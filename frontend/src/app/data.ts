export type DepartmentInfo = {
  name: string;
  doctorCount: number;
  availability: "Available" | "Limited" | "Busy";
};

export type BedType = "ICU" | "General Ward" | "Private Room" | "Emergency";

export type BedTypeAvailability = {
  type: BedType;
  available: number;
  busy: number;
  unavailable: number;
};

export type Hospital = {
  id: number;
  name: string;
  location: string;
  specialties: string[];
  rating: number;
  isOpen: boolean;
  bedsAvailable: number;
  emergencyStatus: "Active" | "Busy" | "Unavailable";
  bedInventory: BedTypeAvailability[];
  departments: DepartmentInfo[];
};

export type Doctor = {
  id: number;
  hospitalId: number;
  practiceHospitalIds?: number[];
  department: string;
  name: string;
  experience: number;
  availability: "Available" | "Limited" | "On Leave";
  fees: number;
  phone: string;
  email: string;
};

export type AdminPatient = {
  id: string;
  name: string;
  age: number;
  gender: "Male" | "Female" | "Other";
  diagnosis: string;
  status: "Admitted" | "In Treatment" | "Discharged" | "Waiting";
  hospitalId: number;
};

export type HospitalRevenue = {
  hospitalId: number;
  monthly: number[];
};

export const hospitals: Hospital[] = [
  {
    id: 1,
    name: "Apollo Hospital Kolkata",
    location: "Salt Lake",
    specialties: ["Cardiology", "Neurology", "Orthopedics"],
    rating: 4.7,
    isOpen: true,
    bedsAvailable: 18,
    emergencyStatus: "Active",
    bedInventory: [
      { type: "ICU", available: 4, busy: 9, unavailable: 1 },
      { type: "General Ward", available: 7, busy: 14, unavailable: 2 },
      { type: "Private Room", available: 5, busy: 6, unavailable: 1 },
      { type: "Emergency", available: 2, busy: 3, unavailable: 0 },
    ],
    departments: [
      { name: "Cardiology", doctorCount: 5, availability: "Available" },
      { name: "Neurology", doctorCount: 4, availability: "Limited" },
      { name: "Orthopedics", doctorCount: 3, availability: "Available" },
      { name: "General Medicine", doctorCount: 6, availability: "Busy" },
    ],
  },
  {
    id: 2,
    name: "Fortis Hospital Kolkata",
    location: "Anandapur",
    specialties: ["Cardiology", "Dermatology", "ENT"],
    rating: 4.4,
    isOpen: true,
    bedsAvailable: 7,
    emergencyStatus: "Busy",
    bedInventory: [
      { type: "ICU", available: 1, busy: 6, unavailable: 1 },
      { type: "General Ward", available: 3, busy: 12, unavailable: 2 },
      { type: "Private Room", available: 2, busy: 5, unavailable: 1 },
      { type: "Emergency", available: 1, busy: 4, unavailable: 0 },
    ],
    departments: [
      { name: "Cardiology", doctorCount: 4, availability: "Limited" },
      { name: "Dermatology", doctorCount: 3, availability: "Available" },
      { name: "ENT", doctorCount: 2, availability: "Available" },
      { name: "General Medicine", doctorCount: 5, availability: "Busy" },
    ],
  },
  {
    id: 3,
    name: "AMRI Dhakuria",
    location: "Dhakuria",
    specialties: ["Pediatrics", "Neurology", "General Medicine"],
    rating: 4.1,
    isOpen: false,
    bedsAvailable: 0,
    emergencyStatus: "Unavailable",
    bedInventory: [
      { type: "ICU", available: 0, busy: 2, unavailable: 4 },
      { type: "General Ward", available: 0, busy: 4, unavailable: 6 },
      { type: "Private Room", available: 0, busy: 1, unavailable: 2 },
      { type: "Emergency", available: 0, busy: 1, unavailable: 2 },
    ],
    departments: [
      { name: "Pediatrics", doctorCount: 4, availability: "Available" },
      { name: "Neurology", doctorCount: 2, availability: "Limited" },
      { name: "General Medicine", doctorCount: 4, availability: "Busy" },
    ],
  },
  {
    id: 4,
    name: "Peerless Hospital Kolkata",
    location: "Panchasayar",
    specialties: ["Oncology", "Cardiology", "General Medicine"],
    rating: 4.3,
    isOpen: true,
    bedsAvailable: 12,
    emergencyStatus: "Active",
    bedInventory: [
      { type: "ICU", available: 2, busy: 7, unavailable: 1 },
      { type: "General Ward", available: 5, busy: 10, unavailable: 2 },
      { type: "Private Room", available: 3, busy: 5, unavailable: 1 },
      { type: "Emergency", available: 2, busy: 3, unavailable: 0 },
    ],
    departments: [
      { name: "Oncology", doctorCount: 4, availability: "Available" },
      { name: "Cardiology", doctorCount: 3, availability: "Limited" },
      { name: "General Medicine", doctorCount: 5, availability: "Available" },
    ],
  },
  {
    id: 5,
    name: "Ruby General Hospital",
    location: "Kasba",
    specialties: ["Nephrology", "Pediatrics", "ENT"],
    rating: 4.2,
    isOpen: true,
    bedsAvailable: 9,
    emergencyStatus: "Busy",
    bedInventory: [
      { type: "ICU", available: 1, busy: 5, unavailable: 1 },
      { type: "General Ward", available: 4, busy: 11, unavailable: 2 },
      { type: "Private Room", available: 3, busy: 4, unavailable: 1 },
      { type: "Emergency", available: 1, busy: 3, unavailable: 0 },
    ],
    departments: [
      { name: "Nephrology", doctorCount: 3, availability: "Available" },
      { name: "Pediatrics", doctorCount: 4, availability: "Limited" },
      { name: "ENT", doctorCount: 3, availability: "Available" },
    ],
  },
  {
    id: 6,
    name: "Medica Superspecialty",
    location: "Mukundapur",
    specialties: ["Critical Care", "Neurology", "Orthopedics"],
    rating: 4.6,
    isOpen: true,
    bedsAvailable: 21,
    emergencyStatus: "Active",
    bedInventory: [
      { type: "ICU", available: 5, busy: 10, unavailable: 1 },
      { type: "General Ward", available: 8, busy: 16, unavailable: 2 },
      { type: "Private Room", available: 5, busy: 6, unavailable: 1 },
      { type: "Emergency", available: 3, busy: 4, unavailable: 0 },
    ],
    departments: [
      { name: "Critical Care", doctorCount: 4, availability: "Available" },
      { name: "Neurology", doctorCount: 5, availability: "Available" },
      { name: "Orthopedics", doctorCount: 4, availability: "Limited" },
    ],
  },
];

