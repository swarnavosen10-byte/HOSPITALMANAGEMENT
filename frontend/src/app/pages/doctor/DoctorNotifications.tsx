import { useState } from "react";
import { getDoctorNotifications } from "../../data";
import { getDoctorScope } from "../../utils/roleScope";

export default function DoctorNotifications() {
  const { doctorId, hospitalId } = getDoctorScope();
  const [rows, setRows] = useState(() =>
    getDoctorNotifications(doctorId).filter((notification) => notification.hospitalId === hospitalId)
  );

  const markAsRead = (id: string) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, isRead: true } : row)));
  };

  return (
    <div className="page-content space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Doctor Portal</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Notifications</h1>
        <p className="text-slate-600">Track schedule conflicts, emergency alerts, new appointments, and staff updates.</p>
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <article key={row.id} className="surface-card p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-semibold text-slate-900">{row.title}</p>
                <p className="text-sm text-slate-600">{row.message}</p>
                <p className="text-xs text-slate-500">{new Date(row.timestamp).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800">{row.severity}</span>
                {!row.isRead && (
                  <button onClick={() => markAsRead(row.id)} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200">Mark read</button>
                )}
              </div>
            </div>
          </article>
        ))}

        {rows.length === 0 && <p className="surface-card p-4 text-sm text-slate-500">No notifications.</p>}
      </div>
    </div>
  );
}
