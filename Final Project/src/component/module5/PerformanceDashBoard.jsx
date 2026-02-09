import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../Navbar/Navbar";
import logo from "../../logo/logo.png";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import "../../CSSDesgin5/PerformanceDashboard.css";

const marketPrices = [
  { month: "Jan", price: 10 }, { month: "Feb", price: 11.5 },
  { month: "Mar", price: 12.6 }, { month: "Apr", price: 12.0 },
  { month: "May", price: 12.2 }, { month: "Jun", price: 11.8 },
  { month: "Jul", price: 11.0 }, { month: "Aug", price: 11.6 },
  { month: "Sep", price: 12.1 }, { month: "Oct", price: 12.8 },
  { month: "Nov", price: 13.5 }, { month: "Dec", price: 14.0 }
];

function PerformanceDashboard() {
  const navigate = useNavigate();

  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
  const investorId = loggedInUser.investorId || loggedInUser.id;

  const [portfolios, setPortfolios] = useState([]);
  const [selectedId, setSelectedId] = useState("");

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!investorId) {
      console.error("No investor found in session.");
      navigate("/"); 
    }
  }, [investorId, navigate]);
  useEffect(() => {
    if (!investorId) return;

    let cancelled = false;

    fetch(`http://localhost:8303/api/portfolios/investor/${investorId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch portfolios");
        return res.json();
      })
      .then((data) => {
        if (cancelled) return;

        setPortfolios(data);
        setSelectedId(data?.[0]?.portfolioId || "");
        setLoading(false);
      })
      .catch((err) => {
        console.error("API Error:", err);
        if (cancelled) return;
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [investorId]);

  const activeData = useMemo(() => {
    return portfolios.find((p) => String(p.portfolioId) === String(selectedId)) || null;
  }, [selectedId, portfolios]);

  const { monthlyData, totalReturn, volatility, riskAdjusted, pieData } = useMemo(() => {
    const qty = activeData?.quantity || 0;
    const invested = activeData?.investedAmount || 0;

    const mData = marketPrices.map((p) => ({
      name: p.month,
      value: Number((p.price * qty).toFixed(2)),
    }));

    const currentVal = mData.length > 0 ? mData[mData.length - 1].value : 0;
    const ret =
      invested > 0 ? (((currentVal - invested) / invested) * 100).toFixed(2) : "0.00";

    let vol = 0;
    if (mData.length >= 2) {
      const returns = mData
        .slice(1)
        .map((x, i) => ((x.value - mData[i].value) / mData[i].value) * 100);

      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      vol = Math.sqrt(
        returns.reduce((s, x) => s + Math.pow(x - mean, 2), 0) / returns.length
      );
    }

    const volFixed = vol.toFixed(2);
    const riskAdj = vol > 0 ? (ret / vol).toFixed(2) : "0.00";

    const pData = [
      { name: "Return %", val: Math.abs(parseFloat(ret)), color: "#0ea5e9" },
      { name: "Volatility", val: Math.abs(parseFloat(volFixed)), color: "#f43f5e" },
      { name: "Risk-Adj", val: Math.abs(parseFloat(riskAdj)), color: "#8b5cf6" },
    ];

    return {
      monthlyData: mData,
      totalReturn: ret,
      volatility: volFixed,
      riskAdjusted: riskAdj,
      pieData: pData,
    };
  }, [activeData]);

  if (loading) return <div className="light-loader">Analyzing Market Data...</div>;

  const reportPayload = {
    portfolioName: activeData?.portfolioName,
    metrics: { totalReturn, volatility, riskAdjusted },
    chartData: monthlyData,
    pieData: pieData,
    generatedAt: new Date().toLocaleString(),
  };

  const myLoginOptions = (
    <div className="home-links">
      <Link to="/investordashboard" className="ad">Home</Link>
      <Link to="/P1" className="ad active">Performance Dashboard</Link>
      <Link to="/P2" state={{ reportData: reportPayload }} className="ad">Export Report</Link>
    </div>
  );

  return (
    <div className="performance-page">
      <Navbar loginOptions={myLoginOptions} />

      <div className="report-container-fluid">
        <section className="portfolio-selector-bar">
          <div className="selector-label">Your Active Portfolios:</div>
          <div className="selector-scroll">
            {portfolios.length > 0 ? (
              portfolios.map((p) => (
                <div
                  key={p.portfolioId}
                  className={`portfolio-card-mini ${
                    String(selectedId) === String(p.portfolioId) ? "active" : ""
                  }`}
                  onClick={() => setSelectedId(p.portfolioId)}
                >
                  <span className="p-id">PF-{p.portfolioId}</span>
                  <span className="p-name">{p.portfolioName}</span>
                </div>
              ))
            ) : (
              <div className="no-data-msg">No portfolios found for your account.</div>
            )}
          </div>
        </section>

        <main className="report-main">
          {activeData ? (
            <>
              <header className="report-header">
                <div className="header-info">
                  <h1>
                    Performance Report: <span>{activeData.portfolioName}</span>
                  </h1>
                  <p>
                    Status: {activeData.status} • Current Holding:{" "}
                    {activeData.quantity || 0} Units
                  </p>
                </div>
              </header>

              <section className="metrics-summary">
                <div className="metric-card return">
                  <label>Net Returns</label>
                  <h3 className="text-blue">{totalReturn}%</h3>
                </div>
                <div className="metric-card volatility">
                  <label>Volatility</label>
                  <h3 className="text-red">{volatility}</h3>
                </div>
                <div className="metric-card efficiency">
                  <label>Efficiency Score</label>
                  <h3 className="text-purple">{riskAdjusted}</h3>
                </div>
              </section>

              <div className="analytics-grid">
                <div className="chart-panel">
                  <h4>Growth Projection (USD)</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyData}>
                      <defs>
                        <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f1f5f9"
                      />
                      <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 12 }} />
                      <YAxis tick={{ fill: "#64748b", fontSize: 12 }} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#0ea5e9"
                        fill="url(#colorVal)"
                        strokeWidth={3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="chart-panel">
                  <h4>Metric Distribution</h4>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="val"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={5}
                        label={({ name, val }) => `${name}: ${val}`}
                        labelLine={true}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            <div className="empty-state">Select a portfolio to view analysis.</div>
          )}
        </main>
      </div>

      <footer className="home-footer1">
        <img src={logo} alt="logo" className="hero-logo-footer" />
        <h5>© 2026 PortSure – Portfolio Risk Analysis & Investment Compliance System</h5>
      </footer>
    </div>
  );
}

export default PerformanceDashboard;