export const doctors: Doctor[] = [
  { id: 101, hospitalId: 1, practiceHospitalIds: [1, 4, 6], department: "Cardiology", name: "Dr. Rahul Das", experience: 10, availability: "Available", fees: 900, phone: "+91 90511 11001", email: "rahul.das@medisync.com" },
  { id: 102, hospitalId: 1, department: "Cardiology", name: "Dr. Suman Ghosh", experience: 8, availability: "Limited", fees: 850, phone: "+91 90511 11002", email: "suman.ghosh@medisync.com" },
  { id: 103, hospitalId: 1, department: "Neurology", name: "Dr. Tumpa Sen", experience: 7, availability: "Available", fees: 1000, phone: "+91 90511 11003", email: "tumpa.sen@medisync.com" },
  { id: 104, hospitalId: 1, department: "Orthopedics", name: "Dr. Mita Roy", experience: 9, availability: "Available", fees: 780, phone: "+91 90511 11004", email: "mita.roy@medisync.com" },
  { id: 105, hospitalId: 2, practiceHospitalIds: [2, 5], department: "Cardiology", name: "Dr. Arindam Pal", experience: 12, availability: "Limited", fees: 950, phone: "+91 90511 11005", email: "arindam.pal@medisync.com" },
  { id: 106, hospitalId: 2, department: "Dermatology", name: "Dr. Sneha Sen", experience: 6, availability: "Available", fees: 700, phone: "+91 90511 11006", email: "sneha.sen@medisync.com" },
  { id: 107, hospitalId: 2, department: "ENT", name: "Dr. Rakesh Mitra", experience: 11, availability: "On Leave", fees: 650, phone: "+91 90511 11007", email: "rakesh.mitra@medisync.com" },
  { id: 108, hospitalId: 3, department: "Pediatrics", name: "Dr. Nabanita Paul", experience: 9, availability: "Available", fees: 800, phone: "+91 90511 11008", email: "nabanita.paul@medisync.com" },
  { id: 109, hospitalId: 3, department: "Neurology", name: "Dr. Arnab Dey", experience: 5, availability: "Limited", fees: 900, phone: "+91 90511 11009", email: "arnab.dey@medisync.com" },
  { id: 110, hospitalId: 4, practiceHospitalIds: [4, 6], department: "Oncology", name: "Dr. Sreya Mitra", experience: 11, availability: "Available", fees: 1200, phone: "+91 90511 11010", email: "sreya.mitra@medisync.com" },
  { id: 111, hospitalId: 4, department: "Cardiology", name: "Dr. Souvik Kar", experience: 9, availability: "Limited", fees: 980, phone: "+91 90511 11011", email: "souvik.kar@medisync.com" },
  { id: 112, hospitalId: 5, practiceHospitalIds: [5, 6], department: "Nephrology", name: "Dr. Ria Banerjee", experience: 10, availability: "Available", fees: 1100, phone: "+91 90511 11012", email: "ria.banerjee@medisync.com" },
  { id: 113, hospitalId: 5, department: "ENT", name: "Dr. Debjit Ghosh", experience: 8, availability: "Available", fees: 760, phone: "+91 90511 11013", email: "debjit.ghosh@medisync.com" },
  { id: 114, hospitalId: 6, practiceHospitalIds: [6, 1], department: "Critical Care", name: "Dr. Paroma Nandi", experience: 13, availability: "Available", fees: 1400, phone: "+91 90511 11014", email: "paroma.nandi@medisync.com" },
  { id: 115, hospitalId: 6, department: "Neurology", name: "Dr. Sagnik Roy", experience: 7, availability: "Available", fees: 1020, phone: "+91 90511 11015", email: "sagnik.roy@medisync.com" },
  { id: 116, hospitalId: 6, department: "Orthopedics", name: "Dr. Rupam Dutta", experience: 9, availability: "Limited", fees: 930, phone: "+91 90511 11016", email: "rupam.dutta@medisync.com" },
];

