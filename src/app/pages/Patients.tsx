import { useEffect, useState } from "react";

type Patient = {
  id: number;
  name: string;
  age: number;
};

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [name, setName] = useState("");
  const [age, setAge] = useState("");

  const fetchPatients = () => {
    fetch("http://127.0.0.1:8000/patients")
      .then((res) => res.json())
      .then((data) => setPatients(data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const addPatient = async () => {
    if (!name || !age) {
      alert("Please enter both name and age");
      return;
    }

    const newPatient = {
      id: Date.now(),
      name: name,
      age: Number(age),
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/patients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newPatient),
      });

      const data = await response.json();
      console.log(data);

      setName("");
      setAge("");
      fetchPatients();
    } catch (error) {
      console.log("Error adding patient:", error);
    }
  };

  const deletePatient = async (id: number) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/patients/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      console.log(data);

      fetchPatients();
    } catch (error) {
      console.log("Error deleting patient:", error);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Patients</h1>

      {/* Add Patient Form */}
      <div className="bg-white rounded-xl shadow p-4 mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Enter patient name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full"
        />

        <input
          type="number"
          placeholder="Enter age"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full"
        />

        <button
          onClick={addPatient}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Patient
        </button>
      </div>

      {/* Patients Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="grid grid-cols-4 px-6 py-3 text-sm font-semibold text-gray-500 border-b">
          <span>Name</span>
          <span>Age</span>
          <span>Disease</span>
          <span>Action</span>
        </div>

        {patients.map((p) => (
          <div
            key={p.id}
            className="grid grid-cols-4 px-6 py-4 text-sm border-b border-gray-200/70 hover:bg-gray-50 transition"
          >
            <span className="font-medium text-gray-800">{p.name}</span>
            <span className="text-gray-600">{p.age}</span>
            <span className="text-gray-600">N/A</span>
            <button
              onClick={() => deletePatient(p.id)}
              className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 w-fit"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}