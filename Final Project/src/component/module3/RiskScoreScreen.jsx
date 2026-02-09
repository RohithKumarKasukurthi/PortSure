import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import Navbar from "../../Navbar/Navbar";
import "../../CSSDesgin3/RiskScoreScreen.css";
import logo from "../../logo/logo.png";

const COLORS = ["#2563eb", "#22c55e", "#f59e0b"];

const calculateRiskValue = (allocation) => {
  const { Equity = 0, Bond = 0, Derivative = 0 } = allocation;
  return Math.min(100, Math.round(Equity * 0.7 + Bond * 0.3 + Derivative * 1.5));
};

const getRiskLevelDetails = (score) => {
  if (score >= 75) return { label: "High", className: "risk-high" };
  if (score >= 45) return { label: "Medium", className: "risk-med" };
  return { label: "Low", className: "risk-low" };
};

export default function RiskScoreScreen() {
  const [investors, setInvestors] = useState([]);
  const [selectedInvestorId, setSelectedInvestorId] = useState("");

  // Keep portfolios as a map keyed by STRING portfolioId to avoid JS key coercion surprises.
  const [portfolios, setPortfolios] = useState({});
  const [selectedPortfolioId, setSelectedPortfolioId] = useState(""); // string id

  const [allocation, setAllocation] = useState({ Equity: 0, Bond: 0, Derivative: 0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const navOptions = (
    <div className="home-links">
      <Link to="/C1" className="ad">Home</Link>
      <Link to="/C2" className="ad">Compliance Logs</Link>
      <Link to="/r" className="ad active">Risk Score</Link>
      <Link to="/r1" className="ad">Exposure Alert</Link>
    </div>
  );

  const fetchRiskHistory = useCallback(async (portfolioId) => {
    if (!portfolioId) return;

    try {
      const response = await fetch(`http://localhost:8304/api/risk-scores/portfolio/${portfolioId}`);
      if (response.ok) {
        const data = await response.json();
        setHistory([{
          id: "RISK-" + data.riskId,
          score: data.calculatedScore,
          level: data.riskLevel,
          date: data.calculationDate,
        }]);
      } else {
        setHistory([]);
      }
    } catch (error) {
      console.error("Risk history fetch failed:", error);
      setHistory([]);
    }
  }, []);

  // 1) Load investors
  useEffect(() => {
    const loadInvestors = async () => {
      try {
        // IMPORTANT:
        // Your backend controller earlier was @RequestMapping("/investors") and had:
        // GET /getAllInvestors
        // So the correct URL is:
        const response = await fetch("http://localhost:8302/api/investors/getAllInvestors");

        if (!response.ok) {
          const text = await response.text();
          console.error("Investors fetch failed:", response.status, text);
          setInvestors([]);
          return;
        }

        const data = await response.json();
        setInvestors(data);

        if (data.length > 0) {
          // Ensure it's a string for select control
          setSelectedInvestorId(String(data[0].investorId));
        }
      } catch (err) {
        console.error("Error loading investors:", err);
        setInvestors([]);
      }
    };

    loadInvestors();
  }, []);

  // 2) Load portfolios by selected investor
  useEffect(() => {
    if (!selectedInvestorId) return;

    const loadPortfoliosByInvestor = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://localhost:8303/api/portfolios/investor/${selectedInvestorId}`
        );

        if (!response.ok) {
          const text = await response.text();
          console.error("Portfolios fetch failed:", response.status, text);
          setPortfolios({});
          setSelectedPortfolioId("");
          setAllocation({ Equity: 0, Bond: 0, Derivative: 0 });
          setHistory([]);
          return;
        }

        const data = await response.json();

        const portfolioMap = {};
        data.forEach((p) => {
          portfolioMap[String(p.portfolioId)] = {
            name: p.portfolioName,
            Equity: p.equityPercentage || 0,
            Bond: p.bondPercentage || 0,
            Derivative: p.derivativePercentage || 0,
          };
        });

        setPortfolios(portfolioMap);

        const firstId = Object.keys(portfolioMap)[0];
        if (firstId) {
          // set selected portfolio + allocation + history
          setSelectedPortfolioId(firstId);
          setAllocation({
            Equity: portfolioMap[firstId].Equity,
            Bond: portfolioMap[firstId].Bond,
            Derivative: portfolioMap[firstId].Derivative,
          });
          fetchRiskHistory(firstId);
        } else {
          setSelectedPortfolioId("");
          setAllocation({ Equity: 0, Bond: 0, Derivative: 0 });
          setHistory([]);
        }
      } catch (err) {
        console.error("Error loading portfolios:", err);
        setPortfolios({});
        setSelectedPortfolioId("");
        setAllocation({ Equity: 0, Bond: 0, Derivative: 0 });
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    loadPortfoliosByInvestor();
  }, [selectedInvestorId, fetchRiskHistory]);

  const handlePortfolioChange = (id) => {
    const key = String(id);
    setSelectedPortfolioId(key);

    const p = portfolios[key];
    if (!p) {
      setAllocation({ Equity: 0, Bond: 0, Derivative: 0 });
      setHistory([]);
      return;
    }

    setAllocation({
      Equity: p.Equity,
      Bond: p.Bond,
      Derivative: p.Derivative,
    });

    fetchRiskHistory(key);
  };

  const handleCalculate = async () => {
    if (!selectedPortfolioId) return;

    const score = calculateRiskValue(allocation);
    const riskDetails = getRiskLevelDetails(score);

    const payload = {
      equityPercentage: allocation.Equity,
      bondPercentage: allocation.Bond,
      derivativePercentage: allocation.Derivative,
      calculatedScore: score,
      riskLevel: riskDetails.label,
    };

    try {
      const response = await fetch(
        `http://localhost:8304/api/risk-scores/calculate/${selectedPortfolioId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const text = await response.text();
        console.error("Risk save failed:", response.status, text);
        alert(text || "Failed to save risk score.");
        return;
      }

      alert(`Risk Score of ${score} saved to Audit Ledger.`);
      fetchRiskHistory(selectedPortfolioId);
    } catch {
      alert("Error connecting to Risk Service.");
    }
  };

  const currentScore = calculateRiskValue(allocation);
  const risk = getRiskLevelDetails(currentScore);

  return (
    <div className="home">
      <Navbar loginOptions={navOptions} />
      <main className="dashboard-content">
        <header className="content8">
          <h1>RISK MANAGEMENT ENGINE</h1>
        </header>

        <div className="flex-row">
          <section className="dashboard-section section-inputs">
            <h3>Portfolio Selector</h3>

            <div className="input-group">
              <label>Select Investor</label>
              <select
                value={selectedInvestorId}
                onChange={(e) => setSelectedInvestorId(String(e.target.value))}
              >
                {investors.map((inv) => (
                  <option key={inv.investorId} value={inv.investorId}>
                    {inv.fullName ?? "Unknown"} (ID: {inv.investorId})
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>Database Portfolio</label>
              <select
                value={selectedPortfolioId}
                onChange={(e) => handlePortfolioChange(e.target.value)}
                disabled={Object.keys(portfolios).length === 0}
              >
                {loading ? (
                  <option>Syncing...</option>
                ) : Object.keys(portfolios).length > 0 ? (
                  Object.keys(portfolios).map((id) => (
                    <option key={id} value={id}>
                      PF-{id}: {portfolios[id].name}
                    </option>
                  ))
                ) : (
                  <option>No Portfolios Found</option>
                )}
              </select>
            </div>

            <div className="input-group">
              <label>Allocation Adjustment (%)</label>
              {["Equity", "Bond", "Derivative"].map((asset) => (
                <div key={asset} className="asset-input">
                  <span>{asset}</span>
                  <input
                    type="number"
                    value={allocation[asset]}
                    onChange={(e) =>
                      setAllocation({ ...allocation, [asset]: Number(e.target.value) })
                    }
                  />
                </div>
              ))}
            </div>

            <button
              className="calc-btn"
              onClick={handleCalculate}
              disabled={!selectedPortfolioId}
            >
              Commit Analysis to Audit
            </button>
          </section>

          <section className="dashboard-section section-score">
            <h3>Risk Gauge</h3>
            <div className="score-circle">
              <span className="score-num">{currentScore}</span>
              <span className={`risk-badge ${risk.className}`}>{risk.label} Risk</span>
            </div>
          </section>

          <section className="dashboard-section section-chart">
            <h3>Exposure Distribution</h3>
            <div style={{ width: "100%", height: "220px" }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Equity", value: allocation.Equity },
                      { name: "Bond", value: allocation.Bond },
                      { name: "Derivative", value: allocation.Derivative },
                    ].filter((v) => v.value > 0)}
                    dataKey="value"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={true}
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>

        <section className="dashboard-section section-table">
          <h3>Recent RiskScore Entity Audit</h3>
          <table className="simple-table">
            <thead>
              <tr>
                <th>Risk ID</th>
                <th>Score</th>
                <th>Level</th>
                <th>Logged Date</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.map((h, i) => (
                  <tr key={i}>
                    <td>{h.id}</td>
                    <td><strong>{h.score}</strong></td>
                    <td>
                      <span className={`status-tag ${getRiskLevelDetails(h.score).className}`}>
                        {h.level}
                      </span>
                    </td>
                    <td>{h.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center" }}>
                    No audit found for this portfolio.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>

      <footer className="home-footer1">
        <img src={logo} alt="PortSure footer logo" className="hero-logo-footer" />
        <h5>© 2026 PortSure – Portfolio Risk Analysis & Investment Compliance System</h5>
      </footer>
    </div>
  );
}