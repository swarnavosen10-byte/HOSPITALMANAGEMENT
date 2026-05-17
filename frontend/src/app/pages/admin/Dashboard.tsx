import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Building2, Stethoscope, Users } from "lucide-react";
import { adminPatients, doctors, hospitals } from "../../data";

type EmergencyStatus = "Active" | "Busy" | "Unavailable";

type CustomTooltipProps = {
  active?: boolean;
  payload?: Array<{ value: number | string }>;
  label?: string;
};

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="surface-card px-3 py-2 text-sm">
        <p className="font-semibold text-slate-900">{label}</p>
        <p className="font-semibold text-cyan-700">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [selectedEmergencyStatus, setSelectedEmergencyStatus] =
    useState<EmergencyStatus>("Active");
  const [selectedStatusHospitalId, setSelectedStatusHospitalId] = useState<number | null>(null);

  const totalBedsAvailable = hospitals.reduce(
    (sum, hospital) => sum + hospital.bedsAvailable,
    0
  );

  const activeEmergencyCenters = hospitals.filter(
    (hospital) => hospital.emergencyStatus === "Active"
  ).length;

  const openHospitals = hospitals.filter((hospital) => hospital.isOpen).length;

  const quickStats = [
    {
      title: "Hospitals Network",
      value: hospitals.length,
      note: `${openHospitals} open now`,
      icon: Building2,
    },
    {
      title: "Doctors On Platform",
      value: doctors.length,
      note: "Across all Kolkata hospitals",
      icon: Stethoscope,
    },
    {
      title: "Active Patients",
      value: adminPatients.length,
      note: "Centralized patient records",
      icon: Users,
    },
    {
      title: "Emergency Ready",
      value: activeEmergencyCenters,
      note: `${totalBedsAvailable} beds available`,
      icon: Activity,
    },
  ];

  const bedsData = hospitals.map((hospital) => ({
    name: hospital.name.replace(" Hospital Kolkata", ""),
    beds: hospital.bedsAvailable,
  }));

  const emergencyBreakdown: Array<{
    name: EmergencyStatus;
    value: number;
    color: string;
  }> = [
    {
      name: "Active",
      value: hospitals.filter((hospital) => hospital.emergencyStatus === "Active")
        .length,
      color: "#0891b2",
    },
    {
      name: "Busy",
      value: hospitals.filter((hospital) => hospital.emergencyStatus === "Busy")
        .length,
      color: "#f59e0b",
    },
    {
      name: "Unavailable",
      value: hospitals.filter(
        (hospital) => hospital.emergencyStatus === "Unavailable"
      ).length,
      color: "#ef4444",
    },
  ];

  const selectedStatusHospitals = hospitals.filter(
    (hospital) => hospital.emergencyStatus === selectedEmergencyStatus
  );

  const resolvedSelectedStatusHospitalId =
    selectedStatusHospitalId &&
    selectedStatusHospitals.some((hospital) => hospital.id === selectedStatusHospitalId)
      ? selectedStatusHospitalId
      : selectedStatusHospitals[0]?.id ?? null;

  const selectedStatusHospital =
    selectedStatusHospitals.find((hospital) => hospital.id === resolvedSelectedStatusHospitalId) ??
    null;

  const selectedStatusBreakdown = (() => {
    const rows = selectedStatusHospitals.map((hospital) => ({
      id: hospital.id,
      name: hospital.name,
      load: adminPatients.filter((patient) => patient.hospitalId === hospital.id).length,
      beds: hospital.bedsAvailable,
    }));

    if (rows.length === 0) return [];

    const totalLoad = rows.reduce((sum, item) => sum + item.load, 0);

    if (totalLoad === 0) {
      const base = Math.floor(100 / rows.length);
      let remaining = 100 - base * rows.length;

      return rows.map((item) => {
        const bonus = remaining > 0 ? 1 : 0;
        if (remaining > 0) remaining -= 1;
        return {
          ...item,
          percentage: base + bonus,
        };
      });
    }

    const withRaw = rows.map((item) => {
      const raw = (item.load / totalLoad) * 100;
      return {
        ...item,
        raw,
        percentage: Math.floor(raw),
        fraction: raw - Math.floor(raw),
      };
    });

    const remaining = 100 - withRaw.reduce((sum, item) => sum + item.percentage, 0);

    withRaw
      .sort((a, b) => b.fraction - a.fraction)
      .forEach((item, index) => {
        if (index < remaining) {
          item.percentage += 1;
        }
      });

    return withRaw.map(({ id, name, load, beds, percentage }) => ({
      id,
      name,
      load,
      beds,
      percentage,
    }));
  })();

  const selectedStatusTotalPercentage = selectedStatusBreakdown.reduce(
    (sum, item) => sum + item.percentage,
    0
  );

  const recentPatients = [...adminPatients]
    .sort((a, b) => (a.id < b.id ? 1 : -1))
    .slice(0, 4);

  const patientStatusClass = (status: string) => {
    if (status === "Admitted") return "bg-rose-50 text-rose-700";
    if (status === "In Treatment") return "bg-amber-50 text-amber-700";
    if (status === "Discharged") return "bg-emerald-50 text-emerald-700";
    if (status === "Waiting") return "bg-cyan-50 text-cyan-700";
    return "bg-slate-50 text-slate-700";
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
          Admin Control Center
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
          Kolkata Hospital Network Dashboard
        </h1>
        <p className="text-slate-600">
          Centralized live operations across all registered hospitals.
        </p>
      </div>

      <div className="stagger grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {quickStats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div key={stat.title} className="surface-card p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-600">{stat.title}</p>
                <span className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
                  <Icon size={16} />
                </span>
              </div>
              <p className="text-3xl font-extrabold text-slate-900">{stat.value}</p>
              <p className="mt-1 text-sm text-slate-500">{stat.note}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.7fr_1fr]">
        <div className="surface-card p-5">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Bed Availability by Hospital</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={bedsData} margin={{ top: 8, right: 12, left: 4, bottom: 28 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.25} />
              <XAxis
                dataKey="name"
                interval={0}
                angle={-15}
                textAnchor="end"
                height={64}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="beds" radius={[8, 8, 0, 0]} fill="#0891b2" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="surface-card p-5">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Emergency Status Mix</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={emergencyBreakdown}
                dataKey="value"
                nameKey="name"
                innerRadius={56}
                outerRadius={90}
                paddingAngle={3}
                labelLine={false}
              >
                {emergencyBreakdown.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                    className="cursor-pointer"
                    stroke={selectedEmergencyStatus === entry.name ? "#0f172a" : "#ffffff"}
                    strokeWidth={selectedEmergencyStatus === entry.name ? 2 : 1}
                    onClick={() => {
                      setSelectedEmergencyStatus(entry.name);
                      setSelectedStatusHospitalId(
                        hospitals.find((hospital) => hospital.emergencyStatus === entry.name)?.id ??
                          null
                      );
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-2 flex flex-wrap gap-2">
            {emergencyBreakdown.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  setSelectedEmergencyStatus(item.name);
                  setSelectedStatusHospitalId(
                    hospitals.find((hospital) => hospital.emergencyStatus === item.name)?.id ??
                      null
                  );
                }}
                className={`interactive-chip rounded-full px-3 py-1 text-xs font-semibold ${
                  selectedEmergencyStatus === item.name
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {item.name} ({item.value})
              </button>
            ))}
          </div>

          <div className="mt-3 rounded-xl border border-slate-200 bg-white/80 p-3">
            <p className="text-sm font-semibold text-slate-900">
              {selectedEmergencyStatus} Hospitals Percentage Split
            </p>
            <p className="text-xs text-slate-500">
              Percentage uses patient load inside this status group and always totals 100%.
            </p>

            <div className="mt-3 space-y-2">
              {selectedStatusBreakdown.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedStatusHospitalId(item.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left transition ${
                    resolvedSelectedStatusHospitalId === item.id
                      ? "bg-cyan-50 ring-1 ring-cyan-200"
                      : "bg-slate-50 hover:bg-slate-100"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-800">{item.name}</p>
                    <p className="text-sm font-bold text-cyan-700">{item.percentage}%</p>
                  </div>
                  <p className="text-xs text-slate-500">
                    Patients: {item.load} | Beds: {item.beds}
                  </p>
                </button>
              ))}
            </div>

            <div className="mt-3 border-t border-slate-200 pt-2 text-sm font-semibold text-slate-800">
              Total: {selectedStatusTotalPercentage}%
            </div>

            {selectedStatusHospital && (
              <div className="mt-3 rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-sm font-semibold text-slate-900">
                  Bed Type Details for {selectedStatusHospital.name}
                </p>
                <p className="text-xs text-slate-500">
                  Clicked hospital drilldown: available, busy, and unavailable beds by type.
                </p>

                <div className="mt-2 overflow-x-auto">
                  <table className="w-full min-w-[360px] text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                        <th className="py-1.5 pr-2 font-semibold">Bed Type</th>
                        <th className="py-1.5 pr-2 font-semibold">Available</th>
                        <th className="py-1.5 pr-2 font-semibold">Busy</th>
                        <th className="py-1.5 font-semibold">Unavailable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedStatusHospital.bedInventory.map((bedType) => (
                        <tr key={bedType.type} className="border-b border-slate-100 last:border-0">
                          <td className="py-1.5 pr-2 font-medium text-slate-800">{bedType.type}</td>
                          <td className="py-1.5 pr-2 text-emerald-700">{bedType.available}</td>
                          <td className="py-1.5 pr-2 text-amber-700">{bedType.busy}</td>
                          <td className="py-1.5 text-rose-700">{bedType.unavailable}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="surface-card p-5">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Hospital Operations</h2>
          <div className="stagger space-y-3">
            {hospitals.map((hospital) => (
              <div
                key={hospital.id}
                className="rounded-xl border border-slate-200/80 bg-white/80 p-4 transition hover:-translate-y-0.5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{hospital.name}</p>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                    {hospital.isOpen ? "Open" : "Closed"}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-600">{hospital.location}</p>
                <p className="mt-2 text-sm text-slate-600">
                  Beds: <span className="font-semibold text-slate-800">{hospital.bedsAvailable}</span> | Emergency: {" "}
                  <span className="font-semibold text-slate-800">{hospital.emergencyStatus}</span>
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="surface-card p-5">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Recent Patients</h2>
          <div className="stagger space-y-3">
            {recentPatients.map((patient) => {
              const hospital = hospitals.find((item) => item.id === patient.hospitalId);
              return (
                <div
                  key={patient.id}
                  className="rounded-xl border border-slate-200/80 bg-white/80 p-4"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900">{patient.name}</p>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${patientStatusClass(
                        patient.status
                      )}`}
                    >
                      {patient.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{patient.diagnosis}</p>
                  <p className="mt-1 text-sm text-slate-500">{hospital?.name ?? "Unknown Hospital"}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
