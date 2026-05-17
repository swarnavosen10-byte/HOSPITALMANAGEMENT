import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { hospitals } from "../../data";

export default function PatientDashboard() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");

  const specialties = useMemo(() => {
    const values = new Set<string>();
    hospitals.forEach((hospital) => {
      hospital.specialties.forEach((specialty) => values.add(specialty));
    });
    return ["All", ...Array.from(values)];
  }, []);

  const filteredHospitals = hospitals.filter((hospital) => {
    const query = search.toLowerCase();
    const matchesSearch =
      hospital.name.toLowerCase().includes(query) ||
      hospital.location.toLowerCase().includes(query);

    const matchesSpecialty =
      specialtyFilter === "All" ||
      hospital.specialties.some((specialty) => specialty === specialtyFilter);

    const matchesRating =
      ratingFilter === "All" ||
      hospital.rating >= Number(ratingFilter);

    const matchesAvailability =
      availabilityFilter === "All" ||
      (availabilityFilter === "Open Now" && hospital.isOpen) ||
      (availabilityFilter === "Beds Available" && hospital.bedsAvailable > 0);

    return (
      matchesSearch &&
      matchesSpecialty &&
      matchesRating &&
      matchesAvailability
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Patient Portal</p>
          <h1 className="text-3xl font-extrabold text-slate-900">Nearby Hospitals in Kolkata</h1>
          <p className="text-slate-600">Find care by specialty, rating, and current availability.</p>
        </div>
      </div>

      <div className="surface-card grid grid-cols-1 gap-3 p-4 md:grid-cols-4">
        <input
          type="text"
          placeholder="Search by hospital or location"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search hospitals by name or location"
          className="md:col-span-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
        />

        <select
          value={specialtyFilter}
          onChange={(e) => setSpecialtyFilter(e.target.value)}
          aria-label="Filter by specialty"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
        >
          {specialties.map((specialty) => (
            <option key={specialty} value={specialty}>
              {specialty === "All" ? "All Specialties" : specialty}
            </option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-2">
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            aria-label="Filter by rating"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
          >
            <option value="All">Any Rating</option>
            <option value="4">4.0+</option>
            <option value="4.5">4.5+</option>
          </select>

          <select
            value={availabilityFilter}
            onChange={(e) => setAvailabilityFilter(e.target.value)}
            aria-label="Filter by availability"
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
          >
            <option>All</option>
            <option>Open Now</option>
            <option>Beds Available</option>
          </select>
        </div>
      </div>

      <div className="stagger grid grid-cols-1 gap-4 md:grid-cols-2">
        {filteredHospitals.map((hospital) => (
          <button
            key={hospital.id}
            type="button"
            className="surface-card cursor-pointer p-5 text-left transition duration-300 hover:-translate-y-1 hover:border-cyan-200"
            onClick={() => navigate(`/patient-dashboard/hospitals/${hospital.id}`)}
            aria-label={`Open details for ${hospital.name}`}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-xl font-bold text-slate-900">{hospital.name}</h2>
              <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">
                {hospital.isOpen ? "Open Now" : "Currently Closed"}
              </span>
            </div>

            <p className="text-slate-600">{hospital.location}</p>

            <p className="mt-3 text-sm text-slate-700">
              Rating: <span className="font-semibold">{hospital.rating}</span> | Beds: <span className="font-semibold">{hospital.bedsAvailable}</span> | Emergency: <span className="font-semibold">{hospital.emergencyStatus}</span>
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {hospital.specialties.slice(0, 3).map((specialty) => (
                <span
                  key={specialty}
                  className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </button>
        ))}
      </div>

      {filteredHospitals.length === 0 && (
        <p className="surface-card mt-6 p-5 text-slate-600">No hospitals match the selected filters.</p>
      )}
    </div>
  );
}