from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
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
    """Register a new user (handles patient, doctor, and hospital_staff roles)"""
    if request.role not in ["patient", "doctor", "hospital_staff"]:
        return LoginResponse(
            success=False,
            message="Only Patient, Doctor, and Hospital Staff registrations are supported by the cloud database currently."
        )
    
    # Check if username already exists in database
    existing_user = db.query(User).filter(User.username.ilike(request.username)).first()
    if existing_user:
        return LoginResponse(
            success=False,
            message="Username already exists"
        )
        
    # Check if email already exists in database
    if request.email:
        existing_email = db.query(User).filter(User.email.ilike(request.email)).first()
        if existing_email:
            return LoginResponse(
                success=False,
                message="Email address already registered"
            )
    
    hashed = hash_password(request.password)
    
    # Handle Role-specific setup
    doctorId = None
    verification_status = "APPROVED" # Patients are immediately active
    
    if request.role in ["doctor", "hospital_staff"]:
        verification_status = "PENDING" # Doctors and Staff require review
        
    if request.role == "doctor":
        
        # Create unverified profile in doctors table
        new_doctor_profile = Doctor(
            name=request.displayName,
            specialization="General Medicine",
            hospitalId=request.hospitalId,
            department="Unassigned",
            experience=0,
            availability="Unavailable",
            fees=500,
            phone=request.phone or "N/A",
            email=request.email or "N/A"
        )
        db.add(new_doctor_profile)
        db.commit()
        db.refresh(new_doctor_profile)
        doctorId = new_doctor_profile.id
        
    # Create the user credentials record
    new_user = User(
        username=request.username,
        password_hash=hashed,
        displayName=request.displayName,
        role=request.role,
        email=request.email,
        phone=request.phone,
        verification_status=verification_status,
        doctorId=doctorId,
        hospitalId=request.hospitalId
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    # If the user is a patient, create a corresponding profile in the patients table
    # We map the Patient.id to the User.id so they stay perfectly in sync
    if request.role == "patient":
        new_patient = Patient(
            id=new_user.id,
            name=request.displayName,
            age=30, # Default age
            gender="Unknown",
            diagnosis="New Registration",
            status="Waiting",
            hospitalId=request.hospitalId or 1
        )
        db.add(new_patient)
        db.commit()
    
    return LoginResponse(
        success=True,
        id=new_user.id,
        username=new_user.username,
        role=new_user.role,
        displayName=new_user.displayName,
        email=new_user.email,
        phone=new_user.phone,
        verification_status=new_user.verification_status,
        doctorId=new_user.doctorId,
        hospitalId=new_user.hospitalId,
        message="Account created successfully"
    )

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """Validate login credentials against demo dictionary or live database (for patients, doctors, and staff)"""
    # If it's a patient, doctor, or staff, check the database first!
    if request.role in ["patient", "doctor", "hospital_staff"]:
        db_user = db.query(User).filter(
            User.username.ilike(request.username), 
            User.role == request.role
        ).first()
        
        if db_user:
            if verify_password(request.password, db_user.password_hash):
                return LoginResponse(
                    success=True,
                    id=db_user.id,
                    username=db_user.username,
                    role=db_user.role,
                    displayName=db_user.displayName,
                    email=db_user.email,
                    phone=db_user.phone,
                    verification_status=db_user.verification_status,
                    doctorId=db_user.doctorId,
                    hospitalId=db_user.hospitalId,
                    message="Login successful"
                )
            else:
                return LoginResponse(
                    success=False,
                    message="Invalid password"
                )
    
    # Fallback to local DEMO_USERS for other roles (and demo doctor/patient logins)
    key = f"{request.username}:{request.password}"
    if key in DEMO_USERS and DEMO_USERS[key]["role"] == request.role:
        user = DEMO_USERS[key]
        
        # Default session metadata values for static local profiles
        displayName = f"{request.role.capitalize()} User"
        if request.role == "patient":
            displayName = "Patient User"
        elif request.role == "doctor":
            displayName = "Dr. Amit Roy"
            
        email = "patient@gmail.com" if request.role == "patient" else f"{request.username}@medisync.com"
        phone = "+91 98300 12345" if request.role == "patient" else "+91 90511 11000"
        
        # Default IDs
        hospitalId = 1 if request.role in ["doctor", "staff"] else None
        doctorId = 101 if request.role == "doctor" else None
        
        return LoginResponse(
            success=True,
            id=999,
            username=user["username"],
            role=user["role"],
            displayName=displayName,
            email=email,
            phone=phone,
            verification_status="APPROVED",
            doctorId=doctorId,
            hospitalId=hospitalId,
            message="Login successful"
        )
    
    return LoginResponse(
        success=False,
        message="Invalid username, password, or role"
    )

@router.get("/auth/status/{username}")
def check_status(username: str, db: Session = Depends(get_db)):
    """Check the real-time verification status of a user by username"""
    user = db.query(User).filter(User.username.ilike(username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "username": user.username,
        "verification_status": user.verification_status,
        "role": user.role,
        "hospitalId": user.hospitalId,
        "doctorId": user.doctorId
    }

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

@router.get("/admin/pending-users")
def get_pending_users(hospitalId: int = None, db: Session = Depends(get_db)):
    """Get all users with PENDING verification status, optionally filtered by hospitalId"""
    query = db.query(User).filter(User.verification_status == "PENDING")
    if hospitalId is not None:
        query = query.filter(User.role == "doctor", User.hospitalId == hospitalId)
    users = query.all()
    from app.models import Hospital
    result = []
    for u in users:
        hospital_name = "N/A"
        if u.hospitalId:
            h = db.query(Hospital).filter(Hospital.id == u.hospitalId).first()
            if h:
                hospital_name = h.name
        result.append({
            "username": u.username,
            "displayName": u.displayName,
            "role": u.role,
            "email": u.email,
            "phone": u.phone,
            "verification_status": u.verification_status,
            "hospitalId": u.hospitalId,
            "hospitalName": hospital_name,
            "doctorId": u.doctorId
        })
    return result

class UserApprovalRequest(BaseModel):
    specialization: str = None
    department: str = None
    fees: int = None
    experience: int = None

@router.post("/admin/approve-user/{username}")
def approve_user(username: str, request: UserApprovalRequest = None, db: Session = Depends(get_db)):
    """Approve a pending user's verification status by username, optionally configuring doctor details"""
    user = db.query(User).filter(User.username.ilike(username)).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.verification_status = "APPROVED"
    
    # If the user is a doctor, update their doctor profile details and set them as Available
    if user.role == "doctor" and user.doctorId:
        doctor = db.query(Doctor).filter(Doctor.id == user.doctorId).first()
        if doctor:
            if request:
                if request.specialization:
                    doctor.specialization = request.specialization
                if request.department:
                    doctor.department = request.department
                if request.fees is not None:
                    doctor.fees = request.fees
                if request.experience is not None:
                    doctor.experience = request.experience
            doctor.availability = "Available" # Doctor becomes active and bookable
            
    db.commit()
    db.refresh(user)
    
    return {
        "success": True,
        "username": user.username,
        "verification_status": user.verification_status,
        "message": f"User {username} approved and profile configured successfully"
    }
