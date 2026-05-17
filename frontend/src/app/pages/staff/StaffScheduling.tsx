import { useMemo, useRef, useState } from "react";
import {
  getDoctorSchedulesByHospital,
  getDoctorsByHospital,
  type DoctorSchedule,
  type ScheduleAvailability,
  type ShiftType,
} from "../../data";
import { getStaffHospitalId } from "../../utils/roleScope";

type ViewMode = "Daily" | "Weekly";

type ScheduleForm = {
  doctorId: number;
  date: string;
  startTime: string;
  endTime: string;
  breakTime: string;
  roomNumber: string;
  availabilityStatus: ScheduleAvailability;
  shiftType: ShiftType;
  otHours: number;
  isEmergencyDuty: boolean;
  unavailableDate: string;
  consultationMode: "Online" | "Offline" | "Hybrid";
  emergencyOverride: boolean;
};

const toMinutes = (time: string) => {
  const [hour, minute] = time.split(":").map(Number);
  return hour * 60 + minute;
};

const initialForm: ScheduleForm = {
  doctorId: 0,
  date: "",
  startTime: "09:00",
  endTime: "13:00",
  breakTime: "11:30-11:45",
  roomNumber: "",
  availabilityStatus: "Available",
  shiftType: "Morning",
  otHours: 0,
  isEmergencyDuty: false,
  unavailableDate: "",
  consultationMode: "Offline",
  emergencyOverride: false,
};

