import { useEffect, useState } from "react";

type Doctor = {
  id: number;
  name: string;
  specialization: string;
};

export default function Doctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");

  const fetchDoctors = () => {
    fetch("http://127.0.0.1:8000/doctors")
      .then((res) => res.json())
      .then((data) => setDoctors(data))
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const addDoctor = async () => {
    if (!name || !specialization) {
      alert("Please enter both doctor name and specialization");
      return;
    }

    const newDoctor = {
      id: Date.now(),
      name: name,
      specialization: specialization,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/doctors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newDoctor),
      });

      const data = await response.json();
      console.log(data);

      setName("");
      setSpecialization("");
      fetchDoctors();
    } catch (error) {
      console.log("Error adding doctor:", error);
    }
  };

  const deleteDoctor = async (id: number) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/doctors/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();
      console.log(data);

      fetchDoctors();
    } catch (error) {
      console.log("Error deleting doctor:", error);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Doctors</h1>

      {/* Add Doctor Form */}
      <div className="bg-white rounded-xl shadow p-4 mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Enter doctor name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full"
        />

        <input
          type="text"
          placeholder="Enter specialization"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full"
        />

        <button
          onClick={addDoctor}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Add Doctor
        </button>
      </div>

      {/* Doctors List */}
      <div className="grid grid-cols-3 gap-6">
        {doctors.map((d) => (
          <div
            key={d.id}
            className="bg-white p-6 rounded-xl shadow hover:shadow-md transition"
          >
            <h2 className="font-bold text-lg">{d.name}</h2>
            <p className="text-gray-500 mb-4">{d.specialization}</p>

            <button
              onClick={() => deleteDoctor(d.id)}
              className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}