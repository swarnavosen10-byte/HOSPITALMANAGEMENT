import { CalendarCheck2, CircleAlert, DollarSign, HeartPulse, Stethoscope, Users } from "lucide-react";
import {
  getAppointmentsByHospital,
  getDoctorsByHospital,
  getHospitalById,
  getHospitalReportSummary,
  getPatientsByHospital,
  getStaffNotifications,
} from "../../data";
import { getStaffHospitalId } from "../../utils/roleScope";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const isToday = (date: string) => {
  const today = new Date().toISOString().slice(0, 10);
  return date === today;
};

export default function StaffDashboard() {
  const hospitalId = getStaffHospitalId();
  const hospital = getHospitalById(hospitalId);
  const patients = getPatientsByHospital(hospitalId);
  const doctors = getDoctorsByHospital(hospitalId);
  const appointments = getAppointmentsByHospital(hospitalId);
  const notifications = getStaffNotifications(hospitalId);
  const report = getHospitalReportSummary(hospitalId);

  const todayAppointments = appointments.filter((appointment) => isToday(appointment.date));
  const emergencyCases = notifications.filter((notification) => notification.type === "emergency_alert").length;

  const upcomingAppointments = [...appointments]
    .sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`))
    .slice(0, 6);

  const recentPatientActivity = [...patients]
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 5);

  const quickActions = [
    "Create emergency slot",
    "Assign OT duty",
    "Approve waiting appointments",
    "Tag critical patient",
  ];

  const kpiCards = [
    {
      title: "Total Patients",
      value: patients.length,
      subtitle: "Within your hospital",
      icon: Users,
    },
    {
      title: "Total Doctors",
      value: doctors.length,
      subtitle: "Active specialist roster",
      icon: Stethoscope,
    },
    {
      title: "Today Appointments",
      value: todayAppointments.length,
      subtitle: "Planned for today",
      icon: CalendarCheck2,
    },
    {
      title: "Emergency Cases",
      value: emergencyCases,
      subtitle: "Alerts in this shift",
      icon: CircleAlert,
    },
    {
      title: "Revenue Summary",
      value: formatCurrency(report?.revenue ?? 0),
      subtitle: "Current monthly run-rate",
      icon: DollarSign,
    },
    {
      title: "Bed Occupancy",
      value: `${report?.avgBedOccupancy ?? 0}%`,
      subtitle: `${hospital?.bedsAvailable ?? 0} beds available`,
      icon: HeartPulse,
    },
  ];

  return (
    <div className="page-content space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Hospital Staff Workspace</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
          {hospital?.name ?? "Hospital"} Operations Dashboard
        </h1>
        <p className="text-slate-600">Real-time control center for hospital floor management and scheduling.</p>
      </div>

      <div className="stagger grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {kpiCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="surface-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-600">{card.title}</p>
                <span className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
                  <Icon size={16} />
                </span>
              </div>
              <p className="text-2xl font-extrabold text-slate-900">{card.value}</p>
              <p className="mt-1 text-sm text-slate-500">{card.subtitle}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="surface-card overflow-x-auto p-5">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Upcoming Appointments</h2>
          {upcomingAppointments.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No upcoming appointments available.</p>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>{upcomingAppointments.map((appointment, index) => (
                <tr key={appointment.id} className="table-row border-t border-slate-100 transition hover:bg-slate-50/70" style={{ animationDelay: `${index * 60}ms` }}>
                  <td className="px-4 py-3 font-semibold text-cyan-700">{appointment.id}</td>
                  <td className="px-4 py-3 text-slate-700">{patients.find((p) => p.id === appointment.patientId)?.name ?? appointment.patientId}</td>
                  <td className="px-4 py-3 text-slate-700">{doctors.find((d) => d.id === appointment.doctorId)?.name ?? `Dr. ${appointment.doctorId}`}</td>
                  <td className="px-4 py-3 text-slate-600">{appointment.date}</td>
                  <td className="px-4 py-3 text-slate-600">{appointment.time}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800">
                      {appointment.status}
                    </span>
                  </td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>

        <div className="space-y-5">
          <div className="surface-card p-5">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Recent Patient Activity</h2>
            <div className="space-y-3">
              {recentPatientActivity.map((patient) => (
                <div key={patient.id} className="rounded-xl border border-slate-100 bg-white px-3 py-2">
                  <p className="font-semibold text-slate-900">{patient.name}</p>
                  <p className="text-xs text-slate-500">{patient.id} • {patient.diagnosis}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <h2 className="mb-4 text-lg font-bold text-slate-900">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-2">
              {quickActions.map((action) => (
                <button
                  key={action}
                  type="button"
                  className="button-hover rounded-xl border border-cyan-100 bg-cyan-50/60 px-3 py-2 text-left text-sm font-semibold text-cyan-800"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
