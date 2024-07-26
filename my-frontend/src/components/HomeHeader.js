import React from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/images/ethnic food distributor.png'; // Adjust the path to your actual logo image file

const HomeHeader = () => {
  const navigate = useNavigate(); // Initialize useNavigate

  const handleOrderInstantlyClick = () => {
    navigate('/orderinstantly'); // Navigate to OrderInstantly page
  };

  return (
    <header className="home-header">
      <img src={logo} alt="Company Logo" className="home-header-logo" />
      <div className="home-header-text-container">
        <p className="home-header-text">Explore our services by signing in or creating an account.</p>
        <button className="order-instantly-button" onClick={handleOrderInstantlyClick}>
          Order Instantly
        </button>
      </div>
    </header>
  );
};

export default HomeHeader;
