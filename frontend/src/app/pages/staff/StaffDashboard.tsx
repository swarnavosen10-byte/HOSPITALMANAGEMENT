import { useEffect, useState } from "react";
import { CalendarCheck2, CircleAlert, DollarSign, HeartPulse, Stethoscope, Users, ShieldAlert, Loader2, UserCheck } from "lucide-react";
import {
  getAppointmentsByHospital,
  getDoctorsByHospital,
  getHospitalById,
  getHospitalReportSummary,
  getPatientsByHospital,
  getStaffNotifications,
} from "../../data";
import { getStaffHospitalId } from "../../utils/roleScope";
import { api } from "../../services/api";

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
  const [pendingDoctors, setPendingDoctors] = useState<any[]>([]);
  const [loadingPending, setLoadingPending] = useState(false);
  const [actioningUsername, setActioningUsername] = useState<string | null>(null);

  const fetchPendingDoctors = async () => {
    setLoadingPending(true);
    try {
      const res = await api.get<any[]>(`/admin/pending-users?hospitalId=${hospitalId}`);
      setPendingDoctors(res);
    } catch (err) {
      console.error("Failed to fetch pending doctors:", err);
    } finally {
      setLoadingPending(false);
    }
  };

  useEffect(() => {
    fetchPendingDoctors();
  }, [hospitalId]);

  const [showSetupModal, setShowSetupModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState<any | null>(null);
  const [specialization, setSpecialization] = useState("General Medicine");
  const [department, setDepartment] = useState("Outpatient");
  const [fees, setFees] = useState(500);
  const [experience, setExperience] = useState(2);

  const handleApproveClick = (user: any) => {
    setSelectedDoctor(user);
    setSpecialization("General Medicine");
    setDepartment("Outpatient");
    setFees(500);
    setExperience(2);
    setShowSetupModal(true);
  };

  const handleApprove = async (username: string, doctorDetails?: any) => {
    setActioningUsername(username);
    try {
      await api.post(`/admin/approve-user/${username}`, doctorDetails || {});
      await fetchPendingDoctors();
      setShowSetupModal(false);
      setSelectedDoctor(null);
    } catch (err) {
      console.error("Failed to approve doctor:", err);
    } finally {
      setActioningUsername(null);
    }
  };

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

      {/* Pending Doctor Verifications (Specific to this Hospital Branch) */}
      <div className="surface-card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="text-cyan-700" size={18} />
              <span>Pending Practitioner Verifications</span>
            </h2>
            <p className="text-xs text-slate-500">Authorized reviews for doctors joining {hospital?.name ?? "this branch"}.</p>
          </div>
          {loadingPending && (
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Loader2 className="animate-spin" size={12} />
              Loading...
            </span>
          )}
        </div>

        {pendingDoctors.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-sm text-slate-500">
            ✅ No pending practitioner verifications for this hospital branch.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pendingDoctors.map((p) => {
              const isActioning = actioningUsername === p.username;

              return (
                <div
                  key={p.username}
                  className="relative rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm hover:shadow-md transition duration-300 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-bold text-slate-900 text-sm">
                          {p.displayName || p.username}
                        </p>
                        <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                          @{p.username}
                        </p>
                      </div>
                      <span className="rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-100">
                        Doctor
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-xs text-slate-600 border-t border-slate-50 pt-2.5">
                      {p.email && (
                        <p className="truncate">
                          <span className="font-semibold text-slate-500">Email:</span> {p.email}
                        </p>
                      )}
                      {p.phone && (
                        <p>
                          <span className="font-semibold text-slate-500">Phone:</span> {p.phone}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 border-t border-slate-50 pt-3">
                    <button
                      onClick={() => handleApproveClick(p)}
                      disabled={isActioning}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-cyan-700 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-cyan-800 active:scale-95 disabled:opacity-50"
                    >
                      {isActioning ? (
                        <>
                          <Loader2 size={12} className="animate-spin" />
                          <span>Approving...</span>
                        </>
                      ) : (
                        <>
                          <UserCheck size={13} />
                          <span>Verify Doctor</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
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

      {/* Doctor Clinical Onboarding Setup Modal */}
      {showSetupModal && selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 transform scale-up transition duration-300">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
              <span className="rounded-xl bg-amber-50 p-2.5 text-amber-700">
                <Stethoscope size={20} />
              </span>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Verify & Setup Doctor</h3>
                <p className="text-xs text-slate-500">Configure medical credentials for {selectedDoctor.displayName || selectedDoctor.username}.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Medical Specialization</label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="e.g. Cardiologist, Neurologist"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-cyan-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Clinical Department</label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Cardiology, Neurology, Pediatrics"
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-cyan-700 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Consultation Fees (INR)</label>
                  <input
                    type="number"
                    value={fees}
                    onChange={(e) => setFees(Number(e.target.value))}
                    min={0}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-cyan-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Experience (Years)</label>
                  <input
                    type="number"
                    value={experience}
                    onChange={(e) => setExperience(Number(e.target.value))}
                    min={0}
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-800 focus:border-cyan-700 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6 border-t border-slate-100 pt-4">
              <button
                onClick={() => {
                  setShowSetupModal(false);
                  setSelectedDoctor(null);
                }}
                className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 active:scale-95 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApprove(selectedDoctor.username, { specialization, department, fees, experience })}
                disabled={actioningUsername === selectedDoctor.username}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-cyan-700 py-2.5 text-xs font-bold text-white hover:bg-cyan-800 active:scale-95 transition disabled:opacity-50"
              >
                {actioningUsername === selectedDoctor.username ? (
                  <>
                    <Loader2 size={12} className="animate-spin" />
                    <span>Approving...</span>
                  </>
                ) : (
                  <span>Save & Verify</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
