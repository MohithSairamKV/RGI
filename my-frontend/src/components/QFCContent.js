import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import ProductPopup from './ProductPopup.js';

function QFCContent({ username }) {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [popupVisible, setPopupVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [excelData, setExcelData] = useState(null);
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    const fetchProducts = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/qfctable`, {
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

    const saveExcelDataToDatabase = async (data) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/save-qfc-excel`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Error saving Excel data');
            alert('Excel data saved to the database successfully.');
            fetchProducts();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = (event) => {
            const binaryString = event.target.result;
            const workbook = XLSX.read(binaryString, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);
            setExcelData(data);
            saveExcelDataToDatabase(data);
        };
        reader.readAsBinaryString(file);
    };

    const deleteExcelDataFromDatabase = async () => {
        if (window.confirm('Are you sure you want to delete the Excel data?')) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/delete-qfc-excel`, {
                    method: 'DELETE',
                });
                if (!response.ok) throw new Error('Error deleting Excel data');
                setExcelData(null);
                alert('Excel data deleted from the database successfully.');
                fetchProducts();
            } catch (error) {
                console.error('Error:', error);
            }
        }
    };

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
                        ))
                    }
                </select>
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
                            <p>Quantity Present : {product.quantity_on_hand}</p>
                            <button onClick={() => handleAddToCartClick(product)}>Add to Cart</button>
                        </div>
                    ))}
            </div>
            {popupVisible && <ProductPopup product={selectedProduct} username={username} onClose={() => setPopupVisible(false)} />}
        </div>
    );
}

export default QFCContent;
