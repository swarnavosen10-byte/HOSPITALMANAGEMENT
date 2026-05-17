from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.dependencies import get_db, verify_admin_key
from app.models import Appointment, Patient, Doctor, Billing
from app.schemas import AppointmentCreate, AppointmentResponse, AppointmentUpdate, PastAppointmentResponse

router = APIRouter()

def resolve_appointment(a, db: Session):
    from app.models import User, Doctor
    patient_name = a.patientName
    if not patient_name and a.patientId:
        user = db.query(User).filter(User.id == a.patientId).first()
        if user:
            patient_name = user.displayName
    if not patient_name:
        patient_name = "Guest Patient"
    
    doctor_name = a.doctorName
    if not doctor_name and a.doctorId:
        doc = db.query(Doctor).filter(Doctor.id == a.doctorId).first()
        if doc:
            doctor_name = doc.name
    if not doctor_name:
        doctor_name = f"Dr. (ID: {a.doctorId})"
            
    return AppointmentResponse(
        id=a.id,
        patientId=a.patientId,
        doctorId=a.doctorId,
        hospitalId=a.hospitalId,
        date=a.date,
        time=a.time,
        type=a.type,
        mode=a.mode,
        status=a.status,
        notes=a.notes,
        patientName=patient_name,
        doctorName=doctor_name
    )

@router.get("/appointments", response_model=List[AppointmentResponse])
def get_appointments(db: Session = Depends(get_db)):
    """Get all appointments"""
    appointments = db.query(Appointment).all()
    return [resolve_appointment(a, db) for a in appointments]

@router.post("/appointments", response_model=AppointmentResponse)
def create_appointment(appointment: AppointmentCreate, db: Session = Depends(get_db), _: bool = Depends(verify_admin_key)):
    """Create a new appointment - Requires x-api-key header"""
    from app.models import User, Doctor
    
    patient_name = appointment.patientName
    if not patient_name and appointment.patientId:
        user = db.query(User).filter(User.id == appointment.patientId).first()
        if user:
            patient_name = user.displayName
    if not patient_name:
        patient_name = "Guest Patient"
        
    doctor_name = appointment.doctorName
    if not doctor_name and appointment.doctorId:
        doc = db.query(Doctor).filter(Doctor.id == appointment.doctorId).first()
        if doc:
            doctor_name = doc.name
    if not doctor_name:
        doctor_name = f"Dr. (ID: {appointment.doctorId})"

    new_appointment = Appointment(
        patientId=appointment.patientId,
        doctorId=appointment.doctorId,
        hospitalId=appointment.hospitalId,
        patientName=patient_name,
        doctorName=doctor_name,
        date=appointment.date,
        time=appointment.time,
        type=appointment.type,
        mode=appointment.mode,
        status=appointment.status,
        notes=appointment.notes
    )
    db.add(new_appointment)
    db.commit()
    db.refresh(new_appointment)
    return resolve_appointment(new_appointment, db)

@router.delete("/appointments/{appointment_id}")
def delete_appointment(appointment_id: int, db: Session = Depends(get_db), _: bool = Depends(verify_admin_key)):
    """Delete an appointment by ID - Requires x-api-key header"""
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    db.delete(appointment)
    db.commit()
    return {"message": "Appointment deleted successfully"}

