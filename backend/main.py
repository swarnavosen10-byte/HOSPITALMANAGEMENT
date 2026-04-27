from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List

from database import SessionLocal, Hospital

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- DATABASE SESSION ----------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ---------------- WEBSOCKET CONNECTION MANAGER ----------------
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# ---------------- REQUEST MODEL ----------------
class HospitalUpdate(BaseModel):
    icu_beds: int
    general_beds: int
    doctors_available: int
    ambulances: int

# ---------------- HOME ROUTE ----------------
@app.get("/")
def home():
    return {"message": "Backend is running successfully"}

# ---------------- GET ALL HOSPITALS ----------------
@app.get("/hospitals")
def get_hospitals():
    return [
     
        {
            "id": 1,
            "name": "Apollo Hospital",
            "district": "Kolkata",
            "lat": 22.5148,
            "lng": 88.3924,
            "beds": 0,
            "doctors": 8,
            "ambulances": 2,
            "open_time": "08:00",
            "close_time": "22:00",
            "rating": 4.5
        },
        {
            "id": 2,
            "name": "AMRI Dhakuria",
            "district": "Kolkata",
            "lat": 22.5074,
            "lng": 88.3728,
            "beds": 2,
            "doctors": 5,
            "ambulances": 1,
            "open_time": "09:00",
            "close_time": "21:00",
            "rating": 4.2
        },
        {
            "id": 3,
            "name": "AMRI Salt Lake",
            "district": "Kolkata",
            "lat": 22.5991,
            "lng": 88.4128,
            "beds": 6,
            "doctors": 7,
            "ambulances": 2,
            "open_time": "08:00",
            "close_time": "20:00",
            "rating": 4.4
        },
        {
            "id": 4,
            "name": "Fortis Hospital Anandapur",
            "district": "Kolkata",
            "lat": 22.4960,
            "lng": 88.3997,
            "beds": 7,
            "doctors": 9,
            "ambulances": 3,
            "open_time": "00:00",
            "close_time": "23:59",
            "rating": 4.7
        },
        {
            "id": 5,
            "name": "Medica Superspecialty",
            "district": "Kolkata",
            "lat": 22.5106,
            "lng": 88.4011,
            "beds": 4,
            "doctors": 6,
            "ambulances": 2,
            "open_time": "07:00",
            "close_time": "21:00",
            "rating": 4.3
        },
        {
            "id": 6,
            "name": "Ruby General Hospital",
            "district": "Kolkata",
            "lat": 22.5015,
            "lng": 88.4019,
            "beds": 1,
            "doctors": 4,
            "ambulances": 1,
            "open_time": "08:00",
            "close_time": "22:00",
            "rating": 4.1
        },
        {
            "id": 7,
            "name": "Peerless Hospital",
            "district": "Kolkata",
            "lat": 22.4987,
            "lng": 88.4043,
            "beds": 5,
            "doctors": 6,
            "ambulances": 2,
            "open_time": "00:00",
            "close_time": "23:59",
            "rating": 4.3
        },
        {
            "id": 8,
            "name": "Desun Hospital",
            "district": "Kolkata",
            "lat": 22.5168,
            "lng": 88.4025,
            "beds": 0,
            "doctors": 5,
            "ambulances": 2,
            "open_time": "08:00",
            "close_time": "20:00",
            "rating": 4.0
        },
        {
            "id": 9,
            "name": "ILS Hospital Dumdum",
            "district": "Kolkata",
            "lat": 22.6230,
            "lng": 88.4240,
            "beds": 2,
            "doctors": 4,
            "ambulances": 1,
            "open_time": "09:00",
            "close_time": "19:00",
            "rating": 3.9
        },
        {
            "id": 10,
            "name": "ILS Hospital Salt Lake",
            "district": "Kolkata",
            "lat": 22.5800,
            "lng": 88.4200,
            "beds": 4,
            "doctors": 5,
            "ambulances": 2,
            "open_time": "08:00",
            "close_time": "20:00",
            "rating": 4.0
        },
        {
            "id": 11,
            "name": "Belle Vue Clinic",
            "district": "Kolkata",
            "lat": 22.5355,
            "lng": 88.3499,
            "beds": 6,
            "doctors": 7,
            "ambulances": 2,
            "open_time": "08:00",
            "close_time": "22:00",
            "rating": 4.2
        },
        {
            "id": 12,
            "name": "Woodlands Hospital",
            "district": "Kolkata",
            "lat": 22.5300,
            "lng": 88.3420,
            "beds": 5,
            "doctors": 6,
            "ambulances": 2,
            "open_time": "08:00",
            "close_time": "21:00",
            "rating": 4.1
        },
        {
            "id": 13,
            "name": "CMRI Hospital",
            "district": "Kolkata",
            "lat": 22.5315,
            "lng": 88.3490,
            "beds": 7,
            "doctors": 8,
            "ambulances": 3,
            "open_time": "00:00",
            "close_time": "23:59",
            "rating": 4.4
        },
        {
            "id": 14,
            "name": "SSKM Hospital",
            "district": "Kolkata",
            "lat": 22.5410,
            "lng": 88.3410,
            "beds": 0,
            "doctors": 12,
            "ambulances": 4,
            "open_time": "00:00",
            "close_time": "23:59",
            "rating": 4.0
        },
        {
            "id": 15,
            "name": "NRS Medical College",
            "district": "Kolkata",
            "lat": 22.5620,
            "lng": 88.3650,
            "beds": 8,
            "doctors": 10,
            "ambulances": 3,
            "open_time": "00:00",
            "close_time": "23:59",
            "rating": 3.8
        },
        {
            "id": 16,
            "name": "RG Kar Hospital",
            "district": "Kolkata",
            "lat": 22.6040,
            "lng": 88.3780,
            "beds": 0,
            "doctors": 11,
            "ambulances": 3,
            "open_time": "00:00",
            "close_time": "23:59",
            "rating": 3.9
        },
        {
            "id": 17,
            "name": "Calcutta Medical College",
            "district": "Kolkata",
            "lat": 22.5726,
            "lng": 88.3639,
            "beds": 10,
            "doctors": 12,
            "ambulances": 4,
            "open_time": "00:00",
            "close_time": "23:59",
            "rating": 4.0
        },
        {
            "id": 18,
            "name": "Charnock Hospital",
            "district": "Kolkata",
            "lat": 22.6180,
            "lng": 88.4250,
            "beds": 4,
            "doctors": 5,
            "ambulances": 2,
            "open_time": "08:00",
            "close_time": "20:00",
            "rating": 4.1
        },
        {
            "id": 19,
            "name": "Columbia Asia Hospital",
            "district": "Kolkata",
            "lat": 22.5790,
            "lng": 88.4220,
            "beds": 6,
            "doctors": 7,
            "ambulances": 2,
            "open_time": "08:00",
            "close_time": "21:00",
            "rating": 4.2
        },
        {
            "id": 20,
            "name": "Zenith Hospital",
            "district": "Kolkata",
            "lat": 22.5900,
            "lng": 88.4100,
            "beds": 3,
            "doctors": 4,
            "ambulances": 1,
            "open_time": "09:00",
            "close_time": "19:00",
            "rating": 3.9
        },
        {
            "id": 21,
            "name": "Neotia Getwel",
            "district": "Kolkata",
            "lat": 22.5805,
            "lng": 88.4205,
            "beds": 0,
            "doctors": 6,
            "ambulances": 2,
            "open_time": "08:00",
            "close_time": "20:00",
            "rating": 4.3
        },
        {
            "id": 22,
            "name": "IRIS Hospital",
            "district": "Kolkata",
            "lat": 22.5850,
            "lng": 88.4050,
            "beds": 2,
            "doctors": 4,
            "ambulances": 1,
            "open_time": "10:00",
            "close_time": "18:00",
            "rating": 3.8
        },
        {
            "id": 23,
            "name": "Hindustan Health Point",
            "district": "Kolkata",
            "lat": 22.5600,
            "lng": 88.3900,
            "beds": 4,
            "doctors": 5,
            "ambulances": 2,
            "open_time": "08:00",
            "close_time": "20:00",
            "rating": 4.0
        },
        {
            "id": 24,
            "name": "Tata Medical Center",
            "district": "Kolkata",
            "lat": 22.5770,
            "lng": 88.4200,
            "beds": 8,
            "doctors": 10,
            "ambulances": 3,
            "open_time": "00:00",
            "close_time": "23:59",
            "rating": 4.6
        },
        {
            "id": 25,
            "name": "BP Poddar Hospital",
            "district": "Kolkata",
            "lat": 22.5100,
            "lng": 88.3400,
            "beds": 3,
            "doctors": 5,
            "ambulances": 2,
            "open_time": "08:00",
            "close_time": "20:00",
            "rating": 4.0
        },
        {
            "id": 26,
            "name": "Nightangle Hospital",
            "district": "Kolkata",
            "lat": 22.5450,
            "lng": 88.3500,
            "beds": 2,
            "doctors": 4,
            "ambulances": 1,
            "open_time": "09:00",
            "close_time": "18:00",
            "rating": 3.9
        },
        {
            "id": 27,
            "name": "Fortis Shalimar Bagh",
            "district": "Howrah",
            "lat": 22.6200,
            "lng": 88.3900,
            "beds": 5,
            "doctors": 6,
            "ambulances": 2,
            "open_time": "00:00",
            "close_time": "23:59",
            "rating": 4.5
        },
        {
            "id": 28,
            "name": "EEDF Hospital",
            "district": "Kolkata",
            "lat": 22.6000,
            "lng": 88.4100,
            "beds": 3,
            "doctors": 4,
            "ambulances": 1,
            "open_time": "09:00",
            "close_time": "19:00",
            "rating": 3.7
        },
        {
            "id": 29,
            "name": "LifeLine Hospital",
            "district": "Kolkata",
            "lat": 22.5800,
            "lng": 88.4000,
            "beds": 2,
            "doctors": 3,
            "ambulances": 1,
            "open_time": "10:00",
            "close_time": "18:00",
            "rating": 3.8
        },
        {
            "id": 30,
            "name": "Care Hospital Kolkata",
            "district": "Kolkata",
            "lat": 22.5700,
            "lng": 88.3900,
            "beds": 0,
            "doctors": 7,
            "ambulances": 2,
            "open_time": "08:00",
            "close_time": "21:00",
            "rating": 4.2
        },
        {
            "id": 31,
            "name": "Global Hospital Kolkata",
            "district": "Kolkata",
            "lat": 22.5600,
            "lng": 88.3700,
            "beds": 4,
            "doctors": 5,
            "ambulances": 2,
            "open_time": "08:00",
            "close_time": "20:00",
            "rating": 4.1
        },
        {
            "id": 32,
            "name": "Sunrise Hospital",
            "district": "Kolkata",
            "lat": 22.5500,
            "lng": 88.3600,
            "beds": 3,
            "doctors": 4,
            "ambulances": 1,
            "open_time": "09:00",
            "close_time": "19:00",
            "rating": 3.9
        },
        {
            "id": 33,
            "name": "City Care Hospital",
            "district": "Kolkata",
            "lat": 22.5400,
            "lng": 88.3500,
            "beds": 5,
            "doctors": 6,
            "ambulances": 2,
            "open_time": "08:00",
            "close_time": "20:00",
            "rating": 4.0
        },
        {
            "id": 34,
            "name": "Hope Hospital",
            "district": "Kolkata",
            "lat": 22.5300,
            "lng": 88.3400,
            "beds": 4,
            "doctors": 5,
            "ambulances": 2,
            "open_time": "08:00",
            "close_time": "20:00",
            "rating": 4.0
        },
        {
            "id": 35,
            "name": "GreenLife Hospital",
            "district": "Kolkata",
            "lat": 22.5200,
            "lng": 88.3300,
            "beds": 3,
            "doctors": 4,
            "ambulances": 1,
            "open_time": "09:00",
            "close_time": "18:00",
            "rating": 3.8
        },
        {
            "id": 36,
            "name": "Metro Hospital Kolkata",
            "district": "Kolkata",
            "lat": 22.5100,
            "lng": 88.3200,
            "beds": 0,
            "doctors": 7,
            "ambulances": 2,
            "open_time": "08:00",
            "close_time": "21:00",
            "rating": 4.2
        },
        {
            "id": 37,
            "name": "SafeCare Hospital",
            "district": "Kolkata",
            "lat": 22.5000,
            "lng": 88.3100,
            "beds": 2,
            "doctors": 3,
            "ambulances": 1,
            "open_time": "10:00",
            "close_time": "18:00",
            "rating": 3.7
        },
        {
            "id": 38,
            "name": "Healing Touch Hospital",
            "district": "Kolkata",
            "lat": 22.4900,
            "lng": 88.3000,
            "beds": 4,
            "doctors": 5,
            "ambulances": 2,
            "open_time": "08:00",
            "close_time": "20:00",
            "rating": 4.0
        },
        {
            "id": 39,
            "name": "LifeCare Hospital",
            "district": "Kolkata",
            "lat": 22.4800,
            "lng": 88.2900,
            "beds": 3,
            "doctors": 4,
            "ambulances": 1,
            "open_time": "09:00",
            "close_time": "19:00",
            "rating": 3.9
        },
        {
            "id": 40,
            "name": "Wellness Hospital",
            "district": "Kolkata",
            "lat": 22.4700,
            "lng": 88.2800,
            "beds": 5,
            "doctors": 6,
            "ambulances": 2,
            "open_time": "08:00",
            "close_time": "20:00",
            "rating": 4.1
        },
        {
            "id": 41,
            "name": "Prime Hospital Kolkata",
            "district": "Kolkata",
            "lat": 22.4600,
            "lng": 88.2700,
            "beds": 4,
            "doctors": 5,
            "ambulances": 2,
            "open_time": "08:00",
            "close_time": "20:00",
            "rating": 4.0
        },
        {
            "id": 42,
            "name": "Advanced Medical Center",
            "district": "Kolkata",
            "lat": 22.4500,
            "lng": 88.2600,
            "beds": 3,
            "doctors": 4,
            "ambulances": 1,
            "open_time": "09:00",
            "close_time": "18:00",
            "rating": 3.8
        },
        {
            "id": 43,
            "name": "Eastern Care Hospital",
            "district": "Kolkata",
            "lat": 22.4400,
            "lng": 88.2500,
            "beds": 5,
            "doctors": 6,
            "ambulances": 2,
            "open_time": "08:00",
            "close_time": "20:00",
            "rating": 4.0
        },
        {
            "id": 44,
            "name": "NewLife Hospital",
            "district": "Kolkata",
            "lat": 22.4300,
            "lng": 88.2400,
            "beds": 4,
            "doctors": 5,
            "ambulances": 2,
            "open_time": "08:00",
            "close_time": "20:00",
            "rating": 4.1
        },
        {
            "id": 45,
            "name": "Urban Health Center",
            "district": "Kolkata",
            "lat": 22.4200,
            "lng": 88.2300,
            "beds": 2,
            "doctors": 3,
            "ambulances": 1,
            "open_time": "10:00",
            "close_time": "17:00",
            "rating": 3.7
        },
        {
            "id": 46,
            "name": "City Hospital East",
            "district": "Kolkata",
            "lat": 22.4100,
            "lng": 88.2200,
            "beds": 0,
            "doctors": 4,
            "ambulances": 1,
            "open_time": "09:00",
            "close_time": "18:00",
            "rating": 3.8
        },
        {
            "id": 47,
            "name": "MetroCare Hospital",
            "district": "Kolkata",
            "lat": 22.4000,
            "lng": 88.2100,
            "beds": 5,
            "doctors": 6,
            "ambulances": 2,
            "open_time": "08:00",
            "close_time": "20:00",
            "rating": 4.0
        },
        {
            "id": 48,
            "name": "HealthFirst Clinic",
            "district": "Kolkata",
            "lat": 22.3900,
            "lng": 88.2000,
            "beds": 2,
            "doctors": 3,
            "ambulances": 1,
            "open_time": "10:00",
            "close_time": "18:00",
            "rating": 3.7
        },
        {
            "id": 49,
            "name": "Urban Life Hospital",
            "district": "Kolkata",
            "lat": 22.3800,
            "lng": 88.1900,
            "beds": 4,
            "doctors": 5,
            "ambulances": 2,
            "open_time": "08:00",
            "close_time": "20:00",
            "rating": 4.0
        },
        {
            "id": 50,
            "name": "CityMed Hospital",
            "district": "Kolkata",
            "lat": 22.3700,
            "lng": 88.1800,
            "beds": 0,
            "doctors": 4,
            "ambulances": 1,
            "open_time": "09:00",
            "close_time": "18:00",
            "rating": 3.8
        }
    ]
    

# ---------------- UPDATE HOSPITAL ----------------
@app.put("/hospitals/{hospital_id}")
async def update_hospital(hospital_id: int, data: HospitalUpdate, db: Session = Depends(get_db)):
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()

    if not hospital:
        return {"error": "Hospital not found"}

    hospital.icu_beds = data.icu_beds
    hospital.general_beds = data.general_beds
    hospital.doctors_available = data.doctors_available
    hospital.ambulances = data.ambulances

    db.commit()

    # send live update to frontend
    await manager.broadcast("hospital_updated")

    return {"message": "Hospital updated successfully"}

# ---------------- WEBSOCKET ----------------
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)