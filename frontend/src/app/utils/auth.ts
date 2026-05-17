import { doctors, hospitals } from "../data";

export type UserRole = "admin" | "patient" | "hospital_staff" | "doctor";

export type AuthUser = {
  role: UserRole;
  username: string;
  hospitalId?: number;
  hospitalIds?: number[];
  activeHospitalId?: number;
  doctorId?: number;
  displayName?: string;
};

export type DemoCredential = {
  role: UserRole;
  username: string;
  password: string;
  hospitalId?: number;
  hospitalIds?: number[];
  doctorId?: number;
  displayName: string;
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/hospital kolkata/g, "")
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.|\.$/g, "");

const demoCredentials: DemoCredential[] = [
  {
    role: "admin",
    username: "admin",
    password: "123",
    displayName: "Network Admin",
  },
  {
    role: "patient",
    username: "patient",
    password: "123",
    displayName: "Patient User",
  },
  ...hospitals.map((hospital, index) => ({
    role: "hospital_staff" as const,
    username: `staff.${slugify(hospital.name) || slugify(hospital.location) || `hospital${index + 1}`}`,
    password: "123",
    hospitalId: hospital.id,
    displayName: `${hospital.name} Staff`,
  })),
  ...doctors.map((doctor) => {
    const hospitalIds = doctor.practiceHospitalIds ?? [doctor.hospitalId];
    return {
      role: "doctor" as const,
      username: `doctor.${slugify(doctor.name.replace(/^Dr\.\s*/i, "")) || doctor.id}`,
      password: "123",
      hospitalId: hospitalIds[0],
      hospitalIds,
      doctorId: doctor.id,
      displayName: doctor.name,
    };
  }),
  {
    role: "doctor",
    username: "doctor.multi",
    password: "123",
    hospitalIds: [1, 4, 6],
    hospitalId: 1,
    doctorId: 101,
    displayName: "Dr. Rahul Das (Multi-Hospital)",
  },
];

export const loginUser = (user: AuthUser) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const updateLoggedInUser = (patch: Partial<AuthUser>) => {
  const currentUser = getUser();
  if (!currentUser) return;

  loginUser({ ...currentUser, ...patch });
};

export const logoutUser = () => {
  localStorage.removeItem("user");
};

export const getUser = (): AuthUser | null => {
  const user = localStorage.getItem("user");
  if (!user) return null;

  try {
    return JSON.parse(user) as AuthUser;
  } catch {
    return null;
  }
};

export const isAuthenticated = () => {
  return !!localStorage.getItem("user");
};

export const getRoleHomePath = (role: UserRole) => {
  if (role === "admin") return "/admin";
  if (role === "patient") return "/patient-dashboard";
  if (role === "hospital_staff") return "/staff-dashboard";
  return "/doctor-dashboard";
};

export const validateDemoCredential = (
  role: UserRole,
  username: string,
  password: string
): AuthUser | null => {
  const match = demoCredentials.find(
    (item) =>
      item.role === role &&
      item.username.toLowerCase() === username.toLowerCase() &&
      item.password === password
  );

  if (!match) return null;

  return {
    role: match.role,
    username: match.username,
    hospitalId: match.hospitalId,
    hospitalIds: match.hospitalIds,
    activeHospitalId: match.hospitalIds?.[0] ?? match.hospitalId,
    doctorId: match.doctorId,
    displayName: match.displayName,
  };
};

export const getDemoCredentials = () => demoCredentials;