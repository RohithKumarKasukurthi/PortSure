import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom'; // Added Link import
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import "../../CSSDesgin5/ReportExport.css";
import Navbar from '../../Navbar/Navbar';
import logo from "../../logo/logo.png";
function ReportExport() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const data = location.state?.reportData;
  if (!data) {
    return (
      <div className="report-export-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="error-container" style={{ textAlign: 'center' }}>
          <h2>No report data found.</h2>
          <p>Please generate a report from the performance dashboard first.</p>
          <button className="btn-cancel" onClick={() => navigate('/P1')}>Go to Dashboard</button>
        </div>
      </div>
    );
  }

  const downloadPDF = () => {
    const doc = new jsPDF();
    
    doc.text(`Official Portfolio Report: ${data.portfolioName}`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${data.generatedAt}`, 14, 22);

    const tableColumn = ["Metric", "Value"];
    const tableRows = [
      ["Portfolio Name", data.portfolioName],
      ["Total Returns", `${data.metrics.totalReturn}%`],
      ["Volatility", data.metrics.volatility],
      ["Efficiency (Risk-Adj)", data.metrics.riskAdjusted],
    ];

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 30,
      theme: 'striped',
      headStyles: { fillColor: [14, 165, 233] } 
    });

    doc.save(`${data.portfolioName}_Report.pdf`);
  };

  const downloadExcel = () => {
    const worksheetData = [
      ["Report Metric", "Value"],
      ["Portfolio Name", data.portfolioName],
      ["Total Returns (%)", data.metrics.totalReturn],
      ["Volatility", data.metrics.volatility],
      ["Efficiency Score", data.metrics.riskAdjusted],
      ["Generated At", data.generatedAt],
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Performance Report");
    XLSX.writeFile(workbook, `${data.portfolioName}_Data.xlsx`);
  };

  const myLoginOptions = (
    <div className="home-links">
      <Link to="/investordashboard" className="ad">Home</Link>
            <Link to="/P1" className="ad">Performance Dashboard</Link>
            <Link to="/P2"  className="ad active">Export Report</Link>
           
    </div>
  );

  return (
    <div className="report-export-page">
      <Navbar loginOptions={myLoginOptions} />
      
      <div className="report-export-container">
        <div className="export-preview">
          <header>
            <h1>Official Portfolio Report</h1>
            <p>Portfolio: <strong>{data.portfolioName}</strong></p>
            <p>Date: {data.generatedAt}</p>
          </header>

          <section className="metrics-display">
            <h3>Key Analytics</h3>
            <div className="metrics-grid">
              <div className="m-item">
                <label>Returns</label>
                <span className={parseFloat(data.metrics.totalReturn) >= 0 ? "text-success" : "text-danger"}>
                  {data.metrics.totalReturn}%
                </span>
              </div>
              <div className="m-item">
                <label>Volatility</label>
                <span>{data.metrics.volatility}</span>
              </div>
              <div className="m-item">
                <label>Risk-Adj</label>
                <span>{data.metrics.riskAdjusted}</span>
              </div>
            </div>
          </section>

          <div className="export-actions">
            <button className="pdf1" onClick={downloadPDF}>Download PDF</button>
            <button className="excel1" onClick={downloadExcel}>Download Excel</button>
           
          </div>
        </div>
      </div>
       <footer className="home-footer1">
              <img src={logo} alt="logo" className="hero-logo-footer" />
              <h5>© 2026 PortSure – Portfolio Risk Analysis & Investment Compliance System</h5>
            </footer>
    </div>
  );
}

export default ReportExport;