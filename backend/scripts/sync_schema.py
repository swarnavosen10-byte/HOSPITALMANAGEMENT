import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from app.database import Base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def sync_schema():
    if not DATABASE_URL:
        print("DATABASE_URL not found in .env")
        return

    print(f"Connecting to: {DATABASE_URL.split('@')[-1]}")
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # 1. Ensure tables exist
        Base.metadata.create_all(bind=engine)
        print("Basic tables check complete.")

        # 2. Force add missing columns for Supabase (Postgres)
        # SQLAlchemy create_all doesn't add columns to existing tables
        tables = {
            "patients": ["gender", "diagnosis", "status", '"hospitalId"'],
            "doctors": ["hospitalId", "department", "experience", "availability", "fees", "phone", "email"],
            "appointments": ["patientId", "doctorId", "hospitalId", "type", "mode", "notes"],
            "hospitals": ["district", "open_time", "close_time", "rating"]
        }

        for table, columns in tables.items():
            for col in columns:
                try:
                    # Clean column name for SQL (handle casing)
                    col_name = col if col.startswith('"') else f'"{col}"'
                    
                    # Determine type
                    col_type = "INTEGER" if "Id" in col or "experience" in col or "fees" in col or "beds" in col else "TEXT"
                    if "rating" in col: col_type = "FLOAT"
                    
                    conn.execute(text(f'ALTER TABLE {table} ADD COLUMN IF NOT EXISTS {col_name} {col_type}'))
                    conn.commit()
                    print(f"Checked column {col} in {table}")
                except Exception as e:
                    print(f"Skipped {col} in {table}: {e}")

    print("Schema sync complete.")

if __name__ == "__main__":
    sync_schema()
