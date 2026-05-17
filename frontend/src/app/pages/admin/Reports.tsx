import { useMemo, useState, type ReactNode } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Banknote, Building2, CirclePercent, Hospital, TrendingUp, Users } from "lucide-react";
import {
  adminPatients,
  doctors,
  getHospitalMonthlyRevenue,
  getHospitalYearlyRevenue,
  getNetworkMonthlyRevenue,
  hospitals,
  revenueMonths,
} from "../../data";

type TooltipProps = {
  active?: boolean;
  payload?: Array<{
    name?: string;
    value: number | string;
    color?: string;
    payload?: {
      name?: string;
      short?: string;
      percentage?: number;
    };
  }>;
  label?: string;
};

type RevenueView = "monthly" | "yearly";
type ReportYear = 2024 | 2025 | 2026;

const REPORT_YEARS: ReportYear[] = [2024, 2025, 2026];

const YEAR_SCALE: Record<ReportYear, number> = {
  2024: 0.86,
  2025: 0.94,
  2026: 1,
};

const COLORS = ["#0891b2", "#155eef", "#10b981", "#f59e0b", "#ec4899", "#7c3aed"];

const compactCurrency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  notation: "compact",
  maximumFractionDigits: 1,
});

const fullCurrency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    const first = payload[0];
    const row = first?.payload;
    const resolvedLabel = label ?? row?.name ?? row?.short ?? first?.name ?? "";
    const resolvedValue =
      typeof row?.percentage === "number" ? `${row.percentage}%` : String(first?.value ?? "");

    return (
      <div className="surface-card px-3 py-2 text-sm">
        <p className="font-semibold text-slate-900">{resolvedLabel}</p>
        <p className="font-semibold text-cyan-700">{resolvedValue}</p>
      </div>
    );
  }
  return null;
};

const RevenueTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="surface-card px-3 py-2 text-sm">
        <p className="font-semibold text-slate-900">{label}</p>
        <div className="mt-1 space-y-1">
          {payload.map((entry) => {
            const value = Number(entry.value ?? 0);
            return (
              <p key={entry.name} className="font-semibold" style={{ color: entry.color ?? "#0f172a" }}>
                {entry.name}: {fullCurrency.format(value)}
              </p>
            );
          })}
        </div>
      </div>
    );
  }
  return null;
};

const percentage = (value: number, total: number) => {
  if (!total) return 0;
  return Number(((value / total) * 100).toFixed(1));
};

const RADIAN = Math.PI / 180;

const renderHospitalBreakdownLabel = ({
  cx,
  cy,
  midAngle,
  outerRadius,
  percent,
  fill,
}: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  percent?: number;
  fill?: string;
}) => {
  if (
    typeof cx !== "number" ||
    typeof cy !== "number" ||
    typeof midAngle !== "number" ||
    typeof outerRadius !== "number"
  ) {
    return null;
  }

  const radius = outerRadius + 16;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = Math.max(18, cy + radius * Math.sin(-midAngle * RADIAN));

  return (
    <text
      x={x}
      y={y}
      fill={fill ?? "#334155"}
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={12}
      fontWeight={600}
    >
      {`${Math.round((percent ?? 0) * 100)}%`}
    </text>
  );
};

