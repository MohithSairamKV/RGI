import React, { useState, useEffect } from 'react';
import OrderInstantlyHeader from './OrderInstantlyHeader';
import ProductPopup from './ProductPopup.js';

const OrderInstantly = () => {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [storeName, setStoreName] = useState('');
  const [imageFiles, setImageFiles] = useState([]);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products711`, {
        headers: { 'Accept': 'application/json' }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const responseBody = await response.json();
      setProducts(responseBody);
    } catch (error) {
      console.error('There has been a problem with your fetch operation:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAddToCartClick = (product) => {
    setCart([...cart, product]);
    setPopupVisible(true);
    setSelectedProduct(product);
  };

  const handlePlaceOrder = async () => {
    const formData = new FormData();
    imageFiles.forEach((file) => {
      formData.append('images', file);
    });
    formData.append('cart', JSON.stringify(cart));
    formData.append('storeName', storeName);

    try {
      const response = await fetch(`${API_BASE_URL}/orderinstantly/place-order`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Error placing order');
      alert('Order placed successfully.');
      setCart([]);
      setImageFiles([]);
      setStoreName('');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleFileChange = (event) => {
    setImageFiles([...event.target.files]);
  };

  return (
    <div>
      <OrderInstantlyHeader />
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
            ))
          }
        </select>
        {/* <input
          type="text"
          placeholder="Store Name"
          onChange={(e) => setStoreName(e.target.value)}
          value={storeName}
          className="store-name-input"
        /> */}
      </div>
      <div className="products-container">
        {products && products
          .filter((product) => 
            (product.Product_Name && product.Product_Name.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (selectedBrand ? product.Brand === selectedBrand : true)
          )
          .map((product, index) => (
            <div key={index} className="product-card">
              <img src={`${API_BASE_URL}/${product.img}`} alt={product.Product_Name} />
              <h3>{product.Product_Name}</h3>
              <p>Brand: {product.Brand}</p>
              <button onClick={() => handleAddToCartClick(product)}>Add to Cart</button>
            </div>
          ))}
      </div>
      {popupVisible && <ProductPopup product={selectedProduct} onClose={() => setPopupVisible(false)} />}
      {cart.length > 0 && (
        <div className="cart-container">
          <h2>Cart</h2>
          <ul>
            {cart.map((item, index) => (
              <li key={index}>{item.Product_Name} - {item.Brand}</li>
            ))}
          </ul>
          <input type="file" multiple onChange={handleFileChange} />
          <button onClick={handlePlaceOrder}>Place Order</button>
        </div>
      )}
    </div>
  );
};

export default OrderInstantly;
