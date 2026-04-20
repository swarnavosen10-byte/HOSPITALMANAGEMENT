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
@app.get("/doctors")
def get_doctors():
    return [
        {"id": 1, "name": "Dr. Sen", "specialization": "Cardiology"},
        {"id": 2, "name": "Dr. Roy", "specialization": "Neurology"}
    ]

# Appointments API
@app.get("/appointments")
def get_appointments():
    return [
        {"id": 1, "patient": "Soham", "doctor": "Dr. Sen"},
        {"id": 2, "patient": "Suman", "doctor": "Dr. Roy"}
    ]