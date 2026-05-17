import { useMemo, useState } from "react";
import {
  getAppointmentsByHospital,
  getDoctorsByHospital,
  getMedicalRecordByPatientId,
  getPatientsByHospital,
  type AdminPatient,
} from "../../data";
import { getStaffHospitalId } from "../../utils/roleScope";

type PatientStatus = AdminPatient["status"];

type PatientRow = AdminPatient & {
  emergencyTagged: boolean;
};

export default function StaffPatients() {
  const hospitalId = getStaffHospitalId();
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<PatientStatus | "All">("All");

  const basePatients = getPatientsByHospital(hospitalId);
  const doctors = getDoctorsByHospital(hospitalId);
  const appointments = getAppointmentsByHospital(hospitalId);

  const [patients, setPatients] = useState<PatientRow[]>(
    basePatients.map((patient) => ({ ...patient, emergencyTagged: false }))
  );

  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const normalized = query.toLowerCase().trim();
      const matchesQuery =
        patient.name.toLowerCase().includes(normalized) ||
        patient.id.toLowerCase().includes(normalized) ||
        patient.diagnosis.toLowerCase().includes(normalized);
      const matchesStatus = statusFilter === "All" || patient.status === statusFilter;
      return matchesQuery && matchesStatus;
    });
  }, [patients, query, statusFilter]);

  const getAssignedDoctor = (patientId: string) => {
    const latestAppointment = appointments.find((appointment) => appointment.patientId === patientId);
    if (!latestAppointment) return "Not assigned";
    return doctors.find((doctor) => doctor.id === latestAppointment.doctorId)?.name ?? "Not assigned";
  };

  const updatePatientStatus = (patientId: string, status: PatientStatus) => {
    setPatients((prev) => prev.map((patient) => (patient.id === patientId ? { ...patient, status } : patient)));
  };

  const toggleEmergencyTag = (patientId: string) => {
    setPatients((prev) =>
      prev.map((patient) =>
        patient.id === patientId ? { ...patient, emergencyTagged: !patient.emergencyTagged } : patient
      )
    );
  };

  return (
    <div className="page-content space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Hospital Staff</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Patient Management</h1>
        <p className="text-slate-600">Search, track medical history, and manage admissions for your hospital only.</p>
      </div>

      <div className="surface-card grid grid-cols-1 gap-3 p-4 md:grid-cols-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by name, ID, diagnosis"
          className="md:col-span-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
        />

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as PatientStatus | "All")}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
        >
          <option value="All">All Status</option>
          <option value="Admitted">Admitted</option>
          <option value="In Treatment">In Treatment</option>
          <option value="Discharged">Discharged</option>
          <option value="Waiting">Waiting</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.45fr_1fr]">
        <div className="surface-card overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Diagnosis</th>
                <th className="px-4 py-3">Assigned Doctor</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{patient.name}</p>
                    <p className="text-xs text-slate-500">{patient.id} • {patient.age} yrs</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{patient.diagnosis}</td>
                  <td className="px-4 py-3 text-slate-700">{getAssignedDoctor(patient.id)}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800">
                      {patient.status}
                    </span>
                    {patient.emergencyTagged && (
                      <span className="ml-2 rounded-full bg-rose-100 px-2.5 py-1 text-xs font-semibold text-rose-700">Emergency</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => updatePatientStatus(patient.id, "Admitted")}
                        className="rounded-lg bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800 transition hover:bg-cyan-100"
                      >
                        Admit
                      </button>
                      <button
                        type="button"
                        onClick={() => updatePatientStatus(patient.id, "Discharged")}
                        className="rounded-lg bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        Discharge
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleEmergencyTag(patient.id)}
                        className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
                      >
                        Tag Emergency
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPatients.length === 0 && (
            <p className="p-4 text-sm text-slate-500">No patients match your search criteria.</p>
          )}
        </div>

        <div className="surface-card p-5">
          <h2 className="mb-4 text-lg font-bold text-slate-900">Medical History Snapshot</h2>
          <div className="space-y-4">
            {filteredPatients.slice(0, 3).map((patient) => {
              const record = getMedicalRecordByPatientId(patient.id);
              return (
                <div key={patient.id} className="rounded-xl border border-slate-100 bg-white p-3">
                  <p className="font-semibold text-slate-900">{patient.name}</p>
                  <p className="mt-1 text-xs text-slate-500">Allergies: {(record?.allergies ?? ["No records"]).join(", ")}</p>
                  <p className="text-xs text-slate-500">History: {(record?.prescriptionHistory ?? ["No history"])[0]}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