export default function Reports() {
  const [selectedHospitalId, setSelectedHospitalId] = useState<number>(hospitals[0]?.id ?? 1);
  const [comparisonHospitalId, setComparisonHospitalId] = useState<number>(hospitals[1]?.id ?? hospitals[0]?.id ?? 1);
  const [selectedYear, setSelectedYear] = useState<ReportYear>(2026);
  const [revenueView, setRevenueView] = useState<RevenueView>("yearly");

  const hospitalBreakdown = useMemo(() => {
    const totalPatients = adminPatients.length;

    return hospitals.map((hospital, index) => {
      const patientsCount = adminPatients.filter(
        (patient) => patient.hospitalId === hospital.id
      ).length;

      return {
        id: hospital.id,
        name: hospital.name,
        short: hospital.name.replace(" Hospital Kolkata", ""),
        value: patientsCount,
        percentage: percentage(patientsCount, totalPatients),
        fill: COLORS[index % COLORS.length],
      };
    });
  }, []);

  const selectedHospital =
    hospitals.find((hospital) => hospital.id === selectedHospitalId) ?? hospitals[0];

  const comparisonHospital =
    hospitals.find((hospital) => hospital.id === comparisonHospitalId) ?? hospitals[0];

  const getAlternativeHospitalId = (excludedId: number) => {
    return hospitals.find((hospital) => hospital.id !== excludedId)?.id ?? excludedId;
  };

  const selectedHospitalPatients = adminPatients.filter(
    (patient) => patient.hospitalId === selectedHospital.id
  );

  const selectedHospitalDoctors = doctors.filter(
    (doctor) => doctor.hospitalId === selectedHospital.id
  );

  const totalDoctors = doctors.length;
  const totalBeds = hospitals.reduce((sum, hospital) => sum + hospital.bedsAvailable, 0);

  const selectedHospitalInsights = {
    patientShare: percentage(selectedHospitalPatients.length, adminPatients.length),
    doctorShare: percentage(selectedHospitalDoctors.length, totalDoctors),
    bedShare: percentage(selectedHospital.bedsAvailable, totalBeds),
  };

  const departmentMix = selectedHospital.departments.map((department) => ({
    name: department.name,
    value: department.doctorCount,
  }));

  const hospitalCapacityData = hospitals.map((hospital) => ({
    name: hospital.name,
    beds: hospital.bedsAvailable,
  }));

  const selectedHospitalBaseMonthlyRevenue = getHospitalMonthlyRevenue(selectedHospital.id);
  const comparisonHospitalBaseMonthlyRevenue = getHospitalMonthlyRevenue(comparisonHospital.id);
  const baseNetworkMonthlyRevenue = getNetworkMonthlyRevenue();
  const selectedYearScale = YEAR_SCALE[selectedYear];

  const selectedHospitalMonthlyRevenue = selectedHospitalBaseMonthlyRevenue.map((value) =>
    Math.round(value * selectedYearScale)
  );
  const comparisonHospitalMonthlyRevenue = comparisonHospitalBaseMonthlyRevenue.map((value) =>
    Math.round(value * selectedYearScale)
  );
  const networkMonthlyRevenue = baseNetworkMonthlyRevenue.map((entry) => ({
    ...entry,
    value: Math.round(entry.value * selectedYearScale),
  }));

  const monthlyRevenueSeries = revenueMonths.map((month, index) => ({
    month,
    selected: selectedHospitalMonthlyRevenue[index] ?? 0,
    compare: comparisonHospitalMonthlyRevenue[index] ?? 0,
    network: networkMonthlyRevenue[index]?.value ?? 0,
  }));

  const yearlyRevenueByHospital = getHospitalYearlyRevenue().map((entry) => {
    const hospital = hospitals.find((item) => item.id === entry.hospitalId);
    return {
      hospitalId: entry.hospitalId,
      name: hospital?.name.replace(" Hospital Kolkata", "") ?? "Unknown",
      yearly: Math.round(entry.yearly * selectedYearScale),
    };
  });

  const yearlyComparisonSeries = REPORT_YEARS.map((year) => {
    const yearScale = YEAR_SCALE[year];
    const selected = Math.round(
      selectedHospitalBaseMonthlyRevenue.reduce((sum, value) => sum + value, 0) * yearScale
    );
    const compare = Math.round(
      comparisonHospitalBaseMonthlyRevenue.reduce((sum, value) => sum + value, 0) * yearScale
    );
    const network = Math.round(
      baseNetworkMonthlyRevenue.reduce((sum, entry) => sum + entry.value, 0) * yearScale
    );

    return {
      year,
      selected,
      compare,
      network,
    };
  });

  const selectedYearlyRevenue =
    yearlyRevenueByHospital.find((entry) => entry.hospitalId === selectedHospital.id)?.yearly ?? 0;

  const comparisonYearlyRevenue =
    yearlyRevenueByHospital.find((entry) => entry.hospitalId === comparisonHospital.id)?.yearly ?? 0;

  const networkYearlyRevenue = yearlyRevenueByHospital.reduce(
    (sum, entry) => sum + entry.yearly,
    0
  );

  const yearlyRevenueDelta = selectedYearlyRevenue - comparisonYearlyRevenue;
  const monthlyAverageSelected =
    selectedHospitalMonthlyRevenue.reduce((sum, value) => sum + value, 0) /
    Math.max(1, selectedHospitalMonthlyRevenue.length);
  const monthlyAverageComparison =
    comparisonHospitalMonthlyRevenue.reduce((sum, value) => sum + value, 0) /
    Math.max(1, comparisonHospitalMonthlyRevenue.length);

  const selectedRevenueGrowth = (() => {
    if (selectedHospitalMonthlyRevenue.length < 2) return 0;

    const first = selectedHospitalMonthlyRevenue[0] ?? 0;
    const last = selectedHospitalMonthlyRevenue[selectedHospitalMonthlyRevenue.length - 1] ?? 0;

    if (!first) return 0;
    return Number((((last - first) / first) * 100).toFixed(1));
  })();

  const comparisonRevenueGrowth = (() => {
    if (comparisonHospitalMonthlyRevenue.length < 2) return 0;

    const first = comparisonHospitalMonthlyRevenue[0] ?? 0;
    const last = comparisonHospitalMonthlyRevenue[comparisonHospitalMonthlyRevenue.length - 1] ?? 0;

    if (!first) return 0;
    return Number((((last - first) / first) * 100).toFixed(1));
  })();

  const forecastSeries = (() => {
    const values = selectedHospitalMonthlyRevenue;
    if (values.length < 2) {
      return [
        { month: "Next 1", value: values[values.length - 1] ?? 0 },
        { month: "Next 2", value: values[values.length - 1] ?? 0 },
        { month: "Next 3", value: values[values.length - 1] ?? 0 },
      ];
    }

    let deltaSum = 0;
    for (let i = 1; i < values.length; i += 1) {
      deltaSum += values[i] - values[i - 1];
    }

    const avgDelta = deltaSum / (values.length - 1);
    const base = values[values.length - 1] ?? 0;

    return [1, 2, 3].map((step) => ({
      month: `Next ${step}`,
      value: Math.max(0, Math.round(base + avgDelta * step)),
    }));
  })();

  const exportRevenueCsv = () => {
    const header = "Hospital,Month,Revenue(INR)";
    const rows = hospitals.flatMap((hospital) =>
      getHospitalMonthlyRevenue(hospital.id).map((amount, index) =>
        `${hospital.name},${revenueMonths[index]},${amount}`
      )
    );

    const yearlyHeader = "Hospital,YearlyRevenue(INR)";
    const yearlyRows = yearlyRevenueByHospital.map(
      (entry) => `${entry.name},${entry.yearly}`
    );

    const csv = [header, ...rows, "", yearlyHeader, ...yearlyRows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "kolkata-hospital-revenue-report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const topEarningHospital = [...yearlyRevenueByHospital].sort(
    (a, b) => b.yearly - a.yearly
  )[0];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Advanced Reports
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">
            Kolkata Hospital Intelligence Hub
          </h1>
          <p className="text-slate-600">
            Centralized earnings, patient mix, and operations analytics for all hospitals.
          </p>
        </div>

        <button
          onClick={exportRevenueCsv}
          aria-label="Export intelligence snapshot as CSV"
          className="hover-float rounded-xl bg-cyan-700 px-4 py-2.5 font-semibold text-white hover:bg-cyan-800"
        >
          Export Intelligence Snapshot
        </button>
      </div>

      <div className="stagger grid grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          title="Total Hospitals"
          value={hospitals.length}
          icon={<Hospital size={18} />}
          note="Kolkata network"
        />
        <MetricCard
          title="Total Patients"
          value={adminPatients.length}
          icon={<Users size={18} />}
          note="Centralized records"
        />
        <MetricCard
          title="Total Doctors"
          value={doctors.length}
          icon={<Building2 size={18} />}
          note="Cross-hospital registry"
        />
        <MetricCard
          title="Selected Share"
          value={`${selectedHospitalInsights.patientShare}%`}
          icon={<CirclePercent size={18} />}
          note={`${selectedHospital.name} patients`}
        />
        <MetricCard
          title={`Selected Yearly Revenue (${selectedYear})`}
          value={compactCurrency.format(selectedYearlyRevenue)}
          icon={<Banknote size={18} />}
          note={selectedHospital.name}
        />
        <MetricCard
          title="Growth (Jan-Dec)"
          value={`${selectedRevenueGrowth}%`}
          icon={<TrendingUp size={18} />}
          note="For selected hospital"
        />
      </div>

      <div className="surface-card p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h2 className="text-lg font-bold text-slate-900">Hospital Earnings Analytics</h2>

          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs font-semibold text-slate-700">
              Report Year
              <select
                value={selectedYear}
                onChange={(event) => setSelectedYear(Number(event.target.value) as ReportYear)}
                aria-label="Select report year"
                className="ml-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
              >
                {REPORT_YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </label>

            <button
              onClick={() => setRevenueView("monthly")}
              aria-pressed={revenueView === "monthly"}
              className={`interactive-chip rounded-full px-3 py-1.5 text-xs font-semibold ${
                revenueView === "monthly"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              Monthly View
            </button>
            <button
              onClick={() => setRevenueView("yearly")}
              aria-pressed={revenueView === "yearly"}
              className={`interactive-chip rounded-full px-3 py-1.5 text-xs font-semibold ${
                revenueView === "yearly"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              Yearly View
            </button>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <label className="text-sm font-semibold text-slate-700">
            Primary Hospital
            <select
              value={selectedHospitalId}
              onChange={(event) => {
                const nextPrimaryId = Number(event.target.value);
                setSelectedHospitalId(nextPrimaryId);

                if (nextPrimaryId === comparisonHospitalId) {
                  setComparisonHospitalId(getAlternativeHospitalId(nextPrimaryId));
                }
              }}
              aria-label="Select primary hospital for revenue analytics"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            >
              {hospitals.map((hospital) => (
                <option key={hospital.id} value={hospital.id}>
                  {hospital.name}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm font-semibold text-slate-700">
            Comparison Hospital
            <select
              value={comparisonHospitalId}
              onChange={(event) => {
                const nextCompareId = Number(event.target.value);
                setComparisonHospitalId(nextCompareId);

                if (nextCompareId === selectedHospitalId) {
                  setSelectedHospitalId(getAlternativeHospitalId(nextCompareId));
                }
              }}
              aria-label="Select comparison hospital for revenue analytics"
              className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            >
              {hospitals.map((hospital) => (
                <option
                  key={hospital.id}
                  value={hospital.id}
                  disabled={hospital.id === selectedHospitalId}
                >
                  {hospital.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mb-3 rounded-xl border border-cyan-100 bg-cyan-50/70 px-3 py-2 text-sm text-slate-700" role="status" aria-live="polite">
          Comparing <span className="font-semibold">{selectedHospital.name}</span> vs <span className="font-semibold">{comparisonHospital.name}</span> for {selectedYear}.
          Charts include both hospitals and total network revenue.
        </div>

        {revenueView === "monthly" ? (
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={monthlyRevenueSeries}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value: number) => compactCurrency.format(value)} />
              <Tooltip content={<RevenueTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="selected"
                name={`${selectedHospital.name} Revenue`}
                stroke="#0891b2"
                strokeWidth={3}
                isAnimationActive
                animationDuration={700}
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="compare"
                name={`${comparisonHospital.name} Revenue`}
                stroke="#7c3aed"
                strokeWidth={2}
                isAnimationActive
                animationDuration={750}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="network"
                name="Total Network Revenue"
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="6 4"
                isAnimationActive
                animationDuration={800}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={yearlyComparisonSeries}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
              <XAxis dataKey="year" />
              <YAxis tickFormatter={(value: number) => compactCurrency.format(value)} />
              <Tooltip content={<RevenueTooltip />} />
              <Legend />
              <Bar
                dataKey="selected"
                name={`${selectedHospital.name} Yearly Revenue`}
                fill="#0891b2"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="compare"
                name={`${comparisonHospital.name} Yearly Revenue`}
                fill="#7c3aed"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                dataKey="network"
                name="Total Network Revenue"
                fill="#10b981"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
            <p className="text-sm text-slate-500">Network Yearly Revenue ({selectedYear})</p>
            <p className="text-xl font-bold text-slate-900">{fullCurrency.format(networkYearlyRevenue)}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
            <p className="text-sm text-slate-500">Top Earning Hospital</p>
            <p className="text-xl font-bold text-slate-900">{topEarningHospital?.name ?? "N/A"}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
            <p className="text-sm text-slate-500">Comparison Yearly Revenue ({comparisonHospital.name}, {selectedYear})</p>
            <p className="text-xl font-bold text-slate-900">
              {fullCurrency.format(comparisonYearlyRevenue)}
            </p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
            <p className="text-sm text-slate-500">Yearly Revenue Delta</p>
            <p className="text-xl font-bold text-slate-900">{fullCurrency.format(yearlyRevenueDelta)}</p>
            <p className="text-xs text-slate-500">Primary minus comparison</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
            <p className="text-sm text-slate-500">Avg Monthly (Primary)</p>
            <p className="text-xl font-bold text-slate-900">{fullCurrency.format(Math.round(monthlyAverageSelected))}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
            <p className="text-sm text-slate-500">Avg Monthly (Comparison)</p>
            <p className="text-xl font-bold text-slate-900">{fullCurrency.format(Math.round(monthlyAverageComparison))}</p>
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-slate-200 bg-white/80 p-3">
          <p className="text-sm font-semibold text-slate-900">Selected vs Comparison Monthly Data (INR)</p>
          <p className="text-xs text-slate-500">
            Raw monthly values for {selectedYear}, used for all comparison cards above.
          </p>

          <div className="mt-2 overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                  <th className="py-1.5 pr-2 font-semibold">Month</th>
                  <th className="py-1.5 pr-2 font-semibold">{selectedHospital.name}</th>
                  <th className="py-1.5 pr-2 font-semibold">{comparisonHospital.name}</th>
                  <th className="py-1.5 pr-2 font-semibold">Difference</th>
                  <th className="py-1.5 font-semibold">Total Network</th>
                </tr>
              </thead>
              <tbody>
                {monthlyRevenueSeries.map((item) => {
                  const difference = item.selected - item.compare;
                  return (
                    <tr key={item.month} className="border-b border-slate-100 transition-colors hover:bg-slate-50/80 last:border-0">
                      <td className="py-1.5 pr-2 font-medium text-slate-800">{item.month}</td>
                      <td className="py-1.5 pr-2 text-slate-700">{fullCurrency.format(item.selected)}</td>
                      <td className="py-1.5 pr-2 text-slate-700">{fullCurrency.format(item.compare)}</td>
                      <td className={`py-1.5 pr-2 font-semibold ${difference >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                        {fullCurrency.format(difference)}
                      </td>
                      <td className="py-1.5 text-slate-700">{fullCurrency.format(item.network)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
            <p className="text-sm text-slate-500">Primary Growth</p>
            <p className="text-xl font-bold text-slate-900">{selectedRevenueGrowth}%</p>
            <p className="text-xs text-slate-500">{selectedHospital.name}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
            <p className="text-sm text-slate-500">Comparison Growth</p>
            <p className="text-xl font-bold text-slate-900">{comparisonRevenueGrowth}%</p>
            <p className="text-xs text-slate-500">{comparisonHospital.name}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
            <p className="text-sm text-slate-500">Top Yearly Revenue</p>
            <p className="text-xl font-bold text-slate-900">
              {topEarningHospital ? fullCurrency.format(topEarningHospital.yearly) : "N/A"}
            </p>
            <p className="text-xs text-slate-500">{topEarningHospital?.name ?? "N/A"}</p>
          </div>
        </div>

        <div className="mt-4">
          <h3 className="mb-3 text-base font-bold text-slate-900">3-Month Forecast ({selectedHospital.name})</h3>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            {forecastSeries.map((item) => (
              <div key={item.month} className="surface-card p-4">
                <p className="text-sm text-slate-500">{item.month}</p>
                <p className="text-xl font-bold text-slate-900">{fullCurrency.format(item.value)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_1.4fr]">
        <div className="surface-card p-5">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Patient Distribution by Hospital</h2>
          <ResponsiveContainer width="100%" height={360}>
            <PieChart margin={{ top: 26, right: 24, bottom: 72, left: 24 }}>
              <Pie
                data={hospitalBreakdown}
                dataKey="value"
                nameKey="short"
                outerRadius={86}
                innerRadius={56}
                cy="46%"
                paddingAngle={3}
                labelLine={false}
                label={renderHospitalBreakdownLabel}
              >
                {hospitalBreakdown.map((slice) => (
                  <Cell
                    key={slice.id}
                    fill={slice.fill}
                    stroke={slice.id === selectedHospital.id ? "#0f172a" : "#ffffff"}
                    strokeWidth={slice.id === selectedHospital.id ? 2 : 1}
                    className="cursor-pointer"
                    onClick={() => setSelectedHospitalId(slice.id)}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                align="center"
                iconType="circle"
                wrapperStyle={{ paddingTop: 16 }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="mt-3 text-sm text-slate-600">
            Click any pie segment to update hospital-specific percentages and department analytics.
          </div>
        </div>

        <div className="surface-card p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Selected Hospital Insight</h2>
              <p className="text-sm text-slate-600">{selectedHospital.name}</p>
            </div>
            <span className="interactive-chip rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-700">
              {selectedHospital.location}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Insight title="Patient Share" value={`${selectedHospitalInsights.patientShare}%`} />
            <Insight title="Doctor Share" value={`${selectedHospitalInsights.doctorShare}%`} />
            <Insight title="Bed Share" value={`${selectedHospitalInsights.bedShare}%`} />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
              <p className="text-sm text-slate-500">Emergency Status</p>
              <p className="text-xl font-bold text-slate-900">{selectedHospital.emergencyStatus}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white/80 p-4">
              <p className="text-sm text-slate-500">Current Beds Available</p>
              <p className="text-xl font-bold text-slate-900">{selectedHospital.bedsAvailable}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <div className="surface-card p-5">
          <h2 className="mb-4 text-lg font-bold text-slate-900">
            Department Strength in {selectedHospital.name}
          </h2>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={departmentMix}>
              <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.25} />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="surface-card p-5">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Beds by Hospital</h2>

          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={hospitalCapacityData} margin={{ top: 8, right: 12, left: 4, bottom: 28 }}>
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
              <Bar dataKey="beds" fill="#10b981" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  icon,
  note,
}: {
  title: string;
  value: string | number;
  icon: ReactNode;
  note: string;
}) {
  return (
    <div className="surface-card hover-float p-4">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-sm text-slate-500">{title}</p>
        <span className="rounded-lg bg-cyan-50 p-2 text-cyan-700">{icon}</span>
      </div>
      <p className="text-2xl font-extrabold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500">{note}</p>
    </div>
  );
}

function Insight({ title, value }: { title: string; value: string }) {
  return (
    <div className="hover-float rounded-xl border border-slate-200 bg-white/80 p-4">
      <p className="text-sm text-slate-500">{title}</p>
      <p className="text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
