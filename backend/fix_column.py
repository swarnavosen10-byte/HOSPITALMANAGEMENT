import os
from dotenv import load_dotenv
from sqlalchemy import create_engine, text

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

def fix_column():
    with engine.connect() as conn:
        try:
            # Change patientId to TEXT
            conn.execute(text('ALTER TABLE appointments ALTER COLUMN "patientId" TYPE TEXT'))
            conn.commit()
            print("Successfully changed patientId to TEXT")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    fix_column()
