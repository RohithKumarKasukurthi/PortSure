import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Snackbar } from "@mui/material";
import "../../CSSDesgin3/ExposureAlertScreen.css";
import Navbar from "../../Navbar/Navbar";
import logo from "../../logo/logo.png";

function getExposureData(allocation) {
  const equity = allocation?.Equity || 0;
  const bond = allocation?.Bond || 0;
  const derivative = allocation?.Derivative || 0;

  const total = equity + bond + derivative;
  if (total === 0) {
    return [
      { name: "Equity", value: 0 },
      { name: "Bond", value: 0 },
      { name: "Derivative", value: 0 },
    ];
  }

  return [
    { name: "Equity", value: (equity / total) * 100 },
    { name: "Bond", value: (bond / total) * 100 },
    { name: "Derivative", value: (derivative / total) * 100 },
  ];
}

const safeDate = (ts) => {
  if (!ts) return "N/A";

  // Works for ISO like: 2026-02-08T07:28:14.095+00:00
  const d1 = new Date(ts);
  if (!isNaN(d1.getTime())) return d1.toLocaleString();

  // Fallback for formats like: 2026-02-08 07:28:14
  const d2 = new Date(String(ts).replace(" ", "T"));
  if (!isNaN(d2.getTime())) return d2.toLocaleString();

  return String(ts);
};

