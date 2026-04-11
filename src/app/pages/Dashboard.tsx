const Dashboard = () => {
  const cards = [
    { title: "Total Patients", value: "1200" },
    { title: "Total Doctors", value: "40" },
    { title: "Appointments", value: "30" },
  ];

  return (
    <div>
      <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>Dashboard</h1>

      <div style={{ display: "flex", gap: "20px" }}>
        {cards.map((card, index) => (
          <div
            key={index}
            style={{
              background: "white",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              minWidth: "200px"
            }}
          >
            <h3 style={{ marginBottom: "10px" }}>{card.title}</h3>
            <p style={{ fontSize: "24px", fontWeight: "bold" }}>
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;