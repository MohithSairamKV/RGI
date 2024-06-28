import React, { useState, useEffect } from 'react';
import ProductPopup from './ProductPopup';

function NewArrivals({ username }) {
    const [newArrivals, setNewArrivals] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [popupVisible, setPopupVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Fetch new arrivals data from the database on component mount
    const fetchNewArrivals = async () => {
        try {
            const response = await fetch('http://localhost:3000/new-arrivals', {
                headers: { 'Accept': 'application/json' }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const responseBody = await response.json();
            setNewArrivals(responseBody);
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    };

    useEffect(() => {
        fetchNewArrivals();
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
                    placeholder="Search new arrivals..."
                    onChange={(e) => setSearchTerm(e.target.value)}
                    value={searchTerm}
                    className="search-bar"
                />
                <select onChange={(e) => setSelectedBrand(e.target.value)} className="brand-filter">
                    <option value="">Filter by Brand</option>
                    {newArrivals && [...new Set(newArrivals.map((product) => product.Brand))]
                        .map((brand, index) => (
                            <option key={index} value={brand}>{brand}</option>
                        ))
                    }
                </select>
            </div>
            <div className="products-container">
                {newArrivals &&
                    newArrivals
                        .filter(
                            (product) =>
                                product.Product_Name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                                (selectedBrand ? product.Brand === selectedBrand : true)
                        )
                        .map((product, index) => (
                            <div key={index} className="product-card">
                                <img src={`http://localhost:3000/${product.img}`} alt={product.Product_Name} />
                                <h3>{product.Product_Name}</h3>
                                <p>SKU: {product.sku}</p>
                                <p>Brand: {product.Brand}</p>
                                <p>Price: ${product.price.toFixed(2)}</p>
                                <button onClick={() => handleAddToCartClick(product)}>Add to Cart</button>
                            </div>
                        ))}
            </div>
            {popupVisible && <ProductPopup product={selectedProduct} username={username} onClose={() => setPopupVisible(false)} />}
        </div>
    );
}

export default NewArrivals;
