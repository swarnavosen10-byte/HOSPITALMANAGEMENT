from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.models import Patient, Doctor, Appointment, Billing
from app.schemas import LoginRequest, LoginResponse, AdminDashboard

router = APIRouter()

DEMO_USERS = {
    "admin:123": {"username": "admin", "role": "admin"},
    "patient:123": {"username": "patient", "role": "patient"},
    "doctor:123": {"username": "doctor", "role": "doctor"},
    "staff:123": {"username": "staff", "role": "staff"},
}

@app.post("/login", response_model=LoginResponse) if False else router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest):
    """Validate login credentials for demo users"""
    key = f"{request.username}:{request.password}"
    
    if key in DEMO_USERS and DEMO_USERS[key]["role"] == request.role:
        user = DEMO_USERS[key]
        return LoginResponse(
            success=True,
            username=user["username"],
            role=user["role"],
            message="Login successful"
        )
    
    return LoginResponse(
        success=False,
        message="Invalid username, password, or role"
    )

@router.get("/admin/dashboard", response_model=AdminDashboard)
def get_admin_dashboard(db: Session = Depends(get_db)):
    """Get admin dashboard statistics"""
    total_patients = db.query(Patient).count()
    total_doctors = db.query(Doctor).count()
    total_appointments = db.query(Appointment).count()
    
    # Calculate revenue (total amount from billing)
    billing_records = db.query(Billing).all()
    total_revenue = sum(b.amount for b in billing_records)
    
    total_hospitals = 50 # Standard network count
    
    return AdminDashboard(
        total_patients=total_patients,
        total_doctors=total_doctors,
        total_appointments=total_appointments,
        total_revenue=total_revenue,
        total_hospitals=total_hospitals
    )
