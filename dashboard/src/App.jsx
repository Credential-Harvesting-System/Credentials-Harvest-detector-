import { useEffect, useState } from "react";

function App() {
  const [alerts, setAlerts] = useState([]);

  const fetchAlerts = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/alerts");
      const data = await res.json();
      console.log("🔥 FRONTEND RECEIVED:", data);
      setAlerts(data);
    } catch (error) {
      console.error("Error fetching alerts:", error);
    }
  };

  useEffect(() => {
    fetchAlerts();

    const interval = setInterval(fetchAlerts, 3000);

    return () => clearInterval(interval);
  }, []);

  // Risk logic
  const getRisk = (score) => {
    if (score >= 12) return "CRITICAL";
    if (score >= 8) return "HIGH";
    if (score >= 5) return "MEDIUM";
    return "LOW";
  };

  const getColor = (score) => {
    if (score >= 12) return "red";
    if (score >= 8) return "orange";
    if (score >= 5) return "gold";
    return "green";
  };

  // Summary counts
  const criticalCount = alerts.filter((a) => a.score >= 12).length;
  const mediumCount = alerts.filter(
    (a) => a.score >= 5 && a.score < 12
  ).length;

  const cardStyle = {
    background: "#1e293b",
    padding: "15px",
    borderRadius: "10px",
    minWidth: "150px",
    textAlign: "center",
    fontWeight: "bold",
  };

  return (
    <div
      style={{
        background: "#0f172a",
        minHeight: "100vh",
        color: "white",
        padding: "20px",
        fontFamily: "Arial",
      }}
    >
      {/* Title */}
      <h1 style={{ fontSize: "28px", marginBottom: "20px" }}>
        🔐 Cybersecurity Threat Dashboard
      </h1>

      {/* Summary Cards */}
      <div style={{ display: "flex", gap: "20px", marginBottom: "20px" }}>
        <div style={cardStyle}>Total Alerts: {alerts.length}</div>
        <div style={cardStyle}>Critical: {criticalCount}</div>
        <div style={cardStyle}>Medium: {mediumCount}</div>
      </div>

      {/* Table */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#1e293b" }}>
            <th>ID</th>
            <th>Domain</th>
            <th>Score</th>
            <th>Risk</th>
            <th>Reason</th>
          </tr>
        </thead>

        <tbody>
          {alerts.map((alert) => (
            <tr
              key={alert.id}
              style={{
                borderBottom: "1px solid gray",
                textAlign: "center",
                background:
                  alert.score >= 12 ? "#3f0000" : "transparent",
              }}
            >
              <td>{alert.id}</td>
              <td>{alert.domain}</td>
              <td>{alert.score}</td>

              {/* Risk Column */}
              <td
                style={{
                  color: getColor(alert.score),
                  fontWeight: "bold",
                  animation:
                    alert.score >= 12 ? "blink 1s infinite" : "none",
                }}
              >
                {getRisk(alert.score)}
              </td>

              <td>{alert.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;