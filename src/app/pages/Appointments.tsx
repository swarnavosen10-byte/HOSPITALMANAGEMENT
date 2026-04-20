import { useEffect, useState } from "react";

type Appointment = {
  id: number;
  patient: string;
  doctor: string;
};

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patient, setPatient] = useState("");
  const [doctor, setDoctor] = useState("");

  const fetchAppointments = () => {
    fetch("http://127.0.0.1:8000/appointments")
      .then((res) => res.json())
      .then((data) => setAppointments(data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const addAppointment = async () => {
    if (!patient || !doctor) {
      alert("Enter patient and doctor");
      return;
    }

    const newAppointment = {
      id: Date.now(),
      patient,
      doctor,
    };

    try {
      const res = await fetch("http://127.0.0.1:8000/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAppointment),
      });

      await res.json();
      setPatient("");
      setDoctor("");
      fetchAppointments();
    } catch (err) {
      console.log("Error:", err);
    }
  };

  const deleteAppointment = async (id: number) => {
    try {
      await fetch(`http://127.0.0.1:8000/appointments/${id}`, {
        method: "DELETE",
      });

      fetchAppointments();
    } catch (err) {
      console.log("Delete error:", err);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Appointments</h1>

      {/* Add Form */}
      <div className="bg-white rounded-xl shadow p-4 mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Enter patient"
          value={patient}
          onChange={(e) => setPatient(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full"
        />

        <input
          type="text"
          placeholder="Enter doctor"
          value={doctor}
          onChange={(e) => setDoctor(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full"
        />

        <button
          onClick={addAppointment}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          Add
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="grid grid-cols-3 px-6 py-3 text-sm font-semibold text-gray-500 border-b">
          <span>Patient</span>
          <span>Doctor</span>
          <span>Action</span>
        </div>

        {appointments.map((a) => (
          <div
            key={a.id}
            className="grid grid-cols-3 px-6 py-4 text-sm border-b"
          >
            <span>{a.patient}</span>
            <span>{a.doctor}</span>

            <button
              onClick={() => deleteAppointment(a.id)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}