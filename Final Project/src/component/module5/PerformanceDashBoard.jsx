
// import React, { useEffect, useState, useMemo } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import Navbar from "../../Navbar/Navbar";
// import logo from "../../logo/logo.png";
// import {
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   Tooltip,
//   CartesianGrid,
//   ResponsiveContainer
// } from "recharts";
// import "../../CSSDesgin5/PerformanceDashboard.css";

// const marketPrices = [
//   { month: "Jan", price: 10 },
//   { month: "Feb", price: 11.5 },
//   { month: "Mar", price: 12.6 },
//   { month: "Apr", price: 12.0 },
//   { month: "May", price: 12.2 },
//   { month: "Jun", price: 11.8 },
//   { month: "Jul", price: 11.0 },
//   { month: "Aug", price: 11.6 },
//   { month: "Sep", price: 12.1 },
//   { month: "Oct", price: 12.8 },
//   { month: "Nov", price: 13.5 },
//   { month: "Dec", price: 14.0 }
// ];

// function PerformanceDashboard() {
//   const navigate = useNavigate();

//   const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
//   const investorId = loggedInUser.investorId || loggedInUser.id;

//   const [portfolios, setPortfolios] = useState([]);
//   const [selectedId, setSelectedId] = useState("");
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!investorId) navigate("/");
//   }, [investorId, navigate]);

//   useEffect(() => {
//     fetch(`http://localhost:8303/api/portfolios/investor/${investorId}`)
//       .then(res => res.json())
//       .then(data => {
//         setPortfolios(data || []);
//         setSelectedId(data?.[0]?.portfolioId || "");
//         setLoading(false);
//       })
//       .catch(() => setLoading(false));
//   }, [investorId]);

//   const activeData = useMemo(() => {
//     return portfolios.find(
//       p => String(p.portfolioId) === String(selectedId)
//     );
//   }, [selectedId, portfolios]);

//   const allowedStatuses = ["APPROVED", "EXECUTED", "COMPLETED"];

//   const {
//     monthlyData,
//     totalReturn,
//     volatility,
//     riskAdjusted,
//     finalValue
//   } = useMemo(() => {
//     if (
//       !activeData ||
//       !allowedStatuses.includes(
//         String(activeData.status || "").toUpperCase()
//       )
//     ) {
//       return {
//         monthlyData: marketPrices.map(p => ({ name: p.month, value: 0 })),
//         totalReturn: "0.00",
//         volatility: "0.00",
//         riskAdjusted: "0.00",
//         finalValue: 0
//       };
//     }

//     const invested = Number(activeData.investedAmount || 0);

//     const sorted = [...portfolios].sort(
//       (a, b) => a.portfolioId - b.portfolioId
//     );

//     const index = sorted.findIndex(
//       p => p.portfolioId === activeData.portfolioId
//     );

//     const positiveCount = Math.ceil(sorted.length / 2);
//     const isPositive = index < positiveCount;

//     const baseGrowth = isPositive ? 0.06 : -0.05;

//     const mData = marketPrices.map((p, i) => {
//       const noise = Math.sin((i + 1) * (index + 1)) * 0.03;
//       return {
//         name: p.month,
//         value: Number((invested * (1 + baseGrowth + noise)).toFixed(2))
//       };
//     });

//     const finalVal = mData[mData.length - 1].value;

//     const ret = invested
//       ? (((finalVal - invested) / invested) * 100).toFixed(2)
//       : "0.00";

//     const returns = mData.slice(1).map((v, i) =>
//       ((v.value - mData[i].value) / mData[i].value) * 100
//     );

//     const mean = returns.reduce((a, b) => a + b, 0) / returns.length;

//     const vol = Math.sqrt(
//       returns.reduce((s, r) => s + Math.pow(r - mean, 2), 0) /
//         returns.length
//     ).toFixed(2);

//     const riskAdj = vol > 0 ? (ret / vol).toFixed(2) : "0.00";

//     return {
//       monthlyData: mData,
//       totalReturn: ret,
//       volatility: vol,
//       riskAdjusted: riskAdj,
//       finalValue: finalVal
//     };
//   }, [activeData, portfolios]);

//   if (loading) {
//     return <div className="light-loader">Analyzing Market Data...</div>;
//   }

//   const gainLoss = finalValue - (activeData?.investedAmount || 0);
//   const profitStatus =
//     gainLoss > 0 ? "PROFIT" : gainLoss < 0 ? "LOSS" : "NO CHANGE";

//   const myLoginOptions = (
//     <div className="home-links">
//       <Link to="/investordashboard" className="ad">Home</Link>
//       <Link to="/P1" className="ad active">Performance Dashboard</Link>
//     </div>
//   );

//   return (
//     <div className="performance-page">
//       <Navbar loginOptions={myLoginOptions} />

