import React from "react";
import Patients from "./components/Patients";
import Doctors from "./components/Doctors";
import Appointments from "./components/Appointments";

function App() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>Hospital Management System</h1>
      <Patients />
      <hr />
      <Doctors />
      <hr />
      <Appointments />
    </div>
  );
}

export default App;