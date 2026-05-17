import { useParams, useNavigate } from "react-router-dom";
import { getHospitalById } from "../../data";

export default function HospitalDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const hospitalId = Number(id);
  const hospital = getHospitalById(hospitalId);

  if (!hospital) return <div>Hospital not found</div>;

  return (
    <div className="space-y-6">
      <div className="surface-card p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Hospital Profile</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">{hospital.name}</h1>
        <p className="mt-1 text-slate-600">{hospital.location}</p>
      </div>

      <div className="stagger grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">Bed Availability</p>
          <p className="text-2xl font-bold text-slate-900">{hospital.bedsAvailable}</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">Emergency Status</p>
          <p className="text-2xl font-bold text-slate-900">{hospital.emergencyStatus}</p>
        </div>
        <div className="surface-card p-4">
          <p className="text-sm text-slate-500">Rating</p>
          <p className="text-2xl font-bold text-slate-900">{hospital.rating}</p>
        </div>
      </div>

      <h2 className="text-xl font-semibold text-slate-900">Departments</h2>

      <div className="stagger grid grid-cols-1 gap-3 md:grid-cols-2">
        {hospital.departments.map((dept) => (
          <button
            key={dept.name}
            type="button"
            className="surface-card cursor-pointer p-4 text-left transition duration-300 hover:-translate-y-1 hover:border-cyan-200"
            onClick={() =>
              navigate(
                `/patient-dashboard/hospitals/${hospital.id}/departments/${encodeURIComponent(
                  dept.name
                )}`
              )
            }
            aria-label={`View ${dept.name} doctors`}
          >
            <p className="font-semibold text-slate-900">{dept.name}</p>
            <p className="text-sm text-slate-600">Doctors: {dept.doctorCount}</p>
            <p className="text-sm text-slate-600">Availability: {dept.availability}</p>
          </button>
        ))}
      </div>

      <button
        onClick={() =>
          navigate(`/patient-dashboard/hospitals/${hospitalId}/departments`)
        }
        className="rounded-xl bg-cyan-700 px-4 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-cyan-800"
      >
        View Department Page
      </button>
    </div>
  );
}