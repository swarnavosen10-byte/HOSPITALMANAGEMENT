import { AlertTriangle, CalendarClock, ClipboardList, FileText, Users } from "lucide-react";
import {
  getAppointmentsByDoctor,
  getDoctorById,
  getDoctorNotifications,
  getDoctorSchedulesByDoctor,
  getHospitalById,
  getPatientsByHospital,
} from "../../data";
import { getDoctorScope } from "../../utils/roleScope";

const isToday = (date: string) => date === new Date().toISOString().slice(0, 10);

export default function DoctorDashboard() {
  const { doctorId, hospitalId } = getDoctorScope();
  const doctor = getDoctorById(doctorId);
  const hospital = getHospitalById(hospitalId);

  const appointments = getAppointmentsByDoctor(doctorId).filter((appointment) => appointment.hospitalId === hospitalId);
  const schedules = getDoctorSchedulesByDoctor(doctorId).filter((schedule) => schedule.hospitalId === hospitalId);
  const notifications = getDoctorNotifications(doctorId).filter((notification) => notification.hospitalId === hospitalId);
  const patients = getPatientsByHospital(hospitalId);

  const patientCount = new Set(appointments.map((appointment) => appointment.patientId)).size;
  const todayAppointments = appointments.filter((appointment) => isToday(appointment.date));
  const upcomingAppointments = [...appointments]
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .slice(0, 6);

  const emergencyCases = notifications.filter((notification) => notification.type === "emergency_alert").length;
  const pendingReports = appointments.filter((appointment) => appointment.status === "Completed").length;

  const scheduleSummary = schedules
    .slice(0, 4)
    .map((schedule) => `${schedule.date} • ${schedule.startTime}-${schedule.endTime}`);

  const cards = [
    { title: "Today Appointments", value: todayAppointments.length, subtitle: "In your queue", icon: CalendarClock },
    { title: "Upcoming Appointments", value: upcomingAppointments.length, subtitle: "Next scheduled visits", icon: ClipboardList },
    { title: "Patient Count", value: patientCount, subtitle: "Unique patients", icon: Users },
    { title: "Emergency Cases", value: emergencyCases, subtitle: "Priority notifications", icon: AlertTriangle },
    { title: "Pending Reports", value: pendingReports, subtitle: "Consultations to finalize", icon: FileText },
  ];

  return (
    <div className="page-content space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Doctor Portal</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Welcome, {doctor?.name ?? "Doctor"}</h1>
        <p className="text-slate-600">{hospital?.name ?? "Selected hospital"} workspace for your appointments, schedule, and clinical tasks.</p>
      </div>

      <div className="stagger grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="surface-card p-5">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-600">{card.title}</p>
                <span className="rounded-lg bg-cyan-50 p-2 text-cyan-700"><Icon size={14} /></span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{card.value}</p>
              <p className="text-xs text-slate-500">{card.subtitle}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="surface-card overflow-x-auto p-5">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Upcoming Appointments</h2>
          {upcomingAppointments.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No appointments found.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingAppointments.map((appointment) => {
                  const patient = patients.find((item) => item.id === appointment.patientId);
                  return (
                    <tr key={appointment.id} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                      <td className="px-4 py-3 font-semibold text-cyan-700">{appointment.id}</td>
                      <td className="px-4 py-3 text-slate-700">{patient?.name ?? appointment.patientId}</td>
                      <td className="px-4 py-3 text-slate-700">{appointment.date}</td>
                      <td className="px-4 py-3 text-slate-700">{appointment.time}</td>
                      <td className="px-4 py-3"><span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800">{appointment.status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <div className="space-y-5">
          <div className="surface-card p-5">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Schedule Summary</h2>
            <div className="space-y-2">
              {scheduleSummary.map((line) => (
                <p key={line} className="rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">{line}</p>
              ))}
              {scheduleSummary.length === 0 && <p className="text-sm text-slate-500">No schedule entries available.</p>}
            </div>
          </div>

          <div className="surface-card p-5">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Latest Notifications</h2>
            <div className="space-y-2">
              {notifications.slice(0, 4).map((notification) => (
                <div key={notification.id} className="rounded-xl border border-slate-100 bg-white p-3">
                  <p className="text-sm font-semibold text-slate-900">{notification.title}</p>
                  <p className="text-xs text-slate-500">{notification.message}</p>
                </div>
              ))}
              {notifications.length === 0 && <p className="text-sm text-slate-500">No notifications right now.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