export default function ExposureAlertScreen() {
  const [investors, setInvestors] = useState([]);
  const [selectedInvestorId, setSelectedInvestorId] = useState("");

  // map key: "PF-<id>"
  const [portfolios, setPortfolios] = useState({});
  const [loading, setLoading] = useState(false);

  const [selectedPortfolio, setSelectedPortfolio] = useState("");

  const [alertSent, setAlertSent] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [alertHistory, setAlertHistory] = useState([]);

  const [limits] = useState({
    Equity: 70,
    Bond: 10,
    Derivative: 20,
  });

  // 1) Load investors
  useEffect(() => {
    const loadInvestors = async () => {
      try {
        // Use ONE correct URL depending on your InvestorController.
        // If your controller is @RequestMapping("/api/investors") then keep this:
        const res = await fetch("http://localhost:8302/api/investors/getAllInvestors");
        // If instead it is @RequestMapping("/investors"), change to:
        // const res = await fetch("http://localhost:8302/investors/getAllInvestors");

        if (!res.ok) {
          const text = await res.text();
          console.error("Investors fetch failed:", res.status, text);
          setInvestors([]);
          setSelectedInvestorId("");
          return;
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setInvestors(list);

        if (list.length > 0) {
          setSelectedInvestorId(String(list[0].investorId));
        } else {
          setSelectedInvestorId("");
        }
      } catch (err) {
        console.error("Failed to load investors:", err);
        setInvestors([]);
        setSelectedInvestorId("");
      }
    };

    loadInvestors();
  }, []);

  // 2) Load portfolios for selected investor
  useEffect(() => {
    if (!selectedInvestorId) return;

    const loadPortfolios = async () => {
      setLoading(true);
      try {
        const investorId = Number(selectedInvestorId);

        const res = await fetch(`http://localhost:8303/api/portfolios/investor/${investorId}`);
        if (!res.ok) {
          const text = await res.text();
          console.error("Portfolios fetch failed:", res.status, text);
          setPortfolios({});
          setSelectedPortfolio("");
          return;
        }

        const data = await res.json();

        const map = {};
        (Array.isArray(data) ? data : []).forEach((p) => {
          const key = `PF-${p.portfolioId}`;
          map[key] = {
            dbId: p.portfolioId,
            name: p.portfolioName,
            Equity: p.equityPercentage || 0,
            Bond: p.bondPercentage || 0,
            Derivative: p.derivativePercentage || 0,
          };
        });

        setPortfolios(map);

        const firstKey = Object.keys(map)[0];
        setSelectedPortfolio(firstKey || "");
      } catch (err) {
        console.error("Failed to load portfolios:", err);
        setPortfolios({});
        setSelectedPortfolio("");
      } finally {
        setLoading(false);
      }
    };

    loadPortfolios();
  }, [selectedInvestorId]);

  // 3) Load alert history for selected portfolio
  useEffect(() => {
    const fetchHistory = async () => {
      const dbId = portfolios[selectedPortfolio]?.dbId;
      if (!dbId) {
        setAlertHistory([]);
        return;
      }

      try {
        const res = await fetch(`http://localhost:8305/api/alerts/portfolio/${dbId}`);

        if (!res.ok) {
          const text = await res.text();
          console.error("Alert history fetch failed:", res.status, text);
          setAlertHistory([]);
          return;
        }

        const data = await res.json();
        setAlertHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching alert history:", err);
        setAlertHistory([]);
      }
    };

    fetchHistory();
  }, [selectedPortfolio, portfolios, alertSent]);

  // reset warning display when switching portfolio
  useEffect(() => {
    setIsDismissed(false);
  }, [selectedPortfolio]);

  const allocation = portfolios[selectedPortfolio];
  const exposure = allocation ? getExposureData(allocation) : [];
  const activeBreaches = exposure.filter((e) => e.value > limits[e.name]);

  async function handleSendAlert() {
    const dbId = portfolios[selectedPortfolio]?.dbId;
    if (!dbId || activeBreaches.length === 0) return;

    const breachNames = activeBreaches.map((b) => b.name).join(", ");
    const firstBreach = activeBreaches[0];

    // A) ExposureAlertService payload (investorId is required if your alert DB has NOT NULL investorId)
    const alertPayload = {
      investorId: Number(selectedInvestorId),
      assetType: breachNames,
      exposureValue: parseFloat(firstBreach.value.toFixed(2)),
      limitValue: limits[firstBreach.name],
      status: "CRITICAL_BREACH",
    };

    // B) ComplianceReportService payload
    const compliancePayload = {
      portfolioId: dbId,
      // If your compliance table/entity has investorId, keep this; otherwise remove it.
      // investorId: Number(selectedInvestorId),
      regulationType: "Exposure Limit Policy",
      findings: `Automatic Breach Log: ${breachNames} recorded at ${firstBreach.value.toFixed(
        2
      )}% (Limit: ${limits[firstBreach.name]}%)`,
      date: new Date().toISOString().split("T")[0],
      status: "BREACH",
    };

    try {
      // 1) Save exposure alert
      const alertRes = await fetch(`http://localhost:8305/api/alerts/send/${dbId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(alertPayload),
      });

      if (!alertRes.ok) {
        const text = await alertRes.text();
        console.error("Alert API failed:", alertRes.status, text);
        alert(text || "Failed to save exposure alert.");
        return;
      }

      // 2) Save compliance log
      const complianceRes = await fetch(`http://localhost:8306/api/compliance/logs/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(compliancePayload),
      });

      if (!complianceRes.ok) {
        const text = await complianceRes.text();
        console.error("Compliance API failed:", complianceRes.status, text);
        alert(text || "Failed to save compliance log.");
        return;
      }

      const savedLog = await complianceRes.json();
      console.log("Compliance log saved:", savedLog);

      setAlertSent(true);
      setIsDismissed(true);
    } catch (err) {
      console.error("Alert/Compliance logging failed:", err);
      alert("Network error while sending alert/log.");
    }
  }

  const handleDeleteAlert = async (alertId) => {
    if (!window.confirm("Delete this alert record?")) return;

    try {
      const res = await fetch(`http://localhost:8305/api/alerts/delete/${alertId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Delete failed:", res.status, text);
        alert(text || "Delete failed");
        return;
      }

      setAlertHistory((prev) => prev.filter((a) => a.alertId !== alertId));
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Network error while deleting.");
    }
  };

  const navOptions = (
    <div className="home-links">
      <Link to="/C1" className="ad">Home</Link>
      <Link to="/C2" className="ad">Compliance Logs</Link>
      <Link to="/r" className="ad">Risk Score</Link>
      <Link to="/r1" className="ad active">Exposure Alert</Link>
    </div>
  );

  return (
    <div className="home">
      <Navbar loginOptions={navOptions} />
      <h2 className="exposure-title">EXPOSURE ALERTS</h2>

      <main className="exposure-main-content">
        <section className="selection-card">
          <h3 className="card-header-title">Portfolio Selection</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Investor</label>
              <select
                value={selectedInvestorId}
                onChange={(e) => setSelectedInvestorId(String(e.target.value))}
                className="simple-select"
              >
                <option value="" disabled>
                  Choose an Investor
                </option>
                {investors.map((inv) => (
                  <option key={inv.investorId} value={String(inv.investorId)}>
                    {inv.fullName ?? "Unknown"} (ID: {inv.investorId})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Portfolio</label>
              <select
                value={selectedPortfolio}
                onChange={(e) => setSelectedPortfolio(e.target.value)}
                className="simple-select"
                disabled={loading || Object.keys(portfolios).length === 0}
              >
                {loading ? (
                  <option>Loading...</option>
                ) : Object.keys(portfolios).length > 0 ? (
                  Object.keys(portfolios).map((p) => (
                    <option key={p} value={p}>
                      {p} - {portfolios[p].name}
                    </option>
                  ))
                ) : (
                  <option>No Portfolios Found</option>
                )}
              </select>
            </div>
          </div>
        </section>

        <section className="data-card exposure-details">
          <h3 className="card-header-title">Current Exposure Status</h3>

          <div className="alert-box-container">
            {activeBreaches.length > 0 && !isDismissed ? (
              <div className="simple-alert warning-alert">
                <div className="alert-text">
                  <strong>Warning!</strong> Exposure limit breached in{" "}
                  {activeBreaches.map((b) => b.name).join(", ")}.
                </div>
                <button className="alert-btn" onClick={handleSendAlert}>
                  Send Notification & Log Audit
                </button>
              </div>
            ) : (
              <div className="simple-alert success-alert">
                <strong>{isDismissed ? "Audit Captured:" : "Status Safe:"}</strong>
                {isDismissed ? " Compliance log created." : " Portfolio is within limits."}
              </div>
            )}
          </div>

          <div className="table-container">
            <table className="simple-exposure-table">
              <thead>
                <tr>
                  <th>Asset Type</th>
                  <th>Actual Exposure</th>
                  <th>Policy Limit</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {exposure.map((e) => (
                  <tr key={e.name}>
                    <td style={{ fontWeight: "600" }}>{e.name}</td>
                    <td className={e.value > limits[e.name] ? "text-danger" : ""}>
                      {e.value.toFixed(2)}%
                    </td>
                    <td>{limits[e.name]}%</td>
                    <td>
                      <span
                        className={`status-badge ${
                          e.value > limits[e.name] ? "breach" : "ok"
                        }`}
                      >
                        {e.value > limits[e.name] ? "BREACH" : "OK"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="data-card history-card">
          <h3 className="card-header-title">Historical Alert Log</h3>

          <div className="tablecontainer1">
            <table className="simpletable1">
              <thead>
                <tr>
                  <th>Asset Class</th>
                  <th>Value at Breach</th>
                  <th>Date & Time</th>
                  <th style={{ textAlign: "center" }}>Manage</th>
                </tr>
              </thead>
              <tbody>
                {alertHistory.length > 0 ? (
                  alertHistory.map((alert) => (
                    <tr key={alert.alertId}>
                      <td>{alert.assetType}</td>
                      <td className="text-danger">{alert.exposureValue}%</td>
                      <td style={{ color: "#666" }}>{safeDate(alert.timestamp)}</td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          onClick={() => handleDeleteAlert(alert.alertId)}
                          className="delete-btn-style"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: "center", padding: "30px", color: "#999" }}>
                      No history found for this portfolio.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Snackbar
        open={alertSent}
        autoHideDuration={3000}
        onClose={() => setAlertSent(false)}
        message="Compliance Alert & Audit Logged Successfully"
      />

      <footer className="home-footer1">
        <img src={logo} alt="PortSure footer logo" className="hero-logo-footer" />
        <h5>© 2025 PortSure – Portfolio Risk Analysis & Investment Compliance System</h5>
      </footer>
    </div>
  );
}