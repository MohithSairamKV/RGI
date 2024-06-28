// ForgotPassword.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch('http://localhost:3000/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (response.ok) {
        setStep(2);
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (error) {
      setError("Network error, please try again later.");
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await fetch('http://localhost:3000/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      if (response.ok) {
        navigate("/reset-password");
      } else {
        const data = await response.json();
        setError(data.message);
      }
    } catch (error) {
      setError("Network error, please try again later.");
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', backgroundColor: '#fff' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>Forgot Password</h1>
      {step === 1 && (
        <form onSubmit={handleEmailSubmit}>
          <label style={{ display: 'block', marginBottom: '10px' }}>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}>Send OTP</button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleOtpSubmit}>
          <label style={{ display: 'block', marginBottom: '10px' }}>OTP</label>
          <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required style={{ width: '100%', padding: '10px', marginBottom: '10px', border: '1px solid #ccc', borderRadius: '4px' }} />
          {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
          <button type="submit" style={{ width: '100%', padding: '10px', background: '#007bff', color: 'white', border: 'none', borderRadius: '4px', fontSize: '16px', cursor: 'pointer' }}>Verify OTP</button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;
