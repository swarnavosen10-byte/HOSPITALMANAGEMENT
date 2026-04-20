import { useEffect, useState } from "react";

type ReportData = {
  total_patients: number;
  total_doctors: number;
  total_appointments: number;
  total_revenue: number;
};

export default function Reports() {
  const [report, setReport] = useState<ReportData | null>(null);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/reports")
      .then((res) => res.json())
      .then((data) => setReport(data))
      .catch((err) => console.log(err));
  }, []);

  if (!report) {
    return <div>Loading reports...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Reports</h1>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500 text-sm mb-2">Total Patients</h2>
          <p className="text-3xl font-bold">{report.total_patients}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500 text-sm mb-2">Total Doctors</h2>
          <p className="text-3xl font-bold">{report.total_doctors}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500 text-sm mb-2">Total Appointments</h2>
          <p className="text-3xl font-bold">{report.total_appointments}</p>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-gray-500 text-sm mb-2">Total Revenue</h2>
          <p className="text-3xl font-bold">${report.total_revenue}</p>
        </div>
      </div>
    </div>
  );
}