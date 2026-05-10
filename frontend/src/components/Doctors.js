import React, { useEffect, useState } from "react";
import axios from "axios";

function Doctors() {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/doctors")
      .then((response) => setDoctors(response.data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div>
      <h2>Doctors</h2>
      <ul>
        {doctors.map((doctor) => (
          <li key={doctor.id}>
            {doctor.name} - {doctor.specialization}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Doctors;