import urllib.request
import json

url = "http://localhost:8000/appointments"
data = {
    "patientId": "test_patient",
    "doctorId": 101,
    "hospitalId": 1,
    "date": "2026-05-15",
    "time": "10:00 AM",
    "type": "Consultation",
    "mode": "In-person",
    "status": "Scheduled",
    "notes": "Testing diagnostic"
}
headers = {
    "Content-Type": "application/json",
    "x-api-key": "dev-secret-key"
}

req = urllib.request.Request(url, data=json.dumps(data).encode(), headers=headers, method="POST")

try:
    with urllib.request.urlopen(req) as response:
        print(f"Status: {response.status}")
        print(f"Body: {response.read().decode()}")
except urllib.error.HTTPError as e:
    print(f"Error Status: {e.code}")
    print(f"Error Body: {e.read().decode()}")
except Exception as e:
    print(f"Failed: {e}")
