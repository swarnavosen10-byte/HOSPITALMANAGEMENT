import { useState } from "react";

export default function DoctorSettings() {
  const [settings, setSettings] = useState({
    autoApproveFollowUp: false,
    emergencyPushAlert: true,
    onlineConsultationDefault: true,
    consultationBufferMinutes: "10",
  });

  const [saved, setSaved] = useState(false);

  const save = () => {
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="page-content space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Doctor Portal</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Doctor Settings</h1>
        <p className="text-slate-600">Manage consultation defaults, emergency alerts, and schedule preferences.</p>
      </div>

      <div className="surface-card space-y-3 p-5">
        <label className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={settings.autoApproveFollowUp}
            onChange={(event) => setSettings((prev) => ({ ...prev, autoApproveFollowUp: event.target.checked }))}
          />
          Auto-approve follow-up requests
        </label>

        <label className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={settings.emergencyPushAlert}
            onChange={(event) => setSettings((prev) => ({ ...prev, emergencyPushAlert: event.target.checked }))}
          />
          Receive emergency push alerts
        </label>

        <label className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={settings.onlineConsultationDefault}
            onChange={(event) => setSettings((prev) => ({ ...prev, onlineConsultationDefault: event.target.checked }))}
          />
          Default to online consultation for new slots
        </label>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Consultation buffer (minutes)</label>
          <select
            value={settings.consultationBufferMinutes}
            onChange={(event) => setSettings((prev) => ({ ...prev, consultationBufferMinutes: event.target.value }))}
            className="max-w-xs rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="15">15</option>
            <option value="20">20</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={save} className="rounded-xl bg-cyan-700 px-4 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-cyan-800">Save Settings</button>
          {saved && <span className="text-sm font-semibold text-emerald-700">Saved successfully.</span>}
        </div>
      </div>
    </div>
  );
}
