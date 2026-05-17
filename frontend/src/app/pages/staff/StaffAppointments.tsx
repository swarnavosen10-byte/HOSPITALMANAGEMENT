import { useMemo, useState } from "react";
import {
  getAppointmentsByHospital,
  getDoctorsByHospital,
  getPatientsByHospital,
  type AppointmentRecord,
  type AppointmentStatus,
} from "../../data";
import { getStaffHospitalId } from "../../utils/roleScope";

type AppointmentWithMeta = AppointmentRecord & {
  rescheduleNote?: string;
};

const appointmentActionStatus: Record<string, AppointmentStatus> = {
  approve: "Approved",
  reject: "Rejected",
  cancel: "Cancelled",
  complete: "Completed",
  noShow: "No-show",
};

export default function StaffAppointments() {
  const hospitalId = getStaffHospitalId();
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "All">("All");
  const [query, setQuery] = useState("");

  const patients = getPatientsByHospital(hospitalId);
  const doctors = getDoctorsByHospital(hospitalId);

  const [appointmentRows, setAppointmentRows] = useState<AppointmentWithMeta[]>(
    getAppointmentsByHospital(hospitalId)
  );

  const filteredAppointments = useMemo(() => {
    return appointmentRows.filter((appointment) => {
      const patient = patients.find((item) => item.id === appointment.patientId);
      const doctor = doctors.find((item) => item.id === appointment.doctorId);
      const normalized = query.toLowerCase().trim();

      const matchesQuery =
        appointment.id.toLowerCase().includes(normalized) ||
        patient?.name.toLowerCase().includes(normalized) ||
        doctor?.name.toLowerCase().includes(normalized);

      const matchesStatus = statusFilter === "All" || appointment.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [appointmentRows, doctors, patients, query, statusFilter]);

  const updateAppointment = (id: string, patch: Partial<AppointmentWithMeta>) => {
    setAppointmentRows((prev) => prev.map((appointment) => (appointment.id === id ? { ...appointment, ...patch } : appointment)));
  };

  const handleReschedule = (appointment: AppointmentWithMeta) => {
    const [hourText, minuteText] = appointment.time.split(":");
    const nextHour = String((Number(hourText) + 1) % 24).padStart(2, "0");
    updateAppointment(appointment.id, {
      time: `${nextHour}:${minuteText}`,
      status: "Scheduled",
      rescheduleNote: `Shifted from ${appointment.time} to ${nextHour}:${minuteText}`,
    });
  };

  const statusOptions: Array<AppointmentStatus | "All"> = [
    "All",
    "Pending Approval",
    "Approved",
    "Scheduled",
    "In Progress",
    "Completed",
    "Cancelled",
    "Rejected",
    "No-show",
  ];

  return (
    <div className="page-content space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Hospital Staff</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Appointment Management</h1>
        <p className="text-slate-600">Approve, reschedule, and complete appointments for your hospital operation desk.</p>
      </div>

      <div className="surface-card grid grid-cols-1 gap-3 p-4 md:grid-cols-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by ID, patient, doctor"
          className="md:col-span-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as AppointmentStatus | "All")}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status === "All" ? "All Status" : status}
            </option>
          ))}
        </select>
      </div>

      <div className="surface-card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Appointment</th>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Doctor</th>
              <th className="px-4 py-3">Date & Time</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((appointment) => {
              const patient = patients.find((item) => item.id === appointment.patientId);
              const doctor = doctors.find((item) => item.id === appointment.doctorId);

              return (
                <tr key={appointment.id} className="border-t border-slate-100 align-top transition hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-cyan-700">{appointment.id}</p>
                    {appointment.rescheduleNote && (
                      <p className="text-xs text-amber-600">{appointment.rescheduleNote}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700">{patient?.name ?? appointment.patientId}</td>
                  <td className="px-4 py-3 text-slate-700">{doctor?.name ?? `Dr. ${appointment.doctorId}`}</td>
                  <td className="px-4 py-3 text-slate-700">{appointment.date} • {appointment.time}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800">
                      {appointment.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => updateAppointment(appointment.id, { status: appointmentActionStatus.approve })} className="rounded-lg bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800 transition hover:bg-cyan-100">Approve</button>
                      <button onClick={() => updateAppointment(appointment.id, { status: appointmentActionStatus.reject })} className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100">Reject</button>
                      <button onClick={() => handleReschedule(appointment)} className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-100">Reschedule</button>
                      <button onClick={() => updateAppointment(appointment.id, { status: appointmentActionStatus.cancel })} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200">Cancel</button>
                      <button onClick={() => updateAppointment(appointment.id, { status: appointmentActionStatus.complete })} className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100">Complete</button>
                      <button onClick={() => updateAppointment(appointment.id, { status: appointmentActionStatus.noShow })} className="rounded-lg bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 transition hover:bg-orange-100">No-show</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredAppointments.length === 0 && (
          <p className="p-4 text-sm text-slate-500">No appointments found for this filter set.</p>
        )}
      </div>
    </div>
  );
}
