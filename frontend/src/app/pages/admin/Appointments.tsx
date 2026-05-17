import { useMemo, useState } from "react";
import { adminPatients, doctors, hospitals } from "../../data";

type AppointmentStatus = "Scheduled" | "In Progress" | "Completed" | "Cancelled";
type VisitType = "Consultation" | "Follow-up" | "Procedure" | "Diagnostic";
type VisitMode = "In-person" | "Teleconsult";

type AppointmentRecord = {
  id: string;
  patientId: string;
  doctorId: number;
  hospitalId: number;
  date: string;
  time: string;
  type: VisitType;
  mode: VisitMode;
  status: AppointmentStatus;
  notes: string;
};

const initialAppointments: AppointmentRecord[] = [
  {
    id: "APT-001",
    patientId: "P004",
    doctorId: 101,
    hospitalId: 1,
    date: "2026-04-28",
    time: "09:30",
    type: "Follow-up",
    mode: "In-person",
    status: "Scheduled",
    notes: "BP and medication review",
  },
  {
    id: "APT-002",
    patientId: "P002",
    doctorId: 105,
    hospitalId: 2,
    date: "2026-04-27",
    time: "14:00",
    type: "Consultation",
    mode: "In-person",
    status: "In Progress",
    notes: "Diabetes care plan update",
  },
  {
    id: "APT-003",
    patientId: "P010",
    doctorId: 115,
    hospitalId: 6,
    date: "2026-04-26",
    time: "11:15",
    type: "Diagnostic",
    mode: "Teleconsult",
    status: "Completed",
    notes: "Neuro follow-up and reports",
  },
  {
    id: "APT-004",
    patientId: "P009",
    doctorId: 113,
    hospitalId: 5,
    date: "2026-04-29",
    time: "16:10",
    type: "Procedure",
    mode: "In-person",
    status: "Scheduled",
    notes: "ENT minor procedure",
  },
];

const statusStyle = (status: AppointmentStatus) => {
  if (status === "Scheduled") return "bg-blue-100 text-blue-700";
  if (status === "In Progress") return "bg-amber-100 text-amber-700";
  if (status === "Completed") return "bg-emerald-100 text-emerald-700";
  if (status === "Cancelled") return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-700";
};

const formatTime = (time24: string) => {
  const [hoursRaw, minutesRaw] = time24.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return time24;

  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;
  return `${String(hour12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${suffix}`;
};

const createDefaultForm = (): AppointmentRecord => {
  const firstHospitalId = hospitals[0]?.id ?? 1;
  const firstDoctorId = doctors.find((doctor) => doctor.hospitalId === firstHospitalId)?.id ?? doctors[0]?.id ?? 101;
  const firstPatientId =
    adminPatients.find((patient) => patient.hospitalId === firstHospitalId)?.id ??
    adminPatients[0]?.id ??
    "P001";

  return {
    id: "",
    patientId: firstPatientId,
    doctorId: firstDoctorId,
    hospitalId: firstHospitalId,
    date: "",
    time: "",
    type: "Consultation",
    mode: "In-person",
    status: "Scheduled",
    notes: "",
  };
};

