import os
from datetime import datetime, timedelta, timezone
from typing import Optional
from enum import Enum as PyEnum
from fastapi import Depends, FastAPI, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from sqlalchemy import (
    Column, Date, DateTime,
    Enum, Integer, String, 
    ForeignKey, DECIMAL, create_engine
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import Session, sessionmaker, relationship

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:amen2004@localhost/projetweb")
SECRET_KEY = os.getenv("SECRET_KEY", "secret123")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

def now_utc():
    return datetime.now(timezone.utc)

class UserRole(PyEnum):
    admin = "admin"
    student = "student"

class User(Base):
    __tablename__ = "users"
    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), nullable=False, unique=True, index=True)
    email = Column(String(100), nullable=False, unique=True, index=True)
    hashed_pw = Column(String, nullable=False)
    role = Column(Enum(UserRole, values_callable=lambda x: [e.value for e in UserRole]), nullable=False)
    classe = Column(String(50), nullable=False)
    created_at = Column(DateTime, default=now_utc)

class Specialty(Base):
    __tablename__ = "specialties"
    specialty_id = Column(Integer, primary_key=True)
    specialty_name = Column(String(100), unique=True)

class AcademicYear(Base):
    __tablename__ = "academic_years"
    academic_year_id = Column(Integer, primary_key=True)
    year_name = Column(String(50))
    year_order = Column(Integer)
    semester_number = Column(Integer)

class student_academic_info(Base):
    __tablename__ = "student_academic_info"
    student_id = Column(Integer, primary_key=True)
    specialty_id = Column(Integer, ForeignKey("specialties.specialty_id"))
    academic_year_id = Column(Integer, ForeignKey("academic_years.academic_year_id"))
    created_at = Column(DateTime, default=now_utc)

class Subject(Base):
    __tablename__ = "subjects"
    subject_id = Column(Integer, primary_key=True)
    subject_code = Column(String(20), unique=True)
    subject_name = Column(String(100))
    specialty_id = Column(Integer, ForeignKey("specialties.specialty_id"))
    academic_year_id = Column(Integer, ForeignKey("academic_years.academic_year_id"))

class Absence(Base):
    __tablename__ = "absences"
    absence_id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    date_absent = Column(Date, nullable=False)
    created_at = Column(DateTime, default=now_utc)

class Grade(Base):
    __tablename__ = "grades"
    grade_id = Column(Integer, primary_key=True)
    student_id = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    subject_id = Column(Integer, ForeignKey("subjects.subject_id"), nullable=False)
    grade = Column(DECIMAL(5,2), nullable=False)
    entered_by = Column(Integer, ForeignKey("users.user_id"), nullable=False)
    date_entered = Column(DateTime, default=now_utc)

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None

class UserCreate(BaseModel):
    username: str
    email: str
    password: str
    classe: str

class UserOut(BaseModel):
    user_id: int
    username: str
    email: str
    role: str
    classe: str
    created_at: datetime

    class Config:
        orm_mode = True

class StudentProfileOut(BaseModel):
    user_id: int
    username: str
    email: str
    classe: str
    year: Optional[str]
    specialty: Optional[str]

    class Config:
        orm_mode = True

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def get_password_hash(pw: str) -> str:
    return pwd_context.hash(pw)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = now_utc() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_user(db: Session, username: str) -> Optional[User]:
    return db.query(User).filter(User.username == username).first()

def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
    user = get_user(db, username)
    if not user or not verify_password(password, user.hashed_pw):
        return None
    return user

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    creds_exc = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(
            token, 
            SECRET_KEY, 
            algorithms=[ALGORITHM],
            options={"leeway": 60}
        )
        user_id = payload.get("sub")
        if user_id is None:
            raise creds_exc
        try:
            user_id = int(user_id)
        except ValueError:
            raise creds_exc
    except JWTError as e:
        raise creds_exc

    user = db.query(User).get(user_id)
    if user is None:
        raise creds_exc
    return user

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/register", response_model=UserOut)
def register(user_in: UserCreate, db: Session = Depends(get_db)) -> User:
    exists = db.query(User).filter(
        (User.username == user_in.username) |
        (User.email == user_in.email)
    ).first()
    if exists:
        raise HTTPException(400, "Username or email already registered")

    user = User(
        username=user_in.username,
        email=user_in.email,
        hashed_pw=get_password_hash(user_in.password),
        role=UserRole.student,
        classe=user_in.classe
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user

@app.post("/token", response_model=Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
) -> dict:
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"}
        )

    access_token = create_access_token(
        data={"sub": str(user.user_id), "role": user.role.value},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/student/profile/{user_id}", response_model=StudentProfileOut)
def get_student_profile(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != UserRole.student:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can access student profiles"
        )

    if current_user.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only view your own profile"
        )

    result = db.query(
        User,
        AcademicYear.year_name,
        Specialty.specialty_name
    ).select_from(User)\
    .outerjoin(student_academic_info, User.user_id == student_academic_info.student_id)\
    .outerjoin(AcademicYear, student_academic_info.academic_year_id == AcademicYear.academic_year_id)\
    .outerjoin(Specialty, student_academic_info.specialty_id == Specialty.specialty_id)\
    .filter(User.user_id == user_id)\
    .first()

    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Student profile not found"
        )

    user, year_name, specialty_name = result

    return {
        "user_id": user.user_id,
        "username": user.username,
        "email": user.email,
        "classe": user.classe,
        "year": year_name,
        "specialty": specialty_name
    }

