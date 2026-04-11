const Doctors = () => {
  const doctors = [
    { id: 1, name: "Dr. Emily Johnson", specialty: "Cardiology", status: "Available" },
    { id: 2, name: "Dr. Michael Chen", specialty: "Neurology", status: "Busy" },
    { id: 3, name: "Dr. Sarah Martinez", specialty: "Pediatrics", status: "Available" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>Doctors</h1>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
        {doctors.map((doc) => (
          <div
            key={doc.id}
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              width: "250px"
            }}
          >
            <div style={{ marginBottom: "10px", fontWeight: "bold" }}>
              {doc.name}
            </div>

            <div style={{ color: "#64748b", marginBottom: "10px" }}>
              {doc.specialty}
            </div>

            <div
              style={{
                padding: "5px 10px",
                borderRadius: "20px",
                display: "inline-block",
                background: doc.status === "Available" ? "#d1fae5" : "#fee2e2",
                color: doc.status === "Available" ? "#065f46" : "#991b1b",
                fontSize: "12px"
              }}
            >
              {doc.status}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Doctors;