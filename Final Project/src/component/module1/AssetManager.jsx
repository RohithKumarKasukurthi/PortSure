import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../CSSDesgin1/AssetManager.css';
import Navbar from '../../Navbar/Navbar';
import logo from '../../logo/logo.png';
import portfoliologo from '../../logo/profilelogo.jpg';

export default function AssetManager() {
  const [settlementData, setSettlementData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [profileOpen, setProfileOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeView, setActiveView] = useState("dashboard");

  const [profile, setProfile] = useState({
    staffId: "",
    name: "",
    email: "",
    role: "",
  });

  const navigate = useNavigate();

 useEffect(() => {
  const fetchManagerData = async () => {
    try {
     
      const response = await fetch('http://localhost:8303/api/portfolios/all');
      if (!response.ok) {
        const text = await response.text();
        console.error("Portfolio fetch failed:", response.status, text);
        return;
      }

      const portfolios = await response.json();

      const investorIds = Array.from(
        new Set(
          portfolios
            .map(p => p.investorId)
            .filter(id => id !== null && id !== undefined)
        )
      );

      // 3) Fetch investors (parallel)
      const investorResults = await Promise.allSettled(
        investorIds.map(async (id) => {
          const invRes = await fetch(`http://localhost:8302/api/investors/${id}`);
          if (!invRes.ok) throw new Error(`Investor ${id} fetch failed (${invRes.status})`);
          const inv = await invRes.json();
          return { id, fullName: inv.fullName };
        })
      );

      // 4) Build lookup map
      const investorNameById = {};
      for (const r of investorResults) {
        if (r.status === "fulfilled") {
          investorNameById[r.value.id] = r.value.fullName || "N/A";
        }
      }

      // 5) Build table rows
      const formattedData = portfolios.map(port => ({
        portfolio_id: port.portfolioId,
        investor_id: port.investorId,
        investor_name: investorNameById[port.investorId] || "N/A",
        equity: port.equityPercentage || 0,
        bond: port.bondPercentage || 0,
        derivative: port.derivativePercentage || 0,
        quantity: port.quantity || 0,
        price: port.price || port.investedAmount || 0,
        status: port.status ? port.status.toString().toUpperCase() : "PENDING"
      }));

      setSettlementData(formattedData);
    } catch (error) {
      console.error("Database connection error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  fetchManagerData();
}, []);

  useEffect(() => {
    const fetchProfileFromDB = async () => {
      if (activeView !== "profile") return;

      const userSession = JSON.parse(localStorage.getItem("user"));
      const staffId = userSession?.staffId;

      if (!staffId) {
        console.warn("No staffId in localStorage user. Cannot fetch profile.");
        return;
      }

      try {
        const url = `http://localhost:8307/api/internal/profile/${staffId}`;
        const response = await fetch(url);

        if (!response.ok) {
          const text = await response.text();
          console.error("Profile fetch failed:", response.status, text);
          return;
        }

        const dbUser = await response.json();

        setProfile({
          staffId: dbUser.staffId ?? "",
          name: dbUser.fullName ?? dbUser.name ?? "",
          email: dbUser.email ?? "",
          role: dbUser.role ?? "",
        });
      } catch (error) {
        console.error("Error fetching profile from database:", error);
      }
    };

    fetchProfileFromDB();
  }, [activeView]);

  const filteredData = settlementData.filter((item) => {
    const search = searchTerm.toLowerCase();
    return (
      item.investor_name.toLowerCase().includes(search) ||
      `PF-${item.portfolio_id}`.toLowerCase().includes(search)
    );
  });

  const myLoginOptions = (
    <div className="home-links">
      <button
        className={`ad ${activeView === "dashboard" ? "active" : ""}`}
        type="button"
        onClick={() => setActiveView("dashboard")}
      >
        Home
      </button>

      <Link to="/received-requests" className="ad">Requests</Link>

      <div
        className="profile-container"
        tabIndex="0"
        onBlur={() => setProfileOpen(false)}
      >
        <div
          className="profile-btn"
          onClick={() => setProfileOpen(!profileOpen)}
          style={{ cursor: "pointer" }}
        >
          <img src={portfoliologo} alt="Profile" />
        </div>

        {profileOpen && (
          <div className="profile-dropdown">
            <button
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                setProfileOpen(false);
                setActiveView("profile");
              }}
            >
              My Profile
            </button>

            <hr />

            <button
              type="button"
              className="logout-btn"
              onMouseDown={(e) => {
                e.preventDefault();
                setProfileOpen(false);
                localStorage.removeItem("user");
                navigate("/");
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );

  const totalExecuted = settlementData.filter(s => s.status === "APPROVED").length;
  const totalPending = settlementData.filter(s => s.status === "PENDING").length;

  return (
    <div className="asset-container">
      <Navbar loginOptions={myLoginOptions} />

      <main className="main-content">
        {activeView === "profile" ? (
          <div className="profile-page">
            <div className="profile-card">
              <div className="profile-banner">
                <button
                  type="button"
                  className="profile-back-btn"
                  onClick={() => setActiveView("dashboard")}
                >
                  Back
                </button>

                <div className="profile-banner-row">
                  <div className="profile-avatar-wrap">
                    <img className="profile-avatar-img" src={portfoliologo} alt="User" />
                  </div>

                  <div className="profile-banner-meta">
                    <h2 className="profile-name">{profile.name || "Loading..."}</h2>
                    <div className="profile-role">{profile.role?.replace('_', ' ')}</div>
                  </div>
                </div>
              </div>

              <div className="profile-body">
                <div className="profile-section-title">Account Details</div>
                <div className="profile-grid">
                  <div className="profile-field">
                    <span className="profile-label">Staff ID</span>
                    <div className="profile-value">STF-{profile.staffId}</div>
                  </div>

                  <div className="profile-field">
                    <span className="profile-label">Email Address</span>
                    <div className="profile-value">{profile.email}</div>
                  </div>

                  <div className="profile-field">
                    <span className="profile-label">Designation</span>
                    <div className="profile-value">{profile.role}</div>
                  </div>

                  <div className="profile-field">
                    <span className="profile-label">Account Security</span>
                    <div className="profile-value muted">Encrypted Password</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="dashboard-header">
              <h1 className="page-title">Asset Manager Dashboard</h1>
            </div>

            <div className="grid-2">
              <div className="card-2">
                <p>Total Pending Settlements</p>
                <h2 style={{ color: '#e11d48' }}>{totalPending}</h2>
              </div>
              <div className="card-2">
                <p>Total Executed Trades</p>
                <h2 style={{ color: '#16a34a' }}>{totalExecuted}</h2>
              </div>
            </div>

            <div className="section">
              <div className="section-header-flex">
                <h2 className="section-heading">Settlement Status</h2>
                <div className="search-box-container">
                  <input
                    type="text"
                    placeholder="Search Investor or PF-ID..."
                    className="table-search-input"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="history-list">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th>Portfolio ID</th>
                      <th>Investor Name</th>
                      <th>Asset Allocation</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan="7" style={{ textAlign: 'center' }}>Loading...</td></tr>
                    ) : filteredData.length > 0 ? (
                      filteredData.map((s) => (
                        <tr key={s.portfolio_id}>
                          <td style={{ fontWeight: 'bold' }}>PF-{s.portfolio_id}</td>
                          <td>{s.investor_name}</td>
                          <td>
                            {s.status === "PENDING" ? (
                              <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                                None (Awaiting Allocation)
                              </span>
                            ) : (
                              <div className="asset-type-badge">
                                <small>E: {s.equity}% | B: {s.bond}% | D: {s.derivative}%</small>
                              </div>
                            )}
                          </td>
                          <td>{s.quantity}</td>
                          <td>${s.price?.toLocaleString()}</td>
                          <td>
                            <span className={`status-pill ${s.status.toLowerCase()}`}>
                              {s.status === "APPROVED" ? "EXECUTED" : s.status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="view-btn"
                              onClick={() => navigate('/Driver', { state: { portfolio: s } })}
                            >
                              View Diversification
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan="7" style={{ textAlign: 'center' }}>No matching records found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      <footer className="home-footer1">
        <img src={logo} alt="logo" className="hero-logo-footer" />
        <h5>© 2026 PortSure – Portfolio Risk Analysis & Investment Compliance System</h5>
      </footer>
    </div>
  );
}