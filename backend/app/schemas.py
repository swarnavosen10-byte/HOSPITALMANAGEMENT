from pydantic import BaseModel
from typing import List, Optional

# Hospital Update Model
class HospitalUpdate(BaseModel):
    beds: int
    doctors: int
    ambulances: int

# Patient Model
class PatientCreate(BaseModel):
    name: str
    age: int
    gender: Optional[str] = "Male"
    diagnosis: Optional[str] = "N/A"
    status: Optional[str] = "Waiting"
    hospitalId: Optional[int] = 1

class PatientResponse(BaseModel):
    id: int
    name: str
    age: int
    gender: Optional[str] = None
    diagnosis: Optional[str] = None
    status: Optional[str] = None
    hospitalId: Optional[int] = None
    
    class Config:
        from_attributes = True

# Doctor Model
class DoctorCreate(BaseModel):
    name: str
    specialization: str
    hospitalId: Optional[int] = 1
    department: Optional[str] = None
    experience: Optional[int] = 0
    availability: Optional[str] = "Available"
    fees: Optional[int] = 500
    phone: Optional[str] = "N/A"
    email: Optional[str] = "N/A"

class DoctorResponse(BaseModel):
    id: int
    name: str
    specialization: str
    hospitalId: Optional[int] = None
    department: Optional[str] = None
    experience: Optional[int] = None
    availability: Optional[str] = None
    fees: Optional[int] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    
    class Config:
        from_attributes = True

# Appointment Model
class AppointmentCreate(BaseModel):
    patientId: str
    doctorId: int
    hospitalId: int
    date: Optional[str] = None
    time: Optional[str] = None
    type: Optional[str] = "Consultation"
    mode: Optional[str] = "In-person"
    status: Optional[str] = "Scheduled"
    notes: Optional[str] = ""

class AppointmentResponse(BaseModel):
    id: int
    patientId: str
    doctorId: int
    hospitalId: int
    date: Optional[str] = None
    time: Optional[str] = None
    type: Optional[str] = None
    mode: Optional[str] = None
    status: Optional[str] = None
    notes: Optional[str] = None
    
    class Config:
        from_attributes = True

# Billing Model
class BillingCreate(BaseModel):
    patient: str
    amount: int

class BillingResponse(BaseModel):
    id: int
    patient: str
    amount: int
    
    class Config:
        from_attributes = True

# ================== LOGIN MODELS ==================
class LoginRequest(BaseModel):
    username: str
    password: str
    role: str

class LoginResponse(BaseModel):
    success: bool
    username: Optional[str] = None
    role: Optional[str] = None
    message: str

# ================== NOTIFICATION MODEL ==================
class Notification(BaseModel):
    id: int
    title: str
    message: str
    type: str

# ================== DASHBOARD MODELS ==================
class AdminDashboard(BaseModel):
    total_patients: int
    total_doctors: int
    total_appointments: int
    total_revenue: int
    total_hospitals: int

class PatientDashboard(BaseModel):
    available_hospitals: int
    available_doctors: int
    my_appointments: int
    ambulances_available: int

class DoctorDashboard(BaseModel):
    total_appointments: int
    total_patients: int
    today_appointments: int
    pending_appointments: int

class StaffDashboard(BaseModel):
    total_patients: int
    total_doctors: int
    total_appointments: int
    available_beds: int
    ambulances_available: int

class BroadcastUpdate(BaseModel):
    hospital_id: int
    beds_available: int
    ambulances_available: int
