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
    db.commit()
    db.refresh(new_prescription)
    return new_prescription

@router.get("/doctor/{doctor_id}", response_model=List[PrescriptionResponse])
def get_prescriptions_by_doctor(doctor_id: int, db: Session = Depends(get_db)):
    return db.query(Prescription).filter(Prescription.doctorId == doctor_id).order_by(Prescription.id.desc()).all()

@router.get("/patient/{patient_id}", response_model=List[PrescriptionResponse])
def get_prescriptions_by_patient(patient_id: int, db: Session = Depends(get_db)):
    return db.query(Prescription).filter(Prescription.patientId == patient_id).order_by(Prescription.id.desc()).all()
