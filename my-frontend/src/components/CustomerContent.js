import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import ProductPopup from './ProductPopup.js';

function CustomerContent({ username }) {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [popupVisible, setPopupVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // State to track if the screen is mobile-sized

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    // Function to detect window resizing and adjust isMobile state
    const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/products`, {
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

        fetchProducts();

        // Add event listener to handle window resizing
        window.addEventListener('resize', handleResize);

        // Cleanup event listener on component unmount
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleAddToCartClick = (product) => {
        setSelectedProduct(product);
        setPopupVisible(true);
    };

    const handleBrandClick = (brand) => {
        setSelectedBrand(brand === selectedBrand ? '' : brand);
    };

    return (
        <div className="main-layout">
            {/* Conditionally render sidebar or mobile filter based on screen size */}
            {isMobile ? (
                <select 
                    className="mobile-filter" 
                    onChange={(e) => setSelectedBrand(e.target.value)} 
                    value={selectedBrand}
                >
                    <option value="">Filter by Brand</option>
                    {products && [...new Set(products.map((product) => product.Brand))].map((brand, index) => (
                        <option key={index} value={brand}>{brand}</option>
                    ))}
                </select>
            ) : (
                <div className="sidebar">
                    <div className="filter-category">
                        <h3>Filter by Brand</h3>
                        <ul>
                            {products && [...new Set(products.map((product) => product.Brand))].map((brand, index) => (
                                <li
                                    key={index}
                                    onClick={() => handleBrandClick(brand)}
                                    className={brand === selectedBrand ? 'selected' : ''}
                                >
                                    {brand}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            <div className="main-content">
                <input
                    type="text"
                    placeholder="Search products..."
                    onChange={(e) => setSearchTerm(e.target.value)}
                    value={searchTerm}
                    className="search-bar"
                />
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
                                <p>Brand : {product.Brand}</p>
                                <button onClick={() => handleAddToCartClick(product)}>Add to Cart</button>
                            </div>
                        ))}
                </div>
            </div>

            {popupVisible && <ProductPopup product={selectedProduct} username={username} onClose={() => setPopupVisible(false)} />}
        </div>
    );
}

export default CustomerContent;
