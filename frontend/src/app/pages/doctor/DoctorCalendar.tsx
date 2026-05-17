import { useMemo, useState } from "react";
import { getAppointmentsByDoctor, getDoctorSchedulesByDoctor } from "../../data";
import { getDoctorScope } from "../../utils/roleScope";

type CalendarView = "Daily" | "Weekly";

export default function DoctorCalendar() {
  const { doctorId, hospitalId } = getDoctorScope();
  const [view, setView] = useState<CalendarView>("Weekly");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const schedules = getDoctorSchedulesByDoctor(doctorId).filter((schedule) => schedule.hospitalId === hospitalId);
  const appointments = getAppointmentsByDoctor(doctorId).filter((appointment) => appointment.hospitalId === hospitalId);

  const timeline = useMemo(() => {
    if (view === "Daily") {
      return schedules
        .filter((schedule) => schedule.date === date)
        .map((schedule) => ({
          id: schedule.id,
          date: schedule.date,
          time: `${schedule.startTime}-${schedule.endTime}`,
          title: `${schedule.shiftType} Shift (${schedule.consultationMode})`,
          detail: `Room ${schedule.roomNumber} • ${schedule.availabilityStatus}`,
        }));
    }

    const selected = new Date(date);
    const start = new Date(selected);
    start.setDate(selected.getDate() - selected.getDay());
    const end = new Date(start);
    end.setDate(start.getDate() + 6);

    const scheduleRows = schedules
      .filter((schedule) => {
        const current = new Date(schedule.date);
        return current >= start && current <= end;
      })
      .map((schedule) => ({
        id: schedule.id,
        date: schedule.date,
        time: `${schedule.startTime}-${schedule.endTime}`,
        title: `${schedule.shiftType} Shift (${schedule.consultationMode})`,
        detail: `Room ${schedule.roomNumber} • ${schedule.availabilityStatus}`,
      }));

    const appointmentRows = appointments
      .filter((appointment) => {
        const current = new Date(appointment.date);
        return current >= start && current <= end;
      })
      .map((appointment) => ({
        id: appointment.id,
        date: appointment.date,
        time: appointment.time,
        title: `${appointment.type} (${appointment.mode})`,
        detail: `${appointment.status} • ${appointment.notes}`,
      }));

    return [...scheduleRows, ...appointmentRows].sort((a, b) => `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`));
  }, [appointments, date, schedules, view]);

  return (
    <div className="page-content space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Doctor Portal</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">Calendar View</h1>
          <p className="text-slate-600">Switch between daily and weekly timelines for schedules and appointments.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView("Daily")} className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${view === "Daily" ? "bg-cyan-700 text-white" : "bg-cyan-50 text-cyan-800"}`}>Daily</button>
          <button onClick={() => setView("Weekly")} className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${view === "Weekly" ? "bg-cyan-700 text-white" : "bg-cyan-50 text-cyan-800"}`}>Weekly</button>
        </div>
      </div>

      <div className="surface-card p-4">
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100" />
      </div>

      <div className="surface-card p-5">
        <h2 className="mb-4 text-lg font-bold text-slate-900">{view} timeline</h2>
        <div className="space-y-3">
          {timeline.map((item) => (
            <article key={item.id} className="rounded-xl border border-slate-100 bg-white p-4">
              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="text-xs text-slate-500">{item.detail}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-cyan-700">{item.date}</p>
                  <p className="text-xs text-slate-500">{item.time}</p>
                </div>
              </div>
            </article>
          ))}
          {timeline.length === 0 && <p className="text-sm text-slate-500">No calendar entries for selected window.</p>}
        </div>
      </div>
    </div>
  );
}
