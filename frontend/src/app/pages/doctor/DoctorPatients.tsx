import { useMemo, useState } from "react";
import {
  getAppointmentsByDoctor,
  getMedicalRecordByPatientId,
  getPatientsByHospital,
} from "../../data";
import { getDoctorScope } from "../../utils/roleScope";

export default function DoctorPatients() {
  const { doctorId, hospitalId } = getDoctorScope();
  const appointments = getAppointmentsByDoctor(doctorId).filter((appointment) => appointment.hospitalId === hospitalId);
  const patients = getPatientsByHospital(hospitalId).filter((patient) =>
    appointments.some((appointment) => appointment.patientId === patient.id)
  );

  const [query, setQuery] = useState("");
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id ?? "");

  const filteredPatients = useMemo(() => {
    const normalized = query.toLowerCase();
    return patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(normalized) ||
        patient.id.toLowerCase().includes(normalized) ||
        patient.diagnosis.toLowerCase().includes(normalized)
    );
  }, [patients, query]);

  const selectedPatient = patients.find((patient) => patient.id === selectedPatientId) ?? filteredPatients[0];
  const medicalRecord = selectedPatient ? getMedicalRecordByPatientId(selectedPatient.id) : null;

  return (
    <div className="page-content space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Doctor Portal</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Patient Medical View</h1>
        <p className="text-slate-600">Review symptoms, reports, allergy alerts, and prescription history.</p>
      </div>

      <div className="surface-card p-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search patients by name, ID, diagnosis"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1fr_1.6fr]">
        <div className="surface-card p-4">
          <h2 className="mb-3 text-lg font-bold text-slate-900">Assigned Patients</h2>
          <div className="space-y-2">
            {filteredPatients.map((patient) => (
              <button
                key={patient.id}
                onClick={() => setSelectedPatientId(patient.id)}
                className={`w-full rounded-xl border px-3 py-2 text-left transition ${selectedPatient?.id === patient.id ? "border-cyan-300 bg-cyan-50" : "border-slate-100 bg-white hover:bg-slate-50"}`}
              >
                <p className="font-semibold text-slate-900">{patient.name}</p>
                <p className="text-xs text-slate-500">{patient.id} • {patient.diagnosis}</p>
              </button>
            ))}
          </div>
          {filteredPatients.length === 0 && <p className="text-sm text-slate-500">No patients found.</p>}
        </div>

        <div className="surface-card p-5">
          {selectedPatient ? (
            <>
              <h2 className="text-xl font-bold text-slate-900">{selectedPatient.name}</h2>
              <p className="text-sm text-slate-500">{selectedPatient.id} • {selectedPatient.age} years • {selectedPatient.gender}</p>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700">Symptoms</p>
                  <div className="space-y-2">
                    {(medicalRecord?.symptoms ?? ["No data"]).map((item) => (
                      <p key={item} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{item}</p>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700">Reports</p>
                  <div className="space-y-2">
                    {(medicalRecord?.reports ?? ["No reports"]).map((item) => (
                      <p key={item} className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">{item}</p>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700">Allergies</p>
                  <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{(medicalRecord?.allergies ?? ["No allergies recorded"]).join(", ")}</p>
                </div>
                <div>
                  <p className="mb-2 text-sm font-semibold text-slate-700">Emergency Conditions</p>
                  <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">{(medicalRecord?.emergencyConditions ?? ["No emergency condition"]).join(", ")}</p>
                </div>
              </div>

              <div className="mt-4">
                <p className="mb-2 text-sm font-semibold text-slate-700">Prescription History</p>
                <div className="space-y-2">
                  {(medicalRecord?.prescriptionHistory ?? ["No history available"]).map((item) => (
                    <p key={item} className="rounded-lg bg-cyan-50 px-3 py-2 text-sm text-cyan-800">{item}</p>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-slate-500">Select a patient to view medical details.</p>
          )}
        </div>
      </div>
    </div>
  );
}
