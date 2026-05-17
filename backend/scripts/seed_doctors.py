import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models import Doctor

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine)

def seed_doctors():
    db = SessionLocal()
    try:
        # Clear existing doctors (optional, but good for clean sync)
        # db.query(Doctor).delete()
        
        mock_doctors = [
            {"id": 101, "hospitalId": 1, "department": "Cardiology", "name": "Dr. Rahul Das", "experience": 10, "availability": "Available", "fees": 900, "phone": "+91 90511 11001", "email": "rahul.das@medisync.com"},
            {"id": 102, "hospitalId": 1, "department": "Cardiology", "name": "Dr. Suman Ghosh", "experience": 8, "availability": "Limited", "fees": 850, "phone": "+91 90511 11002", "email": "suman.ghosh@medisync.com"},
            {"id": 103, "hospitalId": 1, "department": "Neurology", "name": "Dr. Tumpa Sen", "experience": 7, "availability": "Available", "fees": 1000, "phone": "+91 90511 11003", "email": "tumpa.sen@medisync.com"},
            {"id": 104, "hospitalId": 1, "department": "Orthopedics", "name": "Dr. Mita Roy", "experience": 9, "availability": "Available", "fees": 780, "phone": "+91 90511 11004", "email": "mita.roy@medisync.com"},
            {"id": 105, "hospitalId": 2, "department": "Cardiology", "name": "Dr. Arindam Pal", "experience": 12, "availability": "Limited", "fees": 950, "phone": "+91 90511 11005", "email": "arindam.pal@medisync.com"},
            {"id": 106, "hospitalId": 2, "department": "Dermatology", "name": "Dr. Sneha Sen", "experience": 6, "availability": "Available", "fees": 700, "phone": "+91 90511 11006", "email": "sneha.sen@medisync.com"},
            {"id": 107, "hospitalId": 2, "department": "ENT", "name": "Dr. Rakesh Mitra", "experience": 11, "availability": "On Leave", "fees": 650, "phone": "+91 90511 11007", "email": "rakesh.mitra@medisync.com"},
            {"id": 108, "hospitalId": 3, "department": "Pediatrics", "name": "Dr. Nabanita Paul", "experience": 9, "availability": "Available", "fees": 800, "phone": "+91 90511 11008", "email": "nabanita.paul@medisync.com"},
            {"id": 109, "hospitalId": 3, "department": "Neurology", "name": "Dr. Arnab Dey", "experience": 5, "availability": "Limited", "fees": 900, "phone": "+91 90511 11009", "email": "arnab.dey@medisync.com"},
            {"id": 110, "hospitalId": 4, "department": "Oncology", "name": "Dr. Sreya Mitra", "experience": 11, "availability": "Available", "fees": 1200, "phone": "+91 90511 11010", "email": "sreya.mitra@medisync.com"},
            {"id": 111, "hospitalId": 4, "department": "Cardiology", "name": "Dr. Souvik Kar", "experience": 9, "availability": "Limited", "fees": 980, "phone": "+91 90511 11011", "email": "souvik.kar@medisync.com"},
            {"id": 112, "hospitalId": 5, "department": "Nephrology", "name": "Dr. Ria Banerjee", "experience": 10, "availability": "Available", "fees": 1100, "phone": "+91 90511 11012", "email": "ria.banerjee@medisync.com"},
            {"id": 113, "hospitalId": 5, "department": "ENT", "name": "Dr. Debjit Ghosh", "experience": 8, "availability": "Available", "fees": 760, "phone": "+91 90511 11013", "email": "debjit.ghosh@medisync.com"},
            {"id": 114, "hospitalId": 6, "department": "Critical Care", "name": "Dr. Paroma Nandi", "experience": 13, "availability": "Available", "fees": 1400, "phone": "+91 90511 11014", "email": "paroma.nandi@medisync.com"},
            {"id": 115, "hospitalId": 6, "department": "Neurology", "name": "Dr. Sagnik Roy", "experience": 7, "availability": "Available", "fees": 1020, "phone": "+91 90511 11015", "email": "sagnik.roy@medisync.com"},
            {"id": 116, "hospitalId": 6, "department": "Orthopedics", "name": "Dr. Rupam Dutta", "experience": 9, "availability": "Limited", "fees": 930, "phone": "+91 90511 11016", "email": "rupam.dutta@medisync.com"},
        ]

        for doc_data in mock_doctors:
            # Check if doctor already exists to avoid duplicates
            existing = db.query(Doctor).filter(Doctor.id == doc_data["id"]).first()
            if not existing:
                doc = Doctor(
                    id=doc_data["id"],
                    name=doc_data["name"],
                    specialization=doc_data["department"],
                    hospitalId=doc_data["hospitalId"],
                    department=doc_data["department"],
                    experience=doc_data["experience"],
                    availability=doc_data["availability"],
                    fees=doc_data["fees"],
                    phone=doc_data["phone"],
                    email=doc_data["email"]
                )
                db.add(doc)
        
        db.commit()
        print("Doctors seeded successfully!")
    except Exception as e:
        print(f"Error seeding doctors: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_doctors()
