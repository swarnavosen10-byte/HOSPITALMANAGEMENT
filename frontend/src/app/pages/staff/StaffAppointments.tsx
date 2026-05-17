import { useMemo, useState, useEffect } from "react";
import {
  getDoctorsByHospital,
  getPatientsByHospital,
  type AppointmentStatus,
} from "../../data";
import { getStaffHospitalId } from "../../utils/roleScope";
import { api } from "../../services/api.ts";

type AppointmentWithMeta = {
  id: any;
  patientId: string;
  doctorId: number;
  hospitalId: number;
  date: string;
  time: string;
  status: AppointmentStatus;
  type: string;
  mode: string;
  notes: string;
  rescheduleNote?: string;
  patientName?: string;
  doctorName?: string;
  completionOrCancellationDate?: string;
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
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "All">("All");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const patients = getPatientsByHospital(hospitalId);
  const doctors = getDoctorsByHospital(hospitalId);

  const [appointmentRows, setAppointmentRows] = useState<AppointmentWithMeta[]>([]);
  const [pastAppointmentRows, setPastAppointmentRows] = useState<AppointmentWithMeta[]>([]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const [activeData, pastData] = await Promise.all([
        api.get<any[]>("/appointments"),
        api.get<any[]>("/past_appointments")
      ]);

      const filteredActive = activeData.filter((apt: any) => Number(apt.hospitalId) === Number(hospitalId));
      const filteredPast = pastData.filter((apt: any) => Number(apt.hospitalId) === Number(hospitalId));

      const statusOrder: Record<string, number> = {
        "In Progress": 1,
        "Pending Approval": 2,
        "Approved": 3,
        "Scheduled": 4,
      };

      filteredActive.sort((a: any, b: any) => {
        const orderA = statusOrder[a.status] ?? 99;
        const orderB = statusOrder[b.status] ?? 99;
        return orderA - orderB;
      });

      filteredPast.sort((a: any, b: any) => {
        return String(b.completionOrCancellationDate).localeCompare(String(a.completionOrCancellationDate));
      });

      setAppointmentRows(filteredActive);
      setPastAppointmentRows(filteredPast);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [hospitalId]);

  const filteredActiveAppointments = useMemo(() => {
    return appointmentRows.filter((appointment) => {
      const patient = patients.find((item) => item.id === appointment.patientId);
      const doctor = doctors.find((item) => item.id === appointment.doctorId);
      const normalized = query.toLowerCase().trim();

      const matchesQuery =
        String(appointment.id).toLowerCase().includes(normalized) ||
        (appointment.patientName ?? patient?.name ?? "").toLowerCase().includes(normalized) ||
        (appointment.doctorName ?? doctor?.name ?? "").toLowerCase().includes(normalized);

      const matchesStatus = statusFilter === "All" || appointment.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [appointmentRows, doctors, patients, query, statusFilter]);

  const filteredPastAppointments = useMemo(() => {
    return pastAppointmentRows.filter((appointment) => {
      const patient = patients.find((item) => item.id === appointment.patientId);
      const doctor = doctors.find((item) => item.id === appointment.doctorId);
      const normalized = query.toLowerCase().trim();

      const matchesQuery =
        String(appointment.id).toLowerCase().includes(normalized) ||
        (appointment.patientName ?? patient?.name ?? "").toLowerCase().includes(normalized) ||
        (appointment.doctorName ?? doctor?.name ?? "").toLowerCase().includes(normalized);

      return matchesQuery;
    });
  }, [pastAppointmentRows, doctors, patients, query]);

  const updateAppointment = async (id: any, patch: Partial<AppointmentWithMeta>) => {
    try {
      await api.put(`/appointments/${id}`, patch);
      await fetchAppointments();
    } catch (err) {
      console.error("Failed to update appointment:", err);
    }
  };

  const handleReschedule = async (appointment: AppointmentWithMeta) => {
    const [timePart, ampm] = appointment.time.split(" ");
    const [hourText, minuteText] = timePart.split(":");
    let hour = Number(hourText);
    const nextHour = String((hour + 1) % 12 || 12).padStart(2, "0");
    const newTime = ampm ? `${nextHour}:${minuteText} ${ampm}` : `${nextHour}:${minuteText}`;
    
    try {
      await api.put(`/appointments/${appointment.id}`, {
        time: newTime,
        status: "Scheduled",
        notes: `Rescheduled from ${appointment.time} to ${newTime}`
      });
      await fetchAppointments();
    } catch (err) {
      console.error("Failed to reschedule:", err);
    }
  };

  const statusOptions: Array<AppointmentStatus | "All"> = [
    "All",
    "Pending Approval",
    "Approved",
    "Scheduled",
    "In Progress",
  ];

  return (
    <div className="page-content space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Hospital Staff</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Appointments Desk</h1>
        <p className="text-slate-600">Approve, reschedule, and complete appointments for your hospital branch desk.</p>
      </div>

      {/* Premium Navigation Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-6 py-3 text-sm font-bold tracking-tight border-b-2 transition ${
            activeTab === "active"
              ? "border-cyan-600 text-cyan-700"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Active Desk Operations ({appointmentRows.length})
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`px-6 py-3 text-sm font-bold tracking-tight border-b-2 transition ${
            activeTab === "past"
              ? "border-cyan-600 text-cyan-700"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Archived Branch History ({pastAppointmentRows.length})
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="surface-card grid grid-cols-1 gap-3 p-4 md:grid-cols-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by patient, doctor..."
          className={`rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 ${
            activeTab === "active" ? "md:col-span-3" : "md:col-span-4"
          }`}
        />

        {activeTab === "active" && (
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as AppointmentStatus | "All")}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status === "All" ? "All Active Status" : status}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="surface-card overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-cyan-700 border-t-transparent"></div>
            <p className="mt-2 text-sm text-slate-500">Loading branch timeline...</p>
          </div>
        ) : activeTab === "active" ? (
          <div>
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Slot No.</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Assigned Doctor</th>
                  <th className="px-4 py-3">Date & Time</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(() => {
                  let activeCount = 0;
                  return filteredActiveAppointments.map((appointment) => {
                    const patient = patients.find((item) => item.id === appointment.patientId);
                    const doctor = doctors.find((item) => item.id === appointment.doctorId);
                    const isActive = ["In Progress", "Pending Approval", "Approved", "Scheduled"].includes(appointment.status);
                    const displayNo = isActive ? ++activeCount : "—";

                    return (
                      <tr key={appointment.id} className="border-t border-slate-100 align-top transition hover:bg-slate-50/70">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-cyan-700">{displayNo}</p>
                          {appointment.rescheduleNote && (
                            <p className="text-xs text-amber-600">{appointment.rescheduleNote}</p>
                          )}
                        </td>
                        <td className="px-4 py-3 text-slate-700">{appointment.patientName ?? patient?.name ?? `Patient #${appointment.patientId}`}</td>
                        <td className="px-4 py-3 text-slate-700">{appointment.doctorName ?? doctor?.name ?? `Dr. ${appointment.doctorId}`}</td>
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
                  });
                })()}
              </tbody>
            </table>
            {filteredActiveAppointments.length === 0 && (
              <p className="p-6 text-sm text-slate-500 text-center">No active scheduled consultations matching criteria.</p>
            )}
          </div>
        ) : (
          <div>
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">Index</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="px-4 py-3">Treatment Date</th>
                  <th className="px-4 py-3">Archive Status</th>
                  <th className="px-4 py-3">Resolution Date</th>
                  <th className="px-4 py-3">Operation Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredPastAppointments.map((appointment, index) => {
                  const patient = patients.find((item) => item.id === appointment.patientId);
                  const doctor = doctors.find((item) => item.id === appointment.doctorId);
                  const isCompleted = appointment.status === "Completed";

                  return (
                    <tr key={appointment.id} className="border-t border-slate-100 align-top transition hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-semibold text-slate-500">{index + 1}</td>
                      <td className="px-4 py-3 text-slate-700">{appointment.patientName ?? patient?.name ?? `Patient #${appointment.patientId}`}</td>
                      <td className="px-4 py-3 text-slate-700">{appointment.doctorName ?? doctor?.name ?? `Dr. ${appointment.doctorId}`}</td>
                      <td className="px-4 py-3 text-slate-600">{appointment.date} • {appointment.time}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          isCompleted ? "bg-emerald-50 text-emerald-800" : "bg-rose-50 text-rose-800"
                        }`}>
                          {appointment.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 font-medium">{appointment.completionOrCancellationDate ?? "Archived"}</td>
                      <td className="px-4 py-3 text-slate-500 italic max-w-xs truncate">{appointment.notes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredPastAppointments.length === 0 && (
              <p className="p-6 text-sm text-slate-500 text-center">No past treatment history archived for this branch.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
