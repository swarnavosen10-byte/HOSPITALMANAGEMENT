import { useMemo, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getPatientsByHospital } from "../../data";
import { getDoctorScope } from "../../utils/roleScope";
import { api } from "../../services/api";
import { Printer, Calendar, Pill, Activity, Stethoscope, ArrowLeft } from "lucide-react";

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
  const location = useLocation();
  const navigate = useNavigate();
  const targetDate = location.state?.date;
  const targetPatientId = location.state?.patientId;

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
      const d = new Date();
      const todayStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

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

  const targetRx = useMemo(() => {
    if (targetDate && targetPatientId && prescriptions.length > 0) {
      return prescriptions.find(rx => rx.createdAt === targetDate && Number(rx.patientId) === Number(targetPatientId)) || null;
    }
    return null;
  }, [prescriptions, targetDate, targetPatientId]);

  const enrichedRows = useMemo(
    () => {
      const d = new Date();
      const todayStr = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
      return prescriptions
        .filter(row => {
          if (targetDate && targetPatientId) {
            if (row.createdAt === targetDate && Number(row.patientId) === Number(targetPatientId)) {
              return true;
            }
          }
          return row.createdAt === todayStr;
        })
        .map((row) => {
          const match = todayPatients.find((p) => String(p.id) === String(row.patientId)) ?? 
                        patients.find((p) => String(p.id) === String(row.patientId));
          return {
            ...row,
            patientName: row.patientName ?? match?.name ?? `Patient #${row.patientId}`,
          };
        });
    },
    [patients, todayPatients, prescriptions, targetDate, targetPatientId]
  );

  const handlePrint = () => {
    window.print();
  };

  if (targetRx) {
    return (
      <div className="page-content space-y-6 print:space-y-0 print:p-0">
        <div className="print:hidden flex justify-between items-end">
          <div>
            <button 
              onClick={() => navigate('/doctor-dashboard/appointments')}
              className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-800 transition"
            >
              <ArrowLeft size={16} /> Back to Appointments
            </button>
            <h1 className="text-3xl font-extrabold text-slate-900">Historical Record</h1>
            <p className="text-slate-600">Viewing past prescription for {targetRx.patientName}</p>
          </div>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 shadow-lg shadow-slate-900/20"
          >
            <Printer size={16} />
            Print Prescription
          </button>
        </div>

        <div className="mx-auto bg-white shadow-xl ring-1 ring-slate-100 md:rounded-3xl overflow-hidden print:shadow-none print:ring-0 print:rounded-none" style={{ maxWidth: '210mm', minHeight: '297mm' }}>
          {/* Header */}
          <div className="bg-slate-50 border-b border-slate-100 px-8 py-10 print:bg-white print:border-b-2 print:border-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-serif text-cyan-900 font-bold mb-1">Dr. {targetRx.doctorName || "Unknown"}</h2>
                <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Consultant</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800">Hospital ID: {targetRx.hospitalId}</p>
                <p className="text-sm text-slate-500 flex items-center justify-end gap-1.5 mt-1">
                  <Calendar size={14} />
                  {targetRx.createdAt}
                </p>
              </div>
            </div>
          </div>

          {/* Patient Info */}
          <div className="px-8 py-6 border-b border-dashed border-slate-200">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Patient Name</p>
                <p className="text-lg font-semibold text-slate-900">{targetRx.patientName || "Patient"}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Prescription ID</p>
                <p className="text-sm font-mono text-slate-700">RX-{targetRx.id}</p>
              </div>
            </div>
          </div>

          {/* Rx Symbol */}
          <div className="px-8 pt-8">
            <span className="text-4xl font-serif text-slate-300 select-none">Rx</span>
          </div>

          {/* Body */}
          <div className="px-8 pb-10 space-y-10">
            
            {/* Medicines */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
                <Pill size={16} className="text-cyan-600" /> Medication Plan
              </h3>
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-100">
                    <th className="py-2 font-medium w-1/3">Medicine</th>
                    <th className="py-2 font-medium">Dosage</th>
                    <th className="py-2 font-medium">Timing</th>
                    <th className="py-2 font-medium">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {targetRx.medicineName?.split(",").map((med: string, idx: number) => {
                    const dosages = targetRx.dosage?.split(",") || [];
                    const timings = targetRx.timing?.split(",") || [];
                    const durations = targetRx.durationDays?.split(",") || [];
                    
                    const dosage = dosages[idx]?.trim() || dosages[0]?.trim() || "-";
                    const timing = timings[idx]?.trim() || timings[0]?.trim() || "-";
                    const duration = durations[idx]?.trim() || durations[0]?.trim() || "-";

                    return (
                      <tr key={idx} className="border-b border-slate-50 last:border-0">
                        <td className="py-3 font-semibold text-slate-800">{med.trim()}</td>
                        <td className="py-3 text-slate-600">{dosage}</td>
                        <td className="py-3 text-slate-600">{timing}</td>
                        <td className="py-3 text-slate-600">{duration} Days</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Tests & Notes */}
            <div className="grid grid-cols-2 gap-8">
              {targetRx.testsRecommended && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Activity size={16} className="text-cyan-600" /> Recommended Tests
                  </h3>
                  <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                    {targetRx.testsRecommended.split(",").map((test: string, idx: number) => (
                      <li key={idx}>{test.trim()}</li>
                    ))}
                  </ul>
                </div>
              )}

              {targetRx.notes && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Stethoscope size={16} className="text-cyan-600" /> Clinical Notes
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {targetRx.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Follow up */}
            {targetRx.followUpDate && (
              <div className="bg-cyan-50/50 p-4 rounded-xl border border-cyan-100 text-center print:bg-transparent print:border-none print:p-0 print:text-left print:mt-10">
                <p className="text-sm text-slate-600">
                  Please return for a follow-up consultation on <span className="font-bold text-cyan-900">{targetRx.followUpDate}</span>.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-auto px-8 py-8 text-center border-t border-slate-100 text-xs text-slate-400 print:absolute print:bottom-0 print:w-full print:border-t-2 print:border-slate-800">
            <p>This is a computer generated prescription and does not require a physical signature.</p>
            <p className="mt-1">Generated via Medisync Platform.</p>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body * {
              visibility: hidden;
            }
            .print\\:absolute {
              visibility: visible;
            }
            .print\\:absolute * {
              visibility: visible;
            }
            .print\\:absolute {
              position: absolute;
              left: 0;
              top: 0;
            }
          }
        `}} />
      </div>
    );
  }

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
            {enrichedRows.map((row) => {
              const isTarget = targetDate && targetPatientId && row.createdAt === targetDate && Number(row.patientId) === Number(targetPatientId);
              return (
                <tr key={row.id} className={`border-t border-slate-100 transition hover:bg-slate-50/70 ${isTarget ? 'bg-cyan-50/50 ring-2 ring-inset ring-cyan-200' : ''}`}>
                  <td className="px-4 py-3 font-semibold text-slate-900">{row.patientName} {isTarget && <span className="ml-2 inline-flex items-center rounded-md bg-cyan-100 px-2 py-1 text-xs font-medium text-cyan-700 ring-1 ring-inset ring-cyan-700/10">Requested Record</span>}</td>
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
              );
            })}
          </tbody>
        </table>

        {enrichedRows.length === 0 && <p className="p-4 text-sm text-slate-500">No prescriptions yet.</p>}
      </div>
    </div>
  );
}
