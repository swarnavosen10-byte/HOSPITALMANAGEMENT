import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app.models import Hospital, Patient, Doctor, Appointment, Billing


db = SessionLocal()

# ================== HOSPITALS ==================
print("Checking and seeding hospitals...")
existing_hospitals = db.query(Hospital).first()

if not existing_hospitals:
    hospitals = [
        Hospital(name="Apollo Hospital", lat=22.5148, lng=88.3924, beds=5, doctors=8, ambulances=2),
        Hospital(name="AMRI Hospital", lat=22.5074, lng=88.3728, beds=2, doctors=5, ambulances=1),
        Hospital(name="Fortis Hospital", lat=22.4960, lng=88.3997, beds=7, doctors=9, ambulances=3),
        Hospital(name="Medica Hospital", lat=22.5106, lng=88.4011, beds=4, doctors=6, ambulances=2),
        Hospital(name="Ruby Hospital", lat=22.5015, lng=88.4019, beds=1, doctors=4, ambulances=1),
    ]
    for hospital in hospitals:
        db.add(hospital)
    db.commit()
    print("✓ Hospital data inserted")
else:
    print("✓ Hospital data already exists")

# ================== PATIENTS ==================
print("Checking and seeding patients...")
existing_patients = db.query(Patient).first()

if not existing_patients:
    patients = [
        Patient(name="Soham", age=20),
        Patient(name="Suman", age=21),
    ]
    for patient in patients:
        db.add(patient)
    db.commit()
    print("✓ Patient data inserted")
else:
    print("✓ Patient data already exists")

# ================== DOCTORS ==================
print("Checking and seeding doctors...")
existing_doctors = db.query(Doctor).first()

if not existing_doctors:
    doctors = [
        Doctor(name="Dr. Sen", specialization="Cardiology"),
        Doctor(name="Dr. Roy", specialization="Neurology"),
    ]
    for doctor in doctors:
        db.add(doctor)
    db.commit()
    print("✓ Doctor data inserted")
else:
    print("✓ Doctor data already exists")

# ================== APPOINTMENTS ==================
print("Checking and seeding appointments...")
existing_appointments = db.query(Appointment).first()

if not existing_appointments:
    appointments = [
        Appointment(patient="Soham", doctor="Dr. Sen", date="2026-05-15", time="10:00", status="scheduled"),
        Appointment(patient="Suman", doctor="Dr. Roy", date="2026-05-16", time="14:00", status="scheduled"),
    ]
    for appointment in appointments:
        db.add(appointment)
    db.commit()
    print("✓ Appointment data inserted")
else:
    print("✓ Appointment data already exists")

# ================== BILLING ==================
print("Checking and seeding billing...")
existing_billing = db.query(Billing).first()

if not existing_billing:
    billing = [
        Billing(patient="Rahul Das", amount=200),
        Billing(patient="Tumpa Sen", amount=150),
        Billing(patient="Suman Ghosh", amount=300),
        Billing(patient="Mita Roy", amount=250),
        Billing(patient="Abhijit Pal", amount=180),
    ]
    for bill in billing:
        db.add(bill)
    db.commit()
    print("✓ Billing data inserted")
else:
    print("✓ Billing data already exists")

db.close()
print("\n✓ All tables initialized successfully!")
