import React from 'react';
import logo1 from "../logo/logo1.png";
import '../CSSDesgin2/Navbar.css';


// We use 'props' to bring in the login options from the main file
export default function Navbar({ loginOptions }) {
  return (
    <header className="home-header">
      <nav className="home-nav">
        <div className="nav-brand">
          <div className="home-h1">
            <img src={logo1} alt="PortSure logo" className="hero-logo1" />
          </div>
          <h1 className="home-h2">
            Port<span className="sp">Sure</span>
          </h1>
        </div>

        {/* This is where the buttons from the main file will appear */}
        <div className="home-links">
          {loginOptions}
        </div>
      </nav>
    </header>
    
  );
}