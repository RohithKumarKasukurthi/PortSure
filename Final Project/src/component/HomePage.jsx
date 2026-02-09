import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from "../Navbar/Navbar";
import logo1 from "../logo/logo1.png";
import logo from "../logo/logo.png";
import '../CSSDesgin2/HomePage.css' 

export default function HomePage() {
  
  const myLoginOptions = (
    <div className="nav-actions">
      <Link to="/login-one" className=" admin"> Login</Link>
    </div> 
  );

  return (
    <div className="home-container">
      <Navbar loginOptions={myLoginOptions} />
      
      <main className="home-main-hero">
        <div className="hero-content">
         
          <div className="hero-visual">
            <img src={logo1} alt="PortSure Large Logo" className="hero-logo-large" />
          </div>
          
          <div className="hero-text">
            <h1 className="hero-title">
              Port<span className="sp">Sure</span>
            </h1>
            <p className="hero-subtitle">
              Portfolio Risk Analysis & Investment Compliance System
            </p>
            <div className="hero-divider"></div>
            <p className="hero-description">
              Securely manage assets, analyze market trends, and ensure regulatory 
              compliance through our institutional-grade dashboard.
            </p>
          </div>
        </div>
      </main>

         <footer className="home-footer1">
              <img src={logo} alt="PortSure footer logo" className="hero-logo-footer" />
              <h5>@2025 PortSure – Portfolio Risk Analysis & Investment Compliance System</h5>
            </footer>
    </div>
  );
}