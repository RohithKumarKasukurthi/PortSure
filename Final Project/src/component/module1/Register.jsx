import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../../CSSDesgin1/Register.css';
import logo1 from "../../logo/logo.png";

const MAX_KYC_SIZE_MB = 5;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

const Register = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phonePattern = /^[0-9]{10}$/;

    if (!fullName.trim()) newErrors.fullName = 'Full Name is required.';
    
    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!emailPattern.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password.trim() || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    if (!phone.trim()) {
      newErrors.phone = 'Phone is required.';
    } else if (!phonePattern.test(phone.trim())) {
      newErrors.phone = 'Please enter a valid 10-digit phone number.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const investorData = {
        fullName: fullName,
        email: email,
        password: password,
        phoneNumber: phone,
        availableBalance: 0.0
      };

      const response = await fetch('http://localhost:8302/api/investors/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(investorData),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Registered successfully:", data);
        alert("Registration Successful! Please login.");
        navigate('/login-one');
      } else {
        const errorText = await response.text();
        alert(errorText || "Registration failed. Email might already be in use.");
      }
    } catch (error) {
      console.error("Connection Error:", error);
      alert("Could not connect to the database server.");
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
        <h2>Investor Registration</h2>
        <form onSubmit={handleSubmit} noValidate>
          
          <div className="input-field">
            <label>Full Name</label>
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            {errors.fullName && <span className="error-msg">{errors.fullName}</span>}
          </div>

          <div className="input-field">
            <label>Contact Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>

          <div className="input-field">
            <label>Create Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Min 6 characters" />
            {errors.password && <span className="error-msg">{errors.password}</span>}
          </div>

          <div className="input-field">
            <label>Contact Phone</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            {errors.phone && <span className="error-msg">{errors.phone}</span>}
          </div>


          <button type="submit" className="reg-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Complete Registration'}
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

export default Register;