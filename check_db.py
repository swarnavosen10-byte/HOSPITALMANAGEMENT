import sqlite3
conn = sqlite3.connect('backend/hospital.db')
print("TABLES:", conn.execute('SELECT name FROM sqlite_master WHERE type="table"').fetchall())
try:
    print("PRESCRIPTIONS:", conn.execute('SELECT id, doctorId, patientId, createdAt FROM prescriptions').fetchall())
except Exception as e:
    print("Prescriptions error:", e)

try:
    print("PAST APPOINTMENTS:", conn.execute('SELECT id, doctorId, patientId, date, completionOrCancellationDate FROM past_appointments').fetchall())
except Exception as e:
    print("Past appointments error:", e)