export default function Appointments() {
  const [appointments, setAppointments] = useState<AppointmentRecord[]>(initialAppointments);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"list" | "calendar">("list");
  const [statusFilter, setStatusFilter] = useState<AppointmentStatus | "All">("All");
  const [hospitalFilter, setHospitalFilter] = useState<number | "All">("All");

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AppointmentRecord>(() => createDefaultForm());

  const patientById = useMemo(
    () => Object.fromEntries(adminPatients.map((patient) => [patient.id, patient])),
    []
  );
  const doctorById = useMemo(
    () => Object.fromEntries(doctors.map((doctor) => [doctor.id, doctor])),
    []
  );
  const hospitalById = useMemo(
    () => Object.fromEntries(hospitals.map((hospital) => [hospital.id, hospital])),
    []
  );

  const availableDoctors = doctors.filter((doctor) => doctor.hospitalId === form.hospitalId);
  const availablePatients = adminPatients.filter((patient) => patient.hospitalId === form.hospitalId);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      const patient = patientById[appointment.patientId];
      const doctor = doctorById[appointment.doctorId];
      const hospital = hospitalById[appointment.hospitalId];

      const haystack = [
        appointment.id,
        patient?.name ?? "",
        doctor?.name ?? "",
        hospital?.name ?? "",
        doctor?.department ?? "",
        appointment.type,
      ]
        .join(" ")
        .toLowerCase();

      const matchesSearch = haystack.includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || appointment.status === statusFilter;
      const matchesHospital = hospitalFilter === "All" || appointment.hospitalId === hospitalFilter;

      return matchesSearch && matchesStatus && matchesHospital;
    });
  }, [appointments, doctorById, hospitalById, hospitalFilter, patientById, search, statusFilter]);

  const groupedByDate = useMemo(() => {
    return filteredAppointments.reduce<Record<string, AppointmentRecord[]>>((acc, appointment) => {
      if (!acc[appointment.date]) acc[appointment.date] = [];
      acc[appointment.date].push(appointment);
      return acc;
    }, {});
  }, [filteredAppointments]);

  const scheduledCount = appointments.filter((appointment) => appointment.status === "Scheduled").length;
  const inProgressCount = appointments.filter((appointment) => appointment.status === "In Progress").length;
  const completedCount = appointments.filter((appointment) => appointment.status === "Completed").length;

  const resetForm = () => {
    setForm(createDefaultForm());
    setEditingId(null);
    setShowModal(false);
  };

  const handleHospitalChange = (hospitalId: number) => {
    const nextDoctorId =
      doctors.find((doctor) => doctor.hospitalId === hospitalId)?.id ??
      form.doctorId;
    const nextPatientId =
      adminPatients.find((patient) => patient.hospitalId === hospitalId)?.id ??
      form.patientId;

    setForm((current) => ({
      ...current,
      hospitalId,
      doctorId: nextDoctorId,
      patientId: nextPatientId,
    }));
  };

  const handleSave = () => {
    if (!form.patientId || !form.doctorId || !form.hospitalId || !form.date || !form.time) {
      return;
    }

    if (editingId) {
      setAppointments((current) =>
        current.map((appointment) =>
          appointment.id === editingId
            ? { ...form, id: editingId }
            : appointment
        )
      );
    } else {
      const nextId = `APT-${String(appointments.length + 1).padStart(3, "0")}`;
      setAppointments((current) => [...current, { ...form, id: nextId }]);
    }

    resetForm();
  };

  const handleEdit = (appointmentId: string) => {
    const appointment = appointments.find((item) => item.id === appointmentId);
    if (!appointment) return;

    setForm(appointment);
    setEditingId(appointmentId);
    setShowModal(true);
  };

  const handleDelete = (appointmentId: string) => {
    setAppointments((current) => current.filter((appointment) => appointment.id !== appointmentId));
  };

  const updateStatus = (appointmentId: string, status: AppointmentStatus) => {
    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === appointmentId ? { ...appointment, status } : appointment
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Centralized Scheduling</p>
          <h1 className="text-3xl font-extrabold text-slate-900">Appointments Command Center</h1>
          <p className="text-slate-600">Track patient, doctor, and hospital mappings from one unified dashboard.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="hover-float rounded-xl bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700"
        >
          + Schedule Appointment
        </button>
      </div>

      <div className="stagger grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="surface-card hover-float p-4">
          <p className="text-sm text-slate-500">Scheduled</p>
          <p className="text-2xl font-extrabold text-slate-900">{scheduledCount}</p>
        </div>
        <div className="surface-card hover-float p-4">
          <p className="text-sm text-slate-500">In Progress</p>
          <p className="text-2xl font-extrabold text-slate-900">{inProgressCount}</p>
        </div>
        <div className="surface-card hover-float p-4">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="text-2xl font-extrabold text-slate-900">{completedCount}</p>
        </div>
      </div>

      <div className="surface-card grid grid-cols-1 gap-3 p-4 md:grid-cols-[2fr_1fr_1fr_auto] md:items-center">
        <input
          placeholder="Search by patient, doctor, hospital, department, appointment ID"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
        />

        <select
          value={String(hospitalFilter)}
          onChange={(event) => {
            const value = event.target.value;
            setHospitalFilter(value === "All" ? "All" : Number(value));
          }}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
        >
          <option value="All">All Hospitals</option>
          {hospitals.map((hospital) => (
            <option key={hospital.id} value={hospital.id}>
              {hospital.name}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as AppointmentStatus | "All")}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
        >
          <option value="All">All Status</option>
          <option value="Scheduled">Scheduled</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <div className="flex gap-2 justify-start md:justify-end">
          <button
            onClick={() => setView("list")}
            className={`interactive-chip rounded-lg px-3 py-1.5 text-sm font-semibold ${
              view === "list" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            List
          </button>
          <button
            onClick={() => setView("calendar")}
            className={`interactive-chip rounded-lg px-3 py-1.5 text-sm font-semibold ${
              view === "calendar" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
            }`}
          >
            Timeline
          </button>
        </div>
      </div>

      {view === "list" && (
        <div className="surface-card overflow-x-auto p-0">
          <div className="grid min-w-[1100px] grid-cols-[110px_1.5fr_1.4fr_1.6fr_120px_110px_130px_120px_220px] border-b border-slate-200 bg-slate-50 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            <span>ID</span>
            <span>Patient</span>
            <span>Doctor</span>
            <span>Hospital</span>
            <span>Date</span>
            <span>Time</span>
            <span>Type/Mode</span>
            <span>Status</span>
            <span>Actions</span>
          </div>

          {filteredAppointments.map((appointment) => {
            const patient = patientById[appointment.patientId];
            const doctor = doctorById[appointment.doctorId];
            const hospital = hospitalById[appointment.hospitalId];

            return (
              <div
                key={appointment.id}
                className="grid min-w-[1100px] grid-cols-[110px_1.5fr_1.4fr_1.6fr_120px_110px_130px_120px_220px] items-center border-b border-slate-100 px-6 py-4 text-sm transition hover:bg-cyan-50/40"
              >
                <span className="font-semibold text-blue-700">{appointment.id}</span>
                <div className="min-w-0 space-y-1 pr-3">
                  <p className="font-semibold leading-snug text-slate-900">{patient?.name ?? "Unknown"}</p>
                  <p className="break-words text-xs leading-snug text-slate-500">{patient?.diagnosis ?? "No diagnosis"}</p>
                </div>
                <div className="min-w-0 space-y-1 pr-3">
                  <p className="font-semibold leading-snug text-slate-900">{doctor?.name ?? "Unknown"}</p>
                  <p className="break-words text-xs leading-snug text-slate-500">{doctor?.department ?? "N/A"}</p>
                </div>
                <span className="min-w-0 break-words pr-3 leading-snug text-slate-700">{hospital?.name ?? "Unknown Hospital"}</span>
                <span>{appointment.date}</span>
                <span>{formatTime(appointment.time)}</span>
                <span className="text-slate-700">{appointment.type} / {appointment.mode}</span>
                <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusStyle(appointment.status)}`}>
                  {appointment.status}
                </span>
                <div className="flex flex-wrap gap-2 text-sm">
                  <button
                    onClick={() => handleEdit(appointment.id)}
                    className="font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(appointment.id)}
                    className="font-semibold text-rose-600 hover:text-rose-700"
                  >
                    Delete
                  </button>
                  {appointment.status !== "Completed" && (
                    <button
                      onClick={() => updateStatus(appointment.id, "Completed")}
                      className="font-semibold text-emerald-600 hover:text-emerald-700"
                    >
                      Complete
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredAppointments.length === 0 && (
            <p className="px-6 py-8 text-sm text-slate-500">No appointments match current filters.</p>
          )}
        </div>
      )}

      {view === "calendar" && (
        <div className="stagger space-y-4">
          {Object.keys(groupedByDate)
            .sort()
            .map((date) => (
              <div key={date} className="surface-card p-4">
                <h2 className="text-base font-bold text-slate-900">{date}</h2>
                <div className="mt-3 space-y-2">
                  {groupedByDate[date].map((appointment) => {
                    const patient = patientById[appointment.patientId];
                    const doctor = doctorById[appointment.doctorId];
                    const hospital = hospitalById[appointment.hospitalId];

                    return (
                      <div
                        key={appointment.id}
                        className="rounded-xl border border-slate-200/80 bg-white/80 px-4 py-3 transition hover:-translate-y-0.5"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="min-w-0 font-semibold leading-snug text-slate-900">
                            {formatTime(appointment.time)} | {patient?.name ?? "Unknown"}
                          </p>
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle(appointment.status)}`}>
                            {appointment.status}
                          </span>
                        </div>
                        <p className="mt-1 break-words text-sm leading-snug text-slate-600">
                          {doctor?.name ?? "Unknown Doctor"} ({doctor?.department ?? "N/A"}) at {hospital?.name ?? "Unknown Hospital"}
                        </p>
                        <p className="text-xs leading-snug text-slate-500">{appointment.type} | {appointment.mode}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

          {Object.keys(groupedByDate).length === 0 && (
            <p className="surface-card p-5 text-sm text-slate-500">No appointments available for the selected filters.</p>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/35 p-4 backdrop-blur-sm">
          <div className="surface-card w-full max-w-xl p-6">
            <h2 className="text-lg font-bold text-slate-900">
              {editingId ? "Edit Appointment" : "Schedule New Appointment"}
            </h2>

            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <label className="text-sm font-semibold text-slate-700">
                Hospital
                <select
                  value={form.hospitalId}
                  onChange={(event) => handleHospitalChange(Number(event.target.value))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                >
                  {hospitals.map((hospital) => (
                    <option key={hospital.id} value={hospital.id}>
                      {hospital.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Patient
                <select
                  value={form.patientId}
                  onChange={(event) => setForm((current) => ({ ...current, patientId: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                >
                  {availablePatients.map((patient) => (
                    <option key={patient.id} value={patient.id}>
                      {patient.name} ({patient.id})
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Doctor
                <select
                  value={form.doctorId}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, doctorId: Number(event.target.value) }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                >
                  {availableDoctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name} ({doctor.department})
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Visit Type
                <select
                  value={form.type}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, type: event.target.value as VisitType }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                >
                  <option value="Consultation">Consultation</option>
                  <option value="Follow-up">Follow-up</option>
                  <option value="Procedure">Procedure</option>
                  <option value="Diagnostic">Diagnostic</option>
                </select>
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Date
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Time
                <input
                  type="time"
                  value={form.time}
                  onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                />
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Mode
                <select
                  value={form.mode}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, mode: event.target.value as VisitMode }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                >
                  <option value="In-person">In-person</option>
                  <option value="Teleconsult">Teleconsult</option>
                </select>
              </label>

              <label className="text-sm font-semibold text-slate-700">
                Status
                <select
                  value={form.status}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, status: event.target.value as AppointmentStatus }))
                  }
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </label>
            </div>

            <label className="mt-3 block text-sm font-semibold text-slate-700">
              Notes
              <textarea
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                rows={2}
                placeholder="Optional clinical or scheduling notes"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-100"
              />
            </label>

            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={resetForm}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Cancel
              </button>

              <button
                onClick={handleSave}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Save Appointment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}