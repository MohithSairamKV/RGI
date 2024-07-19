import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/images/ethnic food distributor.png'; // Adjust the path to your actual logo image file

const CustomerHeader = ({ onLogout, username }) => {
  return (
    <header>
      <Link to="/" className="header-logo">
        <img src={logo} alt="Company Logo" />
      </Link>
      <div className="header-nav">
        <span className="header-greeting">Welcome, {username || 'Guest'}!</span>
        <div className="header-item">
          <Link to="/profile" className="header-icon">👤</Link>
          <span className="header-text">Profile</span>
        </div>
        <div className="header-item">
          <Link to="/cart" className="header-icon">🛒</Link>
          <span className="header-text">Cart</span>
        </div>
        <div className="header-item">
          <Link to="/previous-orders" className="header-icon">📦</Link>
          <span className="header-text">Orders</span>
        </div>
        <div className="header-item">
          <button className="header-icon" onClick={onLogout}>↩</button>
          <span className="header-text">Logout</span>
        </div>
      </div>
    </header>
  );
};

export default CustomerHeader;
