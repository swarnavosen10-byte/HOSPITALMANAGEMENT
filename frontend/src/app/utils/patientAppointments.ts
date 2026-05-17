export type AppointmentStatus = "Scheduled" | "Completed" | "Cancelled";

export type PatientAppointment = {
  id: string;
  patientName: string;
  doctorName: string;
  department: string;
  hospitalName: string;
  date: string;
  time: string;
  status: AppointmentStatus;
};

const STORAGE_KEY = "patientAppointments";

const defaultAppointments: PatientAppointment[] = [
  {
    id: "APT-001",
    patientName: "patient",
    doctorName: "Dr. Amit Roy",
    department: "Cardiology",
    hospitalName: "Apollo Hospital Kolkata",
    date: "2026-05-10",
    time: "10:30 AM",
    status: "Scheduled",
  },
  {
    id: "APT-002",
    patientName: "patient",
    doctorName: "Dr. Sneha Sen",
    department: "Dermatology",
    hospitalName: "Fortis Hospital Kolkata",
    date: "2026-04-20",
    time: "02:00 PM",
    status: "Completed",
  },
  {
    id: "APT-003",
    patientName: "patient",
    doctorName: "Dr. Rakesh Mitra",
    department: "ENT",
    hospitalName: "Fortis Hospital Kolkata",
    date: "2026-04-18",
    time: "11:00 AM",
    status: "Cancelled",
  },
];

const readStorage = (): PatientAppointment[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultAppointments;

  try {
    const parsed = JSON.parse(raw) as PatientAppointment[];
    return parsed.length ? parsed : defaultAppointments;
  } catch {
    return defaultAppointments;
  }
};

export const getPatientAppointments = () => {
  const appointments = readStorage();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
  return appointments;
};

export const savePatientAppointments = (appointments: PatientAppointment[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appointments));
};

export const addPatientAppointment = (
  appointment: Omit<PatientAppointment, "id" | "status">
) => {
  const appointments = getPatientAppointments();
  const nextId = `APT-${String(appointments.length + 1).padStart(3, "0")}`;

  const newAppointment: PatientAppointment = {
    ...appointment,
    id: nextId,
    status: "Scheduled",
  };

  const updated = [newAppointment, ...appointments];
  savePatientAppointments(updated);
  return newAppointment;
};
