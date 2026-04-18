const Patients = () => {
  const patients = [
    { id: 1, name: "John Smith", age: 45, gender: "Male", disease: "Diabetes" },
    { id: 2, name: "Sarah Lee", age: 32, gender: "Female", disease: "Migraine" },
    { id: 3, name: "Rahul Sharma", age: 50, gender: "Male", disease: "Heart Disease" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>Patients</h1>

      <input
        type="text"
        placeholder="Search patients..."
        style={{
          padding: "10px",
          marginBottom: "20px",
          width: "300px",
          borderRadius: "6px",
          border: "1px solid #ccc"
        }}
      />

      <table style={{
        width: "100%",
        background: "white",
        borderRadius: "10px",
        overflow: "hidden"
      }}>
        <thead style={{ background: "#f1f5f9" }}>
          <tr>
            <th style={{ padding: "10px" }}>ID</th>
            <th style={{ padding: "10px" }}>Name</th>
            <th style={{ padding: "10px" }}>Age</th>
            <th style={{ padding: "10px" }}>Gender</th>
            <th style={{ padding: "10px" }}>Disease</th>
          </tr>
        </thead>

        <tbody>
          {patients.map((p) => (
            <tr key={p.id} style={{ textAlign: "center" }}>
              <td style={{ padding: "10px" }}>{p.id}</td>
              <td style={{ padding: "10px" }}>{p.name}</td>
              <td style={{ padding: "10px" }}>{p.age}</td>
              <td style={{ padding: "10px" }}>{p.gender}</td>
              <td style={{ padding: "10px" }}>{p.disease}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Patients;