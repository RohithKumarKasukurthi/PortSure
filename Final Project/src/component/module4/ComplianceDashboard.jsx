import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Briefcase, AlertTriangle } from "lucide-react";
import "../../CSSDesgin4/ComplianceDashboard.css";
import Navbar from "../../Navbar/Navbar.jsx";
import logo from "../../logo/logo.png";
import profileLogo from "../../logo/profilelogo.jpg";

function SummaryCard({ title, value, variant = "default", icon: Icon }) {
  return (
    <div className={`card summary-card ${variant}`}>
      <div className="card-icon-container">{Icon && <Icon size={28} />}</div>
      <div className="card-text-container">
        <span className="summary-card-title">{title}</span>
        <span className="summary-card-value">{value}</span>
      </div>
    </div>
  );
}

export default function ComplianceDashboard() {
  const navigate = useNavigate();

  const [activeView, setActiveView] = useState("dashboard");
  const [profileOpen, setProfileOpen] = useState(false);

  const loggedInUser = JSON.parse(localStorage.getItem("user") || "{}");

  const staffId = loggedInUser.staffId || loggedInUser.id;

  const [profile, setProfile] = useState({
    staffId: "",
    name: "",
    email: "",
    role: "",
  });

  const [complianceLogs, setComplianceLogs] = useState([]);
  const [metrics, setMetrics] = useState({ total: 0, nonCompliant: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const statsRes = await fetch("http://localhost:8306/api/compliance/stats");
        const statsData = await statsRes.json();

        const portfolioRes = await fetch("http://localhost:8303/api/portfolios/all");
        const portfolioData = await portfolioRes.json();

        const logsRes = await fetch("http://localhost:8306/api/compliance/logs/all");
        const logsData = await logsRes.json();

        setMetrics({
          total: Array.isArray(portfolioData) ? portfolioData.length : (portfolioData.totalPortfolios || 0),
          nonCompliant: statsData.nonCompliantCount || 0,
        });
        setComplianceLogs(logsData);
      } catch (err) {
        console.error("Dashboard sync failed:", err);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (activeView !== "profile") return;
      if (!staffId) return;

      try {
        const res = await fetch(`http://localhost:8307/api/internal/profile/${staffId}`);
        if (!res.ok) {
          const t = await res.text();
          console.error("Profile fetch failed:", res.status, t);
          return;
        }
        const dbUser = await res.json();
        setProfile({
          staffId: dbUser.staffId ?? staffId ?? "",
          name: dbUser.fullName ?? dbUser.name ?? "",
          email: dbUser.email ?? "",
          role: dbUser.role ?? "",
        });
      } catch (e) {
        console.error("Profile fetch error:", e);
      }
    };

    fetchProfile();
  }, [activeView, staffId]);

  const alerts = complianceLogs.filter((l) =>
    ["BREACH", "NON-COMPLIANT", "CRITICAL_BREACH"].includes(l.status?.toUpperCase())
  );

  const navOptions = (
    <div className="home-links">
      <button
        type="button"
        className={`ad ${activeView === "dashboard" ? "active" : ""}`}
        onClick={() => setActiveView("dashboard")}
      >
        Home
      </button>

      <Link to="/C2" className="ad">Compliance Logs</Link>
      <Link to="/r" className="ad">Risk Score</Link>
      <Link to="/r1" className="ad">Exposure Alert</Link>

      {/* Profile dropdown */}
      <div
        className="cd-profile-container"
        tabIndex="0"
        onBlur={() => setProfileOpen(false)}
      >
        <div
          className="cd-profile-btn"
          onClick={() => setProfileOpen((p) => !p)}
        >
          <img src={profileLogo} alt="Profile" />
        </div>

        {profileOpen && (
          <div className="cd-profile-dropdown">
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
              LogOut
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="dashboard-layout-1">
      <Navbar loginOptions={navOptions} />

      {activeView === "profile" ? (
        <main className="cd-profile-page">
          <div className="cd-profile-card">
            <div className="cd-profile-banner">
              <button
                type="button"
                className="cd-profile-back-btn"
                onClick={() => setActiveView("dashboard")}
              >
                Back
              </button>

              <div className="cd-profile-banner-row">
                <div className="cd-profile-avatar-wrap">
                  <img className="cd-profile-avatar-img" src={profileLogo} alt="User" />
                </div>
                <div className="cd-profile-banner-meta">
                  <h2 className="cd-profile-name">{profile.name || "Compliance Officer"}</h2>
                  <div className="cd-profile-role">{profile.role?.replace("_", " ") || "—"}</div>
                </div>
              </div>
            </div>

            <div className="cd-profile-body">
              <div className="cd-profile-section-title">Account Details</div>

              <div className="cd-profile-grid">
                <div className="cd-profile-field">
                  <span className="cd-profile-label">Staff ID</span>
                  <div className="cd-profile-value">STF-{profile.staffId || "—"}</div>
                </div>

                <div className="cd-profile-field">
                  <span className="cd-profile-label">Email</span>
                  <div className="cd-profile-value">{profile.email || "—"}</div>
                </div>

                <div className="cd-profile-field">
                  <span className="cd-profile-label">Role</span>
                  <div className="cd-profile-value">{profile.role || "—"}</div>
                </div>

                <div className="cd-profile-field">
                  <span className="cd-profile-label">Security</span>
                  <div className="cd-profile-value muted">Password Hidden</div>
                </div>
              </div>
            </div>
          </div>
        </main>
      ) : (
        <>
          <h1 className="section-title-1">COMPLIANCE DASHBOARD</h1>

          <div className="kpi-grid-1 dual-grid">
            <SummaryCard
              title="Total Portfolios"
              value={metrics.total}
              icon={Briefcase}
              variant="total"
            />
            <SummaryCard
              title="Non-Compliant Portfolios"
              value={metrics.nonCompliant}
              icon={AlertTriangle}
              variant="danger"
            />
          </div>

          <div className="card-3">
            <h2 className="recent-alerts-header">RECENT COMPLIANCE ALERTS</h2>
            <div className="alerts-container">
              <table className="alerts-table">
                <thead>
                  <tr>
                    <th>Portfolio ID</th>
                    <th>Description</th>
                    <th>Regulation Type</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.length > 0 ? (
                    alerts.map((alert, idx) => (
                      <tr key={alert.logId || `${alert.portfolioId}-${idx}`} className="alert-row">
                        <td data-label="Portfolio ID">PF-{alert.portfolioId}</td>
                        <td data-label="Description" className="findings">{alert.findings}</td>
                        <td data-label="Regulation" className="alert-type-cell"><span className="alert-tag">{alert.regulationType}</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" className="no-data-msg">
                        No critical breaches detected in the audit logs.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      <footer className="home-footer1">
        <img src={logo} alt="PortSure footer logo" className="hero-logo-footer" />
        <h5>© 2025 PortSure – Portfolio Risk Analysis & Investment Compliance System</h5>
      </footer>
    </div>
  );
}