from fastapi import FastAPI

app = FastAPI()
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
def home():
    return {"message": "Backend is running successfully"}

# Patients API
patients = [
    {"id": 1, "name": "Soham", "age": 20},
    {"id": 2, "name": "Suman", "age": 21}
]

@app.get("/patients")
def get_patients():
    return patients

@app.post("/patients")
def add_patient(patient: dict):
    patients.append(patient)
    return {"message": "Patient added"}

@app.delete("/patients/{patient_id}")
def delete_patient(patient_id: int):
    global patients
    patients = [p for p in patients if p["id"] != patient_id]
    return {"message": "Patient deleted"}

# Doctors API
doctors = [
    {"id": 1, "name": "Dr. Sen", "specialization": "Cardiology"},
    {"id": 2, "name": "Dr. Roy", "specialization": "Neurology"}
]

@app.get("/doctors")
def get_doctors():
    return doctors

@app.post("/doctors")
def add_doctor(doctor: dict):
    doctors.append(doctor)
    return {"message": "Doctor added"}

@app.delete("/doctors/{doctor_id}")
def delete_doctor(doctor_id: int):
    global doctors
    doctors = [d for d in doctors if d["id"] != doctor_id]
    return {"message": "Doctor deleted"}

# Appointments API
appointments = [
    {"id": 1, "patient": "Soham", "doctor": "Dr. Sen"},
    {"id": 2, "patient": "Suman", "doctor": "Dr. Roy"}
]

@app.get("/appointments")
def get_appointments():
    return appointments

@app.post("/appointments")
def add_appointment(appointment: dict):
    appointments.append(appointment)
    return {"message": "Appointment added"}

@app.delete("/appointments/{appointment_id}")
def delete_appointment(appointment_id: int):
    global appointments
    appointments = [a for a in appointments if a["id"] != appointment_id]
    return {"message": "Appointment deleted"}
billing = [
    {"id": 1, "patient": "Rahul Das", "amount": 200},
    {"id": 2, "patient": "Tumpa Sen", "amount": 150},
    {"id": 3, "patient": "Suman Ghosh", "amount": 300},
    {"id": 4, "patient": "Mita Roy", "amount": 250},
    {"id": 5, "patient": "Abhijit Pal", "amount": 180}
]

@app.get("/billing")
def get_billing():
    return billing
reports = {
    "total_patients": 2,
    "total_doctors": 2,
    "total_appointments": 2,
    "total_revenue": 1080
}

@app.get("/reports")
def get_reports():
    return reports