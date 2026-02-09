import React, { useState} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../../CSSDesgin2/PortSureHome.css";
import { Link } from 'react-router-dom';
import Navbar from '../../Navbar/Navbar';

export default function PortSureHome() {
  const { state } = useLocation(); 
  const navigate = useNavigate();
  const [allocations, setAllocations] = useState({
    equity: 0,
    bond: 0,
    derivative: 0,
    quantity: 0,
    regulationType: ""
  });
 
  const totalAllocated = Number(allocations.equity) + Number(allocations.bond) + Number(allocations.derivative);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const numValue = (name === "regulationType") ? value : (value === "" ? 0 : parseFloat(value));
    setAllocations(prev => ({ ...prev, [name]: numValue }));
  };

  const myLoginOptions = (
    <div className="home-links">
       <Link to="/asset-manager" className="ad active">Asset Allocation</Link>
       <Link to="/received-requests" className="ad">Back</Link>
      
    </div>
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (totalAllocated !== 100) {
      alert("Total allocation must equal 100%");
      return;
    }

    const allocationPayload = {
      portfolioName: state.portfolioName,
      investedAmount: state.investedAmount,
      equityPercentage: allocations.equity,
      bondPercentage: allocations.bond,
      derivativePercentage: allocations.derivative,
      quantity: allocations.quantity,
      regulationType: allocations.regulationType
    };

    try {
      const response = await fetch(`http://localhost:8303/api/portfolios/update/${state.portfolioId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(allocationPayload)
      });

      if (response.ok) {
        alert("Portfolio assets allocated and executed successfully!");
        navigate('/asset-manager');
      } else {
        const errorData = await response.json();
        alert("Failed: " + (errorData.message || "Server Error"));
      }
    } catch (error) {
      console.error("Network Error:", error);
      alert("Could not connect to server.");
    }
  };

  if (!state) return <div className="ps-container">No portfolio selected.</div>;

  

  return (
  <div className="ps-enterprise-wrapper1">
    <Navbar loginOptions={myLoginOptions} />
    
    <main className="ps-main-layout">
      {/* LEFT SIDE: PORTFOLIO SUMMARY CARD */}
      <aside className="ps-sidebar">
        <div className="ps-glass-card summary-card">
          <div className="card-header">
            <span className="ps-tag">Portfolio Details</span>
            <h3>{state.portfolioName}</h3>
            <p className="ps-id-text">Portfolio ID: PF-{state.portfolioId}</p>
          </div>
          
          <div className="card-stats5">
            <div className="stat-row">
              <label>Investment Amount</label>
              <p className="stat-value">{state.investedAmount?.toLocaleString()}</p>
            </div>
            <div className="stat-row">
              <label>Quantity</label>
              <p className="stat-value">{allocations.quantity || 0} Units</p>
            </div>
          </div>
        </div>
      </aside>

      {/* RIGHT SIDE: EXECUTION FORM */}
      <section className="ps-form-content">
        <form onSubmit={handleSubmit} className="ps-enterprise-form">
          <div className="ps-form-header">
            <h2>ASSET ALLOCATION</h2>
            <p>Define asset and Rule to portfolio </p>
          </div>

          <div className="ps-input-grid">
            {/* VOLUME CARD */}
            <div className="ps-input-card1 full-width">
              <div className="input-header1">
                <span className="icon">📊</span>
                <label>Trade Quantity</label>
              </div>
              <input 
                type="number" 
                name="quantity" 
                placeholder="Total Units..."
                value={allocations.quantity} 
                onChange={handleInputChange} 
              />
            </div>

            {/* ASSET WEIGHTS CARDS */}
            <div className="ps-asset-card2">
              <label>Equity</label>
              <div className="input-wrapper">
                <input type="number" name="equity" value={allocations.equity} onChange={handleInputChange} />
                <span className="suffix">%</span>
              </div>
              <div className="calc-preview">{((state.investedAmount * allocations.equity) / 100).toLocaleString()}</div>
            </div>

            <div className="ps-asset-card2">
              <label>Bonds</label>
              <div className="input-wrapper">
                <input type="number" name="bond" value={allocations.bond} onChange={handleInputChange} />
                <span className="suffix">%</span>
              </div>
              <div className="calc-preview">{((state.investedAmount * allocations.bond) / 100).toLocaleString()}</div>
            </div>

            <div className="ps-asset-card2">
              <label>Derivatives</label>
              <div className="input-wrapper">
                <input type="number" name="derivative" value={allocations.derivative} onChange={handleInputChange} />
                <span className="suffix">%</span>
              </div>
              <div className="calc-preview">{((state.investedAmount * allocations.derivative) / 100).toLocaleString()}</div>
            </div>
               <div className="ps-input-card1 full-width">
              <div className="input-header1">
                <span className="icon">⚖️</span>
                <label>Regulation</label>
              </div>
              <select 
                name="regulationType" 
                value={allocations.regulationType} 
                onChange={handleInputChange}
              
                required
              >
                <option value="">Select Regulation...</option>
                <option value="UCITS">SEBI</option>
                <option value="MiFID_II">MiFID II (Standard)</option>
              </select>
            </div>
          </div>
          {/* REGULATION SELECTION CARD */}
         
          {/* FOOTER ACTION BAR */}
          <div className="ps-action-bar">
            <div className="progress-group">
              <div className="progress-text">
                <span>Allocation Progress</span>
                <span className={totalAllocated === 100 ? "complete" : ""}>{totalAllocated}% / 100%</span>
              </div>
              <div className="progress-track">
                <div 
                  className="progress-fill" 
                  style={{ width: `${totalAllocated}%`, background: totalAllocated === 100 ? '#10b981' : '#2563eb' }}
                ></div>
              </div>
            </div>
              <button type="submit" disabled={totalAllocated !== 100} className="sub">
              Execute Portfolio Update
            </button>
          </div>
        </form>
      </section>
    </main>
  </div>
);
}