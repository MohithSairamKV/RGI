import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars } from 'react-icons/fa';
import logo from '../assets/images/ethnic food distributor.png'; // Adjust the path to your actual logo image file

const EmployeeHeader = ({ onLogout, username }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleLinkClick = () => {
    setDropdownOpen(false); // Close dropdown after link is clicked
  };

  return (
    <header>
      <Link to="/" className="header-logo">
        <img src={logo} alt="Company Logo" />
      </Link>
      <div className="header-menu-icon" onClick={toggleDropdown}>
        <FaBars />
      </div>
      <div className={`header-nav ${isDropdownOpen ? 'dropdown-open' : ''}`}>
        <span className="header-greeting">Welcome, {username || 'Guest'}!</span>
        <Link to="/employee/orders" className="header-icon" onClick={handleLinkClick}>📦 Orders</Link>
        <Link to="/employee/products" className="header-icon" onClick={handleLinkClick}>📦 Products</Link>
        <Link to="/employee/customers" className="header-icon" onClick={handleLinkClick}>👥 Customers</Link>
        <Link to="/employee/quickscan" className="header-icon" onClick={handleLinkClick}>📱 QuickScan Inventory</Link> 
        <Link to="/employee/inventory" className="header-icon" onClick={handleLinkClick}>📊 View Inventory</Link> 
        <button className="header-icon" onClick={() => {handleLinkClick(); onLogout();}}>↩</button>
      </div>
    </header>
  );
};

export default EmployeeHeader;
