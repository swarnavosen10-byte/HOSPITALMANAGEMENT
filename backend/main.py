from fastapi import FastAPI

app = FastAPI()
from fastapi.middleware.cors import CORSMiddlewar

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
@app.get("/patients")
def get_patients():
    return [
        {"id": 1, "name": "Soham", "age": 20},
        {"id": 2, "name": "Suman", "age": 21}
    ]

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
