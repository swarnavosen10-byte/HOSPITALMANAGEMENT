import { useMemo, useState } from "react";
import { getPatientsByHospital, getPrescriptionsByDoctorAndHospital, type PrescriptionRecord } from "../../data";
import { getDoctorScope } from "../../utils/roleScope";

type PrescriptionForm = {
  patientId: string;
  medicineName: string;
  dosage: string;
  timing: string;
  durationDays: number;
  testsRecommended: string;
  followUpDate: string;
  notes: string;
};

export default function DoctorPrescriptions() {
  const { doctorId, hospitalId } = getDoctorScope();
  const patients = getPatientsByHospital(hospitalId);

  const [rows, setRows] = useState<PrescriptionRecord[]>(
    getPrescriptionsByDoctorAndHospital(doctorId, hospitalId)
  );
  const [form, setForm] = useState<PrescriptionForm>({
    patientId: patients[0]?.id ?? "",
    medicineName: "",
    dosage: "",
    timing: "1-0-1",
    durationDays: 5,
    testsRecommended: "",
    followUpDate: "",
    notes: "",
  });

  const addPrescription = () => {
    if (!form.patientId || !form.medicineName || !form.dosage || !form.followUpDate) return;

    const payload: PrescriptionRecord = {
      id: `RX-${Date.now()}`,
      doctorId,
      hospitalId,
      patientId: form.patientId,
      medicines: [
        {
          name: form.medicineName,
          dosage: form.dosage,
          timing: form.timing,
          durationDays: Number(form.durationDays),
        },
      ],
      testsRecommended: form.testsRecommended
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      followUpDate: form.followUpDate,
      notes: form.notes,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setRows((prev) => [payload, ...prev]);
    setForm((prev) => ({
      ...prev,
      medicineName: "",
      dosage: "",
      timing: "1-0-1",
      durationDays: 5,
      testsRecommended: "",
      followUpDate: "",
      notes: "",
    }));
  };

  const enrichedRows = useMemo(
    () =>
      rows.map((row) => ({
        ...row,
        patientName: patients.find((patient) => patient.id === row.patientId)?.name ?? row.patientId,
      })),
    [patients, rows]
  );

  return (
    <div className="page-content space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Doctor Portal</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Prescription Module</h1>
        <p className="text-slate-600">Add medicines, dosage plans, tests, and follow-up dates for your patients.</p>
      </div>

      <div className="surface-card space-y-3 p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Patient Name *</label>
            <select
              value={form.patientId}
              onChange={(event) => setForm((prev) => ({ ...prev, patientId: event.target.value }))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full"
            >
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>{patient.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Medicine Name *</label>
            <input value={form.medicineName} onChange={(event) => setForm((prev) => ({ ...prev, medicineName: event.target.value }))} placeholder="e.g. Paracetamol" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Dosage *</label>
            <input value={form.dosage} onChange={(event) => setForm((prev) => ({ ...prev, dosage: event.target.value }))} placeholder="e.g. 500mg" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Timing (Morning-Afternoon-Evening) *</label>
            <input value={form.timing} onChange={(event) => setForm((prev) => ({ ...prev, timing: event.target.value }))} placeholder="e.g. 1-0-1" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full" />
            <p className="mt-1 text-xs text-slate-500">Use 1=dose, 0=skip (e.g., 1-0-1 = morning & evening)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Duration (Days) *</label>
            <input type="number" min={1} value={form.durationDays} onChange={(event) => setForm((prev) => ({ ...prev, durationDays: Number(event.target.value) }))} placeholder="e.g. 5" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full" />
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

        <button onClick={addPrescription} className="rounded-xl bg-cyan-700 px-6 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-cyan-800">Add Prescription</button>
      </div>

      <div className="surface-card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Patient</th>
              <th className="px-4 py-3">Medicine</th>
              <th className="px-4 py-3">Tests</th>
              <th className="px-4 py-3">Follow-up</th>
              <th className="px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody>
            {enrichedRows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                <td className="px-4 py-3 font-semibold text-slate-900">{row.patientName}</td>
                <td className="px-4 py-3 text-slate-700">{row.medicines[0]?.name} • {row.medicines[0]?.dosage} • {row.medicines[0]?.timing}</td>
                <td className="px-4 py-3 text-slate-700">{row.testsRecommended.join(", ") || "None"}</td>
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
