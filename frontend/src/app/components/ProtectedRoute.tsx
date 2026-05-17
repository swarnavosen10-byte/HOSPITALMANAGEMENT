import { useState } from "react";
import { Navigate } from "react-router-dom";
import { getUser, logoutUser, loginUser, type UserRole } from "../utils/auth";
import type { JSX } from "react";
import { api } from "../services/api";
import { 
  ShieldAlert, 
  Loader2, 
  LogOut, 
  RefreshCw, 
  Clock, 
  Lock, 
  CheckCircle2 
} from "lucide-react";

export default function ProtectedRoute({
  children,
  role,
}: {
  children: JSX.Element;
  role: UserRole;
}) {
  const user = getUser();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [isApproved, setIsApproved] = useState(false);

  if (!user) {
    return <Navigate to="/" />;
  }

  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }

  // Verification Pending Hold Interceptor for Doctors
  if (user.role === "doctor" && user.verification_status === "PENDING" && !isApproved) {
    const handleRefresh = async () => {
      setIsRefreshing(true);
      setStatusMessage("");
      try {
        const res = await api.get<{
          username: string;
          verification_status: string;
          role: string;
          hospitalId?: number;
          doctorId?: number;
        }>(`/auth/status/${user.username}`);

        if (res.verification_status === "APPROVED") {
          // Update local session
          const updatedUser = {
            ...user,
            verification_status: "APPROVED",
            hospitalId: res.hospitalId ?? user.hospitalId,
            doctorId: res.doctorId ?? user.doctorId,
            activeHospitalId: res.hospitalId ?? user.hospitalId,
          };
          loginUser(updatedUser);
          setIsApproved(true);
          setStatusMessage("Verification approved! Redirecting...");
          // Trigger a quick reload after a second so routing updates
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        } else {
          setStatusMessage("Status remains: Pending Review.");
        }
      } catch (err: any) {
        setStatusMessage(err.message || "Failed to check status. Please check your internet connection.");
      } finally {
        setIsRefreshing(false);
      }
    };

    const handleSignOut = () => {
      logoutUser();
      window.location.href = "/";
    };

    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-4 py-10">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/4 h-[350px] w-[350px] -translate-x-1/2 rounded-full bg-amber-200/30 blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 h-[400px] w-[400px] translate-x-1/2 rounded-full bg-cyan-200/30 blur-[110px]" />

        <div className="relative z-10 w-full max-w-xl overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-[0_24px_70px_-30px_rgba(2,23,54,0.25)] backdrop-blur-md text-center soft-pop">
          
          {/* Security Radar Locking Icon */}
          <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 shadow-[0_12px_24px_-10px_rgba(217,119,6,0.3)]">
            <div className="absolute inset-0 rounded-2xl border-2 border-amber-500/20 animate-ping opacity-60" style={{ animationDuration: "3s" }} />
            <ShieldAlert size={40} className="relative z-10" />
          </div>

          <p className="mt-6 text-xs font-bold uppercase tracking-[0.24em] text-amber-700">Verification Gateway</p>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-900">Credentials Verification Pending</h2>
          
          <p className="mt-4 text-sm font-medium text-slate-600 leading-relaxed px-2">
            Welcome, <span className="font-bold text-slate-900">{user.displayName || `Dr. ${user.username}`}</span>. Your medical practitioner account has been registered successfully, but is currently in a <strong>Verification Hold</strong>.
          </p>

          <p className="mt-3 text-xs text-slate-500 leading-relaxed px-4">
            For institutional security and patient privacy, a hospital staff operator must confirm your medical licenses and allocate you to an active hospital department before access is granted.
          </p>

          {/* Timeline Review Status */}
          <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50/50 p-5 text-left space-y-4">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">Review Timeline</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Account Registration Complete</p>
                  <p className="text-[10px] text-slate-500">Credentials created and encrypted in cloud database.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 shrink-0">
                  <div className="h-4 w-4 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 animate-pulse">
                    <Clock size={10} />
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    Credential Review
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-amber-700 animate-pulse">In Progress</span>
                  </p>
                  <p className="text-[10px] text-slate-500">Staff verification of practitioner role status.</p>
                </div>
              </div>

              <div className="flex items-center gap-3 opacity-60">
                <Lock size={14} className="text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-slate-600">Hospital Department Allocation</p>
                  <p className="text-[10px] text-slate-400">Lock will release once staff assigns your clinical scope.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Feedback message */}
          {statusMessage && (
            <p className={`mt-5 text-xs font-bold px-3 py-2 rounded-xl transition ${
              statusMessage.includes("approved") 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                : "bg-amber-50 text-amber-700 border border-amber-100"
            }`}>
              {statusMessage}
            </p>
          )}

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRefresh}
              disabled={isRefreshing || isApproved}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 py-3 text-sm font-bold text-white shadow-lg transition hover:shadow-cyan-500/25 active:scale-95 disabled:opacity-50"
            >
              {isRefreshing ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={16} />
              )}
              Refresh Status
            </button>

            <button
              onClick={handleSignOut}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 hover:text-slate-900 active:scale-95"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>

        </div>
      </div>
    );
  }

  return children;
}