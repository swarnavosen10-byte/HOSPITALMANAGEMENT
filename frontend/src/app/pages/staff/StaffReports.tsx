import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  getAppointmentsByHospital,
  getDoctorsByHospital,
  getHospitalById,
  getHospitalMonthlyRevenue,
  getHospitalReportSummary,
  getPatientsByHospital,
} from "../../data";
import { useState } from "react";
import { getStaffHospitalId } from "../../utils/roleScope";

const colors = ["#0891b2", "#0ea5e9", "#22c55e", "#f59e0b", "#ef4444"];

export default function StaffReports() {
  const hospitalId = getStaffHospitalId();
  const hospital = getHospitalById(hospitalId);
  const doctors = getDoctorsByHospital(hospitalId);
  const patients = getPatientsByHospital(hospitalId);
  const appointments = getAppointmentsByHospital(hospitalId);
  const monthlyRevenue = getHospitalMonthlyRevenue(hospitalId);
  const summary = getHospitalReportSummary(hospitalId);
  const [revenueView, setRevenueView] = useState<"Monthly" | "Yearly">("Monthly");
  const [selectedYear, setSelectedYear] = useState(2026);

  const appointmentByStatus = (() => {
    const bucket = new Map<string, number>();
    appointments.forEach((appointment) => {
      bucket.set(appointment.status, (bucket.get(appointment.status) ?? 0) + 1);
    });
    return Array.from(bucket.entries()).map(([name, value]) => ({ name, value }));
  })();

  const workloadByDoctor = doctors.map((doctor) => ({
    name: doctor.name.replace("Dr. ", ""),
    appointments: appointments.filter((appointment) => appointment.doctorId === doctor.id).length,
  }));

  const departmentUsage = (() => {
    const bucket = new Map<string, number>();
    doctors.forEach((doctor) => {
      bucket.set(doctor.department, (bucket.get(doctor.department) ?? 0) + 1);
    });
    return Array.from(bucket.entries()).map(([name, value]) => ({ name, value }));
  })();

  const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const yearMultiplier = selectedYear === 2025 ? 0.86 : 1;
  const selectedMonthlyRevenue = monthlyRevenue.map((value) => Math.round(value * yearMultiplier));
  const revenueSeries = monthLabels.map((month, index) => ({ month, revenue: selectedMonthlyRevenue[index] ?? 0 }));
  const yearTotal = selectedMonthlyRevenue.reduce((sum, value) => sum + value, 0);
  const quarterlyRevenue = [
    { quarter: "Q1", revenue: selectedMonthlyRevenue.slice(0, 3).reduce((sum, value) => sum + value, 0) },
    { quarter: "Q2", revenue: selectedMonthlyRevenue.slice(3, 6).reduce((sum, value) => sum + value, 0) },
    { quarter: "Q3", revenue: selectedMonthlyRevenue.slice(6, 9).reduce((sum, value) => sum + value, 0) },
    { quarter: "Q4", revenue: selectedMonthlyRevenue.slice(9, 12).reduce((sum, value) => sum + value, 0) },
  ];

  return (
    <div className="page-content space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Hospital Staff</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Reports & Analytics</h1>
        <p className="text-slate-600">Daily appointments, doctor workload, revenue, and department usage for {hospital?.name}.</p>
      </div>

      <div className="stagger grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="surface-card p-5">
          <p className="text-sm text-slate-500">Monthly Appointments</p>
          <p className="text-3xl font-extrabold text-slate-900">{summary?.appointments ?? appointments.length}</p>
        </div>
        <div className="surface-card p-5">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="text-3xl font-extrabold text-slate-900">{summary?.completedAppointments ?? 0}</p>
        </div>
        <div className="surface-card p-5">
          <p className="text-sm text-slate-500">Patients</p>
          <p className="text-3xl font-extrabold text-slate-900">{patients.length}</p>
        </div>
        <div className="surface-card p-5">
          <p className="text-sm text-slate-500">Revenue</p>
          <p className="text-3xl font-extrabold text-slate-900">₹{((summary?.revenue ?? 0) / 100000).toFixed(1)}L</p>
          <p className="text-xs text-slate-500">Financial year {selectedYear}</p>
        </div>
      </div>

      <div className="surface-card flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-700">Revenue view</p>
          <p className="text-xs text-slate-500">Switch between monthly trend and yearly summary for this hospital only.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={selectedYear}
            onChange={(event) => setSelectedYear(Number(event.target.value))}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
          </select>
          <button onClick={() => setRevenueView("Monthly")} className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${revenueView === "Monthly" ? "bg-cyan-700 text-white" : "bg-cyan-50 text-cyan-800"}`}>Monthly</button>
          <button onClick={() => setRevenueView("Yearly")} className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${revenueView === "Yearly" ? "bg-cyan-700 text-white" : "bg-cyan-50 text-cyan-800"}`}>Yearly</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="surface-card p-5">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Appointment Status Mix</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={appointmentByStatus} dataKey="value" nameKey="name" innerRadius={56} outerRadius={92} label>
                {appointmentByStatus.map((entry, index) => (
                  <Cell key={entry.name} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="surface-card p-5">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Doctor Workload</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={workloadByDoctor} margin={{ top: 8, right: 12, left: 4, bottom: 28 }}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="name" angle={-15} textAnchor="end" height={64} interval={0} tick={{ fontSize: 12 }} />
              <YAxis />
              <Tooltip />
              <Bar dataKey="appointments" fill="#0891b2" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="surface-card p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">
              {revenueView === "Monthly" ? `Monthly Revenue Analytics - ${selectedYear}` : `Yearly Revenue Comparison - ${selectedYear}`}
            </h2>
            <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
              Total: ₹{(yearTotal / 100000).toFixed(1)}L
            </span>
          </div>

          {revenueView === "Monthly" ? (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={revenueSeries}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={quarterlyRevenue} margin={{ top: 8, right: 12, left: 4, bottom: 28 }}>
                  <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                  <XAxis dataKey="quarter" />
                  <YAxis tickFormatter={(value) => `₹${Number(value) / 100000}L`} />
                  <Tooltip formatter={(value) => `₹${Number(value).toLocaleString("en-IN")}`} />
                  <Legend />
                  <Bar dataKey="revenue" fill="#0891b2" radius={[8, 8, 0, 0]} name={`Revenue ${selectedYear}`} />
                </BarChart>
              </ResponsiveContainer>
              <p className="mt-2 text-xs text-slate-500">Quarters: Q1 = Jan–Mar, Q2 = Apr–Jun, Q3 = Jul–Sep, Q4 = Oct–Dec.</p>
            </>
          )}
        </div>

        <div className="surface-card p-5">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Department Usage</h2>
          <div className="space-y-3">
            {departmentUsage.map((department, index) => (
              <div key={department.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-semibold text-slate-700">{department.name}</span>
                  <span className="text-slate-500">{department.value} doctors</span>
                </div>
                <div className="h-2 rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.max(8, (department.value / Math.max(1, doctors.length)) * 100)}%`,
                      backgroundColor: colors[index % colors.length],
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
