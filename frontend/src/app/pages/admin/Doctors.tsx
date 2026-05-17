import { useState } from "react";
import {
  doctors as centralizedDoctors,
  getHospitalNameById,
  hospitals,
  type Doctor,
} from "../../data";

type DoctorFormState = Omit<Doctor, "id"> & { id?: number };

const initialForm = (): DoctorFormState => ({
  hospitalId: hospitals[0]?.id ?? 1,
  department: "Cardiology",
  name: "",
  experience: 0,
  availability: "Available",
  fees: 0,
  phone: "",
  email: "",
});

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>(centralizedDoctors);
  const [search, setSearch] = useState("");
  const [hospitalFilter, setHospitalFilter] = useState<number | "All">("All");

  const [showModal, setShowModal] = useState(false);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const [form, setForm] = useState<DoctorFormState>(initialForm());

  const filteredDoctors = doctors.filter((doctor) => {
    const query = search.toLowerCase();
    const matchesSearch =
      doctor.name.toLowerCase().includes(query) ||
      doctor.department.toLowerCase().includes(query) ||
      doctor.email.toLowerCase().includes(query);

    const matchesHospital =
      hospitalFilter === "All" || doctor.hospitalId === hospitalFilter;

    return matchesSearch && matchesHospital;
  });

  const generateDoctorId = () => {
    const highest = doctors.reduce((max, doctor) => Math.max(max, doctor.id), 100);
    return highest + 1;
  };

  const resetForm = () => {
    setShowModal(false);
    setEditIndex(null);
    setForm(initialForm());
  };

  const handleSave = () => {
    if (!form.name || !form.department) return;

    if (editIndex !== null) {
      const updated = [...doctors];
      const current = updated[editIndex];
      updated[editIndex] = {
        ...form,
        id: current.id,
      } as Doctor;
      setDoctors(updated);
    } else {
      const newDoctor: Doctor = {
        ...(form as Omit<Doctor, "id">),
        id: generateDoctorId(),
      };
      setDoctors((prev) => [newDoctor, ...prev]);
    }

    resetForm();
  };

  const handleEdit = (index: number) => {
    setForm(doctors[index]);
    setEditIndex(index);
    setShowModal(true);
  };

  const handleDelete = (index: number) => {
    setDoctors((prev) => prev.filter((_, currentIndex) => currentIndex !== index));
  };

  const statusStyle = (status: Doctor["availability"]) => {
    if (status === "Available") return "bg-emerald-50 text-emerald-700";
    if (status === "Limited") return "bg-amber-50 text-amber-700";
    return "bg-rose-50 text-rose-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
            Admin Clinical Directory
          </p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Doctors</h1>
          <p className="text-slate-600">Centralized specialist roster for all Kolkata hospitals.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="rounded-xl bg-cyan-700 px-4 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-cyan-800"
        >
          + Add Doctor
        </button>
      </div>

      <div className="surface-card grid grid-cols-1 gap-3 p-4 md:grid-cols-4">
        <input
          placeholder="Search by name, specialty, email"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="md:col-span-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
        />

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

      <div className="stagger grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredDoctors.map((doctor, index) => (
          <div key={doctor.id} className="surface-card p-5">
            <div className="mb-4 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{doctor.name}</h2>
                <p className="text-sm text-slate-600">{doctor.department}</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(
                  doctor.availability
                )}`}
              >
                {doctor.availability}
              </span>
            </div>

            <div className="space-y-1 text-sm text-slate-600">
              <p>
                Experience: <span className="font-semibold text-slate-800">{doctor.experience} years</span>
              </p>
              <p>
                Hospital: <span className="font-semibold text-slate-800">{getHospitalNameById(doctor.hospitalId)}</span>
              </p>
              <p>
                Fees: <span className="font-semibold text-slate-800">Rs. {doctor.fees}</span>
              </p>
              <p>{doctor.phone}</p>
              <p>{doctor.email}</p>
            </div>

            <div className="mt-4 flex gap-3 text-sm font-semibold">
              <button onClick={() => handleEdit(index)} className="text-cyan-700">
                Edit
              </button>
              <button onClick={() => handleDelete(index)} className="text-rose-600">
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredDoctors.length === 0 && (
        <div className="surface-card p-5 text-sm text-slate-500">No doctors match the selected filters.</div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/45 p-4">
          <div className="surface-card w-full max-w-md p-6">
            <h2 className="mb-4 text-lg font-bold text-slate-900">
              {editIndex !== null ? "Edit Doctor" : "Add Doctor"}
            </h2>

            <div className="space-y-3">
              <input
                placeholder="Doctor name"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Department"
                  value={form.department}
                  onChange={(event) =>
                    setForm({ ...form, department: event.target.value })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                />
                <input
                  type="number"
                  placeholder="Experience"
                  value={form.experience || ""}
                  onChange={(event) =>
                    setForm({ ...form, experience: Number(event.target.value) })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  placeholder="Consultation Fees"
                  value={form.fees || ""}
                  onChange={(event) =>
                    setForm({ ...form, fees: Number(event.target.value) })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                />

                <select
                  value={form.availability}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      availability: event.target.value as Doctor["availability"],
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                >
                  <option value="Available">Available</option>
                  <option value="Limited">Limited</option>
                  <option value="On Leave">On Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input
                  placeholder="Phone"
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                />
                <input
                  placeholder="Email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                />
              </div>

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
                Save Doctor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