export const adminPatients: AdminPatient[] = [
  {
    id: "P001",
    name: "Rohan Mukherjee",
    age: 45,
    gender: "Male",
    diagnosis: "Hypertension",
    status: "In Treatment",
    hospitalId: 1,
  },
  {
    id: "P002",
    name: "Priyanka Sen",
    age: 32,
    gender: "Female",
    diagnosis: "Diabetes Type 2",
    status: "Admitted",
    hospitalId: 2,
  },
  {
    id: "P003",
    name: "Ritwik Ghosh",
    age: 27,
    gender: "Male",
    diagnosis: "Migraine",
    status: "Waiting",
    hospitalId: 3,
  },
  {
    id: "P004",
    name: "Ananya Dutta",
    age: 54,
    gender: "Female",
    diagnosis: "Cardiac Arrhythmia",
    status: "Discharged",
    hospitalId: 1,
  },
  {
    id: "P005",
    name: "Imran Ali",
    age: 41,
    gender: "Male",
    diagnosis: "Pneumonia",
    status: "In Treatment",
    hospitalId: 2,
  },
  {
    id: "P006",
    name: "Tanisha Roy",
    age: 36,
    gender: "Female",
    diagnosis: "Kidney Stone",
    status: "Admitted",
    hospitalId: 5,
  },
  {
    id: "P007",
    name: "Sayan Chatterjee",
    age: 59,
    gender: "Male",
    diagnosis: "Post Stroke Rehab",
    status: "In Treatment",
    hospitalId: 6,
  },
  {
    id: "P008",
    name: "Mou Das",
    age: 43,
    gender: "Female",
    diagnosis: "Thyroid Nodules",
    status: "Waiting",
    hospitalId: 4,
  },
  {
    id: "P009",
    name: "Arif Khan",
    age: 48,
    gender: "Male",
    diagnosis: "ENT Infection",
    status: "Discharged",
    hospitalId: 5,
  },
  {
    id: "P010",
    name: "Nabanita Ghosh",
    age: 62,
    gender: "Female",
    diagnosis: "Neuro Observation",
    status: "Admitted",
    hospitalId: 6,
  },
];