//       <div className="report-container-fluid">
//         <section className="portfolio-selector-bar">
//           <div className="selector-label">Your Active Portfolios:</div>
//           <div className="selector-scroll">
//             {portfolios.map(p => (
//               <div
//                 key={p.portfolioId}
//                 className={`portfolio-card-mini ${
//                   String(selectedId) === String(p.portfolioId) ? "active" : ""
//                 }`}
//                 onClick={() => setSelectedId(p.portfolioId)}
//               >
//                 <span className="p-id">PF-{p.portfolioId}</span>
//                 <span className="p-name">{p.portfolioName}</span>
//               </div>
//             ))}
//           </div>
//         </section>

//         <main className="report-main">
//           <h1>Performance Report</h1>

//           <section className="metrics-summary">
//             <div className="metric-card return">
//               <label>Net Returns</label>
//               <h3>{totalReturn}%</h3>
//             </div>
//             <div className="metric-card volatility">
//               <label>Volatility</label>
//               <h3>{volatility}</h3>
//             </div>
//             <div className="metric-card efficiency">
//               <label>Efficiency Score</label>
//               <h3>{riskAdjusted}</h3>
//             </div>
//           </section>

//           {/* ===== GRAPH ===== */}
//           <div className="chart-panel">
//             <h4>Growth Projection (USD)</h4>
//             <ResponsiveContainer width="100%" height={300}>
//               <AreaChart data={monthlyData}>
//                 <CartesianGrid strokeDasharray="3 3" />
//                 <XAxis dataKey="name" />
//                 <YAxis />
//                 <Tooltip />
//                 <Area
//                   type="monotone"
//                   dataKey="value"
//                   stroke="#0ea5e9"
//                   fill="#bae6fd"
//                 />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>

//           {/* ✅ GAP ADDED HERE */}
//           <div style={{ marginTop: "40px" }} />

//           {/* ===== TABLE ===== */}
//           <div className="chart-panel">
//             <h4>Portfolio Performance Summary</h4>

//             <table className="history-table">
//               <thead>
//                 <tr>
//                   <th>Portfolio ID</th>
//                   <th>Initial Investment</th>
//                   <th>Current Value</th>
//                   <th>Gain / Loss</th>
//                   <th>Status</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr>
//                   <td>PF-{activeData?.portfolioId}</td>
//                   <td>₹ {activeData?.investedAmount}</td>
//                   <td>₹ {finalValue.toFixed(2)}</td>
//                   <td
//                     style={{
//                       color: gainLoss >= 0 ? "green" : "red",
//                       fontWeight: "bold"
//                     }}
//                   >
//                     ₹ {gainLoss.toFixed(2)}
//                   </td>
//                   <td
//                     style={{
//                       color: profitStatus === "PROFIT" ? "green" : "red",
//                       fontWeight: "bold"
//                     }}
//                   >
//                     {profitStatus}
//                   </td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>
//         </main>
//       </div>

//       <footer className="home-footer1">
//         <img src={logo} alt="logo" className="hero-logo-footer" />
//         <h5>© 2026 PortSure – Portfolio Risk Analysis</h5>
//       </footer>
//     </div>
//   );
// }

// export default PerformanceDashboard;
import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../../Navbar/Navbar";
import logo from "../../logo/logo.png";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from "recharts";
import "../../CSSDesgin5/PerformanceDashboard.css";

const marketPrices = [
  { month: "Jan", price: 10 },
  { month: "Feb", price: 11.5 },
  { month: "Mar", price: 12.6 },
  { month: "Apr", price: 12.0 },
  { month: "May", price: 12.2 },
  { month: "Jun", price: 11.8 },
  { month: "Jul", price: 11.0 },
  { month: "Aug", price: 11.6 },
  { month: "Sep", price: 12.1 },
  { month: "Oct", price: 12.8 },
  { month: "Nov", price: 13.5 },
  { month: "Dec", price: 14.0 }
];

