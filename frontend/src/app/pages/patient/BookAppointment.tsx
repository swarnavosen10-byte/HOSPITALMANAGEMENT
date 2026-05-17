import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { getHospitalById, type Doctor } from "../../data";
import { getUser } from "../../utils/auth";
import { api } from "../../services/api.ts";

export default function BookAppointment() {
  const { doctorId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const hospitalId = Number(searchParams.get("hospitalId"));
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const hospital = getHospitalById(hospitalId);

  const [date, setDate] = useState("");
  const [time, setTime] = useState("10:00 AM");
  const [type, setType] = useState("Consultation");
  const [mode, setMode] = useState("In-person");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  const timeSlots = [
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "02:00 PM",
    "04:00 PM",
  ];

  useEffect(() => {
    async function fetchDoctor() {
      setLoading(true);
      try {
        const data = await api.get<any[]>("/doctors");
        const found = data.find((d: any) => String(d.id) === String(doctorId));
        if (found) {
          setDoctor({
            id: found.id,
            hospitalId: found.hospitalId,
            department: found.department || found.specialization || "General",
            name: found.name,
            experience: found.experience || 0,
            availability: found.availability || "Available",
            fees: found.fees || 500,
            phone: found.phone || "N/A",
            email: found.email || "N/A",
          });
        }
      } catch (err) {
        console.error("Failed to fetch doctor:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDoctor();
  }, [doctorId]);

  const handleConfirm = async () => {
    if (!date) {
      setMessage("Please select a date.");
      return;
    }

    if (!doctor) return;

    try {
      const user = getUser();
      const payload = {
        patientId: user?.id ?? 999,
        patientName: user?.displayName ?? user?.username ?? "Patient User",
        doctorId: doctor.id,
        doctorName: doctor.name,
        hospitalId: hospitalId,
        date,
        time,
        status: "Scheduled",
        type,
        mode,
        notes: notes || "Booked via Patient Portal"
      };

      await api.post("/appointments", payload);

      setMessage("Appointment confirmed! Redirecting...");
      setTimeout(() => {
        navigate("/patient-dashboard/my-appointments");
      }, 1500);
    } catch (err) {
      console.error("Failed to book appointment:", err);
      setMessage("Error booking appointment. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-cyan-700 border-t-transparent"></div>
        <p className="mt-2 text-sm text-slate-500">Loading doctor details...</p>
      </div>
    );
  }

  if (!doctor || !hospital) {
    return <div className="p-6">Doctor or Hospital details not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="surface-card p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Appointment Booking</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Book Appointment</h1>
        <p className="mt-2 text-slate-600">Doctor: {doctor.name}</p>
        <p className="text-slate-600">Hospital: {hospital.name}</p>
        <p className="text-sm font-semibold text-cyan-700">Consultation Fee: ₹{doctor.fees}</p>
      </div>

      <div className="surface-card max-w-2xl p-6">
        <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-semibold text-slate-700">
          Select date
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            aria-label="Appointment date"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
          />
        </label>

        <label className="block text-sm font-semibold text-slate-700">
          Select time slot
          <select
            value={time}
            onChange={(e) => setTime(e.target.value)}
            aria-label="Appointment time slot"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
          >
            {timeSlots.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm font-semibold text-slate-700 mt-2">
          Appointment Type
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            aria-label="Appointment type"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
          >
            <option value="Consultation">General Consultation</option>
            <option value="Follow-up">Follow-up Visit</option>
            <option value="Routine Checkup">Routine Checkup</option>
            <option value="Emergency">Emergency Appointment</option>
          </select>
        </label>

        <label className="block text-sm font-semibold text-slate-700 mt-2">
          Consultation Mode
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            aria-label="Consultation mode"
            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
          >
            <option value="In-person">In-Person (Walk-In)</option>
            <option value="Video Consultation">Video Call (Virtual)</option>
            <option value="Tele-health">Telephonic Consultation</option>
          </select>
        </label>
      </div>

      <label className="block text-sm font-semibold text-slate-700 mt-4">
        Describe Symptoms / Notes (Optional)
        <textarea
          placeholder="Describe any symptoms, medical history, or specific notes for the doctor..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          aria-label="Symptoms or notes"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 resize-none"
        />
      </label>

        <button
          onClick={handleConfirm}
          aria-label="Confirm appointment booking"
          className="mt-5 rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-700"
        >
          Confirm Booking
        </button>

        {message && (
          <p role="status" aria-live="polite" className={`mt-3 rounded-xl px-3 py-2 text-sm font-medium ${message.includes("Error") ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
}