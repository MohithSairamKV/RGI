// HomeHeader.js
import React from 'react';
import logo from '../assets/images/ethnic food distributor.png'; // Adjust the path to your actual logo image file

const HomeHeader = () => {
  return (
    <header className="home-header">
      <img src={logo} alt="Company Logo" className="home-header-logo" />
      <div className="home-header-text-container">
        <p className="home-header-text">Explore our services by signing in or creating an account.</p>
      </div>
    </header>
  );
};

export default HomeHeader;
