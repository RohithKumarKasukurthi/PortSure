import React, { useState, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../Navbar/Navbar';
import "../../CSSDesgin1/InvestorDashboard.css";
import logo from "../../logo/logo.png";
import Profilelogo from "../../logo/profilelogo.jpg";
import NotificationPanel from '../module2/TradeCature';
export default function InvestorDashboard() {
  const navigate = useNavigate();
  const loggedInUser = JSON.parse(localStorage.getItem('user') || '{}');
  const investorId = loggedInUser.investorId || loggedInUser.id;
  const [activeView, setActiveView] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState("");
  const [portfolioName, setPortfolioName] = useState("");
  const [investment, setInvestment] = useState("");
  const [portfolioData, setPortfolioData] = useState([]);

  const [expandedRowId, setExpandedRowId] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingPortfolioId, setEditingPortfolioId] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [editUser, setEditUser] = useState({ ...loggedInUser });
  const [passwords, setPasswords] = useState({ current: "", next: "" });

  const toggleRow = async (id) => {
    if (expandedRowId === id) {
      setExpandedRowId(null);
    } else {
      setExpandedRowId(id);
      try {
        const response = await fetch(`http://localhost:8304/api/risk-scores/portfolio/${id}`);
        if (response.ok) {
          const scoreData = await response.json();

          setPortfolioData(prevData => prevData.map(port =>
            port.portfolioId === id ? { ...port, riskScore: scoreData } : port
          ));
        }
      } catch (err) {
        console.error("Risk Score not found or server error:", err);
      }
    }
  };
  const fetchPortfolios = useCallback(async () => {
    if (!investorId) {
      console.error("Session missing: No Investor ID found.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8303/api/portfolios/investor/${investorId}`);
      if (response.ok) {
        const data = await response.json();
        setPortfolioData(data);
      } else {
        console.error("Failed to fetch portfolios:", response.status);
      }
    } catch (err) {
      console.error("Network Error (GET): Is Spring Boot running?", err);
    }
  }, [investorId]);

  const fetchAlerts = useCallback(async () => {
    if (!investorId || portfolioData.length === 0) return;

    try {
      const exposureRes = await fetch(`http://localhost:8305/api/alerts/investor/${investorId}`);
      const exposureData = exposureRes.ok ? await exposureRes.json() : [];

      const compliancePromises = portfolioData.map(port =>
        fetch(`http://localhost:8306/api/compliance/logs/portfolio/${port.portfolioId}`)
          .then(res => res.json())
      );

      const allLogsArrays = await Promise.all(compliancePromises);

      const breaches = allLogsArrays.flat()
        .filter(log => log.status === "BREACH" || log.status === "NON-COMPLIANT")
        .map((log, index) => ({
          ...log,

          portfolioId: log.portfolio?.portfolioId || log.portfolioId || "N/A",
          date: log.timestamp || log.date || new Date().toISOString(),
          id: log.id || `compliance-${index}`,

          alertType: "Compliance Breach",
          message: log.findings || "No findings reported"
        }));

      setAlerts([...exposureData, ...breaches]);

    } catch (err) {
      console.error("Error fetching notification alerts:", err);
    }
  }, [investorId, portfolioData]);
  useEffect(() => {
    if (portfolioData.length > 0) {
      fetchAlerts();
    }
  }, [portfolioData.length]);
  useEffect(() => {
    if (investorId) {
      fetchPortfolios();
    }
  }, [fetchPortfolios, investorId]);

  const handleResendClick = (port) => {
    setPortfolioName(port.portfolioName);
    setInvestment(port.investedAmount);
    setEditingPortfolioId(port.portfolioId);
    setIsEditMode(true);
    setActiveView('createPortfolio');
  };

  const resetForm = () => {
    setPortfolioName("");
    setInvestment("");
    setIsEditMode(false);
    setEditingPortfolioId(null);
    setActiveView('dashboard');
  };

  const handleSendRequest = async () => {
    if (!investorId) {
      alert("Session expired. Please log in again.");
      navigate('/');
      return;
    }

    if (!portfolioName || !investment) {
      alert("Please enter portfolio name and amount.");
      return;
    }

    const payload = {
      portfolioName: portfolioName,
      investedAmount: parseFloat(investment)
    };

    try {
      const url = isEditMode
        ? `http://localhost:8303/api/portfolios/resubmit/${editingPortfolioId}`
        : `http://localhost:8303/api/portfolios/submit/${investorId}`;

      const response = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const data = await response.json();
        alert(isEditMode ? `Request for PF-${editingPortfolioId} resent!` : `Success! Portfolio PF-${data.portfolioId} created.`);

        fetchPortfolios();
        resetForm();
      } else {
        const errorText = await response.text();
        console.error("Backend Error:", errorText);
        alert("Server Error: " + errorText);
      }
    } catch (error) {
      console.error("Connection Error:", error);
      alert("Could not connect to the server.");
    }
  };
  const handleUpdateProfile = async () => {
    try {
      const response = await fetch(`http://localhost:8302/api/investors/update/${investorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editUser),
      });

      if (response.ok) {
        const updatedData = await response.json();
        localStorage.setItem('user', JSON.stringify(updatedData));
        alert("Profile updated successfully!");
        setActiveView('profile');
        window.location.reload();
      } else {
        alert("Failed to update profile.");
      }
    } catch (err) {
      console.error("Update Error:", err);
      alert("Connection error while updating profile.");
    }
  };
  const handlePasswordUpdate = async () => {
    if (!passwords.current || !passwords.next) {
      alert("Please fill in both fields.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8302/api/investors/update-password/${investorId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: passwords.current,
          fullName: passwords.next
        }),
      });

      const message = await response.text();
      if (response.ok) {
        alert("Password updated successfully!");
        setPasswords({ current: "", next: "" });
        setActiveView('dashboard');
      } else {
        alert(message);
      }
    } catch (err) {
      console.error("Password Update Error:", err);
    }
  };
  const filteredPortfolios = portfolioData.filter(port =>
    (port.portfolioName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
    (port.portfolioId?.toString() || "").includes(searchTerm.toLowerCase())
  );
  const navOptions = (
    <div className="home-links">
      <button
        onClick={resetForm}
        className={`ad ${activeView === 'dashboard' ? 'active' : ''}`}
      >
        Home
      </button>
      <Link to="/P1" className="ad">Performance Dashboard</Link>
      <div className="notification-icon" onClick={() => setActiveView('notifications')} style={{ cursor: 'pointer', position: 'relative' }}>
        🔔 {alerts.length > 0 && <span className="badge" style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', borderRadius: '50%', padding: '2px 5px', fontSize: '10px' }}>{alerts.length}</span>}
      </div>
      <div
        className="profile-container"
        tabIndex="0"
        onBlur={() => setProfileOpen(false)}
      >
        <div
          className="profile-btn"
          onClick={() => setProfileOpen(!profileOpen)}
        >
          <img src={Profilelogo} alt="Profile" />
        </div>
        {profileOpen && (
          <div className="profile-dropdown">
            <button onMouseDown={(e) => { e.preventDefault(); setProfileOpen(false); setActiveView('profile'); }}>My Profile</button>
            <button onMouseDown={(e) => { e.preventDefault(); setProfileOpen(false); setActiveView('password'); }}>Update Password</button>
            <button onMouseDown={(e) => { e.preventDefault(); setProfileOpen(false); setActiveView('terms'); }}>Terms & Conditions</button>
            <hr />
            <button className="logout-btn" onMouseDown={(e) => {
              e.preventDefault();
              setProfileOpen(false);
              localStorage.removeItem('user');
              navigate('/');
            }}>Logout</button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <Navbar loginOptions={navOptions} />
      <div className='label'>Welcome {loggedInUser.fullName || "User"}!!</div>

      <main className="dashboard-content">
        {/* CREATE / EDIT PORTFOLIO VIEW */}
        {activeView === 'createPortfolio' && (
          <section className="inner-view-section">
            <div className="module-card1">
              <div className="module-header">
                <h3>{isEditMode ? `Resend Request (PF-${editingPortfolioId})` : "Create New Portfolio"}</h3>
                <button className="close-view-btn" onClick={resetForm}>Close</button>
              </div>
              <div className="form-container2">
                <div className="form-grid-2">
                  <label>Portfolio Name
                    <input
                      type="text"
                      placeholder="e.g. Tech Growth"
                      value={portfolioName}
                      onChange={(e) => setPortfolioName(e.target.value)}
                    />
                  </label>
                  <label>Initial Investment ($)
                    <input
                      type="number"
                      placeholder="0.00"
                      value={investment}
                      onChange={(e) => setInvestment(e.target.value)}
                    />
                  </label>
                </div>
                <button className="submit-btn2" onClick={handleSendRequest}>
                  {isEditMode ? "Confirm & Resend" : "Send Request"}
                </button>
              </div>
            </div>
          </section>
        )}

        {/* PROFILE VIEW */}
        {activeView === 'profile' && (
          <section className="inner-view-section">
            <div className="module-card1">
              <div className="module-header">
                <h3>My Profile</h3>
                <button className="close-view-btn" onClick={() => setActiveView('dashboard')}>Close</button>
              </div>
              <div className="profile-details">
                <img src={Profilelogo} className="large-profile-img" alt="User" />
                <div className="profile-info-grid">
                  <p><strong>Investor ID:</strong> INF-{loggedInUser.investorId || loggedInUser.id || 'N/A'}</p>
                  <p><strong>Name:</strong> {loggedInUser.fullName}</p>
                  <p><strong>Email:</strong> {loggedInUser.email}</p>
                  <p><strong>Phone:</strong> {loggedInUser.phoneNumber}</p>
                  <div style={{ marginTop: '20px', textAlign: 'center' }}>
                    <button className="submit-btn2" onClick={() => setActiveView('editProfile')}>
                      ✏️ Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
        {/* UPDATE PROFILE VIEW */}
        {activeView === 'editProfile' && (
          <section className="inner-view-section">
            <div className="module-card1">
              <div className="module-header">
                <h3>Update Profile</h3>
                <button className="close-view-btn" onClick={() => setActiveView('profile')}>Back</button>
              </div>
              <div className="form-container2">
                <div className="form-grid-2">
                  <label>Full Name
                    <input
                      type="text"
                      value={editUser.fullName || ""}
                      onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })}
                    />
                  </label>
                  <label>Phone Number
                    <input
                      type="text"
                      value={editUser.phoneNumber || ""}
                      onChange={(e) => setEditUser({ ...editUser, phoneNumber: e.target.value })}
                    />
                  </label>
                  <label>Email
                    <input
                      type="text"
                      value={editUser.email || ""}
                      onChange={(e) => setEditUser({ ...editUser, email: e.target.value })}
                    />
                  </label>
                </div>

                <button className="submit-btn2" onClick={handleUpdateProfile} style={{ marginTop: '20px' }}>
                  Save Changes
                </button>
              </div>
            </div>
          </section>
        )}
        {activeView === 'notifications' && (
          <NotificationPanel
            alerts={alerts}
            onClose={() => setActiveView('dashboard')}
          />
        )}
        {/* PASSWORD VIEW */}
        {activeView === 'password' && (
          <section className="inner-view-section">
            <div className="module-card1">
              <div className="module-header">
                <h3>Update Password</h3>
                <button className="close-view-btn" onClick={() => setActiveView('dashboard')}>Close</button>
              </div>
              <div className="form-container">
                <label>Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwords.current}
                  onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                />
                <label>New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={passwords.next}
                  onChange={(e) => setPasswords({ ...passwords, next: e.target.value })}
                />
                <button className="submit-btn" onClick={handlePasswordUpdate}>Update Password</button>
              </div>
            </div>
          </section>
        )}

        {/* TERMS VIEW */}
        {activeView === 'terms' && (
          <section className="inner-view-section">
            <div className="module-card1">
              <div className="module-header">
                <h3>Terms & Conditions</h3>
                <button className="close-view-btn" onClick={() => setActiveView('dashboard')}>Close</button>
              </div>
              <div className="terms-text">
                <p>1. Data Privacy: Your portfolio data is encrypted.</p>
                <p>2. Compliance: All reports follow SEBI standards.</p>
                <p>3. Usage: System is for authorized investor use only.</p>
              </div>
            </div>
          </section>
        )}

        {/* DASHBOARD SUMMARY & TABLE */}
        {activeView === 'dashboard' && (
          <>
            <section className="section-header">
              <div className="account-summary-grid">
                <div className="stat-card">
                  <div className="stat-icon portfolio-icon">📁</div>
                  <div className="stat-content"><p>Total Portfolios</p><h3>{portfolioData.length}</h3></div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon invested-icon">📈</div>
                  <div className="stat-content">
                    <p>Total Invested</p>
                    <h3>{portfolioData.reduce((acc, curr) => acc + (curr.investedAmount || 0), 0).toLocaleString()}</h3>
                  </div>
                </div>
              </div>
              <button className="btn-create-small" onClick={() => setActiveView('createPortfolio')}>
                <span className="plus-plus">+</span> Create Portfolio
              </button>
            </section>

            <section className="portfolio-section">
              <div className="module-card">
                <div className="module-header">
                  <h3>My Portfolios</h3>
                  <div className="search-container">
                    <input
                      type="text"
                      placeholder="Search ID or Name..."
                      className="table-search-input"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="table-wrapper">
                  <table className="portfolio-table">
                    <thead>
                      <tr>
                        <th>Sr.No</th>
                        <th>Portfolio ID</th>
                        <th>Name</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Quantity</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPortfolios.length > 0 ? (
                        filteredPortfolios.map((port, index) => (
                          <React.Fragment key={port.portfolioId}>
                            <tr
                              className={`portfolio-row ${expandedRowId === port.portfolioId ? 'active-row' : ''}`}
                              onClick={() => toggleRow(port.portfolioId)}
                              style={{ cursor: 'pointer' }}
                            >
                              <td data-label="Sr.No">{index + 1}</td>
                              <td data-label="Portfolio ID"><strong>PF-{port.portfolioId}</strong></td>
                              <td data-label="Name">{port.portfolioName}</td>
                              <td data-label="Amount">{port.investedAmount?.toLocaleString()}</td>
                              <td data-label="Status">
                                <span className={`status-badge ${(port.status || 'Pending').toLowerCase()}`}>
                                  {port.status || "Pending"}
                                </span>
                              </td>
                              <td data-label="Quantity">{port.quantity || 0} units</td>
                            </tr>

                            {expandedRowId === port.portfolioId && (
                              <tr className="expansion-row">
                                <td colSpan="6">
                                  <div className="allocation-details">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                      <h4>Allocation Breakdown</h4>
                                      <button className="resend-btn" onClick={(e) => { e.stopPropagation(); handleResendClick(port); }}>
                                        🔄 Resend Request
                                      </button>
                                    </div>
                                    <div className="details-grid">
                                      <div className="detail-item">
                                        <label>Equity: <span>{port.equityPercentage || 0}%</span></label>
                                        <div className="progress-mini">
                                          <div style={{ width: `${port.equityPercentage || 0}%`, backgroundColor: '#2563eb' }}></div>
                                        </div>
                                      </div>
                                      <div className="detail-item">
                                        <label>Bonds: <span>{port.bondPercentage || 0}%</span></label>
                                        <div className="progress-mini">
                                          <div style={{ width: `${port.bondPercentage || 0}%`, backgroundColor: '#10b981' }}></div>
                                        </div>
                                      </div>
                                      <div className="detail-item">
                                        <label>Derivatives: <span>{port.derivativePercentage || 0}%</span></label>
                                        <div className="progress-mini">
                                          <div style={{ width: `${port.derivativePercentage || 0}%`, backgroundColor: '#f59e0b' }}></div>
                                        </div>
                                      </div>
                                      <div className="detail-item">
                                        <label>Total Risk Score:</label>
                                        <span className={`risk-value-large ${port.riskScore?.calculatedScore > 70 ? 'high-risk' : 'low-risk'}`}>
                                          {port.riskScore?.calculatedScore !== undefined ? `${port.riskScore.calculatedScore}%` : 'N/A'}
                                        </span>
                                      </div>
                                      <div className="detail-item">
                                        <label>Regulation Type:</label>
                                        <span className="regulation-tag">
                                          {port.regulationType || "Not Specified"}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        ))
                      ) : (
                        <tr><td colSpan="6" style={{ textAlign: 'center' }}>No records found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </>
        )}
      </main>
      <footer className="home-footer1">
        <img src={logo} alt="PortSure Admin" className="hero-logo-footer" />
        <h5>@2025 PortSure – Portfolio Risk Analysis & Investment Compliance System</h5>
      </footer>
    </div>
  );
}