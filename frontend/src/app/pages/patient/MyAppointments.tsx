import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../services/api.ts";
import { getUser } from "../../utils/auth";
import { hospitals, doctors as mockDoctors } from "../../data";

export type PatientAppointment = {
  id: string;
  patientId: string;
  doctorId: number;
  hospitalId: number;
  date: string;
  time: string;
  status: "Scheduled" | "Completed" | "Cancelled" | "Pending Approval" | "Approved" | "In Progress" | "Rejected" | "No-show";
  type: string;
  mode: string;
  notes: string;
  doctorName?: string;
  hospitalName?: string;
  department?: string;
  completionOrCancellationDate?: string;
};

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<PatientAppointment[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"active" | "past">("active");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const user = getUser();
      const patientId = user?.id ?? 999;

      const [appointmentsData, pastAppointmentsData, doctorsData, prescriptionsData] = await Promise.all([
        api.get<any[]>("/appointments"),
        api.get<any[]>("/past_appointments"),
        api.get<any[]>("/doctors").catch(() => []),
        api.get<any[]>(`/prescriptions/patient/${patientId}`).catch(() => [])
      ]);

      const mapAppointment = (apt: any) => {
        const doctor = doctorsData.find((d: any) => d.id === apt.doctorId) || 
                       mockDoctors.find((d) => d.id === apt.doctorId);
        const hospital = hospitals.find((h) => h.id === apt.hospitalId);

        return {
          ...apt,
          doctorName: apt.doctorName ?? doctor?.name ?? `Dr. (ID: ${apt.doctorId})`,
          hospitalName: hospital?.name || `Hospital (ID: ${apt.hospitalId})`,
          department: doctor?.department || doctor?.specialization || "General"
        };
      };

      const myActive = appointmentsData
        .filter((apt: any) => Number(apt.patientId) === Number(patientId))
        .map(mapAppointment);

      const myPast = pastAppointmentsData
        .filter((apt: any) => Number(apt.patientId) === Number(patientId))
        .map(mapAppointment);

      setAppointments(myActive);
      setPastAppointments(myPast);
      setPrescriptions(prescriptionsData || []);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const upcomingCount = useMemo(
    () => appointments.filter((apt) => ["Scheduled", "Approved", "Pending Approval"].includes(apt.status)).length,
    [appointments]
  );

  const completedCount = useMemo(
    () => pastAppointments.filter((apt) => apt.status === "Completed").length,
    [pastAppointments]
  );

  const cancelledCount = useMemo(
    () => pastAppointments.filter((apt) => ["Cancelled", "Rejected"].includes(apt.status)).length,
    [pastAppointments]
  );

  const updateStatus = async (
    appointmentId: string,
    status: "Scheduled" | "Completed" | "Cancelled"
  ) => {
    try {
      await api.put(`/appointments/${appointmentId}`, { status });
      await fetchData();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const statusStyle = (status: string) => {
    if (["Scheduled", "Approved"].includes(status)) return "bg-blue-100 text-blue-600";
    if (status === "Completed") return "bg-green-100 text-green-600";
    if (["Cancelled", "Rejected"].includes(status)) return "bg-red-100 text-red-600";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Patient Timeline</p>
        <h2 className="mt-2 text-3xl font-extrabold text-slate-900">My Appointments</h2>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="stagger grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">Upcoming Active</p>
          <p className="text-2xl font-bold text-slate-900">{upcomingCount}</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">Completed Sessions</p>
          <p className="text-2xl font-bold text-slate-900">{completedCount}</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">Cancelled / Rejected</p>
          <p className="text-2xl font-bold text-slate-900">{cancelledCount}</p>
        </div>
      </div>

      {/* Premium Tab Selector */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setActiveTab("active")}
          className={`px-6 py-3 text-sm font-bold tracking-tight border-b-2 transition ${
            activeTab === "active"
              ? "border-cyan-600 text-cyan-700"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Upcoming Bookings ({appointments.length})
        </button>
        <button
          onClick={() => setActiveTab("past")}
          className={`px-6 py-3 text-sm font-bold tracking-tight border-b-2 transition ${
            activeTab === "past"
              ? "border-cyan-600 text-cyan-700"
              : "border-transparent text-slate-400 hover:text-slate-600"
          }`}
        >
          Past Consultations ({pastAppointments.length})
        </button>
      </div>

      <div className="stagger space-y-4">
        {loading ? (
          <div className="p-10 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-cyan-700 border-t-transparent"></div>
            <p className="mt-2 text-sm text-slate-500">Loading your appointments...</p>
          </div>
        ) : activeTab === "active" ? (
          appointments.map((appointment) => (
            <div key={appointment.id} className="surface-card p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{appointment.doctorName}</h3>
                  <p className="text-slate-600">{appointment.department}</p>
                  <p className="text-slate-700 font-medium">{appointment.hospitalName}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>

              <div className="flex justify-between mt-4 items-center">
                <div className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">{appointment.date}</span> at <span className="font-semibold text-slate-900">{appointment.time}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  {["Scheduled", "Pending Approval", "Approved"].includes(appointment.status) && (
                    <button
                      onClick={() => updateStatus(appointment.id, "Cancelled")}
                      className="text-sm font-semibold text-rose-600 hover:text-rose-700 transition"
                    >
                      Cancel Appointment
                    </button>
                  )}
                </div>
              </div>
              {appointment.notes && (
                <p className="mt-3 text-xs text-slate-500 italic border-t pt-2">Note: {appointment.notes}</p>
              )}
            </div>
          ))
        ) : (
          pastAppointments.map((appointment) => (
            <div key={appointment.id} className="surface-card p-5 bg-slate-50/50">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{appointment.doctorName}</h3>
                  <p className="text-slate-600">{appointment.department}</p>
                  <p className="text-slate-700 font-medium">{appointment.hospitalName}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusStyle(appointment.status)}`}>
                  {appointment.status}
                </span>
              </div>

              <div className="flex justify-between mt-4 items-center">
                <div className="text-sm text-slate-600">
                  <span className="font-semibold text-slate-900">{appointment.date}</span> at <span className="font-semibold text-slate-900">{appointment.time}</span>
                </div>
                <div className="text-xs text-slate-500 font-medium flex items-center gap-4">
                  <span>Resolved on: {appointment.completionOrCancellationDate ?? "Archived"}</span>
                  {appointment.status === "Completed" && prescriptions.some(rx => (rx.createdAt === appointment.date || rx.createdAt === appointment.completionOrCancellationDate) && Number(rx.doctorId) === Number(appointment.doctorId)) && (
                    <button 
                      onClick={() => navigate('/patient-dashboard/prescriptions', { state: { date: appointment.completionOrCancellationDate || appointment.date, doctorId: appointment.doctorId } })}
                      className="text-cyan-600 bg-cyan-50 px-3 py-1 rounded-full font-bold hover:bg-cyan-100 transition"
                    >
                      View Prescription
                    </button>
                  )}
                </div>
              </div>
              {appointment.notes && (
                <p className="mt-3 text-xs text-slate-500 italic border-t pt-2">Resolution Note: {appointment.notes}</p>
              )}
            </div>
          ))
        )}

        {!loading && activeTab === "active" && appointments.length === 0 && (
          <div className="surface-card p-10 text-center">
            <p className="text-slate-500">You don't have any upcoming appointments yet.</p>
            <button 
              onClick={() => window.location.href = '/patient-dashboard'}
              className="mt-4 text-cyan-700 font-semibold hover:underline"
            >
              Book your first appointment
            </button>
          </div>
        )}

        {!loading && activeTab === "past" && pastAppointments.length === 0 && (
          <div className="surface-card p-10 text-center">
            <p className="text-slate-500">No past consultations found in your history.</p>
          </div>
        )}
      </div>
    </div>
  );
}