function PerformanceDashboard() {
  const navigate = useNavigate();

  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");
  const investorId = loggedInUser.investorId || loggedInUser.id;

  const [portfolios, setPortfolios] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!investorId) navigate("/");
  }, [investorId, navigate]);

  useEffect(() => {
    fetch(`http://localhost:8303/api/portfolios/investor/${investorId}`)
      .then(res => res.json())
      .then(data => {
        setPortfolios(data || []);
        setSelectedId(data?.[0]?.portfolioId || "");
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [investorId]);

  const activeData = useMemo(() => {
    return portfolios.find(
      p => String(p.portfolioId) === String(selectedId)
    );
  }, [selectedId, portfolios]);

  const allowedStatuses = ["APPROVED", "EXECUTED", "COMPLETED"];

  const {
    monthlyData,
    totalReturn,
    volatility,
    riskAdjusted,
    finalValue
  } = useMemo(() => {
    if (
      !activeData ||
      !allowedStatuses.includes(
        String(activeData.status || "").toUpperCase()
      )
    ) {
      return {
        monthlyData: marketPrices.map(p => ({ name: p.month, value: 0 })),
        totalReturn: "0.00",
        volatility: "0.00",
        riskAdjusted: "0.00",
        finalValue: 0
      };
    }

    const invested = Number(activeData.investedAmount || 0);

    const sorted = [...portfolios].sort(
      (a, b) => a.portfolioId - b.portfolioId
    );

    const index = sorted.findIndex(
      p => p.portfolioId === activeData.portfolioId
    );

    const positiveCount = Math.ceil(sorted.length / 2);
    const isPositive = index < positiveCount;

    const baseGrowth = isPositive ? 0.06 : -0.05;

    const mData = marketPrices.map((p, i) => {
      const noise = Math.sin((i + 1) * (index + 1)) * 0.03;
      return {
        name: p.month,
        value: Number((invested * (1 + baseGrowth + noise)).toFixed(2))
      };
    });

    const finalVal = mData[mData.length - 1].value;

    const ret = invested
      ? (((finalVal - invested) / invested) * 100).toFixed(2)
      : "0.00";

    const returns = mData.slice(1).map((v, i) =>
      ((v.value - mData[i].value) / mData[i].value) * 100
    );

    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;

    const vol = Math.sqrt(
      returns.reduce((s, r) => s + Math.pow(r - mean, 2), 0) /
      returns.length
    ).toFixed(2);

    const riskAdj = vol > 0 ? (ret / vol).toFixed(2) : "0.00";

    return {
      monthlyData: mData,
      totalReturn: ret,
      volatility: vol,
      riskAdjusted: riskAdj,
      finalValue: finalVal
    };
  }, [activeData, portfolios]);

  if (loading) {
    return <div className="light-loader">Analyzing Market Data...</div>;
  }

  const gainLoss = finalValue - (activeData?.investedAmount || 0);
  const profitStatus =
    gainLoss > 0 ? "PROFIT" : gainLoss < 0 ? "LOSS" : "NO CHANGE";

  const reportPayload = {
    portfolioId: activeData.portfolioId,
    portfolioName: activeData.portfolioName,
    investedAmount: activeData.investedAmount,
    finalValue,
    gainLoss,
    profitStatus,
    metrics: { totalReturn, volatility, riskAdjusted },
    generatedAt: new Date().toLocaleString()
  };

  const myLoginOptions = (
    <div className="home-links">
      <Link to="/investordashboard" className="ad">Home</Link>
      <Link to="/P1" className="ad active">Performance Dashboard</Link>
      <Link to="/P2" state={{ reportData: reportPayload }} className="ad">
        Export Report
      </Link>
    </div>
  );

  return (
    <div className="performance-page">
      <Navbar loginOptions={myLoginOptions} />

      <div className="report-container-fluid">
        <section className="portfolio-selector-bar">
          <div className="selector-label">Your Active Portfolios:</div>
          <div className="selector-scroll">
            {portfolios.map(p => (
              <div
                key={p.portfolioId}
                className={`portfolio-card-mini ${String(selectedId) === String(p.portfolioId) ? "active" : ""
                  }`}
                onClick={() => setSelectedId(p.portfolioId)}
              >
                <span className="p-id">PF-{p.portfolioId}</span>
                <span className="p-name">{p.portfolioName}</span>
              </div>
            ))}
          </div>
        </section>

        <main className="report-main">
          <section className="metrics-summary">
            <div className="metric-card return">
              <label>Net Returns</label>
              <h3>{totalReturn}%</h3>
            </div>
            <div className="metric-card volatility">
              <label>Volatility</label>
              <h3>{volatility}</h3>
            </div>
            <div className="metric-card efficiency">
              <label>Efficiency Score</label>
              <h3>{riskAdjusted}</h3>
            </div>
          </section>

          <div className="chart-panel">
            <h4>Growth Projection (USD)</h4>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#0ea5e9"
                  fill="#bae6fd"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div style={{ marginTop: "40px" }} />

          <div className="chart-panel">
            <h4>Portfolio Performance Summary</h4>
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
                  <td data-label="Portfolio ID">PF-{activeData.portfolioId}</td>
                  <td data-label="Initial Investment">₹ {activeData.investedAmount}</td>
                  <td data-label="Final Value">₹ {finalValue.toFixed(2)}</td>
                  <td data-label="Gain / Loss" style={{ color: gainLoss >= 0 ? "green" : "red" }}>
                    ₹ {gainLoss.toFixed(2)}
                  </td>
                  <td data-label="Status" style={{ fontWeight: "bold" }}>
                    {profitStatus}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </main>
      </div>

      <footer className="home-footer1">
        <img src={logo} alt="logo" className="hero-logo-footer" />
        <h5>© 2026 PortSure – Portfolio Risk Analysis</h5>
      </footer>
    </div>
  );
}

export default PerformanceDashboard;
