import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../CSSDesgin1/LoginPage.css';
import logo1 from "../../logo/logo.png";

const LoginPage1 = () => {
  const [role, setRole] = useState('Investor');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const routes = {
    Investor: '/investordashboard',
    'Asset Manager': '/asset-manager',
    'Compliance Officer': '/C1',
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      alert('Please enter email and password.');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = role === 'Investor' 
        ? 'http://localhost:8302/api/investors/login' 
        : 'http://localhost:8307/api/internal/login';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          password: password,
          role: role 
        }),
      });

      if (response.ok) {
        const userData = await response.json();
        
        console.log("Login Successful:", userData);

        localStorage.setItem('user', JSON.stringify(userData));

        navigate(routes[role], {
          state: {
            user: userData,
            role: role.toLowerCase().replace(' ', '_'),
          },
        });
      } else {
       
        const errorMsg = await response.text();
        alert(errorMsg || "Invalid credentials. Please try again.");
      }
    } catch (error) {
      console.error("Connection Error:", error);
      alert("Failed to connect to the server. Please ensure the backend is running.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setEmail('');    
    setPassword(''); 
  };

  return (
    <div className="login-page">
      <div className="auth-card">
        <div className="brand">
          <div className="brand-logo" aria-hidden="true">
            <div className="hero-visual">
              <img src={logo1} alt="PortSure Large Logo" className="hero-logo-large" />
            </div>
          </div>
          <h2 className="brand-title"> Login</h2>
          <br/>
        </div>

        <div className="role-selector">
          {['Asset Manager', 'Compliance Officer', 'Investor'].map((r) => (
            <button
              key={r}
              className={`role-tab ${role === r ? 'active' : ''}`}
              onClick={() => handleRoleChange(r)}
              type="button"
            >
              {r}
            </button>
          ))}
        </div>

        <form onSubmit={handleLogin} className="login-form" noValidate>
          <div className="input-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-field">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="icon-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "👁️‍🗨️" : "👁️"}
              </button>
            </div>
          </div>

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? "Signing in..." : `Sign In as ${role}`}
          </button>
          
          <div className="back-button-container">
            <Link to="/" className="back-btn-link">
              ← Back to Home
            </Link>
          </div>
        </form>

        {role === 'Investor' && (
          <p className="reg-link">
            Don&apos;t have an account? <Link to="/regis">Register</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage1;