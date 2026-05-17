import { useNavigate, useParams } from "react-router-dom";
import { getDepartmentsByHospital, getHospitalById } from "../../data";

export default function Departments() {
  const navigate = useNavigate();
  const { id } = useParams();
  const hospitalId = Number(id);

  const hospital = getHospitalById(hospitalId);
  const departments = getDepartmentsByHospital(hospitalId);

  if (!hospital) {
    return <div className="p-6">Hospital not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="surface-card p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Clinical Units</p>
        <h2 className="mt-2 text-3xl font-extrabold text-slate-900">Departments</h2>
        <p className="text-slate-600">{hospital.name}</p>
      </div>

      <div className="stagger grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept) => (
          <button
            key={dept.name}
            type="button"
            onClick={() =>
              navigate(
                `/patient-dashboard/hospitals/${hospitalId}/departments/${encodeURIComponent(
                  dept.name
                )}`
              )
            }
            className="surface-card cursor-pointer p-6 text-center transition duration-300 hover:-translate-y-1 hover:border-cyan-200"
            aria-label={`Open ${dept.name} department`}
          >
            <h3 className="text-xl font-bold text-slate-900">{dept.name}</h3>
            <p className="mt-2 text-slate-600">Doctors: {dept.doctorCount}</p>
            <p className="text-slate-600">Availability: {dept.availability}</p>
          </button>
        ))}
      </div>
    </div>
  );
}