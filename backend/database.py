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
    district = Column(String, nullable=True)
    open_time = Column(String, nullable=True)
    close_time = Column(String, nullable=True)
    rating = Column(Float, nullable=True)

# ================== PATIENT MODEL ==================
class Patient(Base):
    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    age = Column(Integer)
    gender = Column(String, nullable=True)
    diagnosis = Column(String, nullable=True)
    status = Column(String, nullable=True)
    hospitalId = Column("hospitalId", Integer, nullable=True)

# ================== DOCTOR MODEL ==================
class Doctor(Base):
    __tablename__ = "doctors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    specialization = Column(String)
    hospitalId = Column("hospitalId", Integer, nullable=True)
    department = Column(String, nullable=True)
    experience = Column(Integer, nullable=True)
    availability = Column(String, nullable=True)
    fees = Column(Integer, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)

# ================== APPOINTMENT MODEL ==================
class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    patientId = Column("patientId", String)
    doctorId = Column("doctorId", Integer)
    hospitalId = Column("hospitalId", Integer)
    date = Column(String, nullable=True)
    time = Column(String, nullable=True)
    type = Column(String, nullable=True)
    mode = Column(String, nullable=True)
    status = Column(String, nullable=True, default="Scheduled")
    notes = Column(String, nullable=True)

# ================== BILLING MODEL ==================
class Billing(Base):
    __tablename__ = "billing"

    id = Column(Integer, primary_key=True, index=True)
    patient = Column(String)
    amount = Column(Integer)

Base.metadata.create_all(bind=engine)