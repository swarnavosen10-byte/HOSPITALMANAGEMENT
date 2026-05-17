import { useState } from "react";
import { getAppointmentsByDoctor, getPatientsByHospital, type AppointmentStatus } from "../../data";
import { getDoctorScope } from "../../utils/roleScope";

export default function DoctorAppointments() {
  const { doctorId, hospitalId } = getDoctorScope();
  const patients = getPatientsByHospital(hospitalId);

  const [rows, setRows] = useState(() =>
    getAppointmentsByDoctor(doctorId).filter((appointment) => appointment.hospitalId === hospitalId)
  );

  const updateStatus = (id: string, status: AppointmentStatus) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, status } : row)));
  };

  const delayAppointment = (id: string, time: string) => {
    const [hour, minute] = time.split(":").map(Number);
    const delayedHour = String(hour).padStart(2, "0");
    const delayedMinute = String((minute + 15) % 60).padStart(2, "0");

    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, time: `${delayedHour}:${delayedMinute}`, status: "Scheduled" } : row
      )
    );
  };

  return (
    <div className="page-content space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Doctor Portal</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Appointment Actions</h1>
        <p className="text-slate-600">Approve, reject, reschedule, delay, cancel, and complete your appointment timeline.</p>
      </div>

      <div className="surface-card overflow-x-auto">
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
            {rows.map((row) => {
              const patient = patients.find((item) => item.id === row.patientId);
              return (
                <tr key={row.id} className="border-t border-slate-100 align-top transition hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-semibold text-cyan-700">{row.id}</td>
                  <td className="px-4 py-3 text-slate-700">{patient?.name ?? row.patientId}</td>
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
            })}
          </tbody>
        </table>

        {rows.length === 0 && <p className="p-4 text-sm text-slate-500">No appointments assigned.</p>}
      </div>
    </div>
  );
}
