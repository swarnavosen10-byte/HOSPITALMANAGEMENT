import { useMemo, useRef, useState } from "react";
import { getDoctorSchedulesByDoctor, type DoctorSchedule } from "../../data";
import { getDoctorScope } from "../../utils/roleScope";

type ModeFilter = "All" | "Online" | "Offline" | "Hybrid";

export default function DoctorSchedule() {
  const { doctorId, hospitalId } = getDoctorScope();
  const [modeFilter, setModeFilter] = useState<ModeFilter>("All");
  const [rows, setRows] = useState<DoctorSchedule[]>(
    getDoctorSchedulesByDoctor(doctorId).filter((schedule) => schedule.hospitalId === hospitalId)
  );
  const [leaveDate, setLeaveDate] = useState("");
  const scheduleIdCounter = useRef(900);

  const addMinutesToTime = (time: string, minutesToAdd: number) => {
    const [h, m] = time.split(":").map(Number);
    const total = h * 60 + m + minutesToAdd;
    const bounded = Math.max(0, Math.min(23 * 60 + 59, total));
    const nh = Math.floor(bounded / 60)
      .toString()
      .padStart(2, "0");
    const nm = (bounded % 60).toString().padStart(2, "0");
    return `${nh}:${nm}`;
  };

  const handleExtend = (id: string, minutes: number | "custom") => {
    let mins = 0;
    if (minutes === "custom") {
      const raw = window.prompt("Enter minutes to extend (e.g. 15, 30, 60):");
      if (!raw) return;
      const parsed = Number(raw.trim());
      if (Number.isNaN(parsed) || parsed <= 0) return;
      mins = Math.floor(parsed);
    } else {
      mins = minutes;
    }

    const current = rows.find((r) => r.id === id);
    if (!current) return;
    const newEnd = addMinutesToTime(current.endTime, mins);
    const extraHours = +(mins / 60).toFixed(2);
    updateSchedule(id, { endTime: newEnd, otHours: +(current.otHours + extraHours).toFixed(2) });
  };

  const filteredRows = useMemo(
    () => rows.filter((row) => modeFilter === "All" || row.consultationMode === modeFilter),
    [modeFilter, rows]
  );

  const updateSchedule = (id: string, patch: Partial<DoctorSchedule>) => {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const requestLeave = () => {
    if (!leaveDate) return;

    setRows((prev) => [
      {
        id: `LEAVE-${scheduleIdCounter.current++}`,
        doctorId,
        hospitalId,
        department: prev[0]?.department ?? "General Medicine",
        date: leaveDate,
        startTime: "00:00",
        endTime: "23:59",
        breakTime: "N/A",
        roomNumber: "N/A",
        availabilityStatus: "Unavailable",
        shiftType: "Morning",
        otHours: 0,
        isEmergencyDuty: false,
        unavailableDate: leaveDate,
        consultationMode: "Offline",
      },
      ...prev,
    ]);

    setLeaveDate("");
  };

  return (
    <div className="page-content space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Doctor Portal</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-900">My Schedule</h1>
        <p className="text-slate-600">Edit consultation slots, request leave, swap shifts, and manage availability.</p>
      </div>

      <div className="surface-card grid grid-cols-1 gap-3 p-4 md:grid-cols-4">
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Filter by Mode</label>
          <select
            value={modeFilter}
            onChange={(event) => setModeFilter(event.target.value as ModeFilter)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full"
          >
            <option value="All">All Consultation Modes</option>
            <option value="Online">Online</option>
            <option value="Offline">Offline</option>
            <option value="Hybrid">Hybrid</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">Request Leave Date</label>
          <input
            type="date"
            value={leaveDate}
            onChange={(event) => setLeaveDate(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full"
          />
        </div>
        <button 
          onClick={requestLeave}
          disabled={!leaveDate}
          className="rounded-xl bg-cyan-700 px-4 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-cyan-800 disabled:bg-slate-300 disabled:cursor-not-allowed h-fit"
          title={leaveDate ? "Click to request leave for this date" : "Select a date first"}
        >
          {leaveDate ? "Request Leave" : "Select Date"}
        </button>
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">Select a date above, then use table actions to edit shifts, extend time, or mark emergency duty.</div>
      </div>

      <div className="surface-card overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Time</th>
              <th className="px-4 py-3">Shift</th>
              <th className="px-4 py-3">Room</th>
              <th className="px-4 py-3">Consultation</th>
              <th className="px-4 py-3">Availability</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.id} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                <td className="px-4 py-3 text-slate-700">{row.date}</td>
                <td className="px-4 py-3 text-slate-700">{row.startTime} - {row.endTime}</td>
                <td className="px-4 py-3 text-slate-700">{row.shiftType}</td>
                <td className="px-4 py-3 text-slate-700">{row.roomNumber}</td>
                <td className="px-4 py-3 text-slate-700">{row.consultationMode}</td>
                <td className="px-4 py-3"><span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800">{row.availabilityStatus}</span></td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => updateSchedule(row.id, { consultationMode: "Online" })} className="rounded-lg bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800 transition hover:bg-cyan-100">Online</button>
                    <button onClick={() => updateSchedule(row.id, { consultationMode: "Offline" })} className="rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-200">Offline</button>
                    <button onClick={() => updateSchedule(row.id, { isEmergencyDuty: !row.isEmergencyDuty, availabilityStatus: row.isEmergencyDuty ? "Available" : "Emergency Duty" })} className="rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 transition hover:bg-amber-100">Emergency Duty</button>
                    <select defaultValue="" onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      if (val === 'custom') handleExtend(row.id, 'custom');
                      else handleExtend(row.id, Number(val));
                      e.currentTarget.value = '';
                    }} className="rounded-lg border border-slate-100 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100">
                      <option value="">Extend Time</option>
                      <option value="15">+15m</option>
                      <option value="30">+30m</option>
                      <option value="60">+60m</option>
                      <option value="custom">Custom...</option>
                    </select>
                    <button onClick={() => updateSchedule(row.id, { shiftType: row.shiftType === "Morning" ? "Evening" : "Morning" })} className="rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100">Swap Shift</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredRows.length === 0 && <p className="p-4 text-sm text-slate-500">No schedule entries for selected filter.</p>}
      </div>
    </div>
  );
}
