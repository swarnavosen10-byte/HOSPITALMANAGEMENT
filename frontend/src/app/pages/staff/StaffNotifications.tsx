import { useMemo, useState } from "react";
import { getStaffNotifications, type AlertNotification } from "../../data";
import { getStaffHospitalId } from "../../utils/roleScope";

const severityClass: Record<AlertNotification["severity"], string> = {
  low: "bg-cyan-50 text-cyan-800",
  medium: "bg-amber-50 text-amber-800",
  high: "bg-rose-50 text-rose-700",
};

export default function StaffNotifications() {
  const hospitalId = getStaffHospitalId();
  const [filter, setFilter] = useState<"All" | AlertNotification["type"]>("All");
  const [rows, setRows] = useState(() => getStaffNotifications(hospitalId));

  const filteredRows = useMemo(
    () => rows.filter((row) => filter === "All" || row.type === filter),
    [filter, rows]
  );

  const unreadCount = rows.filter((row) => !row.isRead).length;

  const markAsRead = (id: string) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, isRead: true } : row)));
  };

  const markAllRead = () => {
    setRows((prev) => prev.map((row) => ({ ...row, isRead: true })));
  };

  return (
    <div className="page-content space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Hospital Staff</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Notifications Center</h1>
          <p className="text-slate-600">Schedule conflict alerts, doctor availability changes, reminders, and emergencies.</p>
        </div>
        <div className="rounded-xl bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-800">Unread: {unreadCount}</div>
      </div>

      <div className="surface-card flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as "All" | AlertNotification["type"])}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 md:w-72"
        >
          <option value="All">All Notifications</option>
          <option value="schedule_conflict">Schedule Conflict</option>
          <option value="doctor_unavailable">Doctor Unavailable</option>
          <option value="appointment_reminder">Appointment Reminder</option>
          <option value="emergency_alert">Emergency Alert</option>
          <option value="staff_update">Staff Update</option>
        </select>

        <button onClick={markAllRead} className="rounded-xl bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-cyan-800">Mark all as read</button>
      </div>

      <div className="space-y-3">
        {filteredRows.map((notification) => (
          <article key={notification.id} className="surface-card p-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="font-semibold text-slate-900">{notification.title}</p>
                <p className="mt-1 text-sm text-slate-600">{notification.message}</p>
                <p className="mt-2 text-xs text-slate-500">{new Date(notification.timestamp).toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${severityClass[notification.severity]}`}>
                  {notification.severity}
                </span>
                {!notification.isRead && (
                  <button onClick={() => markAsRead(notification.id)} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200">Mark read</button>
                )}
              </div>
            </div>
          </article>
        ))}

        {filteredRows.length === 0 && (
          <p className="surface-card p-4 text-sm text-slate-500">No notifications for this filter.</p>
        )}
      </div>
    </div>
  );
}
