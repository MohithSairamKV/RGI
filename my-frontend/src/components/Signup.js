import React, { useState } from "react";
import { BsCheckCircleFill } from "react-icons/bs";
import { Link } from "react-router-dom";

const Signup = () => {
  const [formData, setFormData] = useState({
    clientName: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    city: "",
    country: "",
    zip: ""
  });
  const [errors, setErrors] = useState({});
  const [checked, setChecked] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (key) => (e) => {
    setFormData({ ...formData, [key]: e.target.value });
    setErrors({ ...errors, [key]: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};
    let isValid = true;

    // Validate fields
    Object.entries(formData).forEach(([key, value]) => {
      if (!value) {
        newErrors[key] = `Please enter your ${key}`;
        isValid = false;
      }
    });

    // Validate email format
    const emailRegex = /\S+@\S+\.\S+/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = "Enter a valid email";
      isValid = false;
    }

    // Password length check
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Passwords must be at least 6 characters";
      isValid = false;
    }

    if (!checked) {
      alert('Please agree to the terms and conditions.');
      isValid = false;
    }

    if (!isValid) {
      setErrors(newErrors);
      return;
    }

    // API call to register the user
    try {
      const response = await fetch('http://localhost:3000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMsg(`Welcome ${formData.clientName}! Please check your email at ${formData.email} to continue.`);
        setFormData({
          clientName: "",
          email: "",
          phone: "",
          password: "",
          address: "",
          city: "",
          country: "",
          zip: ""
        }); // Reset form after successful submission
      } else {
        // Handle server-side validation errors (e.g., email already in use)
        setErrors({ global: data.message || 'An unknown error occurred.' });
      }
    } catch (error) {
      setErrors({ global: 'Network error. Please try again.' });
      console.error('Network error:', error);
    }
  };

  const styles = {
    container: {
      display: 'flex',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      padding: '20px',
    },
    messageBox: {
      width: '30%',
      margin: '10px',
      padding: '20px',
      borderRadius: '15px',
      backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    formBox: {
      width: '40%',
      padding: '20px',
      margin: '10px',
      borderRadius: '15px',
         
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    input: {
      width: '100%',
      padding: '12px',
      margin: '10px 0',
      borderRadius: '8px',
      border: 'solid 1px #ccc',
      backgroundColor: 'white', // Solid background for readability
    },
    button: {
      width: '100%',
      padding: '15px',
      marginTop: '20px',
      backgroundColor: '#ff85a2', // Soft pink matching the theme
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.messageBox}>
        <h1>Welcome to Our Service!</h1>
        <p>Sign up today to get access to premium features:</p>
        <ul>
          <li><BsCheckCircleFill /> Exclusive access</li>
          <li><BsCheckCircleFill /> 24/7 support</li>
        </ul>
      </div>
      <div style={styles.formBox}>
        {successMsg ? (
          <div>
            <h4>Success!</h4>
            <p>{successMsg}</p>
            <Link to="/signin">Go to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2>Create Your Account</h2>
            {Object.keys(formData).map((key) => (
              <div key={key}>
                <input
                  style={styles.input}
                  placeholder={key[0].toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                  type={key === "password" ? "password" : "text"}
                  value={formData[key]}
                  onChange={handleChange(key)}
                />
                {errors[key] && <p>{errors[key]}</p>}
              </div>
            ))}
            <label>
              <input type="checkbox" checked={checked} onChange={() => setChecked(!checked)} />
              I agree to the Terms and Conditions
            </label>
            <button style={styles.button} type="submit">Sign Up</button>
            {errors.global && <p className="error">{errors.global}</p>}
          </form>
        )}
      </div>
    </div>
  );
};

export default Signup;
