import React from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import Navbar from "../../Navbar/Navbar";
import logo from "../../logo/logo.png";
import "../../CSSDesgin5/ReportExport.css";
 
function ExportReport() {
  const location = useLocation();
  const navigate = useNavigate();
 
  const data = location.state?.reportData;
 
  if (!data) {
    return (
      <div className="report-export-container">
        <h2>No report data found</h2>
        <button onClick={() => navigate("/P1")}>Go to Dashboard</button>
      </div>
    );
  }
 
  const {
    portfolioId,
    portfolioName,
    investedAmount,
    finalValue,
    gainLoss,
    profitStatus,
    metrics,
    generatedAt
  } = data;
 
  const downloadPDF = () => {
    const doc = new jsPDF();
 
    doc.setFontSize(16);
    doc.text("Portfolio Performance Report", 14, 15);
 
    doc.setFontSize(10);
    doc.text(`Generated on: ${generatedAt}`, 14, 22);
 
    autoTable(doc, {
      startY: 30,
      head: [[
        "Portfolio ID",
        "Initial Investment",
        "Final Value",
        "Gain / Loss",
        "Status"
      ]],
      body: [[
        `PF-${portfolioId}`,
        investedAmount,
        finalValue.toFixed(2),
        gainLoss.toFixed(2),
        profitStatus
      ]]
    });
 
    autoTable(doc, {
      startY: doc.lastAutoTable.finalY + 10,
      head: [["Metric", "Value"]],
      body: [
        ["Total Return (%)", metrics.totalReturn],
        ["Volatility", metrics.volatility],
        ["Risk Score", metrics.riskAdjusted]
      ]
    });
 
    doc.save(`${portfolioName}_Report.pdf`);
  };
 
  const downloadExcel = () => {
    const sheetData = [
      ["Portfolio Performance Report"],
      [],
      ["Portfolio Name", portfolioName],
      ["Portfolio ID", `PF-${portfolioId}`],
      ["Initial Investment", investedAmount],
      ["Final Value", finalValue],
      ["Gain / Loss", gainLoss],
      ["Status", profitStatus],
      [],
      ["Metric", "Value"],
      ["Total Return (%)", metrics.totalReturn],
      ["Volatility", metrics.volatility],
      ["Risk Score", metrics.riskAdjusted],
      [],
      ["Generated At", generatedAt]
    ];
 
    const worksheet = XLSX.utils.aoa_to_sheet(sheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Portfolio Report");
 
    XLSX.writeFile(workbook, `${portfolioName}_Report.xlsx`);
  };
 
  const myLoginOptions = (
    <div className="home-links">
      <Link to="/investordashboard" className="ad">Home</Link>
      <Link to="/P1" className="ad">Performance Dashboard</Link>
      <Link to="/P2" className="ad active">Export Report</Link>
    </div>
  );
 
  return (
    <div className="report-export-page">
      <Navbar loginOptions={myLoginOptions} />
 
      <div className="report-export-container">
        <div className="export-preview">
          <h1>Portfolio Performance Report</h1>
 
          <table className="history-table">
            <thead>
              <tr>
                <th>Portfolio ID</th>
                <th>Initial Investment</th>
                <th>Final Value</th>
                <th>Gain / Loss</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>PF-{portfolioId}</td>
                <td>₹ {investedAmount}</td>
                <td>₹ {finalValue.toFixed(2)}</td>
                <td style={{ color: gainLoss >= 0 ? "green" : "red" }}>
                  ₹ {gainLoss.toFixed(2)}
                </td>
                <td style={{ fontWeight: "bold" }}>
                  {profitStatus}
                </td>
              </tr>
            </tbody>
          </table>
 
          <div className="export-actions">
            <button className="pdf1" onClick={downloadPDF}>
              Download PDF
            </button>
            <button className="excel1" onClick={downloadExcel}>
              Download Excel
            </button>
          </div>
        </div>
      </div>
 
      <footer className="home-footer1">
        <img src={logo} alt="logo" className="hero-logo-footer" />
        <h5>© 2026 PortSure – Portfolio Risk Analysis</h5>
      </footer>
    </div>
  );
}
 
export default ExportReport;
 