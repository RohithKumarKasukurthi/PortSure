import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 
import Navbar from '../../Navbar/Navbar';
import logo from '../../logo/logo.png';
import '../../CSSDesgin1/AssetManager.css';

export default function Request() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
  try {
    const response = await fetch('http://localhost:8303/api/portfolios/all');
    if (!response.ok) {
      const text = await response.text();
      console.error("Portfolio fetch failed:", response.status, text);
      return;
    }

    const data = await response.json();

    // If your backend returns "Pending" (capital P) keep this,
    // otherwise change to "PENDING" depending on how your PortfolioService serializes enum.
    const pending = data.filter(p => (p.status || "").toString() === "Pending");

    // Collect unique investorIds from pending portfolios
    const investorIds = Array.from(
      new Set(
        pending
          .map(p => p.investorId)
          .filter(id => id !== null && id !== undefined)
      )
    );

    // Fetch investors in parallel
    const investorResults = await Promise.allSettled(
      investorIds.map(async (id) => {
        const url = `http://localhost:8302/api/investors/${id}`;
        const invRes = await fetch(url);

        if (!invRes.ok) {
          const text = await invRes.text();
          console.error("Investor fetch failed:", { id, status: invRes.status, url, text });
          throw new Error(`Investor ${id} fetch failed (${invRes.status})`);
        }

        const inv = await invRes.json();
        return { id, fullName: inv.fullName ?? "Unknown" };
      })
    );

    // Build map investorId -> name
    const investorNameById = {};
    for (const r of investorResults) {
      if (r.status === "fulfilled") {
        investorNameById[r.value.id] = r.value.fullName;
      }
    }

    // Attach investor_name into each request row
    const pendingWithNames = pending.map(p => ({
      ...p,
      investor_name: investorNameById[p.investorId] || "Unknown"
    }));

    setRequests(pendingWithNames);
  } catch (error) {
    console.error("Error fetching requests:", error);
  } finally {
    setIsLoading(false);
  }
};

const handleGoToAllocation = (req) => {
  navigate('/investor-login', { 
    state: { 
      portfolioId: req.portfolioId,
      portfolioName: req.portfolioName,
      investedAmount: req.investedAmount
    } 
  });
};

  const handleReject = async (portfolioId) => {
    if (!window.confirm("Are you sure you want to reject this request?")) return;

    try {
      const response = await fetch(`http://localhost:8303/api/portfolios/update-status/${portfolioId}?status=Rejected`, {
        method: 'PATCH',
      });

      if (response.ok) {
        alert("Request Rejected.");
        fetchRequests();
      }
    } catch {
      alert("Error rejecting request.");
    }
  };

  const myLoginOptions = (
    <div className="home-links">
       <Link to="/asset-manager" className="ad">Home</Link>
       <Link to="/received-requests" className="ad active">Received Requests</Link>
    </div>
  );

  return (
    <div className="asset-container">
      <Navbar loginOptions={myLoginOptions} />
      <main className="main-content">
        <div className="dashboard-header">
          <h1 className="page-title">Portfolios Requests</h1>
          <p>Review and allocate assets for incoming investor portfolio requests.</p>
        </div>

        <div className="section">
          <div className="history-list">
            <table className="history-table">
              <thead>
                <tr>
                  <th>Investor Name</th>
                  <th>Portfolio ID</th>
                  <th>Portfolio Name</th>
                  <th>Requested Amount</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan="5" style={{textAlign: 'center'}}>Fetching data...</td></tr>
                ) : requests.length > 0 ? (
                  requests.map((req, i) => (
                    <tr key={req.portfolioId || i}>
                      <td>{req.investor_name || 'Unknown'}</td>
                      <td><strong>PF-{req.portfolioId}</strong></td>
                      <td>{req.portfolioName || 'General'}</td>
                      <td>{req.investedAmount || '0'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button 
                            className="allocate-btn" 
                            onClick={() => handleGoToAllocation(req)}
                            style={{
                              background: '#2563eb', 
                              color: 'white', border: 'none', 
                              padding: '5px 12px', borderRadius: '4px', cursor: 'pointer'
                            }}
                          >
                            Go to Allocation
                          </button>
                          
                          <button 
                            className="reject-btn" 
                            onClick={() => handleReject(req.portfolioId)}
                            style={{
                              background: '#dc2626', 
                              color: 'white', border: 'none', 
                              padding: '5px 12px', borderRadius: '4px', cursor: 'pointer'
                            }}
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{textAlign: 'center', padding: '30px'}}>
                      No new pending requests.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
      <footer className="home-footer1">
             <img src={logo} alt="logo" className="hero-logo-footer" />
             <h5>© 2026 PortSure – Portfolio Risk Analysis & Investment Compliance System</h5>
           </footer>
    </div>
  );
}