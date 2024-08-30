import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BsCheckCircleFill } from "react-icons/bs";
import brandsImage from '../assets/images/Brands.png'; // Adjust the path as necessary

const HomeContent = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errEmail, setErrEmail] = useState("");
  const [errPassword, setErrPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [signUpFormData, setSignUpFormData] = useState({
    clientName: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    city: "",
    country: "",
    zip: ""
  });
  const [signUpErrors, setSignUpErrors] = useState({});
  const [checked, setChecked] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [showSignUpSuccess, setShowSignUpSuccess] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setErrEmail("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setErrPassword("");
  };

  const handleRememberMe = () => {
    setRememberMe(!rememberMe);
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    setErrEmail("");
    setErrPassword("");

    if (!email) {
      setErrEmail("Please enter your email address.");
      return;
    }
    if (!password) {
      setErrPassword("Please enter your password.");
      return;
    }

    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    };

    try {
      const response = await fetch(`${API_BASE_URL}/signin`, requestOptions);
      const data = await response.json();

      if (response.ok) {
        console.log('Login successful:', data);
        onLogin(data);
        navigate("/");
      } else {
        console.error('Login failed:', data.message);
        setErrEmail("Invalid email or password.");
      }
    } catch (error) {
      console.error('Network error:', error);
      setErrPassword("Network error, please try again later.");
    }
  };

  const handleSignUpChange = (key) => (e) => {
    setSignUpFormData({ ...signUpFormData, [key]: e.target.value });
    setSignUpErrors({ ...signUpErrors, [key]: '' });
  };

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
    let isValid = true;

    // Validate fields
    Object.entries(signUpFormData).forEach(([key, value]) => {
      if (!value) {
        newErrors[key] = `Please enter your ${key}`;
        isValid = false;
      }
    });

    // Validate email format
    const emailRegex = /\S+@\S+\.\S+/;
    if (signUpFormData.email && !emailRegex.test(signUpFormData.email)) {
      newErrors.email = "Enter a valid email";
      isValid = false;
    }

    // Password length check
    if (signUpFormData.password && signUpFormData.password.length < 6) {
      newErrors.password = "Passwords must be at least 6 characters";
      isValid = false;
    }

    if (!checked) {
      alert('Please agree to the terms and conditions.');
      isValid = false;
    }

    if (!isValid) {
      setSignUpErrors(newErrors);
      return;
    }

    // API call to register the user
    try {
      const response = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(signUpFormData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(`Welcome ${signUpFormData.clientName}! Please check your email at ${signUpFormData.email} to continue.`);
        setSignUpFormData({
          clientName: "",
          email: "",
          phone: "",
          password: "",
          address: "",
          city: "",
          country: "",
          zip: ""
        }); // Reset form after successful submission
        setShowSignUpSuccess(true);
        setShowSignUp(false);
      } else {
        // Handle server-side validation errors (e.g., email already in use)
        setSignUpErrors({ global: data.message || 'An unknown error occurred.' });
      }
    } catch (error) {
      setSignUpErrors({ global: 'Network error. Please try again.' });
      console.error('Network error:', error);
    }
  };

  return (
    <main style={{ flex: 1, display: 'flex', padding: ' 10px', background: '#f8f9fa', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ maxWidth: '1200px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        
        {/* Hero Section */}
        <div style={{ flex: '1 1 100%', marginBottom: '00px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '36px', color: '#333' }}>Welcome to Reshmi's Group</h1>
          
        </div>

        <div style={{ flex: '1 1 45%', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>About Us</h2>
          <p style={{ fontSize: '16px', lineHeight: '1.5' }}>
            As one of the largest ethnic food manufacturers & distributors, we stock and distribute everything you need to fill your kitchen or store shelves with authentic Indian and Pakistani food.
          </p>
          <p style={{ fontSize: '16px', lineHeight: '1.5' }}>
            <strong> Our Partner Brands</strong>
          </p>
          <img src={brandsImage} alt="Brands" style={{ width: '100%', marginTop: '20px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)' }} />
          <p style={{ fontSize: '16px', lineHeight: '1.5', marginTop: '20px' }}>
            Hurry up and create your account, over 2000 items are waiting for you!
          </p>
        </div>

        <div style={{ flex: '1 1 45%', marginBottom: '20px' }}>
          {!showSignUp ? (
            <form onSubmit={handleSignIn} style={{ 
              background: '#fff', 
              padding: '40px', 
              borderRadius: '10px', 
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', 
              maxWidth: '400px', 
              margin: '0 auto' 
          }}>
            <h1 style={{ marginBottom: '20px', fontSize: '26px', fontWeight: 'bold' }}>Sign In</h1>
            
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '16px', fontWeight: '500' }}>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={handleEmailChange} 
              required 
              style={{ 
                width: '100%', 
                padding: '12px', 
                marginBottom: '15px', 
                border: '1px solid #ccc', 
                borderRadius: '6px', 
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s',
              }} 
            />
            {errEmail && <div style={{ color: 'red', marginBottom: '15px', fontSize: '14px' }}>{errEmail}</div>}
            
            <label style={{ display: 'block', marginBottom: '10px', fontSize: '16px', fontWeight: '500' }}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={handlePasswordChange} 
              required 
              style={{ 
                width: '100%', 
                padding: '12px', 
                marginBottom: '15px', 
                border: '1px solid #ccc', 
                borderRadius: '6px', 
                fontSize: '16px',
                boxSizing: 'border-box',
                transition: 'border-color 0.3s',
              }} 
            />
            {errPassword && <div style={{ color: 'red', marginBottom: '15px', fontSize: '14px' }}>{errPassword}</div>}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <input type="checkbox" checked={rememberMe} onChange={handleRememberMe} />
                <label style={{ marginLeft: '5px', fontSize: '14px' }}>Remember me</label>
              </div>
              <Link to="/forgot-password" style={{ color: '#007bff', textDecoration: 'none', fontSize: '14px' }}>Forgot Password?</Link>
            </div>
            
            <button 
              type="submit" 
              style={{ 
                width: '100%', 
                padding: '12px', 
                background: 'linear-gradient(90deg, #007bff, #0056b3)', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                fontSize: '16px', 
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background 0.3s',
              }}
              onMouseOver={(e) => e.target.style.background = 'linear-gradient(90deg, #0056b3, #007bff)'}
              onMouseOut={(e) => e.target.style.background = 'linear-gradient(90deg, #007bff, #0056b3)'}
            >
              Sign In
            </button>
            
            <p style={{ marginTop: '15px', fontSize: '14px', textAlign: 'center' }}>
              Don’t have an account? 
              <span 
                style={{ 
                  color: '#007bff', 
                  textDecoration: 'none', 
                  cursor: 'pointer', 
                  fontWeight: '500' 
                }} 
                onClick={() => setShowSignUp(true)}
              >
                Sign up
              </span>
            </p>
          </form>
          
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {showSignUpSuccess && (
                <div style={{ marginBottom: '20px', textAlign: 'center', color: '#28a745' }}>
                  <h4>Success!</h4>
                  <p>{successMsg}</p>
                </div>
              )}
              <div style={{ width: '100%', marginBottom: '20px', textAlign: 'center' }}>
                <h1>Welcome to Our Service!</h1>
                <p>Sign up today to get access to premium features:</p>
                <ul style={{ listStyle: 'none', paddingLeft: '0' }}>
                  <li><BsCheckCircleFill color="#28a745" /> Exclusive access</li>
                  <li><BsCheckCircleFill color="#28a745" /> 24/7 support</li>
                </ul>
              </div>
              <form onSubmit={handleSignUpSubmit} style={{ background: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)', width: '100%' }}>
                <h2>Create Your Account</h2>
                {Object.keys(signUpFormData).map((key) => (
                  <div key={key}>
                    <input
                      style={{ width: '100%', padding: '12px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
                      placeholder={key[0].toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                      type={key === "password" ? "password" : "text"}
                      value={signUpFormData[key]}
                      onChange={handleSignUpChange(key)}
                    />
                    {signUpErrors[key] && <p style={{ color: 'red' }}>{signUpErrors[key]}</p>}
                  </div>
                ))}
                <label>
                  <input type="checkbox" checked={checked} onChange={() => setChecked(!checked)} />
                  I agree to the Terms and Conditions
                </label>
                <button type="submit" style={{ width: '100%', padding: '15px', marginTop: '20px', backgroundColor: '#ff85a2', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Sign Up</button>
                {signUpErrors.global && <p style={{ color: 'red' }}>{signUpErrors.global}</p>}
                <p style={{ marginTop: '10px', fontSize: '14px' }}>Already have an account? <span style={{ color: '#007bff', textDecoration: 'none', cursor: 'pointer' }} onClick={() => setShowSignUp(false)}>Sign in</span></p>
              </form>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default HomeContent;
