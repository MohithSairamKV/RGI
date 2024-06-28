// HomeFooter.js
import React from 'react';
import { Link } from 'react-router-dom';

const HomeFooter = () => {
  return (
    <footer style={{ background: '#343a40', color: '#fff', padding: '40px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Quick Links</h3>
          <ul style={{ listStyle: 'none', padding: '0', fontSize: '16px' }}>
            <li style={{ marginBottom: '10px' }}><Link to="/" style={{ color: 'lightblue', textDecoration: 'none' }}>Home</Link></li>
            <li style={{ marginBottom: '10px' }}><Link to="/shop" style={{ color: 'lightblue', textDecoration: 'none' }}>Online Shop</Link></li>
            <li style={{ marginBottom: '10px' }}><Link to="/wholesale" style={{ color: 'lightblue', textDecoration: 'none' }}>Wholesale Customers</Link></li>
            <li style={{ marginBottom: '10px' }}><Link to="/products" style={{ color: 'lightblue', textDecoration: 'none' }}>Our Products</Link></li>
            <li style={{ marginBottom: '10px' }}><Link to="/about" style={{ color: 'lightblue', textDecoration: 'none' }}>About Us</Link></li>
            <li style={{ marginBottom: '10px' }}><Link to="/careers" style={{ color: 'lightblue', textDecoration: 'none' }}>Careers</Link></li>
          </ul>
        </div>
        <div style={{ flex: '1 1 200px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Resources</h3>
          <ul style={{ listStyle: 'none', padding: '0', fontSize: '16px' }}>
            <li style={{ marginBottom: '10px' }}><Link to="/covid-19" style={{ color: 'lightblue', textDecoration: 'none' }}>COVID-19</Link></li>
            <li style={{ marginBottom: '10px' }}><Link to="/terms" style={{ color: 'lightblue', textDecoration: 'none' }}>Site Terms</Link></li>
            <li style={{ marginBottom: '10px' }}><Link to="/shipping" style={{ color: 'lightblue', textDecoration: 'none' }}>Shipping Policy</Link></li>
            <li style={{ marginBottom: '10px' }}><Link to="/returns" style={{ color: 'lightblue', textDecoration: 'none' }}>Returns & Refunds</Link></li>
            <li style={{ marginBottom: '10px' }}><Link to="/privacy" style={{ color: 'lightblue', textDecoration: 'none' }}>Privacy Policy</Link></li>
            <li style={{ marginBottom: '10px' }}><Link to="/wholesale-terms" style={{ color: 'lightblue', textDecoration: 'none' }}>Wholesale T&Cs</Link></li>
          </ul>
        </div>
        <div style={{ flex: '1 1 200px', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Contact Us</h3>
          <p style={{ fontSize: '16px', lineHeight: '1.5' }}>
            T: (206) 575-0050<br />
            F: (866) 935-3247<br />
            E: <a href="mailto:cs@rginw.com" style={{ color: 'lightblue', textDecoration: 'none' }}>cs@rginw.com</a><br />
            1120 Andover Park E.<br />
            Tukwila, WA 98188
          </p>
        </div>
      </div>
    </footer>
  );
};

export default HomeFooter;
