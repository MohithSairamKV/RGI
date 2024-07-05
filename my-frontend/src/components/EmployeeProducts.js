import React, { useState, useEffect } from 'react';
import ProductPopup from './ProductPopup';

function EmployeeProducts() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        headers: { 'Accept': 'application/json' }
      });
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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
      </div>

      <div className="products-container">
        {products && products
          .filter((product) => {
            const productName = product.Product_Name || '';
            const normalizedSearchTerm = searchTerm ? searchTerm.toLowerCase() : '';
            return productName.toLowerCase().includes(normalizedSearchTerm) &&
                   (selectedBrand ? product.Brand === selectedBrand : true);
          })
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

      {popupVisible && <ProductPopup product={selectedProduct} onClose={() => setPopupVisible(false)} />}
    </div>
  );
}

export default EmployeeProducts;
