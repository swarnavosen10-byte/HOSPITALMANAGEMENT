import React, { useEffect, useState } from "react";
import axios from "axios";

function Appointments() {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/appointments")
      .then((response) => setAppointments(response.data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div>
      <h2>Appointments</h2>
      <ul>
        {appointments.map((appointment) => (
          <li key={appointment.id}>
            {appointment.patient} with {appointment.doctor}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Appointments;