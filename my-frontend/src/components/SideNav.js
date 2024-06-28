import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SideNav.css';

const SideNav = () => {
  const [isOpen, setIsOpen] = useState(false); // Initially closed

  const toggleNav = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={`sidenav-container ${isOpen ? 'open' : ''}`}>
      <button className="open-btn" onClick={toggleNav}>
        ☰
      </button>
      <div className={`sidenav ${isOpen ? 'open' : ''}`}>
        <button className="close-btn" onClick={toggleNav}>
          ×
        </button>
        <ul>
          <li><Link to="/" onClick={toggleNav}>Home</Link></li>
          <li><Link to="/new-arrivals" onClick={toggleNav}>New Arrivals</Link></li>
          <li><Link to="/special-deals" onClick={toggleNav}>Special Deals</Link></li>
          <li><Link to="/profile" onClick={toggleNav}>Profile</Link></li>
          <li><Link to="/logout" onClick={toggleNav}>Logout</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default SideNav;
