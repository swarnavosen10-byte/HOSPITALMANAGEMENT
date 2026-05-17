import { getUser } from "./auth";

export const getStaffHospitalId = () => {
  const user = getUser();
  if (!user) return 1;

  return user.activeHospitalId ?? user.hospitalId ?? user.hospitalIds?.[0] ?? 1;
};

export const getDoctorScope = () => {
  const user = getUser();
  const hospitalIds = user?.hospitalIds?.length
    ? user.hospitalIds
    : user?.hospitalId
      ? [user.hospitalId]
      : [1];
  const activeHospitalId = user?.activeHospitalId ?? hospitalIds[0] ?? 1;

  return {
    doctorId: user?.doctorId ?? 101,
    hospitalId: activeHospitalId,
    hospitalIds,
  };
};

export const getCurrentHospitalId = () => {
  const user = getUser();
  if (!user) return 1;

  return user.activeHospitalId ?? user.hospitalId ?? user.hospitalIds?.[0] ?? 1;
};
