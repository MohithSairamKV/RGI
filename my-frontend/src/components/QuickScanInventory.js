import React, { useState } from 'react';
import useZxing from './useZxing'; 

const QuickScanInventory = () => {
  const [barcode, setBarcode] = useState('');
  const [productDetails, setProductDetails] = useState(null);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const { ref } = useZxing({
    onResult: async (result) => {
      const scannedBarcode = result.getText();
      setBarcode(scannedBarcode);
      await fetchProductDetails(scannedBarcode);
    },
    onError: (error) => {
      console.error('Barcode scan error:', error);
    },
  });

  const fetchProductDetails = async (barcode) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/barcode/${barcode}`, {
        headers: { 'Accept': 'application/json' }
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

  return (
    <div>
      <h1>Scan Inventory</h1>
      <video ref={ref} style={{ width: '300px' }} />
      {barcode && (
        <div>
          <label htmlFor="barcodeInput">Scanned Barcode:</label>
          <input
            type="text"
            id="barcodeInput"
            value={barcode}
            readOnly
            style={{ width: '100%', padding: '8px', marginTop: '10px' }}
          />
        </div>
      )}

      {productDetails && (
        <div>
          <h2>Product Details</h2>
          <p><strong>Name:</strong> {productDetails.Product_Name}</p>
          <p><strong>SKU:</strong> {productDetails.sku}</p>
          <p><strong>Brand:</strong> {productDetails.Brand}</p>
          <img src={`images/${productDetails.img}`} alt={productDetails.Product_Name} />
        </div>
      )}

      {!productDetails && barcode && (
        <p>No product details found for this barcode.</p>
      )}
    </div>
  );
};

export default QuickScanInventory;
