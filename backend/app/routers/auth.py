from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.dependencies import get_db
from app.models import Patient, Doctor, Appointment, Billing, User
from app.schemas import LoginRequest, LoginResponse, AdminDashboard, UserRegisterRequest
from app.utils.security import hash_password, verify_password

router = APIRouter()

DEMO_USERS = {
    "admin:123": {"username": "admin", "role": "admin"},
    "patient:123": {"username": "patient", "role": "patient"},
    "doctor:123": {"username": "doctor", "role": "doctor"},
    "staff:123": {"username": "staff", "role": "staff"},
}

@router.post("/register", response_model=LoginResponse)
def register(request: UserRegisterRequest, db: Session = Depends(get_db)):
    """Register a new user (currently focusing on patient role only)"""
    if request.role != "patient":
        return LoginResponse(
            success=False,
            message="Currently, only patient registration is handled by the cloud database. Other roles will be implemented soon."
        )
    
    # Check if username already exists in database
    existing_user = db.query(User).filter(User.username.ilike(request.username)).first()
    if existing_user:
        return LoginResponse(
            success=False,
            message="Username already exists"
        )
    
    # Hash password and save user
    hashed = hash_password(request.password)
    new_user = User(
        username=request.username,
        password_hash=hashed,
        displayName=request.displayName,
        role="patient",
        email=request.email,
        phone=request.phone
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return LoginResponse(
        success=True,
        username=new_user.username,
        role=new_user.role,
        displayName=new_user.displayName,
        email=new_user.email,
        phone=new_user.phone,
        message="Account created successfully"
    )

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Validate login credentials against demo dictionary or live database (for patients)"""
    # If it's a patient, check the database first!
    if request.role == "patient":
        db_user = db.query(User).filter(User.username.ilike(request.username), User.role == "patient").first()
        if db_user:
            if verify_password(request.password, db_user.password_hash):
                return LoginResponse(
                    success=True,
                    username=db_user.username,
                    role=db_user.role,
                    displayName=db_user.displayName,
                    email=db_user.email,
                    phone=db_user.phone,
                    message="Login successful"
                )
            else:
                return LoginResponse(
                    success=False,
                    message="Invalid password"
                )
    
    # Fallback to local DEMO_USERS for other roles (until they are implemented in database)
    key = f"{request.username}:{request.password}"
    if key in DEMO_USERS and DEMO_USERS[key]["role"] == request.role:
        user = DEMO_USERS[key]
        
        # Determine defaults for static demo profiles
        displayName = "Patient User" if request.role == "patient" else f"{request.role.capitalize()} User"
        email = "patient@gmail.com" if request.role == "patient" else f"{request.username}@medisync.com"
        phone = "+91 98300 12345" if request.role == "patient" else "+91 90511 11000"
        
        return LoginResponse(
            success=True,
            username=user["username"],
            role=user["role"],
            displayName=displayName,
            email=email,
            phone=phone,
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