export default function StaffScheduling() {
  const hospitalId = getStaffHospitalId();
  const doctors = getDoctorsByHospital(hospitalId);

  const [viewMode, setViewMode] = useState<ViewMode>("Weekly");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ScheduleForm>({
    ...initialForm,
    doctorId: doctors[0]?.id ?? 0,
    date: selectedDate,
    roomNumber: "C-201",
  });

  const [schedules, setSchedules] = useState<DoctorSchedule[]>(getDoctorSchedulesByHospital(hospitalId));
  const [error, setError] = useState("");
  const scheduleIdCounter = useRef(900);

  const visibleSchedules = useMemo(() => {
    if (viewMode === "Daily") {
      return schedules.filter((schedule) => schedule.date === selectedDate);
    }

    const selected = new Date(selectedDate);
    const start = new Date(selected);
    start.setDate(selected.getDate() - selected.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    return schedules.filter((schedule) => {
      const current = new Date(schedule.date);
      return current >= start && current <= end;
    });
  }, [schedules, selectedDate, viewMode]);

  const hasConflict = (candidate: ScheduleForm) => {
    const candidateStart = toMinutes(candidate.startTime);
    const candidateEnd = toMinutes(candidate.endTime);

    return schedules.some((schedule) => {
      if (editId && schedule.id === editId) return false;
      if (schedule.doctorId !== candidate.doctorId || schedule.date !== candidate.date) return false;
      if (schedule.availabilityStatus === "Unavailable") return false;

      const existingStart = toMinutes(schedule.startTime);
      const existingEnd = toMinutes(schedule.endTime);
      return candidateStart < existingEnd && candidateEnd > existingStart;
    });
  };

  const resetForm = () => {
    setEditId(null);
    setError("");
    setForm({
      ...initialForm,
      doctorId: doctors[0]?.id ?? 0,
      date: selectedDate,
      roomNumber: "C-201",
    });
  };

  const upsertSchedule = () => {
    if (!form.doctorId || !form.date || !form.roomNumber) {
      setError("Doctor, date, and room number are required.");
      return;
    }

    if (toMinutes(form.startTime) >= toMinutes(form.endTime)) {
      setError("End time must be after start time.");
      return;
    }

    if (hasConflict(form) && !form.emergencyOverride) {
      setError("Conflict detected for selected doctor/time. Enable emergency override to proceed.");
      return;
    }

    const doctor = doctors.find((item) => item.id === form.doctorId);
    if (!doctor) {
      setError("Invalid doctor selected.");
      return;
    }

    const payload: DoctorSchedule = {
      id: editId ?? `SCH-${form.doctorId}-${scheduleIdCounter.current++}`,
      doctorId: form.doctorId,
      hospitalId,
      department: doctor.department,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      breakTime: form.breakTime,
      roomNumber: form.roomNumber,
      availabilityStatus: form.availabilityStatus,
      shiftType: form.shiftType,
      otHours: Number(form.otHours),
      isEmergencyDuty: form.isEmergencyDuty,
      unavailableDate: form.unavailableDate || undefined,
      consultationMode: form.consultationMode,
    };

    setSchedules((prev) => {
      if (!editId) return [payload, ...prev];
      return prev.map((schedule) => (schedule.id === editId ? payload : schedule));
    });

    resetForm();
  };

  const handleEdit = (schedule: DoctorSchedule) => {
    setEditId(schedule.id);
    setError("");
    setForm({
      doctorId: schedule.doctorId,
      date: schedule.date,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      breakTime: schedule.breakTime,
      roomNumber: schedule.roomNumber,
      availabilityStatus: schedule.availabilityStatus,
      shiftType: schedule.shiftType,
      otHours: schedule.otHours,
      isEmergencyDuty: schedule.isEmergencyDuty,
      unavailableDate: schedule.unavailableDate ?? "",
      consultationMode: schedule.consultationMode,
      emergencyOverride: false,
    });
  };

  const cancelSchedule = (scheduleId: string) => {
    setSchedules((prev) => prev.filter((schedule) => schedule.id !== scheduleId));
    if (editId === scheduleId) resetForm();
  };

  return (
    <div className="page-content space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Hospital Staff</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Doctor Scheduling</h1>
          <p className="text-slate-600">Assign shifts, breaks, emergency duty, and prevent double booking conflicts.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setViewMode("Daily")} className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${viewMode === "Daily" ? "bg-cyan-700 text-white" : "bg-cyan-50 text-cyan-800"}`}>Daily View</button>
          <button onClick={() => setViewMode("Weekly")} className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${viewMode === "Weekly" ? "bg-cyan-700 text-white" : "bg-cyan-50 text-cyan-800"}`}>Weekly View</button>
        </div>
      </div>

      <div className="surface-card space-y-4 p-4">
        <h3 className="text-lg font-bold text-slate-900">Add or Edit Schedule</h3>
        
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Doctor Name *</label>
            <select
              value={form.doctorId}
              onChange={(event) => setForm((prev) => ({ ...prev, doctorId: Number(event.target.value) }))}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full"
            >
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>{doctor.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Shift Date *</label>
            <input type="date" value={form.date} onChange={(event) => setForm((prev) => ({ ...prev, date: event.target.value }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Start Time *</label>
            <input type="time" value={form.startTime} onChange={(event) => setForm((prev) => ({ ...prev, startTime: event.target.value }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">End Time *</label>
            <input type="time" value={form.endTime} onChange={(event) => setForm((prev) => ({ ...prev, endTime: event.target.value }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Break Time</label>
            <input value={form.breakTime} onChange={(event) => setForm((prev) => ({ ...prev, breakTime: event.target.value }))} placeholder="e.g. 12:00-12:30" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full" />
            <p className="mt-1 text-xs text-slate-500">Format: HH:MM-HH:MM (start-end)</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Room/Cabin Number *</label>
            <input value={form.roomNumber} onChange={(event) => setForm((prev) => ({ ...prev, roomNumber: event.target.value }))} placeholder="e.g. C-201, F-301" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Shift Type *</label>
            <select value={form.shiftType} onChange={(event) => setForm((prev) => ({ ...prev, shiftType: event.target.value as ShiftType }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full">
              <option value="Morning">Morning</option>
              <option value="Evening">Evening</option>
              <option value="Night">Night</option>
              <option value="Split">Split</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Availability Status *</label>
            <select value={form.availabilityStatus} onChange={(event) => setForm((prev) => ({ ...prev, availabilityStatus: event.target.value as ScheduleAvailability }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full">
              <option value="Available">Available</option>
              <option value="Unavailable">Unavailable</option>
              <option value="Emergency Duty">Emergency Duty</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Consultation Mode</label>
            <select value={form.consultationMode} onChange={(event) => setForm((prev) => ({ ...prev, consultationMode: event.target.value as "Online" | "Offline" | "Hybrid" }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full">
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">OT Hours (Overtime)</label>
            <input type="number" value={form.otHours} onChange={(event) => setForm((prev) => ({ ...prev, otHours: Number(event.target.value) }))} min={0} max={8} placeholder="0" className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full" />
            <p className="mt-1 text-xs text-slate-500">Hours beyond scheduled end time</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Unavailable Date (if applicable)</label>
            <input type="date" value={form.unavailableDate} onChange={(event) => setForm((prev) => ({ ...prev, unavailableDate: event.target.value }))} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100 w-full" />
          </div>

          <div>
            <label className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-800 cursor-pointer">
              <input type="checkbox" checked={form.isEmergencyDuty} onChange={(event) => setForm((prev) => ({ ...prev, isEmergencyDuty: event.target.checked }))} className="rounded" />
              <span className="font-semibold">Mark as Emergency Duty</span>
            </label>
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-800 cursor-pointer">
            <input type="checkbox" checked={form.emergencyOverride} onChange={(event) => setForm((prev) => ({ ...prev, emergencyOverride: event.target.checked }))} className="rounded" />
            <span className="font-semibold">Emergency Override (allows double booking)</span>
          </label>
          <p className="mt-1 text-xs text-rose-600">⚠️ Enable only if doctor approved</p>
        </div>
      </div>

      {error && <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</p>}

      <div className="flex gap-2">
        <button onClick={upsertSchedule} className="rounded-xl bg-cyan-700 px-4 py-2.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-cyan-800">{editId ? "Update Schedule" : "Add Schedule"}</button>
        <button onClick={resetForm} className="rounded-xl bg-slate-100 px-4 py-2.5 font-semibold text-slate-700 transition hover:bg-slate-200">Reset</button>
      </div>

      <div className="surface-card overflow-x-auto">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
          <h2 className="text-lg font-bold text-slate-900">{viewMode} schedule timeline</h2>
          <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100" />
        </div>

        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">Doctor</th>
              <th className="px-4 py-3">Department</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Timing</th>
              <th className="px-4 py-3">Break</th>
              <th className="px-4 py-3">Room</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Shift</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleSchedules.map((schedule) => {
              const doctor = doctors.find((item) => item.id === schedule.doctorId);
              return (
                <tr key={schedule.id} className="border-t border-slate-100 transition hover:bg-slate-50/70">
                  <td className="px-4 py-3 font-semibold text-slate-900">{doctor?.name ?? `Dr. ${schedule.doctorId}`}</td>
                  <td className="px-4 py-3 text-slate-700">{schedule.department}</td>
                  <td className="px-4 py-3 text-slate-700">{schedule.date}</td>
                  <td className="px-4 py-3 text-slate-700">{schedule.startTime} - {schedule.endTime}</td>
                  <td className="px-4 py-3 text-slate-700">{schedule.breakTime}</td>
                  <td className="px-4 py-3 text-slate-700">{schedule.roomNumber}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800">{schedule.availabilityStatus}</span></td>
                  <td className="px-4 py-3 text-slate-700">{schedule.shiftType}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(schedule)} className="rounded-lg bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-800 transition hover:bg-cyan-100">Edit</button>
                      <button onClick={() => cancelSchedule(schedule.id)} className="rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-100">Cancel</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {visibleSchedules.length === 0 && (
          <p className="p-4 text-sm text-slate-500">No schedules available for this {viewMode.toLowerCase()} window.</p>
        )}
      </div>
    </div>
  );
}
