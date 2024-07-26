import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/images/ethnic food distributor.png'; // Adjust the path to your actual logo image file

const OrderInstantlyHeader = () => {
  return (
    <header>
      <Link to="/" className="header-logo">
        <img src={logo} alt="Company Logo" />
      </Link>
      <div className="header-nav">
        <span className="header-greeting">Welcome to Reshmi's Group Inc.</span>
        <Link to="/cart" className="header-icon">🛒</Link>
      </div>
    </header>
  );
};

export default OrderInstantlyHeader;
