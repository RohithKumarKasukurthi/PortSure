import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../CSSDesgin1/Register.css'; // Reusing the same styling
import logo1 from "../../logo/logo.png";

const InternalRegister = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('COMPLIANCE_OFFICER');
  const [secretKey, setSecretKey] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!fullName.trim()) newErrors.fullName = 'Full Name is required.';
    
    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!emailPattern.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password.trim() || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!secretKey.trim()) {
      newErrors.secretKey = 'Secret Key is required.';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const adminData = {
        fullName: fullName,
        email: email,
        password: password,
        role: role,
        secretKey: secretKey
      };

      const response = await fetch('http://localhost:8307/api/internal/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminData),
      });

      if (response.ok) {
        alert("Internal User Registered Successfully! Please login.");
        navigate('/login-one');
      } else {
        const errorText = await response.text();
        alert(errorText || "Registration failed. Check your secret key or email.");
      }
    } catch (error) {
      console.error("Connection Error:", error);
      alert("Could not connect to the backend server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <div className="brand-logo" aria-hidden="true">
              <div className="hero-visual">
                        <img src={logo1} alt="PortSure Large Logo" className="hero-logo-large" />
                      </div>
          </div>
        <h2>Internal Staff Registration</h2>
        <form onSubmit={handleSubmit} noValidate>
          
          <div className="input-field">
            <label>Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            {errors.fullName && <span className="error-msg">{errors.fullName}</span>}
          </div>

          <div className="input-field">
            <label>Work Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>

          <div className="input-field">
            <label>Create Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Min 6 characters" />
            {errors.password && <span className="error-msg">{errors.password}</span>}
          </div>

          <div className="input-field">
            <label>Staff Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className="role-select">
              <option value="COMPLIANCE_OFFICER">Compliance Officer</option>
              <option value="ASSET_MANAGER">Asset Manager</option>
            </select>
          </div>

          <div className="input-field">
            <label>Registration Secret Key</label>
            <input type="password" value={secretKey} onChange={(e) => setSecretKey(e.target.value)} required placeholder="Enter the staff secret key" />
            {errors.secretKey && <span className="error-msg">{errors.secretKey}</span>}
          </div>


          <button type="submit" className="reg-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register as Staff'}
          </button>
          
          <div className="login-inline">
            <span className="login-text">Already registered?</span>
            <Link to="/login-one" className="login-small-btn">Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InternalRegister;
