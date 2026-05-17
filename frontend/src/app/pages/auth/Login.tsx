import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { LockKeyhole, Stethoscope, ShieldCheck } from "lucide-react";
import {
  getDemoCredentials,
  getRoleHomePath,
  loginUser,
  type UserRole,
  validateDemoCredential,
} from "../../utils/auth";

export default function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 🔴 VALIDATION
    if (!username || !password) {
      setError("Username and Password required");
      return;
    }

    const authUser = validateDemoCredential(role, username, password);

    if (!authUser) {
      setError("Invalid credentials for selected role");
      return;
    }

    loginUser(authUser);
    navigate(getRoleHomePath(authUser.role));
  };

  const demoRows = getDemoCredentials();

  return (
    <div className="page-enter relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white/90 shadow-[0_30px_80px_-40px_rgba(2,23,54,0.55)] backdrop-blur-md lg:grid-cols-[1.05fr_1fr] soft-pop">
        <section className="relative hidden p-10 lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_15%,#cffafe_0%,#ecfeff_35%,#ffffff_100%)]" />
          <div className="relative z-10">
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
            <p className="mt-4 text-lg font-semibold text-slate-600">
              Secure clinical workspace for hospital teams and patients.
            </p>

            <div className="mt-10 space-y-4">
              <div className="surface-card flex items-start gap-3 p-4">
                <ShieldCheck className="mt-1 text-cyan-700" size={18} />
                <div>
                  <p className="font-semibold text-slate-900">Role based access</p>
                  <p className="text-sm text-slate-600">Separate pathways for administrators and patients.</p>
                </div>
              </div>

              <div className="surface-card flex items-start gap-3 p-4">
                <Stethoscope className="mt-1 text-cyan-700" size={18} />
                <div>
                  <p className="font-semibold text-slate-900">Hospital operations view</p>
                  <p className="text-sm text-slate-600">Appointments, billing, reports, and patient management.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="p-7 md:p-10">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-700">Welcome back</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900">Sign in to continue</h2>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <label className="block text-sm font-semibold text-slate-700">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              aria-label="Select login role"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            >
              <option value="admin">Admin</option>
              <option value="patient">Patient</option>
              <option value="hospital_staff">Hospital Staff</option>
              <option value="doctor">Doctor</option>
            </select>

            <label className="block text-sm font-semibold text-slate-700">Username</label>
            <input
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              aria-label="Username"
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
            />

            <label className="block text-sm font-semibold text-slate-700">Password</label>
            <div className="relative">
              <LockKeyhole size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-label="Password"
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
              />
            </div>

            {error && <p role="alert" aria-live="assertive" className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-600">{error}</p>}

            <button
              type="submit"
              className="w-full rounded-xl bg-cyan-700 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-cyan-800"
            >
              Login
            </button>

            <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-600">
              <p className="font-semibold text-slate-700">Demo credentials:</p>
              {demoRows.map((row) => (
                <p key={`${row.role}-${row.username}`}>
                  {row.role}: {row.username} / {row.password}
                </p>
              ))}
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}