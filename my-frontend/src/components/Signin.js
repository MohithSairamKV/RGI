import React, { useState } from "react";
import { Link } from "react-router-dom";

const Signin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errEmail, setErrEmail] = useState("");
  const [errPassword, setErrPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

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
  
    // Reset error messages
    setErrEmail("");
    setErrPassword("");
  
    // Basic input validation
    if (!email) {
      setErrEmail("Please enter your email address.");
      return;
    }
    if (!password) {
      setErrPassword("Please enter your password.");
      return;
    }
  
    // API call setup
    const requestOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email, password: password })
    };
  
    try {
      const response = await fetch('http://localhost:3001/api/signin', requestOptions);
      const data = await response.json();
  
      if (response.ok) {
        console.log('Login successful:', data);
        // Handle successful login, e.g., redirect to another page or set auth state
      } else {
        console.error('Login failed:', data.message);
        // Update error states based on the specific error
        if (data.message) {
          if (data.message.includes("email")) {
            setErrEmail(data.message);
          } else if (data.message.includes("password")) {
            setErrPassword(data.message);
          }
        }
      }
    } catch (error) {
      console.error('Network error:', error);
      // Handle network errors
    }
  };
  

  return (
    <div >
      <form onSubmit={handleSignIn} >
        <h1 >Sign In</h1>
        <div >
          <label >Email</label>
          <input type="email" value={email} onChange={handleEmailChange} 
                 />
          {errEmail && <p className="text-sm text-red-500">{errEmail}</p>}
        </div>
        <div >
          <label >Password</label>
          <input type="password" value={password} onChange={handlePasswordChange}
                />
          {errPassword && <p>{errPassword}</p>}
        </div>
        <div >
          <div >
            <input type="checkbox" checked={rememberMe} onChange={handleRememberMe}
                  />
            <label >Remember me</label>
          </div>
          <Link to="/forgot-password" >Forgot Password?</Link>
        </div>
        <button type="submit">          Sign In
        </button>
        <p >Don’t have an account? <Link to="/signup" >Sign up</Link></p>
      </form>
    </div>
  );
};

export default Signin;
