import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, Column, Integer, String, Float
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./hospital.db")

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    DATABASE_URL,
    connect_args=connect_args
)

SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

Base = declarative_base()

# ================== HOSPITAL MODEL ==================
class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    lat = Column(Float)
    lng = Column(Float)
    beds = Column(Integer)
    doctors = Column(Integer)
    ambulances = Column(Integer)

# ================== PATIENT MODEL ==================
class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    age = Column(Integer)

# ================== DOCTOR MODEL ==================
class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    specialization = Column(String)

# ================== APPOINTMENT MODEL ==================
class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patient = Column(String)
    doctor = Column(String)
    date = Column(String, nullable=True)
    time = Column(String, nullable=True)
    status = Column(String, nullable=True, default="scheduled")

# ================== BILLING MODEL ==================
class Billing(Base):
    __tablename__ = "billing"

    id = Column(Integer, primary_key=True, index=True)
    patient = Column(String)
    amount = Column(Integer)

Base.metadata.create_all(bind=engine)