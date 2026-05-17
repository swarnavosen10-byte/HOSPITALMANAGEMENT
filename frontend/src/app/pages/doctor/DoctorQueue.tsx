import { useMemo, useState } from "react";
import { getAppointmentsByDoctor, getPatientsByHospital, type AppointmentRecord } from "../../data";
import { getDoctorScope } from "../../utils/roleScope";

type QueueStatus = "Current" | "Upcoming" | "Completed" | "Emergency";

type QueueRow = AppointmentRecord & {
  queueStatus: QueueStatus;
};

export default function DoctorQueue() {
  const { doctorId, hospitalId } = getDoctorScope();
  const patients = getPatientsByHospital(hospitalId);
  const [rows, setRows] = useState<QueueRow[]>(
    getAppointmentsByDoctor(doctorId)
      .filter((appointment) => appointment.hospitalId === hospitalId)
      .map((appointment, index) => ({
      ...appointment,
      queueStatus: index === 0 ? "Current" : "Upcoming",
    }))
  );

  const queues = useMemo(
    () => ({
      current: rows.filter((row) => row.queueStatus === "Current"),
      upcoming: rows.filter((row) => row.queueStatus === "Upcoming"),
      completed: rows.filter((row) => row.queueStatus === "Completed"),
      emergency: rows.filter((row) => row.queueStatus === "Emergency"),
    }),
    [rows]
  );

  const setQueueStatus = (id: string, queueStatus: QueueStatus) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, queueStatus } : row)));
  };

  const renderSection = (title: string, list: QueueRow[]) => (
    <div className="surface-card p-4">
      <h2 className="mb-3 text-base font-bold text-slate-900">{title}</h2>
      <div className="space-y-3">
        {list.map((row) => {
          const patient = patients.find((item) => item.id === row.patientId);
          return (
            <div key={row.id} className="rounded-xl border border-slate-100 bg-white p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-slate-900">{patient?.name ?? row.patientId}</p>
                <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800">{row.time}</span>
              </div>
              <p className="text-xs text-slate-500">{row.id} • {row.type}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <button onClick={() => setQueueStatus(row.id, "Current")} className="rounded-lg bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800 transition hover:bg-cyan-100">Current</button>
                <button onClick={() => setQueueStatus(row.id, "Upcoming")} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200">Upcoming</button>
                <button onClick={() => setQueueStatus(row.id, "Completed")} className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100">Completed</button>
                <button onClick={() => setQueueStatus(row.id, "Emergency")} className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100">Emergency</button>
              </div>
            </div>
          );
        })}
        {list.length === 0 && <p className="text-sm text-slate-500">No patients in this queue.</p>}
      </div>
    </div>
  );

  return (
    <div className="page-content space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Doctor Portal</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Patient Queue</h1>
        <p className="text-slate-600">Track current, upcoming, completed, and emergency patient flow.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {renderSection("Current Patients", queues.current)}
        {renderSection("Upcoming Patients", queues.upcoming)}
        {renderSection("Completed Consultations", queues.completed)}
        {renderSection("Emergency Queue", queues.emergency)}
      </div>
    </div>
  );
}
