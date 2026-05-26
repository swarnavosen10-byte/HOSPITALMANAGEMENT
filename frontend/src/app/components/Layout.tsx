import { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, LogOut, Search, ShieldCheck, UserRound } from "lucide-react";
import { getUser, logoutUser, updateLoggedInUser } from "../utils/auth";
import { hospitals, doctors, adminPatients, appointments } from "../data";
import { getCurrentHospitalId } from "../utils/roleScope";

type SearchResult = {
  id: string;
  type: "appointment" | "doctor" | "patient" | "hospital";
  title: string;
  subtitle: string;
};

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(getUser());
  const activeHospitalId = getCurrentHospitalId();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const showGlobalSearch = location.pathname.startsWith("/admin") && location.pathname !== "/admin/patients";
  const roleLabel =
    user?.role === "admin"
      ? "Administrator"
      : user?.role === "patient"
        ? "Patient Portal"
        : user?.role === "hospital_staff"
          ? "Hospital Staff"
          : "Doctor Portal";

  const links = useMemo(() => {
    if (user?.role === "admin") {
      return [
        { to: "/admin", label: "Dashboard", end: true },
        { to: "patients", label: "Patients" },
        { to: "doctors", label: "Doctors" },
        { to: "appointments", label: "Appointments" },
        { to: "billing", label: "Billing" },
        { to: "reports", label: "Reports" },
        { to: "settings", label: "Settings" },
      ];
    }

    if (user?.role === "hospital_staff") {
      return [
        { to: "/staff-dashboard", label: "Dashboard", end: true },
        { to: "patients", label: "Patients" },
        { to: "doctors", label: "Doctors" },
        { to: "appointments", label: "Appointments" },
        { to: "scheduling", label: "Scheduling" },
        { to: "reports", label: "Reports" },
        { to: "notifications", label: "Notifications" },
        { to: "settings", label: "Settings" },
      ];
    }

    if (user?.role === "doctor") {
      return [
        { to: "/doctor-dashboard", label: "Dashboard", end: true },
        { to: "my-schedule", label: "My Schedule" },
        { to: "queue", label: "Patient Queue" },
        { to: "appointments", label: "Appointments" },
        { to: "patients", label: "Patients" },
        { to: "prescriptions", label: "Prescriptions" },
        { to: "calendar", label: "Calendar" },
        { to: "notifications", label: "Notifications" },
        { to: "settings", label: "Settings" },
      ];
    }

    return [
      { to: "/patient-dashboard", label: "Dashboard", end: true },
      { to: "hospital-map", label: "Hospital Map" },
      { to: "my-appointments", label: "My Appointments" },
      { to: "prescriptions", label: "My Prescriptions" },
    ];
  }, [user?.role]);

  const activeHospital = hospitals.find((hospital) => hospital.id === activeHospitalId) ?? null;
  const accessibleHospitals =
    user?.role === "doctor"
      ? hospitals.filter((hospital) => user.hospitalIds?.includes(hospital.id) || user.hospitalId === hospital.id)
      : user?.role === "hospital_staff"
        ? hospitals.filter((hospital) => hospital.id === (user.hospitalId ?? activeHospitalId))
        : [];

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `group flex items-center px-4 py-3 rounded-xl transition-all duration-300
    ${
      isActive
        ? "bg-cyan-50 text-cyan-800 font-semibold shadow-sm border border-cyan-100"
        : "text-slate-600 hover:bg-slate-100/85 hover:text-slate-900"
    }`;

  const searchResults = useMemo((): SearchResult[] => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    const results: SearchResult[] = [];

    // Search appointments
    appointments.forEach((apt) => {
      const patient = adminPatients.find((p) => p.id === apt.patientId);
      const doctor = doctors.find((d) => d.id === apt.doctorId);
      const hospital = hospitals.find((h) => h.id === apt.hospitalId);

      if (
        apt.id.toLowerCase().includes(query) ||
        patient?.name.toLowerCase().includes(query) ||
        doctor?.name.toLowerCase().includes(query) ||
        hospital?.name.toLowerCase().includes(query)
      ) {
        results.push({
          id: apt.id,
          type: "appointment",
          title: `Appointment ${apt.id}`,
          subtitle: `${patient?.name} • ${doctor?.name} • ${hospital?.name}`,
        });
      }
    });

    // Search doctors
    doctors.forEach((doctor) => {
      if (
        doctor.name.toLowerCase().includes(query) ||
        doctor.email.toLowerCase().includes(query) ||
        doctor.department.toLowerCase().includes(query)
      ) {
        results.push({
          id: String(doctor.id),
          type: "doctor",
          title: doctor.name,
          subtitle: `${doctor.department} • ${doctor.email}`,
        });
      }
    });

    // Search patients
    adminPatients.forEach((patient) => {
      if (
        patient.name.toLowerCase().includes(query) ||
        patient.id.toLowerCase().includes(query) ||
        patient.diagnosis.toLowerCase().includes(query)
      ) {
        results.push({
          id: patient.id,
          type: "patient",
          title: patient.name,
          subtitle: `${patient.id} • ${patient.diagnosis}`,
        });
      }
    });

    // Search hospitals
    hospitals.forEach((hospital) => {
      if (
        hospital.name.toLowerCase().includes(query) ||
        hospital.location.toLowerCase().includes(query)
      ) {
        results.push({
          id: String(hospital.id),
          type: "hospital",
          title: hospital.name,
          subtitle: `${hospital.location} • ${hospital.bedsAvailable} beds available`,
        });
      }
    });

    return results.slice(0, 8);
  }, [searchQuery]);

  const handleLogout = () => {
    logoutUser();
    setUser(null);
    navigate("/");
  };

  const handleHospitalChange = (hospitalId: number) => {
    updateLoggedInUser({ activeHospitalId: hospitalId, hospitalId });
    setUser(getUser());
    setIsSidebarOpen(false);
  };

  return (
    <div className="page-shell min-h-screen lg:flex">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      {isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-20 bg-slate-900/35 lg:hidden"
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-72 border-r border-cyan-100/80 bg-white/90 p-5 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-8 flex items-center justify-between px-1">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700/80">
              Hospital Suite
            </p>
            <p className="text-2xl font-extrabold text-slate-900">Medisync</p>
          </div>

          <button
            onClick={() => setIsSidebarOpen(false)}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Collapse sidebar"
          >
            <X size={20} />
          </button>
        </div>

        <div className="surface-card mb-6 px-4 py-3 text-sm text-slate-600 soft-pop">
          <p className="mb-1 flex items-center gap-2 font-semibold text-slate-900">
            {user?.role === "admin" ? <ShieldCheck size={16} /> : <UserRound size={16} />}
            {roleLabel}
          </p>
          <p>Role based workspace with live workflow navigation.</p>
        </div>

        <nav className="stagger space-y-2" aria-label="Primary navigation">
          {links.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              end={link.end}
              className={linkClass}
              onClick={() => setIsSidebarOpen(false)}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="sticky top-0 z-10 p-3 md:p-5">
          <div className="glass-topbar mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-2xl px-3 py-3 md:px-5">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="rounded-xl border border-slate-200 p-2 text-slate-700 lg:hidden"
                aria-label="Open sidebar"
              >
                <Menu size={18} />
              </button>

            {showGlobalSearch && (
              <div className="relative hidden md:block">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  placeholder="Search appointments, doctors, reports"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchResults(e.target.value.length > 0);
                  }}
                  onFocus={() => searchQuery.length > 0 && setShowSearchResults(true)}
                  aria-label="Search appointments, doctors, and reports"
                  className="w-[370px] rounded-xl border border-slate-200 bg-white/80 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                />

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <>
                    <button
                      onClick={() => setShowSearchResults(false)}
                      className="fixed inset-0 z-10"
                      aria-label="Close search results"
                    />
                    <div className="absolute top-full left-0 z-20 mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white/95 shadow-lg backdrop-blur-sm">
                      {searchResults.map((result) => (
                        <button
                          key={`${result.type}-${result.id}`}
                          onClick={() => {
                            setSearchQuery("");
                            setShowSearchResults(false);
                            if (result.type === "appointment") navigate("/admin/appointments");
                            if (result.type === "doctor") navigate("/admin/doctors");
                            if (result.type === "patient") navigate("/admin/patients");
                            if (result.type === "hospital") navigate("/admin");
                          }}
                          className="w-full border-b border-slate-100 px-4 py-2.5 text-left transition hover:bg-cyan-50/50 focus-visible:bg-cyan-50/50 last:border-b-0"
                        >
                          <p className="text-sm font-semibold text-slate-900">{result.title}</p>
                          <p className="text-xs text-slate-500">{result.subtitle}</p>
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {/* No Results Message */}
                {showSearchResults && searchQuery.length > 0 && searchResults.length === 0 && (
                  <>
                    <button
                      onClick={() => setShowSearchResults(false)}
                      className="fixed inset-0 z-10"
                      aria-label="Close search results"
                    />
                    <div className="absolute top-full left-0 z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white/95 p-4 text-center shadow-lg backdrop-blur-sm">
                      <p className="text-sm text-slate-500">No results found for "{searchQuery}"</p>
                    </div>
                  </>
                )}
              </div>
            )}
            </div>

            <div className="flex items-center gap-3">
              {user?.role === "doctor" && accessibleHospitals.length > 1 && (
                <select
                  value={activeHospitalId}
                  onChange={(event) => handleHospitalChange(Number(event.target.value))}
                  className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 md:block"
                  aria-label="Select active hospital"
                >
                  {accessibleHospitals.map((hospital) => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name.replace(" Hospital Kolkata", "")}
                    </option>
                  ))}
                </select>
              )}

              {(user?.role === "hospital_staff" || user?.role === "doctor") && activeHospital && (
                <div className="hidden rounded-xl bg-cyan-50 px-3 py-2 text-right md:block">
                  <p className="text-xs text-slate-500">Active hospital</p>
                  <p className="text-sm font-semibold text-slate-800">{activeHospital.name.replace(" Hospital Kolkata", "")}</p>
                </div>
              )}

              <div className="hidden rounded-xl bg-cyan-50 px-3 py-2 text-right md:block">
                <p className="text-xs text-slate-500">Signed in as</p>
                <p className="text-sm font-semibold text-slate-800">{user?.displayName ?? user?.username}</p>
              </div>

              <button
                onClick={handleLogout}
                aria-label="Log out"
                className="inline-flex items-center gap-2 rounded-xl bg-rose-500 px-3 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-rose-600"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </header>

        <main id="main-content" className="fade-up px-3 pb-8 md:px-5" tabIndex={-1}>
          <div key={`${user?.role ?? "guest"}-${activeHospitalId}-${location.pathname}`} className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}