export const revenueMonths = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const hospitalRevenue: HospitalRevenue[] = [
  {
    hospitalId: 1,
    monthly: [4500000, 4720000, 4830000, 5010000, 5120000, 5280000, 5360000, 5420000, 5490000, 5630000, 5740000, 5900000],
  },
  {
    hospitalId: 2,
    monthly: [3800000, 3920000, 4010000, 4150000, 4240000, 4330000, 4410000, 4460000, 4520000, 4650000, 4740000, 4860000],
  },
  {
    hospitalId: 3,
    monthly: [2900000, 3010000, 3090000, 3160000, 3220000, 3270000, 3330000, 3380000, 3410000, 3490000, 3560000, 3640000],
  },
  {
    hospitalId: 4,
    monthly: [3300000, 3440000, 3520000, 3690000, 3780000, 3860000, 3940000, 4010000, 4070000, 4170000, 4250000, 4380000],
  },
  {
    hospitalId: 5,
    monthly: [3100000, 3220000, 3330000, 3470000, 3520000, 3600000, 3670000, 3720000, 3780000, 3890000, 3970000, 4090000],
  },
  {
    hospitalId: 6,
    monthly: [4100000, 4230000, 4370000, 4520000, 4630000, 4740000, 4830000, 4920000, 5010000, 5150000, 5260000, 5410000],
  },
];

export const getHospitalById = (id: number) => {
  return hospitals.find((hospital) => hospital.id === id) ?? null;
};

export const getHospitalMonthlyRevenue = (hospitalId: number) => {
  return hospitalRevenue.find((revenue) => revenue.hospitalId === hospitalId)?.monthly ?? [];
};

export const getHospitalYearlyRevenue = () => {
  return hospitalRevenue.map((revenue) => ({
    hospitalId: revenue.hospitalId,
    yearly: revenue.monthly.reduce((sum, value) => sum + value, 0),
  }));
};

export const getNetworkMonthlyRevenue = () => {
  return revenueMonths.map((month, monthIndex) => ({
    month,
    value: hospitalRevenue.reduce(
      (sum, revenue) => sum + (revenue.monthly[monthIndex] ?? 0),
      0
    ),
  }));
};

export const getHospitalNameById = (id: number) => {
  return getHospitalById(id)?.name ?? "Unknown Hospital";
};

export const getDepartmentsByHospital = (hospitalId: number) => {
  return getHospitalById(hospitalId)?.departments ?? [];
};

export const getDoctorsByHospitalAndDepartment = (
  hospitalId: number,
  department: string
) => {
  return doctors.filter(
    (doctor) =>
      doctor.hospitalId === hospitalId &&
      doctor.department.toLowerCase() === department.toLowerCase()
  );
};

export const getDoctorById = (id: number) => {
  return doctors.find((doctor) => doctor.id === id) ?? null;
};

export type AppointmentStatus =
  | "Pending Approval"
  | "Approved"
  | "Scheduled"
  | "In Progress"
  | "Completed"
  | "Cancelled"
  | "Rejected"
  | "No-show";
export type VisitType = "Consultation" | "Follow-up" | "Procedure" | "Diagnostic";
export type VisitMode = "In-person" | "Teleconsult";

