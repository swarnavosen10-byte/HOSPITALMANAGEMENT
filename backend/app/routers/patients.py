from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.dependencies import get_db, verify_admin_key
from app.models import Patient, Doctor, Hospital, Appointment
from app.schemas import PatientCreate, PatientResponse, PatientDashboard, AppointmentResponse, AppointmentCreate

router = APIRouter()

@router.get("/patients", response_model=List[PatientResponse])
def get_patients(db: Session = Depends(get_db)):
    """Get all patients"""
    patients = db.query(Patient).all()
    return patients

@router.post("/patients", response_model=PatientResponse)
def create_patient(patient: PatientCreate, db: Session = Depends(get_db), _: bool = Depends(verify_admin_key)):
    """Create a new patient - Requires x-api-key header"""
    new_patient = Patient(
        name=patient.name, 
        age=patient.age,
        gender=patient.gender,
        diagnosis=patient.diagnosis,
        status=patient.status,
        hospitalId=patient.hospitalId
    )
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return new_patient

@router.delete("/patients/{patient_id}")
def delete_patient(patient_id: int, db: Session = Depends(get_db), _: bool = Depends(verify_admin_key)):
    """Delete a patient by ID - Requires x-api-key header"""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    db.delete(patient)
    db.commit()
    return {"message": "Patient deleted successfully"}

@router.get("/patient/dashboard", response_model=PatientDashboard)
def get_patient_dashboard(db: Session = Depends(get_db)):
    """Get patient dashboard statistics"""
    total_hospitals = 50 # Standard count
    total_doctors = db.query(Doctor).count()
    
    # Calculate ambulances available (sum of all hospitals)
    hospitals = db.query(Hospital).all()
    ambulances_available = sum(h.ambulances for h in hospitals)
    
    # Mock count of appointments
    my_appointments = db.query(Appointment).count()
    
    return PatientDashboard(
        available_hospitals=total_hospitals,
        available_doctors=total_doctors,
        my_appointments=my_appointments,
        ambulances_available=ambulances_available
    )

@router.get("/patient/appointments", response_model=List[AppointmentResponse])
def get_patient_appointments(db: Session = Depends(get_db)):
    """Get all patient appointments"""
    appointments = db.query(Appointment).filter(Appointment.status == "scheduled").all()
    return appointments

@router.post("/patient/book-appointment")
def book_patient_appointment(appointment: AppointmentCreate, db: Session = Depends(get_db), _: bool = Depends(verify_admin_key)):
    """Book a new appointment for patient - Requires x-api-key header"""
    try:
        new_appointment = Appointment(
            patientId=appointment.patientId,
            doctorId=appointment.doctorId,
            hospitalId=appointment.hospitalId,
            date=appointment.date,
            time=appointment.time,
            status=appointment.status or "scheduled"
        )
        db.add(new_appointment)
        db.commit()
        db.refresh(new_appointment)
        return {
            "success": True,
            "message": "Appointment booked successfully",
            "appointment_id": new_appointment.id
        }
    except Exception as e:
        db.rollback()
        return {
            "success": False,
            "message": f"Failed to book appointment: {str(e)}"
        }

@router.get("/staff/patients", response_model=List[PatientResponse])
def get_staff_patients(db: Session = Depends(get_db)):
    """Get all staff patients"""
    patients = db.query(Patient).all()
    return patients
