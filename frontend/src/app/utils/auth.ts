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
  email?: string;
  phone?: string;
  verification_status?: string;
};

export type DemoCredential = {
  role: UserRole;
  username: string;
  password: string;
  hospitalId?: number;
  hospitalIds?: number[];
  doctorId?: number;
  displayName: string;
  email?: string;
  phone?: string;
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
    email: "admin@medisync.com",
    phone: "+91 90000 00001",
  },
  {
    role: "patient",
    username: "patient",
    password: "123",
    displayName: "Patient User",
    email: "patient@gmail.com",
    phone: "+91 98300 12345",
  },
  ...hospitals.map((hospital, index) => ({
    role: "hospital_staff" as const,
    username: `staff.${slugify(hospital.name) || slugify(hospital.location) || `hospital${index + 1}`}`,
    password: "123",
    hospitalId: hospital.id,
    displayName: `${hospital.name} Staff`,
    email: `staff.${slugify(hospital.name)}@medisync.com`,
    phone: `+91 90511 ${10000 + hospital.id}`,
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
      email: doctor.email || `${slugify(doctor.name)}@medisync.com`,
      phone: doctor.phone || "+91 90511 11000",
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
    email: "rahul.das@medisync.com",
    phone: "+91 90511 11001",
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

export const getRegisteredUsers = (): DemoCredential[] => {
  const users = localStorage.getItem("registered_users");
  if (!users) return [];
  try {
    return JSON.parse(users) as DemoCredential[];
  } catch {
    return [];
  }
};

export const registerUser = (
  role: UserRole,
  username: string,
  password: string,
  displayName: string,
  hospitalId?: number,
  doctorId?: number,
  email?: string,
  phone?: string
): { success: boolean; message: string } => {
  const registered = getRegisteredUsers();
  
  const existsInDemo = demoCredentials.some(
    (item) => item.username.toLowerCase() === username.toLowerCase()
  );
  const existsInRegistered = registered.some(
    (item) => item.username.toLowerCase() === username.toLowerCase()
  );

  if (existsInDemo || existsInRegistered) {
    return { success: false, message: "Username already exists" };
  }

  const newUser: DemoCredential = {
    role,
    username,
    password,
    displayName,
    hospitalId,
    doctorId,
    email,
    phone,
  };

  registered.push(newUser);
  localStorage.setItem("registered_users", JSON.stringify(registered));
  return { success: true, message: "Account created successfully" };
};

export const validateDemoCredential = (
  role: UserRole,
  username: string,
  password: string
): AuthUser | null => {
  const registered = getRegisteredUsers();
  const allCredentials = [...demoCredentials, ...registered];

  const match = allCredentials.find(
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
    email: match.email,
    phone: match.phone,
    verification_status: "APPROVED",
  };
};

export const getDemoCredentials = () => demoCredentials;