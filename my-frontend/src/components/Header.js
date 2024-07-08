import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/images/ethnic_food_distributor.png'; // Adjust the path to your actual logo image file

const Header = ({ onLogout, username }) => {
  return (
    <header>
      <Link to="/" className="header-logo">
        <img src={logo} alt="Company Logo" />
      </Link>
      <div className="header-nav">
        <span className="header-greeting">Welcome, {username || 'Guest'}!</span>
        <Link to="/profile" className="header-icon">👤</Link>
        <Link to="/cart" className="header-icon">🛒</Link>
        <button className="header-icon" onClick={onLogout}>↩</button>
      </div>
    </header>
  );
};

export default Header;
