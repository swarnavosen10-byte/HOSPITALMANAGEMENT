from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.dependencies import get_db, verify_admin_key
from app.models import Doctor, Appointment, Patient, User
from app.schemas import DoctorCreate, DoctorResponse, DoctorDashboard, AppointmentResponse, PatientResponse
from app.utils.security import hash_password

router = APIRouter()

@router.get("/doctors", response_model=List[DoctorResponse])
def get_doctors(db: Session = Depends(get_db)):
    """Get all doctors"""
    doctors = db.query(Doctor).all()
    return doctors

@router.post("/doctors", response_model=DoctorResponse)
def create_doctor(doctor: DoctorCreate, db: Session = Depends(get_db), _: bool = Depends(verify_admin_key)):
    """Create a new doctor - Requires x-api-key header and automatically provisions a User credentials account"""
    new_doctor = Doctor(
        name=doctor.name, 
        specialization=doctor.specialization,
        hospitalId=doctor.hospitalId,
        department=doctor.department,
        experience=doctor.experience,
        availability=doctor.availability,
        fees=doctor.fees,
        phone=doctor.phone,
        email=doctor.email
    )
    db.add(new_doctor)
    db.commit()
    db.refresh(new_doctor)

    # Automatically generate a unique, clean username
    username_base = "dr_" + doctor.name.replace(" ", "_").replace(".", "").lower()
    if not username_base:
        username_base = f"doctor_{new_doctor.id}"
        
    username = username_base
    counter = 1
    while db.query(User).filter(User.username.ilike(username)).first() is not None:
        username = f"{username_base}{counter}"
        counter += 1

    temp_password = "welcome123"
    hashed_password = hash_password(temp_password)

    new_user = User(
        username=username,
        password_hash=hashed_password,
        displayName=doctor.name,
        role="doctor",
        email=doctor.email,
        phone=doctor.phone,
        verification_status="APPROVED", # Manually added by staff means immediately active
        doctorId=new_doctor.id,
        hospitalId=doctor.hospitalId
    )
    db.add(new_user)
    db.commit()

    # Dynamic properties for Pydantic schema return
    new_doctor.username = username
    new_doctor.tempPassword = temp_password

    return new_doctor

@router.delete("/doctors/{doctor_id}")
def delete_doctor(doctor_id: int, db: Session = Depends(get_db), _: bool = Depends(verify_admin_key)):
    """Delete a doctor by ID - Requires x-api-key header"""
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    db.delete(doctor)
    db.commit()
    return {"message": "Doctor deleted successfully"}

@router.get("/doctor/dashboard", response_model=DoctorDashboard)
def get_doctor_dashboard(db: Session = Depends(get_db)):
    """Get doctor dashboard statistics"""
    appointments = db.query(Appointment).all()
    total_appointments = len(appointments)
    unique_patients = len(set(a.patientId for a in appointments))
    
    today_str = datetime.now().strftime("%Y-%m-%d")
    today_appointments = len([a for a in appointments if a.date == today_str])
    pending_appointments = len([a for a in appointments if a.status == "scheduled"])
    
    return DoctorDashboard(
        total_appointments=total_appointments,
        total_patients=unique_patients,
        today_appointments=today_appointments,
        pending_appointments=pending_appointments
    )

@router.get("/doctor/appointments", response_model=List[AppointmentResponse])
def get_doctor_appointments(db: Session = Depends(get_db)):
    """Get all doctor appointments"""
    appointments = db.query(Appointment).all()
    return appointments

@router.get("/doctor/patients", response_model=List[PatientResponse])
def get_doctor_patients(db: Session = Depends(get_db)):
    """Get all doctor patients"""
    patients = db.query(Patient).all()
    return patients

@router.get("/doctor/notifications")
def get_doctor_notifications():
    """Get doctor notifications"""
    return [
        {
            "id": 1,
            "title": "New appointment request",
            "message": "Patient John has requested an appointment",
            "type": "info"
        },
        {
            "id": 2,
            "title": "Schedule reminder",
            "message": "You have 3 appointments today",
            "type": "info"
        }
    ]

@router.get("/doctor/schedule")
def get_doctor_schedule(db: Session = Depends(get_db)):
    """Get doctor schedule from appointments"""
    appointments = db.query(Appointment).all()
    return [
        {
            "id": a.id,
            "patient": getattr(a, "patientId", "Patient"),
            "date": a.date,
            "time": a.time,
            "status": a.status
        }
        for a in appointments
    ]

@router.get("/staff/doctors", response_model=List[DoctorResponse])
def get_staff_doctors(db: Session = Depends(get_db)):
    """Get all staff doctors"""
    doctors = db.query(Doctor).all()
    return doctors
