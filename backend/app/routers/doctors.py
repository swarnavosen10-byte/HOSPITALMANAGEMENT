from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from app.dependencies import get_db, verify_admin_key
from app.models import Doctor, Appointment, Patient
from app.schemas import DoctorCreate, DoctorResponse, DoctorDashboard, AppointmentResponse, PatientResponse

router = APIRouter()

@router.get("/doctors", response_model=List[DoctorResponse])
def get_doctors(db: Session = Depends(get_db)):
    """Get all doctors"""
    doctors = db.query(Doctor).all()
    return doctors

@router.post("/doctors", response_model=DoctorResponse)
def create_doctor(doctor: DoctorCreate, db: Session = Depends(get_db), _: bool = Depends(verify_admin_key)):
    """Create a new doctor - Requires x-api-key header"""
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
