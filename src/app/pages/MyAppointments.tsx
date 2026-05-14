import { useMemo, useState, useEffect } from "react";
import { api } from "../services/api.ts";
import { getUser } from "../utils/auth";
import { hospitals, doctors as mockDoctors, type Doctor } from "../data";

export type PatientAppointment = {
  id: string;
  patientId: string;
  doctorId: number;
  hospitalId: number;
  date: string;
  time: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  type: string;
  mode: string;
  notes: string;
  doctorName?: string;
  hospitalName?: string;
  department?: string;
};

export default function MyAppointments() {
  const [appointments, setAppointments] = useState<PatientAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const user = getUser();
      const patientId = user?.username ?? "patient";

      // Fetch both appointments and doctors to resolve names
      const [appointmentsData, doctorsData] = await Promise.all([
        api.get<any[]>("/appointments"),
        api.get<any[]>("/doctors").catch(() => []) // Fallback to empty if fails
      ]);

      setAllDoctors(doctorsData);

      // Filter appointments for this patient
      const myAppointments = appointmentsData
        .filter((apt: any) => String(apt.patientId) === String(patientId))
        .map((apt: any) => {
          const doctor = doctorsData.find((d: any) => d.id === apt.doctorId) || 
                         mockDoctors.find((d) => d.id === apt.doctorId);
          const hospital = hospitals.find((h) => h.id === apt.hospitalId);

          return {
            ...apt,
            doctorName: doctor?.name || `Dr. (ID: ${apt.doctorId})`,
            hospitalName: hospital?.name || `Hospital (ID: ${apt.hospitalId})`,
            department: doctor?.department || doctor?.specialization || "General"
          };
        });

      setAppointments(myAppointments);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const upcomingAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.status === "Scheduled"),
    [appointments]
  );

  const completedCount = useMemo(
    () => appointments.filter((appointment) => appointment.status === "Completed").length,
    [appointments]
  );

  const cancelledCount = useMemo(
    () => appointments.filter((appointment) => appointment.status === "Cancelled").length,
    [appointments]
  );

  const updateStatus = async (
    appointmentId: string,
    status: "Scheduled" | "Completed" | "Cancelled"
  ) => {
    try {
      // In a real app, we'd have a PUT endpoint. 
      // For now, we'll just log or implement if backend supports it.
      // Assuming backend might need an update for status changes.
      await api.delete(`/appointments/${appointmentId}`); // Basic implementation: cancel = delete
      await fetchData();
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  };

  const statusStyle = (status: string) => {
    if (status === "Scheduled") return "bg-blue-100 text-blue-600";
    if (status === "Completed") return "bg-green-100 text-green-600";
    if (status === "Cancelled") return "bg-red-100 text-red-600";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Patient Timeline</p>
        <h2 className="mt-2 text-3xl font-extrabold text-slate-900">My Appointments</h2>
      </div>

      <div className="stagger grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">Upcoming</p>
          <p className="text-2xl font-bold text-slate-900">{upcomingAppointments.length}</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="text-2xl font-bold text-slate-900">{completedCount}</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">Cancelled</p>
          <p className="text-2xl font-bold text-slate-900">{cancelledCount}</p>
        </div>
      </div>

      <div className="stagger space-y-4">
        {loading ? (
          <div className="p-10 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-cyan-700 border-t-transparent"></div>
            <p className="mt-2 text-sm text-slate-500">Loading your appointments...</p>
          </div>
        ) : (
          appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="surface-card p-5"
            >
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
                  {appointment.status === "Scheduled" && (
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
        )}

        {!loading && appointments.length === 0 && (
          <div className="surface-card p-10 text-center">
            <p className="text-slate-500">You don't have any appointments yet.</p>
            <button 
              onClick={() => window.location.href = '/patient-dashboard'}
              className="mt-4 text-cyan-700 font-semibold hover:underline"
            >
              Book your first appointment
            </button>
          </div>
        )}
      </div>
    </div>
  );
}