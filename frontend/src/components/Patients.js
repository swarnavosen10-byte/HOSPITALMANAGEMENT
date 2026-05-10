import React, { useEffect, useState } from "react";
import axios from "axios";

function Patients() {
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/patients")
      .then((response) => setPatients(response.data))
      .catch((error) => console.error(error));
  }, []);

  return (
    <div>
      <h2>Patients</h2>
      <ul>
        {patients.map((patient) => (
          <li key={patient.id}>
            {patient.name} - Age {patient.age}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Patients;