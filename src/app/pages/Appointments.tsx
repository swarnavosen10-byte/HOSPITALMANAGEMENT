const Appointments = () => {
  const appointments = [
    {
      id: 1,
      patient: "John Smith",
      doctor: "Dr. Emily Johnson",
      time: "10:00 AM",
      status: "Scheduled",
    },
    {
      id: 2,
      patient: "Sarah Lee",
      doctor: "Dr. Michael Chen",
      time: "11:30 AM",
      status: "Completed",
    },
    {
      id: 3,
      patient: "Rahul Sharma",
      doctor: "Dr. Sarah Martinez",
      time: "2:00 PM",
      status: "Cancelled",
    },
  ];

  return (
    <div>
      <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>
        Appointments
      </h1>

      <table
        style={{
          width: "100%",
          background: "white",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <thead style={{ background: "#f1f5f9" }}>
          <tr>
            <th style={{ padding: "12px" }}>ID</th>
            <th style={{ padding: "12px" }}>Patient</th>
            <th style={{ padding: "12px" }}>Doctor</th>
            <th style={{ padding: "12px" }}>Time</th>
            <th style={{ padding: "12px" }}>Status</th>
          </tr>
        </thead>

        <tbody>
          {appointments.map((a) => (
            <tr key={a.id} style={{ textAlign: "center" }}>
              <td style={{ padding: "12px" }}>{a.id}</td>
              <td style={{ padding: "12px" }}>{a.patient}</td>
              <td style={{ padding: "12px" }}>{a.doctor}</td>
              <td style={{ padding: "12px" }}>{a.time}</td>
              <td style={{ padding: "12px" }}>
                <span
                  style={{
                    padding: "5px 10px",
                    borderRadius: "20px",
                    background:
                      a.status === "Scheduled"
                        ? "#dbeafe"
                        : a.status === "Completed"
                        ? "#d1fae5"
                        : "#fee2e2",
                    color:
                      a.status === "Scheduled"
                        ? "#1e40af"
                        : a.status === "Completed"
                        ? "#065f46"
                        : "#991b1b",
                    fontSize: "12px",
                  }}
                >
                  {a.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Appointments;