import { useState } from "react";
import { getHospitalById } from "../../data";
import { getStaffHospitalId } from "../../utils/roleScope";

export default function StaffSettings() {
  const hospitalId = getStaffHospitalId();
  const hospital = getHospitalById(hospitalId);

  const [form, setForm] = useState({
    reminderLeadMinutes: "30",
    conflictChecks: true,
    autoApproveFollowUps: false,
    emergencyBroadcast: true,
    shiftSwapApproval: true,
  });

  const [saved, setSaved] = useState(false);

  const saveSettings = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="page-content space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Hospital Staff</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Operational Settings</h1>
        <p className="text-slate-600">Configure alerts, approvals, and scheduling rules for {hospital?.name}.</p>
      </div>

      <div className="surface-card grid grid-cols-1 gap-4 p-5">
        <label className="text-sm font-semibold text-slate-700">Reminder lead time (minutes)</label>
        <select
          value={form.reminderLeadMinutes}
          onChange={(event) => setForm((prev) => ({ ...prev, reminderLeadMinutes: event.target.value }))}
          className="max-w-sm rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
        >
          <option value="15">15</option>
          <option value="30">30</option>
          <option value="45">45</option>
          <option value="60">60</option>
        </select>

        <label className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.conflictChecks}
            onChange={(event) => setForm((prev) => ({ ...prev, conflictChecks: event.target.checked }))}
          />
          Enable automatic schedule conflict checks
        </label>

        <label className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.autoApproveFollowUps}
            onChange={(event) => setForm((prev) => ({ ...prev, autoApproveFollowUps: event.target.checked }))}
          />
          Auto-approve follow-up appointments
        </label>

        <label className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.emergencyBroadcast}
            onChange={(event) => setForm((prev) => ({ ...prev, emergencyBroadcast: event.target.checked }))}
          />
          Broadcast emergency alerts to all on-duty doctors
        </label>

        <label className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={form.shiftSwapApproval}
            onChange={(event) => setForm((prev) => ({ ...prev, shiftSwapApproval: event.target.checked }))}
          />
          Require staff approval for shift swaps
        </label>

        <div className="flex items-center gap-3">
          <button onClick={saveSettings} className="rounded-xl bg-cyan-700 px-4 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-cyan-800">Save Settings</button>
          {saved && <span className="text-sm font-semibold text-emerald-700">Settings saved.</span>}
        </div>
      </div>
    </div>
  );
}
