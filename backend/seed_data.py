from database import SessionLocal, Hospital

db = SessionLocal()

existing = db.query(Hospital).first()

if not existing:
    hospitals = [
        Hospital(
            name="Apollo Hospital",
            lat=22.5148,
            lng=88.3924,
            beds=5,
            doctors=8,
            ambulances=2
        ),
        Hospital(
            name="AMRI Hospital",
            lat=22.5074,
            lng=88.3728,
            beds=2,
            doctors=5,
            ambulances=1
        ),
        Hospital(
            name="Fortis Hospital",
            lat=22.4960,
            lng=88.3997,
            beds=7,
            doctors=9,
            ambulances=3
        ),
        Hospital(
            name="Medica Hospital",
            lat=22.5106,
            lng=88.4011,
            beds=4,
            doctors=6,
            ambulances=2
        ),
        Hospital(
            name="Ruby Hospital",
            lat=22.5015,
            lng=88.4019,
            beds=1,
            doctors=4,
            ambulances=1
        )
    ]

    for hospital in hospitals:
        db.add(hospital)

    db.commit()
    print("Sample hospital data inserted successfully")
else:
    print("Data already exists")

db.close()