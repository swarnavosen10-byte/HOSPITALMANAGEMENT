import React from "react";

const Settings = () => {
  return (
    <div>
      <h1 style={{ marginBottom: "5px" }}>Settings</h1>
      <p style={{ color: "gray", marginBottom: "20px" }}>
        Manage your account settings
      </p>

      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          maxWidth: "400px",
        }}
      >
        <div style={{ marginBottom: "15px" }}>
          <label>Name</label>
          <input style={inputStyle} placeholder="Admin User" />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>Email</label>
          <input style={inputStyle} placeholder="admin@hospital.com" />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>
            <input type="checkbox" /> Enable Notifications
          </label>
        </div>

        <button style={buttonStyle}>Save Changes</button>
      </div>
    </div>
  );
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px",
  marginTop: "5px",
  border: "1px solid #ccc",
  borderRadius: "5px",
};

const buttonStyle: React.CSSProperties = {
  padding: "10px",
  background: "#2563eb",
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
};

export default Settings;