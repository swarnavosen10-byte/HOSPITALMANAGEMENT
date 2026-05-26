import HospitalMap from "../../components/HospitalMap";

export default function HospitalMapPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Patient Portal</p>
        <h1 className="text-3xl font-extrabold text-slate-900">Hospital Locator</h1>
        <p className="text-slate-600">Locate nearby network hospitals, view real-time bed availabilities, and get routes.</p>
      </div>

      <div className="w-full">
        <HospitalMap />
      </div>
    </div>
  );
}
