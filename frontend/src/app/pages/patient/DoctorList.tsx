import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getHospitalById, type Doctor } from "../../data";
import { api } from "../../services/api.ts";

export default function DoctorList() {
  const { id, department } = useParams();
  const navigate = useNavigate();
  const [deptDoctors, setDeptDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  const hospitalId = Number(id);
  const decodedDepartment = decodeURIComponent(department ?? "");
  const hospital = getHospitalById(hospitalId);

  useEffect(() => {
    async function fetchDoctors() {
      setLoading(true);
      try {
        const data = await api.get<any[]>("/doctors");
        const mapped: Doctor[] = data
          .filter((d: any) => d.hospitalId === hospitalId && (d.department === decodedDepartment || d.specialization === decodedDepartment))
          .map((d: any) => ({
            id: d.id,
            hospitalId: d.hospitalId,
            department: d.department || d.specialization || "General",
            name: d.name,
            experience: d.experience || 0,
            availability: d.availability || "Available",
            fees: d.fees || 500,
            phone: d.phone || "N/A",
            email: d.email || "N/A",
          }));
        setDeptDoctors(mapped);
      } catch (err) {
        console.error("Failed to fetch doctors:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchDoctors();
  }, [hospitalId, decodedDepartment]);

  if (!hospital) {
    return <div className="p-6">Hospital not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="surface-card p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Doctors Directory</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">{decodedDepartment}</h1>
        <p className="text-slate-600">{hospital.name}</p>
      </div>

      <div className="stagger space-y-4">
        {loading && (
          <div className="p-10 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-cyan-700 border-t-transparent"></div>
            <p className="mt-2 text-sm text-slate-500">Finding doctors...</p>
          </div>
        )}

        {!loading && deptDoctors.map((doc) => (
        <div
          key={doc.id}
          className="surface-card p-5"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">{doc.name}</h2>
              <p className="text-slate-600">Experience: {doc.experience} years</p>
              <p className="text-slate-600">Availability: {doc.availability}</p>
              <p className="text-slate-700">Consultation Fee: Rs. {doc.fees}</p>
            </div>

            <button
              className="rounded-xl bg-cyan-700 px-4 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-cyan-800"
              onClick={() =>
                navigate(
                  `/patient-dashboard/book/${doc.id}?hospitalId=${hospitalId}&department=${encodeURIComponent(
                    decodedDepartment
                  )}`
                )
              }
            >
              Book Appointment
            </button>
          </div>
        </div>
        ))}
      </div>

      {!loading && deptDoctors.length === 0 && (
        <p className="surface-card p-5 text-slate-600">No doctors available for this department.</p>
      )}
    </div>
  );
}