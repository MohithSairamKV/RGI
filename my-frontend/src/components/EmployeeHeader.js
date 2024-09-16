import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars } from 'react-icons/fa'; // Import FontAwesome hamburger icon
import logo from '../assets/images/ethnic food distributor.png'; // Adjust the path to your actual logo image file

const EmployeeHeader = ({ onLogout, username }) => {
  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  return (
    <header>
      <Link to="/" className="header-logo">
        <img src={logo} alt="Company Logo" />
      </Link>
      <div className="header-menu-icon" onClick={toggleDropdown}>
        <FaBars /> {/* FontAwesome hamburger icon */}
      </div>
      <div className={`header-nav ${isDropdownOpen ? 'dropdown-open' : ''}`}>
        <span className="header-greeting">Welcome, {username || 'Guest'}!</span>
        <Link to="/employee/orders" className="header-icon">📦 Orders</Link>
        <Link to="/employee/products" className="header-icon">📦 Products</Link>
        <Link to="/employee/customers" className="header-icon">👥 Customers</Link>
        <Link to="/employee/quickscan" className="header-icon">📱 QuickScan Inventory</Link> 
        <Link to="/employee/inventory" className="header-icon">📊 View Inventory</Link> 
        <button className="header-icon" onClick={onLogout}>↩</button>
      </div>
    </header>
  );
};

export default EmployeeHeader;
