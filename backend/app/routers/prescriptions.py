from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List

from app.dependencies import get_db
from app.models import Prescription, Doctor, Patient
from app.schemas import PrescriptionCreate, PrescriptionResponse

router = APIRouter(
    prefix="/prescriptions",
    tags=["prescriptions"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=PrescriptionResponse)
def create_prescription(prescription: PrescriptionCreate, db: Session = Depends(get_db)):
    doctor = db.query(Doctor).filter(Doctor.id == prescription.doctorId).first()
    doctor_name = doctor.name if doctor else prescription.doctorName

    patient = None
    if prescription.patientId:
        patient = db.query(Patient).filter(Patient.id == prescription.patientId).first()
        
    patient_name = prescription.patientName if prescription.patientName else (patient.name if patient else "Unknown Patient")

    new_prescription = Prescription(
        doctorId=prescription.doctorId,
        doctorName=doctor_name,
        hospitalId=prescription.hospitalId,
        patientId=prescription.patientId,
        patientName=patient_name,
        medicineName=prescription.medicineName,
        dosage=prescription.dosage,
        timing=prescription.timing,
        durationDays=prescription.durationDays,
        testsRecommended=prescription.testsRecommended,
        followUpDate=prescription.followUpDate,
        notes=prescription.notes,
        createdAt=datetime.now().strftime("%Y-%m-%d")
    )
    db.add(new_prescription)

    # Auto-resolve today's appointment
    from app.models import Appointment, PastAppointment
    current_date_str = datetime.now().strftime("%Y-%m-%d")
    today_appointment = db.query(Appointment).filter(
        Appointment.patientId == prescription.patientId,
        Appointment.doctorId == prescription.doctorId,
        Appointment.date == current_date_str,
        Appointment.status.notin_(["Completed", "Cancelled", "Rejected"])
    ).first()

    if today_appointment:
        past_apt = PastAppointment(
            patientId=today_appointment.patientId,
            doctorId=today_appointment.doctorId,
            hospitalId=today_appointment.hospitalId,
            patientName=today_appointment.patientName,
            doctorName=today_appointment.doctorName,
            date=today_appointment.date,
            time=today_appointment.time,
            type=today_appointment.type,
            mode=today_appointment.mode,
            status="Completed",
            notes=today_appointment.notes,
            completionOrCancellationDate=current_date_str
        )
        db.add(past_apt)
        db.delete(today_appointment)

    # Automatically create follow-up appointment
    if prescription.followUpDate:
        new_appointment = Appointment(
            patientId=prescription.patientId,
            doctorId=prescription.doctorId,
            hospitalId=prescription.hospitalId,
            patientName=patient_name,
            doctorName=doctor_name,
            date=prescription.followUpDate,
            time="10:00", # default time
            type="Follow-up",
            mode="In-person",
            status="Scheduled",
            notes="Auto-scheduled follow-up from prescription"
        )
        db.add(new_appointment)

    db.commit()
    db.refresh(new_prescription)
    return new_prescription

@router.get("/doctor/{doctor_id}", response_model=List[PrescriptionResponse])
def get_prescriptions_by_doctor(doctor_id: int, db: Session = Depends(get_db)):
    return db.query(Prescription).filter(Prescription.doctorId == doctor_id).order_by(Prescription.id.desc()).all()

@router.get("/patient/{patient_id}", response_model=List[PrescriptionResponse])
def get_prescriptions_by_patient(patient_id: int, db: Session = Depends(get_db)):
    return db.query(Prescription).filter(Prescription.patientId == patient_id).order_by(Prescription.id.desc()).all()
