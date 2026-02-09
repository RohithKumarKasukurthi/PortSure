import React, { useState, useEffect } from "react";
import Navbar from "../../Navbar/Navbar";
import "../../CSSDesgin4/ComplianceLogs.css";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import logo from "../../logo/logo.png";

export default function ComplianceLogs() {
  const [logs, setLogs] = useState([]);

  const fetchLogs = () => {
    fetch("http://localhost:8306/api/compliance/logs/all")
      .then(async (res) => {
        if (!res.ok) {
          console.error("Logs fetch failed:", res.status, await res.text());
          return [];
        }
        return res.json();
      })
      .then((data) => setLogs(Array.isArray(data) ? data : []))
      .catch((err) => console.error("Report Load Error:", err));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const deleteLog = async (logId) => {
    if (!window.confirm(`Are you sure you want to delete Log ID: ${logId}?`)) return;

    try {
      const response = await fetch(`http://localhost:8306/api/compliance/logs/${logId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Log deleted successfully.");
        fetchLogs();
      } else {
        alert("Failed to delete the log.");
        console.error("Delete failed:", response.status, await response.text());
      }
    } catch (err) {
      console.error("Delete Error:", err);
      alert("Connection error while trying to delete.");
    }
  };

  const generateCSV = () => {
    const headers = "LogID,PortfolioID,RegulationType,Findings,Date,Status\n";
    const csvData = logs
      .map(
        (l) =>
          `${l.logId},PF-${l.portfolioId},${l.regulationType},"${String(l.findings ?? "").replace(/"/g, '""')}",${l.date},${l.status}`
      )
      .join("\n");

    const blob = new Blob([headers + csvData], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Compliance_Report_${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Log ID", "Portfolio ID", "Regulation", "Findings", "Date", "Status"];
    const tableRows = logs.map((log) => [
      log.logId,
      `PF-${log.portfolioId}`,
      log.regulationType,
      log.findings,
      log.date,
      log.status,
    ]);

    doc.setFontSize(18);
    doc.text("Regulatory Compliance Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: "grid",
      headStyles: { fillColor: [30, 41, 59] },
    });

    doc.save(`Compliance_Report_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  const navOptions = (
    <div className="home-links">
      <Link to="/C1" className="ad">Home</Link>
      <Link to="/C2" className="ad active">Compliance Logs</Link>
      <Link to="/r" className="ad">Risk Score</Link>
      <Link to="/r1" className="ad">Exposure Alert</Link>
    </div>
  );

  return (
    <div className="report-container">
      <Navbar loginOptions={navOptions} />

      <div className="report-content">
        <div className="report-header">
          <h2>Regulatory Compliance Report</h2>
          <div className="export-actions">
            <button className="export-btn csv" onClick={generateCSV}>CSV</button>
            <button className="export-btn pdf" onClick={generatePDF}>PDF</button>
          </div>
        </div>

        <table className="compliance-table">
          <thead>
            <tr>
              <th>Log ID</th>
              <th>Portfolio ID</th>
              <th>Regulation Type</th>
              <th>Findings</th>
              <th>Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {logs.length > 0 ? (
              logs.map((log) => (
                <tr key={log.logId}>
                  <td>{log.logId}</td>
                  <td>PF-{log.portfolioId}</td>
                  <td>{log.regulationType}</td>
                  <td className="findings-text">{log.findings}</td>
                  <td>{log.date}</td>
                  <td>
                    <span className={`status-pill ${String(log.status || "").toLowerCase()}`}>
                      {log.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="delete-btn-small"
                      onClick={() => deleteLog(log.logId)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem" }}
                      title="Delete log"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No compliance logs available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="home-footer1">
        <img src={logo} alt="PortSure footer logo" className="hero-logo-footer" />
        <h5>© 2025 PortSure – Portfolio Risk Analysis & Investment Compliance System</h5>
      </footer>
    </div>
  );
}