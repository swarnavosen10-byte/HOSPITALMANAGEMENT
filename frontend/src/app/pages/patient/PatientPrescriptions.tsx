import { useState, useEffect } from "react";
import { getPatientScope } from "../../utils/roleScope";
import { api } from "../../services/api";
import { Printer, Calendar, FileText, Pill, Activity, Stethoscope } from "lucide-react";

export default function PatientPrescriptions() {
  const { patientId } = getPatientScope();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRx, setSelectedRx] = useState<any | null>(null);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const data = await api.get<any[]>(`/prescriptions/patient/${patientId}`);
        setPrescriptions(data);
        if (data.length > 0) {
          setSelectedRx(data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch prescriptions:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPrescriptions();
  }, [patientId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return <div className="p-8 text-slate-500">Loading prescriptions...</div>;
  }

  return (
    <div className="page-content space-y-6 print:space-y-0 print:p-0">
      <div className="print:hidden">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Patient Portal</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">My Prescriptions</h1>
        <p className="text-slate-600">View and download your digital prescriptions.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 print:block print:w-full">
        {/* Sidebar list (hidden on print) */}
        <div className="w-full lg:w-1/3 space-y-3 print:hidden">
          {prescriptions.length === 0 ? (
            <div className="surface-card p-6 text-center text-slate-500">
              <FileText className="mx-auto mb-2 text-slate-300" size={32} />
              No prescriptions found.
            </div>
          ) : (
            prescriptions.map((rx) => (
              <button
                key={rx.id}
                onClick={() => setSelectedRx(rx)}
                className={`w-full text-left rounded-2xl p-4 transition-all duration-300 ${
                  selectedRx?.id === rx.id
                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-500/20 translate-x-1"
                    : "bg-white border border-slate-100 hover:border-cyan-200 hover:bg-cyan-50/50 text-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs font-semibold ${selectedRx?.id === rx.id ? "text-cyan-200" : "text-cyan-600"}`}>
                    {rx.createdAt}
                  </span>
                </div>
                <p className="font-bold mb-1">Dr. {rx.doctorName || "Unknown"}</p>
                <p className={`text-sm truncate ${selectedRx?.id === rx.id ? "text-cyan-100" : "text-slate-500"}`}>
                  {rx.medicineName?.split(",").length || 0} Medicine(s)
                </p>
              </button>
            ))
          )}
        </div>

        {/* A4 Document View */}
        {selectedRx && (
          <div className="w-full lg:w-2/3 print:w-full print:absolute print:left-0 print:top-0 print:z-50 print:bg-white print:m-0 print:p-0">
            <div className="print:hidden mb-4 flex justify-end">
              <button
                onClick={handlePrint}
                className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-slate-800 shadow-lg shadow-slate-900/20"
              >
                <Printer size={16} />
                Export as PDF / Print
              </button>
            </div>

            <div className="mx-auto bg-white shadow-xl ring-1 ring-slate-100 md:rounded-3xl overflow-hidden print:shadow-none print:ring-0 print:rounded-none" style={{ maxWidth: '210mm', minHeight: '297mm' }}>
              {/* Header */}
              <div className="bg-slate-50 border-b border-slate-100 px-8 py-10 print:bg-white print:border-b-2 print:border-slate-800">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-3xl font-serif text-cyan-900 font-bold mb-1">Dr. {selectedRx.doctorName || "Unknown"}</h2>
                    <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Consultant</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-800">Hospital ID: {selectedRx.hospitalId}</p>
                    <p className="text-sm text-slate-500 flex items-center justify-end gap-1.5 mt-1">
                      <Calendar size={14} />
                      {selectedRx.createdAt}
                    </p>
                  </div>
                </div>
              </div>

              {/* Patient Info */}
              <div className="px-8 py-6 border-b border-dashed border-slate-200">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Patient Name</p>
                    <p className="text-lg font-semibold text-slate-900">{selectedRx.patientName || "Patient"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Prescription ID</p>
                    <p className="text-sm font-mono text-slate-700">RX-{selectedRx.id}</p>
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
                      {selectedRx.medicineName?.split(",").map((med: string, idx: number) => {
                        const dosages = selectedRx.dosage?.split(",") || [];
                        const timings = selectedRx.timing?.split(",") || [];
                        const durations = selectedRx.durationDays?.split(",") || [];
                        
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
                  {selectedRx.testsRecommended && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
                        <Activity size={16} className="text-cyan-600" /> Recommended Tests
                      </h3>
                      <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                        {selectedRx.testsRecommended.split(",").map((test: string, idx: number) => (
                          <li key={idx}>{test.trim()}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedRx.notes && (
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
                        <Stethoscope size={16} className="text-cyan-600" /> Clinical Notes
                      </h3>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {selectedRx.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Follow up */}
                {selectedRx.followUpDate && (
                  <div className="bg-cyan-50/50 p-4 rounded-xl border border-cyan-100 text-center print:bg-transparent print:border-none print:p-0 print:text-left print:mt-10">
                    <p className="text-sm text-slate-600">
                      Please return for a follow-up consultation on <span className="font-bold text-cyan-900">{selectedRx.followUpDate}</span>.
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
          </div>
        )}
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
