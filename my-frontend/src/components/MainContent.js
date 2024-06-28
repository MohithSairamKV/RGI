// MainContent.js

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import ProductPopup from './ProductPopup.js';
import { Link } from 'react-router-dom';

function MainContent({username}) {
    const [products, setProducts] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedBrand, setSelectedBrand] = useState('');
    const [popupVisible, setPopupVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [excelData, setExcelData] = useState(null);
    const [viewMode, setViewMode] = useState('table');

    const toggleViewMode = () => {
        setViewMode((prevMode) => (prevMode === 'table' ? 'cards' : 'table'));
    };
    // Fetch products data from the database on component mount
    const fetchProducts = async () => {
        try {
            const response = await fetch('http://localhost:3000/products', {
    headers: { 'Accept': 'application/json' }
});

    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const responseBody = await response.json();
    
            try {
                // Attempt to parse the response body as JSON
               // const data = JSON.parse(responseBody);
                setProducts(responseBody);
            } catch (jsonError) {
                console.error('Error parsing JSON response:', jsonError);
                // Handle the error or set an appropriate default value for products
                setProducts([]);
            }
        } catch (error) {
            console.error('There has been a problem with your fetch operation:', error);
        }
    };
    

    useEffect(() => {
        fetchProducts();
    }, []);

    // Function to save Excel data to the database
    const saveExcelDataToDatabase = async (data) => {
        try {
            const response = await fetch('http://localhost:3000/api/save-excel', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Error saving Excel data');
            alert('Excel data saved to the database successfully.');
            // Refresh the products list after saving
            fetchProducts();
        } catch (error) {
            console.error('Error:', error);
        }
    };

    // Function to handle file upload
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
                const response = await fetch('http://localhost:3001/api/delete-excel', {
                    method: 'DELETE',
                });
                if (!response.ok) throw new Error('Error deleting Excel data');
                setExcelData(null); // Clear the local state
                alert('Excel data deleted from the database successfully.');
                // Refresh the products list after deletion
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
    const handleEditItemClick = (product) => {
        // Implement your logic for handling the edit item functionality
        console.log('Edit Item Clicked:', product);
    };

    const handleDeleteItemClick = async (product_id) => {
        
            if (window.confirm(`Are you sure you want to delete ?`)) {
                try {
                    const response = await fetch(`http://localhost:3001/api/delete-product/${product_id}`, {
                        method: 'DELETE',
                    });
                    if (!response.ok) throw new Error('Error deleting product');
                    // Refresh the products or update the state as needed
                    alert('Product deleted successfully.');
                    //window.location.reload()
                } catch (error) {
                    console.error('Error:', error);
                }
            }
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
                <input
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleFileUpload}
                    className="file-input"
                />
                <button onClick={() => saveExcelDataToDatabase(excelData)}>Save Excel Data</button>
                <button onClick={toggleViewMode}>Customer View</button>
            </div> {viewMode === 'table' ? (
                <table className="products-table">
                <thead>
                    <tr>
                        <th>Product Name</th>
                        <th>SKU</th>
                        <th>Brand</th>
                        <th>Action</th>
                        <th>Edit</th>
                        <th>Delete</th>
                    </tr>
                </thead>
                <tbody>
            {products &&
              products
                .filter(
                  (product) =>
                    product.Product_Name.toLowerCase().includes(searchTerm.toLowerCase()) &&
                    (selectedBrand ? product.Brand === selectedBrand : true)
                )
                .map((product, index) => (
                  <tr key={index}>
                    <td>{product.Product_Name}</td>
                    <td>{product.sku}</td>
                    <td>{product.Brand}</td>
                    <td>
                      <button onClick={() => handleAddToCartClick(product)}>Add to Cart</button>
                    </td>
                    <td>
                      {/* Use Link to navigate to the edit item page */}
                      <Link to={`/edit/${product.product_id}`}>
                        <button>Edit Item</button>
                      </Link>
                    </td>
                    <td>
                      <button onClick={() => handleDeleteItemClick(product.product_id)}>Delete Item</button>
                    </td>
                  </tr>
                ))}
          </tbody>
            </table>
            ) : (
                <div className="products-container">
                    {products &&
                        products
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
                                    <button onClick={() => handleAddToCartClick(product)}>Add to Cart</button>
                                </div>
                            ))}
                </div>
            )}
            {popupVisible && <ProductPopup product={selectedProduct} username={username} onClose={() => setPopupVisible(false)} />}
        </div>
    );
}
export default MainContent;
