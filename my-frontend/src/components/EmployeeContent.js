import React, { useState, useEffect } from 'react';
import { Link, Routes, Route, useNavigate } from 'react-router-dom';
import ProductPopup from './ProductPopup';
import AllOrders from './AllOrders';
import OrderDetails from './OrderDetails';

function EmployeeContent() {
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const navigate = useNavigate();

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/employee/products`); // Ensure this matches your backend endpoint
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const responseBody = await response.json();
      setProducts(responseBody);
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/employee/customers`); // Ensure this matches your backend endpoint
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const responseBody = await response.json();
      setCustomers(responseBody);
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCustomers();
    navigate('/employee/orders'); // Navigate to orders list initially
  }, [API_BASE_URL, navigate]);

  const handleAddToCartClick = (product) => {
    setSelectedProduct(product);
    setPopupVisible(true);
  };

  return (
    <div>
      <div className="header-controls">
        <input
          type="text"
          placeholder="Search products..."
          onChange={(e) => setSearchTerm(e.target.value)}
          value={searchTerm}
          className="search-bar"
        />
        <select onChange={(e) => setSelectedBrand(e.target.value)} className="brand-filter">
          <option value="">Filter by Brand</option>
          {products && [...new Set(products.map((product) => product.Brand))]
            .map((brand, index) => (
              <option key={index} value={brand}>{brand}</option>
            ))}
        </select>
        <div className="nav-links">
          <Link to="/employee/orders">Orders</Link>
          <Link to="/employee/products">Products</Link>
          <Link to="/employee/customers">Customers</Link>
        </div>
      </div>

      <div className="content-container">
        <Routes>
          <Route path="orders" element={<AllOrders />} />
          <Route path="orders/:orderId" element={<OrderDetails />} />
          <Route path="products" element={
            <div className="products-container">
              {products && products
                .filter((product) => product.Product_Name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                                     (selectedBrand ? product.Brand === selectedBrand : true))
                .map((product, index) => (
                  <div key={index} className="product-card">
                    <img src={`images/${product.img}`} alt={product.Product_Name} />
                    <h3>{product.Product_Name}</h3>
                    <p>SKU: {product.sku}</p>
                    <p>Brand: {product.Brand}</p>
                    <button onClick={() => handleAddToCartClick(product)}>Add to Cart</button>
                  </div>
                ))}
            </div>
          } />
          <Route path="customers" element={
            <div className="customers-container">
              <h2>Customers List</h2>
              <ul>
                {customers.map((customer, index) => (
                  <li key={index}>
                    <p>ID: {customer.UserId}</p>
                    <p>Name: {customer.ClientName}</p>
                    <p>Email: {customer.Email}</p>
                    <p>Phone: {customer.Phone}</p>
                    <p>Address: {customer.Address}, {customer.City}, {customer.Country}, {customer.Zip}</p>
                  </li>
                ))}
              </ul>
            </div>
          } />
        </Routes>
      </div>

      {popupVisible && <ProductPopup product={selectedProduct} onClose={() => setPopupVisible(false)} />}
    </div>
  );
}

export default EmployeeContent;
