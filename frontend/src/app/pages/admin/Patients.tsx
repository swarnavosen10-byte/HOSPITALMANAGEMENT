import { useMemo, useState, useEffect } from "react";
import {
  getHospitalNameById,
  hospitals,
  type AdminPatient,
} from "../../data";
import { api } from "../../services/api.ts";

type PatientStatus = AdminPatient["status"];

type PatientFormState = {
  id: string;
  name: string;
  age: number;
  gender: AdminPatient["gender"];
  diagnosis: string;
  status: PatientStatus;
  hospitalId: number;
};

const initialForm: PatientFormState = {
  id: "",
  name: "",
  age: 0,
  gender: "Male",
  diagnosis: "",
  status: "Admitted",
  hospitalId: hospitals[0]?.id ?? 1,
};

export default function Patients() {
  const [patients, setPatients] = useState<AdminPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PatientStatus | "All">("All");
  const [genderFilter, setGenderFilter] = useState<AdminPatient["gender"] | "All">(
    "All"
  );
  const [hospitalFilter, setHospitalFilter] = useState<number | "All">("All");

  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<PatientFormState>(initialForm);

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const data = await api.get<any[]>("/patients");
      const mapped: AdminPatient[] = data.map((p: any) => ({
        id: String(p.id).startsWith("P") ? p.id : `P${String(p.id).padStart(3, "0")}`,
        name: p.name,
        age: p.age,
        gender: p.gender || "Male",
        diagnosis: p.diagnosis || "N/A",
        status: p.status || "Waiting",
        hospitalId: p.hospitalId || 1,
      }));
      setPatients(mapped);
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    } finally {
      setLoading(false);
    }
  };

  const normalize = (value: string) => value.toLowerCase().trim();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      normalize(patient.name).includes(normalize(search)) ||
      normalize(patient.id).includes(normalize(search)) ||
      normalize(patient.diagnosis).includes(normalize(search));

    const matchesStatus = statusFilter === "All" || patient.status === statusFilter;
    const matchesGender = genderFilter === "All" || patient.gender === genderFilter;
    const matchesHospital =
      hospitalFilter === "All" || patient.hospitalId === hospitalFilter;

    return matchesSearch && matchesStatus && matchesGender && matchesHospital;
  });

  const summary = useMemo(() => {
    return {
      total: patients.length,
      admitted: patients.filter((patient) => patient.status === "Admitted").length,
      treatment: patients.filter((patient) => patient.status === "In Treatment").length,
      discharged: patients.filter((patient) => patient.status === "Discharged").length,
    };
  }, [patients]);

  const resetForm = () => {
    setShowModal(false);
    setEditIndex(null);
    setForm(initialForm);
  };

  const handleSave = async () => {
    if (!form.name || !form.diagnosis) return;

    try {
      if (editIndex !== null) {
        // We use the patient ID from the state for the update
        await api.post("/patients", { ...form });
      } else {
        await api.post("/patients", { ...form });
      }
      await fetchPatients();
      resetForm();
    } catch (err) {
      console.error("Failed to save patient:", err);
    }
  };

  const handleDelete = async (index: number) => {
    const patient = patients[index];
    const numericId = patient.id.replace("P", "");
    if (!window.confirm(`Are you sure you want to delete ${patient.name}?`)) return;

    try {
      await api.delete(`/patients/${numericId}`);
      await fetchPatients();
    } catch (err) {
      console.error("Failed to delete patient:", err);
    }
  };

  const handleEdit = (index: number) => {
    const patient = patients[index];
    setForm({ ...patient });
    setEditIndex(index);
    setShowModal(true);
  };

  const patientStatusClass = (status: PatientStatus) => {
    if (status === "Admitted") return "bg-rose-50 text-rose-700";
    if (status === "In Treatment") return "bg-amber-50 text-amber-700";
    if (status === "Discharged") return "bg-emerald-50 text-emerald-700";
    return "bg-cyan-50 text-cyan-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Admin Patient Registry
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Patients</h1>
          <p className="text-slate-600">Centralized records across all Kolkata hospitals.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="rounded-xl bg-cyan-700 px-4 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-cyan-800"
        >
          + Add Patient
        </button>
      </div>

      <div className="stagger grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">Total Patients</p>
          <p className="text-2xl font-extrabold text-slate-900">{summary.total}</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">Admitted</p>
          <p className="text-2xl font-extrabold text-slate-900">{summary.admitted}</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">In Treatment</p>
          <p className="text-2xl font-extrabold text-slate-900">{summary.treatment}</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">Discharged</p>
          <p className="text-2xl font-extrabold text-slate-900">{summary.discharged}</p>
        </div>
      </div>

      <div className="surface-card grid grid-cols-1 gap-3 p-4 md:grid-cols-5">
        <input
          placeholder="Search by name, ID, diagnosis"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="md:col-span-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
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

        <select
          value={genderFilter}
          onChange={(event) =>
            setGenderFilter(event.target.value as AdminPatient["gender"] | "All")
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
        >
          <option value="All">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        <select
          value={hospitalFilter}
          onChange={(event) => {
            const value = event.target.value;
            setHospitalFilter(value === "All" ? "All" : Number(value));
          }}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
        >
          <option value="All">All Hospitals</option>
          {hospitals.map((hospital) => (
            <option key={hospital.id} value={hospital.id}>
              {hospital.name}
            </option>
          ))}
        </select>
      </div>

      <div className="surface-card overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-cyan-700 border-t-transparent"></div>
            <p className="mt-2 text-sm text-slate-500">Fetching patient records...</p>
          </div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">ID</th>
                <th className="px-5 py-3">Patient</th>
                <th className="px-5 py-3">Hospital</th>
                <th className="px-5 py-3">Diagnosis</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPatients.map((patient, index) => (
                <tr key={patient.id} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                  <td className="px-5 py-4 font-semibold text-cyan-700">{patient.id}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-600 text-xs font-semibold text-white">
                        {getInitials(patient.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{patient.name}</p>
                        <p className="text-xs text-slate-500">
                          {patient.age} yrs, {patient.gender}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {getHospitalNameById(patient.hospitalId)}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{patient.diagnosis}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${patientStatusClass(
                        patient.status
                      )}`}
                    >
                      {patient.status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex gap-3 text-sm font-semibold">
                      <button onClick={() => handleEdit(index)} className="text-cyan-700">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(index)} className="text-rose-600">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && filteredPatients.length === 0 && (
          <div className="p-5 text-sm text-slate-500">No patients match the current filters.</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="surface-card w-full max-w-md p-6">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              {editIndex !== null ? "Edit Patient" : "Add Patient"}
            </h2>

            <div className="space-y-3">
              <input
                placeholder="Name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Age"
                  value={form.age || ""}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      age: Number(event.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                />

                <select
                  value={form.gender}
                  onChange={(event) =>
                    setForm({ ...form, gender: event.target.value as AdminPatient["gender"] })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <input
                placeholder="Diagnosis"
                value={form.diagnosis}
                onChange={(event) =>
                  setForm({ ...form, diagnosis: event.target.value })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
              />

              <div className="grid grid-cols-2 gap-3">
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value as PatientStatus })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                >
                  <option value="Admitted">Admitted</option>
                  <option value="In Treatment">In Treatment</option>
                  <option value="Discharged">Discharged</option>
                  <option value="Waiting">Waiting</option>
                </select>

                <select
                  value={form.hospitalId}
                  onChange={(event) =>
                    setForm({ ...form, hospitalId: Number(event.target.value) })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                >
                  {hospitals.map((hospital) => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={resetForm}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-800"
              >
                Save Patient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
