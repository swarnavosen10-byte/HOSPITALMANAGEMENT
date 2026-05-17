import { useMemo, useState, useEffect } from "react";
import { getPatientsByHospital } from "../../data";
import { getDoctorScope } from "../../utils/roleScope";
import { api } from "../../services/api";

type PrescriptionForm = {
  patientId: string;
  medicineName: string;
  dosage: string;
  timing: string;
  durationDays: string;
  testsRecommended: string;
  followUpDate: string;
  notes: string;
};

export default function DoctorPrescriptions() {
  const { doctorId, hospitalId } = getDoctorScope();
  const patients = getPatientsByHospital(hospitalId);

  const [todayPatients, setTodayPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);

  const [form, setForm] = useState<PrescriptionForm>({
    patientId: "",
    medicineName: "",
    dosage: "",
    timing: "1-0-1",
    durationDays: "5",
    testsRecommended: "",
    followUpDate: "",
    notes: "",
  });

  const fetchTodayPatients = async () => {
    setLoading(true);
    try {
      const activeData = await api.get<any[]>("/appointments");
      const todayStr = new Date().toISOString().slice(0, 10);

      const filteredToday = activeData.filter(
        (apt: any) =>
          String(apt.doctorId) === String(doctorId) &&
          Number(apt.hospitalId) === Number(hospitalId) &&
          apt.date === todayStr &&
          !["Completed", "Cancelled", "Rejected"].includes(apt.status)
      );

      const uniquePatientsMap = new Map();
      filteredToday.forEach((apt: any) => {
        const pId = String(apt.patientId);
        const resolvedName = apt.patientName ?? patients.find((p) => String(p.id) === pId)?.name ?? `Patient #${pId}`;
        uniquePatientsMap.set(pId, {
          id: pId,
          name: resolvedName
        });
      });

      const todayPatientsList = Array.from(uniquePatientsMap.values());
      setTodayPatients(todayPatientsList);

      if (todayPatientsList.length > 0) {
        setForm((prev) => ({
          ...prev,
          patientId: todayPatientsList[0].id
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          patientId: ""
        }));
      }
    } catch (err) {
      console.error("Failed to fetch active today patients for prescriptions:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPrescriptions = async () => {
    try {
      const data = await api.get<any[]>(`/prescriptions/doctor/${doctorId}`);
      setPrescriptions(data);
    } catch (err) {
      console.error("Failed to fetch prescriptions:", err);
    }
  };

  useEffect(() => {
    fetchTodayPatients();
    fetchPrescriptions();
  }, [doctorId, hospitalId]);

  const addPrescription = async () => {
    if (!form.patientId || !form.medicineName || !form.dosage || !form.followUpDate) return;

    try {
      const selectedPatient = todayPatients.find((p) => p.id === form.patientId);
      
      // Handle cases where patientId might be a string like "P001"
      const parsedPatientId = parseInt(form.patientId);
      const safePatientId = isNaN(parsedPatientId) ? null : parsedPatientId;

      const payload = {
        doctorId: Number(doctorId),
        hospitalId: Number(hospitalId),
        patientId: safePatientId,
        patientName: selectedPatient?.name || form.patientId,
        medicineName: form.medicineName,
        dosage: form.dosage,
        timing: form.timing,
        durationDays: form.durationDays,
        testsRecommended: form.testsRecommended,
        followUpDate: form.followUpDate,
        notes: form.notes,
      };

      const newPrescription = await api.post("/prescriptions/", payload);
      setPrescriptions((prev) => [newPrescription, ...prev]);

      setForm((prev) => ({
        ...prev,
        medicineName: "",
        dosage: "",
        timing: "1-0-1",
        durationDays: "5",
        testsRecommended: "",
        followUpDate: "",
        notes: "",
      }));
    } catch (err) {
      console.error("Failed to add prescription:", err);
    }
  };

  const enrichedRows = useMemo(
    () =>
      prescriptions.map((row) => {
        const match = todayPatients.find((p) => String(p.id) === String(row.patientId)) ?? 
                      patients.find((p) => String(p.id) === String(row.patientId));
        return {
          ...row,
          patientName: row.patientName ?? match?.name ?? `Patient #${row.patientId}`,
        };
      }),
    [patients, todayPatients, prescriptions]
  );

  return (
    <div className="page-content space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Doctor Portal</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Prescription Module</h1>
        <p className="text-slate-600">Add medicines, dosage plans, tests, and follow-up dates for today's active patients.</p>
      </div>

      <div className="surface-card space-y-3 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Patient Name *</label>
            {loading ? (
              <p className="text-sm text-slate-400 py-2.5">Loading active queue...</p>
            ) : (
              <select
                value={form.patientId}
                onChange={(event) => setForm((prev) => ({ ...prev, patientId: event.target.value }))}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full"
              >
                {todayPatients.length === 0 ? (
                  <option value="" disabled>No active appointments scheduled today</option>
                ) : (
                  todayPatients.map((patient) => (
                    <option key={patient.id} value={patient.id}>{patient.name}</option>
                  ))
                )}
              </select>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Medicine Name *</label>
            <input value={form.medicineName} onChange={(event) => setForm((prev) => ({ ...prev, medicineName: event.target.value }))} placeholder="e.g. Paracetamol, Ibuprofen" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full" />
            <p className="mt-1 text-xs text-slate-500">Comma separated for multiple</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Dosage *</label>
            <input value={form.dosage} onChange={(event) => setForm((prev) => ({ ...prev, dosage: event.target.value }))} placeholder="e.g. 500mg, 200mg" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full" />
            <p className="mt-1 text-xs text-slate-500">Respective comma separated</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Timing (M-A-E) *</label>
            <input value={form.timing} onChange={(event) => setForm((prev) => ({ ...prev, timing: event.target.value }))} placeholder="e.g. 1-0-1, 0-1-0" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full" />
            <p className="mt-1 text-xs text-slate-500">Respective comma separated</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Duration (Days) *</label>
            <input type="text" value={form.durationDays} onChange={(event) => setForm((prev) => ({ ...prev, durationDays: event.target.value }))} placeholder="e.g. 5, 3" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full" />
            <p className="mt-1 text-xs text-slate-500">Respective comma separated</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Recommended Tests</label>
            <input value={form.testsRecommended} onChange={(event) => setForm((prev) => ({ ...prev, testsRecommended: event.target.value }))} placeholder="e.g. Blood test, X-ray" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full" />
            <p className="mt-1 text-xs text-slate-500">Comma separated values</p>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Follow-up Date *</label>
            <input type="date" value={form.followUpDate} onChange={(event) => setForm((prev) => ({ ...prev, followUpDate: event.target.value }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full" />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Clinical Notes</label>
          <textarea value={form.notes} onChange={(event) => setForm((prev) => ({ ...prev, notes: event.target.value }))} placeholder="e.g. Avoid dairy products, take with water" className="min-h-20 rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full" />
        </div>

        <button 
          onClick={addPrescription} 
          disabled={todayPatients.length === 0}
          className="rounded-xl bg-cyan-700 px-6 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-cyan-800 disabled:opacity-50 disabled:pointer-events-none"
        >
          Add Prescription
        </button>
      </div>

      <div className="surface-card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Medicine Info</th>
              <th className="px-4 py-3">Tests</th>
              <th className="px-4 py-3">Follow-up</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {enrichedRows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                <td className="px-4 py-3 font-semibold text-slate-900">{row.patientName}</td>
                <td className="px-4 py-3 text-slate-700">
                  <div className="flex flex-col gap-1">
                    {row.medicineName?.split(",").map((med: string, idx: number) => {
                      const dosages = row.dosage?.split(",") || [];
                      const timings = row.timing?.split(",") || [];
                      const durations = row.durationDays?.split(",") || [];
                      
                      const dosage = dosages[idx]?.trim() || dosages[0]?.trim() || "";
                      const timing = timings[idx]?.trim() || timings[0]?.trim() || "";
                      const duration = durations[idx]?.trim() || durations[0]?.trim() || "";

                      return (
                        <span key={idx}>
                          <strong>{med.trim()}</strong> - {dosage} - {timing} ({duration} days)
                        </span>
                      );
                    })}
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-700">{row.testsRecommended || "None"}</td>
                <td className="px-4 py-3 text-slate-700">{row.followUpDate}</td>
                <td className="px-4 py-3 text-slate-500">{row.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {enrichedRows.length === 0 && <p className="p-4 text-sm text-slate-500">No prescriptions yet.</p>}
      </div>
    </div>
  );
}