export type AppointmentRecord = {
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

export const appointments: AppointmentRecord[] = [
  {
    id: "APT-001",
    patientId: "P004",
    doctorId: 101,
    hospitalId: 1,
    date: "2026-04-28",
    time: "09:30",
    type: "Follow-up",
    mode: "In-person",
    status: "Approved",
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
    status: "Scheduled",
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
    status: "Pending Approval",
    notes: "ENT minor procedure",
  },
  {
    id: "APT-005",
    patientId: "P008",
    doctorId: 101,
    hospitalId: 4,
    date: "2026-05-12",
    time: "10:15",
    type: "Consultation",
    mode: "In-person",
    status: "Pending Approval",
    notes: "Cardiology consult at Peerless",
  },
  {
    id: "APT-006",
    patientId: "P006",
    doctorId: 101,
    hospitalId: 6,
    date: "2026-05-13",
    time: "15:30",
    type: "Follow-up",
    mode: "Teleconsult",
    status: "Scheduled",
    notes: "Multi-hospital follow-up",
  },
  {
    id: "APT-007",
    patientId: "P009",
    doctorId: 105,
    hospitalId: 5,
    date: "2026-05-14",
    time: "11:00",
    type: "Consultation",
    mode: "In-person",
    status: "Approved",
    notes: "Cardiology review at Ruby",
  },
];

export type ShiftType = "Morning" | "Evening" | "Night" | "Split";
export type ScheduleAvailability = "Available" | "Unavailable" | "Emergency Duty";
export type StaffNotificationType =
  | "schedule_conflict"
  | "doctor_unavailable"
  | "appointment_reminder"
  | "emergency_alert"
  | "staff_update";

export type DoctorSchedule = {
  id: string;
  doctorId: number;
  hospitalId: number;
  department: string;
  date: string;
  startTime: string;
  endTime: string;
  breakTime: string;
  roomNumber: string;
  availabilityStatus: ScheduleAvailability;
  shiftType: ShiftType;
  otHours: number;
  isEmergencyDuty: boolean;
  unavailableDate?: string;
  consultationMode: "Online" | "Offline" | "Hybrid";
};

export type AlertNotification = {
  id: string;
  type: StaffNotificationType;
  title: string;
  message: string;
  timestamp: string;
  severity: "low" | "medium" | "high";
  hospitalId: number;
  doctorId?: number;
  isRead: boolean;
};

export type PatientMedicalRecord = {
  patientId: string;
  symptoms: string[];
  allergies: string[];
  emergencyConditions: string[];
  reports: string[];
  prescriptionHistory: string[];
};

export type PrescriptionRecord = {
  id: string;
  doctorId: number;
  hospitalId: number;
  patientId: string;
  medicines: Array<{
    name: string;
    dosage: string;
    timing: string;
    durationDays: number;
  }>;
  testsRecommended: string[];
  followUpDate: string;
  notes: string;
  createdAt: string;
};

export type StaffReportSummary = {
  hospitalId: number;
  month: string;
  appointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  revenue: number;
  avgBedOccupancy: number;
  emergencyCases: number;
};

export const doctorSchedules: DoctorSchedule[] = [
  {
    id: "SCH-101-01",
    doctorId: 101,
    hospitalId: 1,
    department: "Cardiology",
    date: "2026-05-11",
    startTime: "09:00",
    endTime: "14:00",
    breakTime: "12:00-12:30",
    roomNumber: "C-201",
    availabilityStatus: "Available",
    shiftType: "Morning",
    otHours: 1,
    isEmergencyDuty: false,
    consultationMode: "Offline",
  },
  {
    id: "SCH-102-01",
    doctorId: 102,
    hospitalId: 1,
    department: "Cardiology",
    date: "2026-05-11",
    startTime: "14:00",
    endTime: "20:00",
    breakTime: "17:00-17:20",
    roomNumber: "C-203",
    availabilityStatus: "Available",
    shiftType: "Evening",
    otHours: 0,
    isEmergencyDuty: false,
    consultationMode: "Hybrid",
  },
  {
    id: "SCH-103-01",
    doctorId: 103,
    hospitalId: 1,
    department: "Neurology",
    date: "2026-05-11",
    startTime: "10:00",
    endTime: "16:00",
    breakTime: "13:30-14:00",
    roomNumber: "N-104",
    availabilityStatus: "Emergency Duty",
    shiftType: "Split",
    otHours: 2,
    isEmergencyDuty: true,
    consultationMode: "Offline",
  },
  {
    id: "SCH-104-01",
    doctorId: 104,
    hospitalId: 1,
    department: "Orthopedics",
    date: "2026-05-11",
    startTime: "08:00",
    endTime: "13:00",
    breakTime: "10:30-10:45",
    roomNumber: "O-112",
    availabilityStatus: "Available",
    shiftType: "Morning",
    otHours: 0,
    isEmergencyDuty: false,
    consultationMode: "Offline",
  },
  {
    id: "SCH-105-01",
    doctorId: 105,
    hospitalId: 2,
    department: "Cardiology",
    date: "2026-05-11",
    startTime: "09:00",
    endTime: "15:00",
    breakTime: "12:20-12:50",
    roomNumber: "F-301",
    availabilityStatus: "Available",
    shiftType: "Morning",
    otHours: 1,
    isEmergencyDuty: false,
    consultationMode: "Hybrid",
  },
  {
    id: "SCH-101-02",
    doctorId: 101,
    hospitalId: 4,
    department: "Cardiology",
    date: "2026-05-11",
    startTime: "16:00",
    endTime: "19:00",
    breakTime: "17:30-17:45",
    roomNumber: "C-114",
    availabilityStatus: "Available",
    shiftType: "Evening",
    otHours: 0,
    isEmergencyDuty: false,
    consultationMode: "Offline",
  },
  {
    id: "SCH-101-03",
    doctorId: 101,
    hospitalId: 6,
    department: "Cardiology",
    date: "2026-05-12",
    startTime: "09:00",
    endTime: "12:00",
    breakTime: "10:30-10:45",
    roomNumber: "C-301",
    availabilityStatus: "Emergency Duty",
    shiftType: "Morning",
    otHours: 1,
    isEmergencyDuty: true,
    consultationMode: "Hybrid",
  },
  {
    id: "SCH-105-02",
    doctorId: 105,
    hospitalId: 5,
    department: "Cardiology",
    date: "2026-05-14",
    startTime: "12:00",
    endTime: "16:00",
    breakTime: "14:00-14:15",
    roomNumber: "F-205",
    availabilityStatus: "Available",
    shiftType: "Split",
    otHours: 1,
    isEmergencyDuty: false,
    consultationMode: "Offline",
  },
];

export const alertNotifications: AlertNotification[] = [
  {
    id: "NTF-001",
    type: "schedule_conflict",
    title: "Schedule conflict detected",
    message: "Dr. Rahul Das has overlapping OPD and emergency rounds at 12:00.",
    timestamp: "2026-05-11T08:15:00",
    severity: "high",
    hospitalId: 1,
    doctorId: 101,
    isRead: false,
  },
  {
    id: "NTF-002",
    type: "appointment_reminder",
    title: "Appointment reminder",
    message: "14 patients are waiting for approval for tomorrow's slots.",
    timestamp: "2026-05-11T09:25:00",
    severity: "medium",
    hospitalId: 1,
    isRead: false,
  },
  {
    id: "NTF-003",
    type: "doctor_unavailable",
    title: "Doctor unavailable",
    message: "Dr. Suman Ghosh requested emergency leave for 2026-05-13.",
    timestamp: "2026-05-10T21:05:00",
    severity: "medium",
    hospitalId: 1,
    doctorId: 102,
    isRead: true,
  },
  {
    id: "NTF-004",
    type: "emergency_alert",
    title: "Emergency patient arrival",
    message: "Cardiac emergency ETA 12 minutes. Keep cath lab standby.",
    timestamp: "2026-05-11T10:05:00",
    severity: "high",
    hospitalId: 1,
    isRead: false,
  },
  {
    id: "NTF-005",
    type: "staff_update",
    title: "Schedule updated by staff",
    message: "Your 16:00 consultation shifted to Room C-208.",
    timestamp: "2026-05-11T07:50:00",
    severity: "low",
    hospitalId: 1,
    doctorId: 101,
    isRead: true,
  },
];

export const patientMedicalRecords: PatientMedicalRecord[] = [
  {
    patientId: "P001",
    symptoms: ["Headache", "Elevated blood pressure", "Fatigue"],
    allergies: ["Penicillin"],
    emergencyConditions: ["Hypertensive urgency history"],
    reports: ["ECG normal", "Lipid profile elevated"],
    prescriptionHistory: ["Telmisartan 40mg", "Rosuvastatin 10mg"],
  },
  {
    patientId: "P004",
    symptoms: ["Palpitations", "Shortness of breath"],
    allergies: ["No known allergies"],
    emergencyConditions: ["Arrhythmia risk"],
    reports: ["Holter monitor review", "ECHO mild irregularity"],
    prescriptionHistory: ["Metoprolol 25mg", "Aspirin 75mg"],
  },
  {
    patientId: "P010",
    symptoms: ["Dizziness", "Intermittent numbness"],
    allergies: ["Dust allergy"],
    emergencyConditions: ["Post stroke monitoring"],
    reports: ["MRI follow-up stable", "Cognitive score improving"],
    prescriptionHistory: ["Clopidogrel", "Neurobion"],
  },
];

export const prescriptions: PrescriptionRecord[] = [
  {
    id: "RX-001",
    doctorId: 101,
    hospitalId: 1,
    patientId: "P001",
    medicines: [
      { name: "Telmisartan", dosage: "40mg", timing: "1-0-0", durationDays: 30 },
      { name: "Amlodipine", dosage: "5mg", timing: "0-0-1", durationDays: 30 },
    ],
    testsRecommended: ["HbA1c", "Serum Creatinine"],
    followUpDate: "2026-05-25",
    notes: "Monitor BP at home twice daily.",
    createdAt: "2026-05-01",
  },
  {
    id: "RX-002",
    doctorId: 103,
    hospitalId: 1,
    patientId: "P010",
    medicines: [
      { name: "Clopidogrel", dosage: "75mg", timing: "1-0-0", durationDays: 20 },
      { name: "Atorvastatin", dosage: "10mg", timing: "0-0-1", durationDays: 20 },
    ],
    testsRecommended: ["Follow-up MRI", "Neurology panel"],
    followUpDate: "2026-05-18",
    notes: "Continue physiotherapy sessions.",
    createdAt: "2026-04-29",
  },
];

export const staffReportSummaries: StaffReportSummary[] = [
  {
    hospitalId: 1,
    month: "2026-05",
    appointments: 468,
    completedAppointments: 411,
    cancelledAppointments: 27,
    revenue: 5420000,
    avgBedOccupancy: 82,
    emergencyCases: 39,
  },
  {
    hospitalId: 2,
    month: "2026-05",
    appointments: 389,
    completedAppointments: 336,
    cancelledAppointments: 31,
    revenue: 4330000,
    avgBedOccupancy: 79,
    emergencyCases: 29,
  },
];

export const getDoctorsByHospital = (hospitalId: number) =>
  doctors.filter((doctor) => doctor.hospitalId === hospitalId || doctor.practiceHospitalIds?.includes(hospitalId));

export const getPatientsByHospital = (hospitalId: number) =>
  adminPatients.filter((patient) => patient.hospitalId === hospitalId);

export const getAppointmentsByHospital = (hospitalId: number) =>
  appointments.filter((appointment) => appointment.hospitalId === hospitalId);

export const getAppointmentsByDoctor = (doctorId: number) =>
  appointments.filter((appointment) => appointment.doctorId === doctorId);

export const getDoctorSchedulesByHospital = (hospitalId: number) =>
  doctorSchedules.filter((schedule) => schedule.hospitalId === hospitalId);

export const getDoctorSchedulesByDoctor = (doctorId: number) =>
  doctorSchedules.filter((schedule) => schedule.doctorId === doctorId);

export const getStaffNotifications = (hospitalId: number) =>
  alertNotifications.filter((notification) => notification.hospitalId === hospitalId);

export const getDoctorNotifications = (doctorId: number) =>
  alertNotifications.filter((notification) => notification.doctorId === doctorId);

export const getMedicalRecordByPatientId = (patientId: string) =>
  patientMedicalRecords.find((record) => record.patientId === patientId) ?? null;

export const getPrescriptionsByDoctor = (doctorId: number) =>
  prescriptions.filter((prescription) => prescription.doctorId === doctorId);

export const getPrescriptionsByDoctorAndHospital = (doctorId: number, hospitalId: number) =>
  prescriptions.filter(
    (prescription) => prescription.doctorId === doctorId && prescription.hospitalId === hospitalId
  );

export const getHospitalReportSummary = (hospitalId: number) =>
  staffReportSummaries.find((summary) => summary.hospitalId === hospitalId) ?? null;