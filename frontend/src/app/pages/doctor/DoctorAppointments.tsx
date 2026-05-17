import { useState, useEffect } from "react";
import { getPatientsByHospital, type AppointmentStatus } from "../../data";
import { getDoctorScope } from "../../utils/roleScope";
import { api } from "../../services/api.ts";

export default function DoctorAppointments() {
  const { doctorId, hospitalId } = getDoctorScope();
  const patients = getPatientsByHospital(hospitalId);

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const data = await api.get<any[]>("/appointments");
      const filtered = data.filter(
        (apt: any) =>
          String(apt.doctorId) === String(doctorId) &&
          Number(apt.hospitalId) === Number(hospitalId)
      );

      const statusOrder: Record<string, number> = {
        "In Progress": 1,
        "Pending Approval": 2,
        "Approved": 3,
        "Scheduled": 4,
        "Completed": 5,
        "No-show": 6,
        "Cancelled": 7,
        "Rejected": 8,
      };

      filtered.sort((a: any, b: any) => {
        const orderA = statusOrder[a.status] ?? 99;
        const orderB = statusOrder[b.status] ?? 99;
        return orderA - orderB;
      });

      setRows(filtered);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [doctorId, hospitalId]);

  const updateStatus = async (id: any, status: AppointmentStatus) => {
    try {
      await api.put(`/appointments/${id}`, { status });
      await fetchAppointments();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const delayAppointment = async (id: any, time: string) => {
    // Support both standard format e.g. "10:00 AM" and "10:00"
    const [timePart, ampm] = time.split(" ");
    const [hourText, minuteText] = timePart.split(":");
    let hour = Number(hourText);
    const minute = Number(minuteText);

    const nextMinute = (minute + 15) % 60;
    if (minute + 15 >= 60) {
      hour = (hour + 1) % 12 || 12;
    }
    const delayedHour = String(hour).padStart(2, "0");
    const delayedMinute = String(nextMinute).padStart(2, "0");
    const newTime = ampm ? `${delayedHour}:${delayedMinute} ${ampm}` : `${delayedHour}:${delayedMinute}`;

    try {
      await api.put(`/appointments/${id}`, { time: newTime, status: "Scheduled" });
      await fetchAppointments();
    } catch (err) {
      console.error("Failed to delay appointment:", err);
    }
  };

  return (
    <div className="page-content space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Doctor Portal</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Appointment Actions</h1>
        <p className="text-slate-600">Approve, reject, reschedule, delay, cancel, and complete your appointment timeline.</p>
      </div>

      <div className="surface-card overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-cyan-700 border-t-transparent"></div>
            <p className="mt-2 text-sm text-slate-500">Loading appointments...</p>
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Appointment</th>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                let activeCount = 0;
                return rows.map((row) => {
                  const patient = patients.find((item) => item.id === row.patientId);
                  const isActive = ["In Progress", "Pending Approval", "Approved", "Scheduled"].includes(row.status);
                  const displayNo = isActive ? ++activeCount : "—";
                  return (
                    <tr key={row.id} className="border-t border-slate-100 align-top transition hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-semibold text-cyan-700">{displayNo}</td>
                      <td className="px-4 py-3 text-slate-700">{row.patientName ?? patient?.name ?? `Patient #${row.patientId}`}</td>
                      <td className="px-4 py-3 text-slate-700">{row.date}</td>
                      <td className="px-4 py-3 text-slate-700">{row.time}</td>
                      <td className="px-4 py-3"><span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800">{row.status}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => updateStatus(row.id, "Approved")} className="rounded-lg bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800 transition hover:bg-cyan-100">Approve</button>
                          <button onClick={() => updateStatus(row.id, "Rejected")} className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100">Reject</button>
                          <button onClick={() => updateStatus(row.id, "Scheduled")} className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100">Reschedule</button>
                          <button onClick={() => delayAppointment(row.id, row.time)} className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-100">Delay +15m</button>
                          <button onClick={() => updateStatus(row.id, "Cancelled")} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200">Cancel</button>
                          <button onClick={() => updateStatus(row.id, "Completed")} className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100">Complete</button>
                        </div>
                      </td>
                    </tr>
                  );
                });
              })()}
            </tbody>
          </table>
        )}

        {!loading && rows.length === 0 && <p className="p-4 text-sm text-slate-500">No appointments assigned.</p>}
      </div>
    </div>
  );
}
