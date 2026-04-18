import React from "react";

const invoices = [
  {
    id: "INV001",
    patient: "John Smith",
    amount: "$250",
    status: "Paid",
  },
  {
    id: "INV002",
    patient: "Sarah Lee",
    amount: "$180",
    status: "Pending",
  },
  {
    id: "INV003",
    patient: "Rahul Sharma",
    amount: "$300",
    status: "Overdue",
  },
];

const Billing = () => {
  return (
    <div style={{ padding: "20px" }}>
      {/* Page Title */}
      <h1 style={{ marginBottom: "5px" }}>Billing</h1>
      <p style={{ color: "gray", marginBottom: "20px" }}>
        Manage invoices and payments
      </p>

      {/* Table */}
      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f1f5f9" }}>
              <th style={thStyle}>Invoice ID</th>
              <th style={thStyle}>Patient</th>
              <th style={thStyle}>Amount</th>
              <th style={thStyle}>Status</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>

          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.id} style={{ borderBottom: "1px solid #e5e7eb" }}>
                <td style={tdStyle}>{inv.id}</td>
                <td style={tdStyle}>{inv.patient}</td>
                <td style={tdStyle}>{inv.amount}</td>
                <td style={tdStyle}>
                  <span
                    style={{
                      padding: "5px 10px",
                      borderRadius: "12px",
                      fontSize: "12px",
                      background:
                        inv.status === "Paid"
                          ? "#d1fae5"
                          : inv.status === "Pending"
                          ? "#fef3c7"
                          : "#fee2e2",
                      color:
                        inv.status === "Paid"
                          ? "#065f46"
                          : inv.status === "Pending"
                          ? "#92400e"
                          : "#991b1b",
                    }}
                  >
                    {inv.status}
                  </span>
                </td>
                <td style={tdStyle}>
                  <button
                    style={{
                      padding: "6px 12px",
                      border: "none",
                      borderRadius: "6px",
                      background: "#3b82f6",
                      color: "white",
                      cursor: "pointer",
                    }}
                  >
                    Pay
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const thStyle: React.CSSProperties = {
  padding: "10px",
  textAlign: "left",
};

const tdStyle: React.CSSProperties = {
  padding: "10px",
};

export default Billing;