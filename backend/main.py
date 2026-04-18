from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import random

app = FastAPI()

# ---------------- CORS SETUP ----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- GLOBAL DATA (CREATED ONCE) ----------------

hospitals = []

base_lat = 22.5726
base_lng = 88.3639

# ---------------- FIXED HOSPITAL DATA ----------------

hospitals = [
    {"id": 1, "name": "Apollo Hospital", "lat": 22.5148, "lng": 88.3924, "beds": random.randint(0, 10)},
    {"id": 2, "name": "AMRI Hospital Dhakuria", "lat": 22.5074, "lng": 88.3728, "beds": random.randint(0, 10)},
    {"id": 3, "name": "AMRI Hospital Salt Lake", "lat": 22.5991, "lng": 88.4128, "beds": random.randint(0, 10)},
    {"id": 4, "name": "Medica Superspecialty Hospital", "lat": 22.4949, "lng": 88.4011, "beds": random.randint(0, 10)},
    {"id": 5, "name": "Fortis Hospital Anandapur", "lat": 22.5016, "lng": 88.4009, "beds": random.randint(0, 10)},
    {"id": 6, "name": "Peerless Hospital", "lat": 22.5036, "lng": 88.3923, "beds": random.randint(0, 10)},
    {"id": 7, "name": "Ruby General Hospital", "lat": 22.5133, "lng": 88.4006, "beds": random.randint(0, 10)},
    {"id": 8, "name": "Desun Hospital", "lat": 22.5079, "lng": 88.4027, "beds": random.randint(0, 10)},
    {"id": 9, "name": "ILS Hospital Salt Lake", "lat": 22.5867, "lng": 88.4172, "beds": random.randint(0, 10)},
    {"id": 10, "name": "Belle Vue Clinic", "lat": 22.5318, "lng": 88.3639, "beds": random.randint(0, 10)},
    {"id": 11, "name": "Woodlands Hospital", "lat": 22.5350, "lng": 88.3542, "beds": random.randint(0, 10)},
    {"id": 12, "name": "CMRI Hospital", "lat": 22.5185, "lng": 88.3512, "beds": random.randint(0, 10)},
    {"id": 13, "name": "SSKM Hospital", "lat": 22.5410, "lng": 88.3420, "beds": random.randint(0, 10)},
    {"id": 14, "name": "RG Kar Medical College", "lat": 22.6022, "lng": 88.3785, "beds": random.randint(0, 10)},
    {"id": 15, "name": "NRS Medical College", "lat": 22.5732, "lng": 88.3727, "beds": random.randint(0, 10)},
    {"id": 16, "name": "Calcutta Medical College", "lat": 22.5726, "lng": 88.3630, "beds": random.randint(0, 10)},
    {"id": 17, "name": "Charnock Hospital", "lat": 22.6155, "lng": 88.4120, "beds": random.randint(0, 10)},
    {"id": 18, "name": "Columbia Asia Hospital", "lat": 22.6150, "lng": 88.4125, "beds": random.randint(0, 10)},
    {"id": 19, "name": "Zenith Super Specialist Hospital", "lat": 22.4980, "lng": 88.3650, "beds": random.randint(0, 10)},
    {"id": 20, "name": "Neotia Hospital", "lat": 22.5808, "lng": 88.4765, "beds": random.randint(0, 10)},
    {"id": 21, "name": "IRIS Hospital", "lat": 22.5088, "lng": 88.3831, "beds": random.randint(0, 10)},
    {"id": 22, "name": "Hindustan Health Point", "lat": 22.5071, "lng": 88.3696, "beds": random.randint(0, 10)},
    {"id": 23, "name": "Howrah Hospital", "lat": 22.5958, "lng": 88.2636, "beds": random.randint(0, 10)},
    {"id": 24, "name": "Nightingale Hospital", "lat": 22.5275, "lng": 88.3622, "beds": random.randint(0, 10)},
    {"id": 25, "name": "Care & Cure Hospital", "lat": 22.5610, "lng": 88.3900, "beds": random.randint(0, 10)},
    {"id": 26, "name": "Sunrise Hospital", "lat": 22.5740, "lng": 88.4140, "beds": random.randint(0, 10)},
    {"id": 27, "name": "Green View Clinic", "lat": 22.5168, "lng": 88.3654, "beds": random.randint(0, 10)},
    {"id": 28, "name": "City Hospital Kolkata", "lat": 22.5720, "lng": 88.3902, "beds": random.randint(0, 10)},
    {"id": 29, "name": "New Life Hospital", "lat": 22.5480, "lng": 88.4015, "beds": random.randint(0, 10)},
    {"id": 30, "name": "Metro Hospital Kolkata", "lat": 22.6010, "lng": 88.3955, "beds": random.randint(0, 10)},
    {"id": 31, "name": "Prime Hospital Kolkata", "lat": 22.5900, "lng": 88.3650, "beds": random.randint(0, 10)},
    {"id": 32, "name": "Global Health Hospital", "lat": 22.5365, "lng": 88.3928, "beds": random.randint(0, 10)},
    {"id": 33, "name": "Eastern Care Hospital", "lat": 22.5552, "lng": 88.4212, "beds": random.randint(0, 10)},
    {"id": 34, "name": "Hope Hospital Kolkata", "lat": 22.5660, "lng": 88.4030, "beds": random.randint(0, 10)},
    {"id": 35, "name": "Safe Care Hospital", "lat": 22.6124, "lng": 88.3764, "beds": random.randint(0, 10)},
    {"id": 36, "name": "Wellness Hospital", "lat": 22.6230, "lng": 88.4020, "beds": random.randint(0, 10)},
    {"id": 37, "name": "Urban Health Hospital", "lat": 22.5304, "lng": 88.4105, "beds": random.randint(0, 10)},
    {"id": 38, "name": "Modern Care Hospital", "lat": 22.5440, "lng": 88.3820, "beds": random.randint(0, 10)},
    {"id": 39, "name": "Life Care Hospital", "lat": 22.5180, "lng": 88.3890, "beds": random.randint(0, 10)},
    {"id": 40, "name": "Emergency Care Centre", "lat": 22.6050, "lng": 88.3900, "beds": random.randint(0, 10)},
    {"id": 41, "name": "Super Care Hospital", "lat": 22.5860, "lng": 88.3605, "beds": random.randint(0, 10)},
    {"id": 42, "name": "North City Hospital", "lat": 22.6200, "lng": 88.4000, "beds": random.randint(0, 10)},
    {"id": 43, "name": "South Point Hospital", "lat": 22.4900, "lng": 88.3800, "beds": random.randint(0, 10)},
    {"id": 44, "name": "Lake View Hospital", "lat": 22.5155, "lng": 88.3480, "beds": random.randint(0, 10)},
    {"id": 45, "name": "Eastern Metro Hospital", "lat": 22.5605, "lng": 88.4350, "beds": random.randint(0, 10)},
    {"id": 46, "name": "West Bank Hospital", "lat": 22.5800, "lng": 88.2900, "beds": random.randint(0, 10)},
    {"id": 47, "name": "Central Kolkata Hospital", "lat": 22.5700, "lng": 88.3600, "beds": random.randint(0, 10)},
    {"id": 48, "name": "Salt Lake Care Centre", "lat": 22.5950, "lng": 88.4200, "beds": random.randint(0, 10)},
    {"id": 49, "name": "New Town Medical Centre", "lat": 22.6200, "lng": 88.4600, "beds": random.randint(0, 10)},
    {"id": 50, "name": "Howrah Multi Speciality Hospital", "lat": 22.5905, "lng": 88.3100, "beds": random.randint(0, 10)},
]


# ---------------- API 1: GET HOSPITALS ----------------
@app.get("/hospitals")
def get_hospitals():
    return hospitals


# ---------------- API 2: REAL-TIME BED UPDATE (OPTIONAL) ----------------
@app.get("/update_beds")
def update_beds():
    for h in hospitals:
        h["beds"] = max(0, min(10, h["beds"] + random.randint(-1, 1)))

    return {"message": "Beds updated", "total_hospitals": len(hospitals)}


# ---------------- API 3: SIMPLE TEST ----------------
@app.get("/")
def home():
    return {"message": "Ambulance Backend Running 🚑"}
