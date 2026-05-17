import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { 
  LockKeyhole, 
  Stethoscope, 
  ShieldCheck, 
  User, 
  ArrowRight, 
  Hospital, 
  AlertCircle, 
  CheckCircle2,
  Lock,
  UserPlus,
  Mail,
  Phone
} from "lucide-react";
import {
  getDemoCredentials,
  getRoleHomePath,
  loginUser,
  registerUser,
  type UserRole,
  validateDemoCredential,
} from "../../utils/auth";
import { hospitals } from "../../data";

export default function Login() {
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  
  // Login State
  const [role, setRole] = useState<UserRole>("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Register State
  const [regName, setRegName] = useState("");
  const [regRole, setRegRole] = useState<UserRole>("patient");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regHospitalId, setRegHospitalId] = useState<number>(hospitals[0]?.id ?? 1);

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!username || !password) {
      setError("Username and Password are required");
      return;
    }

    const authUser = validateDemoCredential(role, username, password);

    if (!authUser) {
      setError("Invalid credentials for the selected role");
      return;
    }

    loginUser(authUser);
    navigate(getRoleHomePath(authUser.role));
  };

  const handleRegister = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!regName || !regUsername || !regPassword) {
      setError("All fields are required to create an account");
      return;
    }

    if (regUsername.includes(" ")) {
      setError("Username cannot contain spaces");
      return;
    }

    // Determine optional mappings based on role
    const hospitalId = (regRole === "hospital_staff" || regRole === "doctor") ? regHospitalId : undefined;
    const doctorId = regRole === "doctor" ? Math.floor(100 + Math.random() * 900) : undefined; // Mock doctor ID

    const res = registerUser(
      regRole,
      regUsername,
      regPassword,
      regName,
      hospitalId,
      doctorId,
      regEmail || undefined,
      regPhone || undefined
    );

    if (!res.success) {
      setError(res.message);
      return;
    }

    // Setup sign in details automatically
    setRole(regRole);
    setUsername(regUsername);
    setPassword(regPassword);
    setSuccess("Account created successfully! Please sign in below.");
    
    // Reset register form
    setRegName("");
    setRegUsername("");
    setRegPassword("");
    setRegEmail("");
    setRegPhone("");
    
    // Switch back to Login view
    setIsRegister(false);
  };

  const demoRows = getDemoCredentials();

  return (
    <div className="page-enter relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      {/* Dynamic Ambient Background Glows */}
      <div className="absolute top-1/4 left-1/4 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-cyan-200/30 blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 h-[450px] w-[450px] translate-x-1/2 rounded-full bg-blue-200/30 blur-[130px]" />

      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white/90 shadow-[0_30px_80px_-40px_rgba(2,23,54,0.3)] backdrop-blur-md lg:grid-cols-[1.05fr_1fr] soft-pop relative z-10">
        
        {/* Left Side Branding Area */}
        <section className="relative hidden p-10 lg:block overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,#cffafe_0%,#ecfeff_35%,#ffffff_100%)]" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-700/80">Medisync Suite</p>
              
              <div className="mt-8 flex items-center gap-4">
                <div className="h-16 w-16 rounded-2xl border border-cyan-100 bg-white/80 p-3 shadow-[0_12px_30px_-18px_rgba(14,116,144,0.55)]">
                  <div className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 text-xl font-black text-white">
                    M
                  </div>
                </div>
                <div>
                  <p className="text-3xl font-black tracking-tight text-slate-900">Medisync</p>
                  <p className="text-sm font-semibold text-slate-500">Hospital intelligence platform</p>
                </div>
              </div>
              
              <p className="mt-6 text-lg font-semibold text-slate-600 leading-relaxed">
                Secure workspace designed to unify hospital operators, doctors, staff, and patients.
              </p>

              <div className="mt-10 space-y-4">
                <div className="surface-card flex items-start gap-4 p-4 border border-cyan-50/50 bg-white/60">
                  <div className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Role-Based Access Control</p>
                    <p className="text-sm text-slate-600 mt-0.5">Custom administrative routing tailored specifically to your department or medical role.</p>
                  </div>
                </div>

                <div className="surface-card flex items-start gap-4 p-4 border border-cyan-50/50 bg-white/60">
                  <div className="rounded-lg bg-cyan-50 p-2 text-cyan-700">
                    <Stethoscope size={20} />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Full Clinic telemetry</p>
                    <p className="text-sm text-slate-600 mt-0.5">Manage patients, doctors, appointments, live beds, and billing in one dashboard.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t pt-6 text-xs text-slate-400 font-medium">
              © {new Date().getFullYear()} Medisync Network. All rights reserved.
            </div>
          </div>
        </section>

        {/* Right Side Interactive Form Area */}
        <section className="p-7 md:p-10 flex flex-col justify-center">
          
          {/* Sign In vs Create Account Toggle Headers */}
          <div className="mb-8">
            <div className="flex border-b border-slate-100 pb-2 mb-6">
              <button
                onClick={() => { setIsRegister(false); setError(""); }}
                className={`flex-1 pb-3 text-sm font-bold tracking-tight border-b-2 transition ${!isRegister ? 'border-cyan-600 text-cyan-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsRegister(true); setError(""); }}
                className={`flex-1 pb-3 text-sm font-bold tracking-tight border-b-2 transition ${isRegister ? 'border-cyan-600 text-cyan-700' : 'border-transparent text-slate-400 hover:text-slate-600'}`}
              >
                Create Account
              </button>
            </div>

            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-700">
              {isRegister ? "Join the network" : "Welcome back"}
            </p>
            <h2 className="mt-2 text-2xl font-black text-slate-950">
              {isRegister ? "Create a credentials profile" : "Sign in to your clinical desk"}
            </h2>
          </div>

          {/* Success / Error Alerts */}
          {success && (
            <div className="mb-4 flex items-start gap-2.5 rounded-xl bg-emerald-50 border border-emerald-100 p-3 text-sm font-medium text-emerald-800 animate-fadeIn">
              <CheckCircle2 className="mt-0.5 text-emerald-600 shrink-0" size={16} />
              <p>{success}</p>
            </div>
          )}

          {error && (
            <div role="alert" aria-live="assertive" className="mb-4 flex items-start gap-2.5 rounded-xl bg-rose-50 border border-rose-100 p-3 text-sm font-medium text-rose-800 animate-fadeIn">
              <AlertCircle className="mt-0.5 text-rose-600 shrink-0" size={16} />
              <p>{error}</p>
            </div>
          )}

          {/* ================== SIGN IN FORM ================== */}
          {!isRegister ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Role Domain</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  aria-label="Select login role"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-50/50 hover:border-slate-300"
                >
                  <option value="admin">Admin Panel</option>
                  <option value="patient">Patient Dashboard</option>
                  <option value="hospital_staff">Hospital Staff Desk</option>
                  <option value="doctor">Doctor Clinic Portal</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Username</label>
                <div className="relative">
                  <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    aria-label="Username"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-50/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Password</label>
                <div className="relative">
                  <LockKeyhole size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    aria-label="Password"
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-50/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 py-3 font-semibold text-white transition hover:-translate-y-0.5 shadow-lg shadow-cyan-900/10"
              >
                <span>Access Clinical Workspace</span>
                <ArrowRight size={16} />
              </button>

              {/* Demo Credentials Drawer */}
              <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 mt-6">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  <Lock size={12} className="text-cyan-700" />
                  <span>Interactive Quick Access Credentials:</span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600 max-h-36 overflow-y-auto pr-1">
                  {demoRows.map((row) => (
                    <div 
                      key={`${row.role}-${row.username}`}
                      onClick={() => {
                        setRole(row.role);
                        setUsername(row.username);
                        setPassword(row.password);
                      }}
                      className="cursor-pointer hover:bg-white p-1.5 rounded-lg border border-transparent hover:border-slate-200 transition font-medium"
                    >
                      <span className="capitalize font-bold text-cyan-800">{row.role}</span>: <span className="font-mono text-slate-900">{row.username}</span>
                    </div>
                  ))}
                </div>
              </div>
            </form>
          ) : (
            
            // ================== CREATE ACCOUNT (REGISTER) FORM ==================
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Full Name</label>
                <div className="relative">
                  <User size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-50/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Phone Number</label>
                  <div className="relative">
                    <Phone size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-50/50"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Register As</label>
                  <select
                    value={regRole}
                    onChange={(e) => setRegRole(e.target.value as UserRole)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-50/50 hover:border-slate-300"
                  >
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="hospital_staff">Staff</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Username</label>
                  <input
                    type="text"
                    placeholder="johndoe"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-50/50"
                  />
                </div>
              </div>

              {/* Conditional Hospital Select Input (Only shown if Staff/Doctor selected) */}
              {(regRole === "hospital_staff" || regRole === "doctor") && (
                <div className="animate-fadeIn">
                  <label className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                    <Hospital size={13} className="text-cyan-700" />
                    <span>Assign Clinic/Hospital Branch</span>
                  </label>
                  <select
                    value={regHospitalId}
                    onChange={(e) => setRegHospitalId(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-50/50"
                  >
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.name} ({h.location || "Kolkata"})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Secure Password</label>
                <div className="relative">
                  <LockKeyhole size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    placeholder="Create password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-50/50"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 py-3 font-semibold text-white transition hover:-translate-y-0.5 shadow-lg shadow-cyan-900/10 mt-6"
              >
                <UserPlus size={16} />
                <span>Create Registered Account</span>
              </button>

              <p className="text-center text-xs text-slate-500 font-medium pt-2">
                By registering, your account is immediately cached inside the client database for quick mock logins.
              </p>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}