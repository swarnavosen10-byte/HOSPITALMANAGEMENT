import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Appointment, Base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def test_insert():
    db = SessionLocal()
    try:
        new_apt = Appointment(
            patientId="test_user",
            doctorId=101,
            hospitalId=1,
            date="2026-05-15",
            time="10:00 AM",
            type="Consultation",
            mode="In-person",
            status="Scheduled",
            notes="Direct insert test"
        )
        db.add(new_apt)
        db.commit()
        print("Insert successful!")
    except Exception as e:
        print(f"Insert failed: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    test_insert()