@router.put("/appointments/{appointment_id}", response_model=AppointmentResponse)
def update_appointment(appointment_id: int, request: AppointmentUpdate, db: Session = Depends(get_db), _: bool = Depends(verify_admin_key)):
    """Update an appointment by ID - Requires x-api-key header"""
    from app.models import PastAppointment, User, Doctor
    import datetime
    
    appointment = db.query(Appointment).filter(Appointment.id == appointment_id).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    # Resolve names if null in database
    patient_name = appointment.patientName
    if not patient_name and appointment.patientId:
        user = db.query(User).filter(User.id == appointment.patientId).first()
        if user:
            patient_name = user.displayName
    if not patient_name:
        patient_name = "Guest Patient"
        
    doctor_name = appointment.doctorName
    if not doctor_name and appointment.doctorId:
        doc = db.query(Doctor).filter(Doctor.id == appointment.doctorId).first()
        if doc:
            doctor_name = doc.name
    if not doctor_name:
        doctor_name = f"Dr. (ID: {appointment.doctorId})"

    # Update temporary fields
    date = request.date if request.date is not None else appointment.date
    time = request.time if request.time is not None else appointment.time
    type_val = request.type if request.type is not None else appointment.type
    mode = request.mode if request.mode is not None else appointment.mode
    status = request.status if request.status is not None else appointment.status
    notes = request.notes if request.notes is not None else appointment.notes

    if status in ["Completed", "Cancelled", "Rejected"]:
        # Move to past_appointments
        current_date_str = datetime.date.today().strftime("%Y-%m-%d")
        past_apt = PastAppointment(
            patientId=appointment.patientId,
            doctorId=appointment.doctorId,
            hospitalId=appointment.hospitalId,
            patientName=patient_name,
            doctorName=doctor_name,
            date=date,
            time=time,
            type=type_val,
            mode=mode,
            status=status,
            notes=notes,
            completionOrCancellationDate=current_date_str
        )
        db.add(past_apt)
        db.delete(appointment)
        db.commit()
        
        # Return resolved past appointment schema
        return AppointmentResponse(
            id=appointment_id,
            patientId=appointment.patientId,
            doctorId=appointment.doctorId,
            hospitalId=appointment.hospitalId,
            date=date,
            time=time,
            type=type_val,
            mode=mode,
            status=status,
            notes=notes,
            patientName=patient_name,
            doctorName=doctor_name
        )
    else:
        # Just update in place
        if request.date is not None:
            appointment.date = request.date
        if request.time is not None:
            appointment.time = request.time
        if request.type is not None:
            appointment.type = request.type
        if request.mode is not None:
            appointment.mode = request.mode
        if request.status is not None:
            appointment.status = request.status
        if request.notes is not None:
            appointment.notes = request.notes
            
        appointment.patientName = patient_name
        appointment.doctorName = doctor_name
        
        db.commit()
        db.refresh(appointment)
        return resolve_appointment(appointment, db)

@router.get("/past_appointments", response_model=List[PastAppointmentResponse])
def get_past_appointments(db: Session = Depends(get_db)):
    """Get all past (completed/cancelled/rejected) appointments"""
    from app.models import PastAppointment
    past = db.query(PastAppointment).all()
    return past

@router.get("/staff/appointments", response_model=List[AppointmentResponse])
def get_staff_appointments(db: Session = Depends(get_db)):
    """Get all appointments for staff"""
    appointments = db.query(Appointment).all()
    return [resolve_appointment(a, db) for a in appointments]

@router.get("/staff/reports")
def get_staff_reports(db: Session = Depends(get_db)):
    """Get staff reports"""
    total_patients = db.query(Patient).count()
    total_doctors = db.query(Doctor).count()
    total_appointments = db.query(Appointment).count()
    
    billing_records = db.query(Billing).all()
    total_revenue = sum(bill.amount for bill in billing_records)
    
    return {
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "total_appointments": total_appointments,
        "total_revenue": total_revenue
    }

@router.get("/staff/notifications")
def get_staff_notifications():
    """Get staff notifications"""
    return [
        {
            "id": 1,
            "title": "Emergency bed update",
            "message": "Hospital bed availability updated",
            "type": "info"
        },
        {
            "id": 2,
            "title": "New patient admission",
            "message": "A new patient has been admitted",
            "type": "info"
        },
        {
            "id": 3,
            "title": "Doctor unavailable",
            "message": "Dr. Sen will be unavailable tomorrow",
            "type": "warning"
        }
    ]

@router.get("/staff/schedule")
def get_staff_schedule(db: Session = Depends(get_db)):
    """Get staff schedule from appointments"""
    appointments = db.query(Appointment).all()
    return [
        {
            "id": a.id,
            "patient": getattr(a, "patientId", "Patient"),
            "doctor": getattr(a, "doctorId", "Doctor"),
            "date": a.date,
            "time": a.time,
            "status": a.status
        }
        for a in appointments
    ]

@router.get("/reports")
def get_reports(db: Session = Depends(get_db)):
    """Get system reports with statistics"""
    total_patients = db.query(Patient).count()
    total_doctors = db.query(Doctor).count()
    total_appointments = db.query(Appointment).count()
    
    # Calculate total amount from billing
    billing_records = db.query(Billing).all()
    total_amount = sum(bill.amount for bill in billing_records)
    
    return {
        "total_patients": total_patients,
        "total_doctors": total_doctors,
        "total_appointments": total_appointments,
        "total_revenue": total_amount
    }
