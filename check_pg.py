import os
import psycopg2
from urllib.parse import urlparse

url = "postgresql://postgres.vxdvzmunvpedpqdlgghx:soham2005bne@aws-1-ap-southeast-2.pooler.supabase.com:6543/postgres"

parsed_url = urlparse(url)
conn = psycopg2.connect(
    dbname=parsed_url.path[1:],
    user=parsed_url.username,
    password=parsed_url.password,
    host=parsed_url.hostname,
    port=parsed_url.port
)

cur = conn.cursor()
try:
    cur.execute('SELECT "id", "doctorId", "patientId", "createdAt" FROM prescriptions')
    print("PRESCRIPTIONS:", cur.fetchall())
except Exception as e:
    print("Prescriptions error:", e)
    conn.rollback()

try:
    cur.execute('SELECT "id", "doctorId", "patientId", "date", "completionOrCancellationDate" FROM past_appointments')
    print("PAST APPOINTMENTS:", cur.fetchall())
except Exception as e:
    print("Past appointments error:", e)
    conn.rollback()

cur.close()
conn.close()
