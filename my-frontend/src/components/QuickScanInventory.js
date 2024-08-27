import React, { useState } from 'react';
import useZxing from './useZxing'; 

const QuickScanInventory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [productDetails, setProductDetails] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const { ref } = useZxing({
    onResult: async (result) => {
      const scannedBarcode = result.getText();
      setSearchQuery(scannedBarcode);
      setIsScanning(false);  // Automatically stop scanning once the barcode is read
      await fetchProductDetails(scannedBarcode);
    },
    onError: (error) => {
      console.error('Barcode scan error:', error);
      setIsScanning(false);  // Stop scanning if there's an error
    },
  });

  const fetchProductDetails = async (query) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/barcode/${query}`, {
        headers: { 'Accept': 'application/json' },
      });
      if (response.ok) {
        const data = await response.json();
        setProductDetails(data);
      } else {
        console.error('Error fetching product details:', response.statusText);
        setProductDetails(null);
      }
    } catch (error) {
      console.error('Error fetching product details:', error);
      setProductDetails(null);
    }
  };

  const startScanning = () => {
    setProductDetails(null);  // Clear previous product details
    setIsScanning(true);
  };

  return (
    <div>
      <h1>Scan Inventory</h1>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Search by barcode or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, padding: '8px' }}
        />
        <button 
          onClick={startScanning} 
          style={{ padding: '8px', marginLeft: '8px', cursor: 'pointer' }}
        >
          Scan
        </button>
      </div>

      {isScanning && (
        <div>
          <video ref={ref} style={{ width: '100%', maxWidth: '300px', marginTop: '10px' }} />
          {!ref.current && <p style={{ color: 'red' }}>Camera is not accessible. Please check your permissions.</p>}
        </div>
      )}

      {productDetails && (
        <div style={{ marginTop: '20px' }}>
          <h2>Product Details</h2>
          <p><strong>Name:</strong> {productDetails.Product_Name}</p>
          <p><strong>SKU:</strong> {productDetails.sku}</p>
          <p><strong>Brand:</strong> {productDetails.Brand}</p>
          <img 
            src={`${API_BASE_URL}/images/${productDetails.img}`} 
            alt={productDetails.Product_Name} 
            style={{ width: '200px', height: 'auto' }} 
          />
        </div>
      )}

      {!productDetails && searchQuery && !isScanning && (
        <p style={{ marginTop: '20px' }}>No product details found for this search.</p>
      )}
    </div>
  );
};

export default QuickScanInventory;
