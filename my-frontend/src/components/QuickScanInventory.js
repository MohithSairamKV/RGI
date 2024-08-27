import React, { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader } from '@zxing/library';

const QuickScanInventory = () => {
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef(null);
  const [cameraError, setCameraError] = useState('');
  const [scannedBarcode, setScannedBarcode] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [productDetails, setProductDetails] = useState(null);
  const [selectedStore, setSelectedStore] = useState('');
  const [count, setCount] = useState('');
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const stores = [
    'QFC 808',
    'QFC 820',
    'QFC 826',
    'QFC 827',
    'QFC 860',
    'QFC 874',
    'QFC 871',
    'QFC 878',
    'H Mart Redmond',
    'H Mart Seattle',
    'H Mart Seattle Broadway',
    'H Mart Lynnwood'
  ];

  useEffect(() => {
    if (isScanning) {
      if (!videoRef.current) {
        console.error('Video element not found or ref not attached properly');
        return;
      }

      const codeReader = new BrowserMultiFormatReader();
      console.log('Starting barcode scanner');

      codeReader.decodeFromVideoDevice(null, videoRef.current, (result, error) => {
        if (result) {
          console.log('Barcode scan successful:', result);
          const barcode = result.getText();
          setScannedBarcode(barcode);
          setIsScanning(false);  // Automatically stop scanning once the barcode is read
          fetchProductDetails(barcode);
        } else if (error && !(error.name === 'NotFoundException')) {
          console.error('Barcode scan error:', error);
          setCameraError('Camera error occurred. Please try again.');
        }
      });

      return () => {
        console.log('Stopping barcode scanner');
        codeReader.reset();
      };
    }
  }, [isScanning]);

  const startScanning = () => {
    setCameraError('');
    setScannedBarcode('');
    setProductDetails(null);
    setIsScanning(true);
  };

  const fetchProductDetails = async (query) => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/search?query=${query}`, {
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

  const handleStoreChange = (event) => {
    setSelectedStore(event.target.value);
  };

  const handleSend = async () => {
    if (!selectedStore) {
      alert('Please select a store from the dropdown.');
      return;
    }
    if (!count || isNaN(count)) {
      alert('Please enter a valid count.');
      return;
    }

    const dataToSend = {
      store: selectedStore,
      product: productDetails.Product_Name,
      sku: productDetails.sku,
      barcode: scannedBarcode,
      count: count,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/scannedinventory`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      });

      if (response.ok) {
        alert('Data sent successfully!');
        setProductDetails(null);  // Clear product details
        setSearchQuery('');  // Reset search query
        setCount('');  // Clear count field
      } else {
        console.error('Error sending data:', response.statusText);
        alert('Failed to send data.');
      }
    } catch (error) {
      console.error('Error sending data:', error);
      alert('Failed to send data.');
    }
  };

  return (
    <div>
      <h1>Scan Inventory</h1>
      
      {/* Dropdown Menu for Store Selection */}
      <div style={{ marginBottom: '10px' }}>
        <label htmlFor="store-select" style={{ marginRight: '10px' }}>Select Store:</label>
        <select 
          id="store-select" 
          value={selectedStore} 
          onChange={handleStoreChange} 
          required
          style={{ padding: '8px' }}
        >
          <option value="">--Select Store--</option>
          {stores.map((store, index) => (
            <option key={index} value={store}>{store}</option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
        <input
          type="text"
          placeholder="Search by barcode or name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ flex: 1, padding: '8px' }}
        />
        <button 
          onClick={() => fetchProductDetails(searchQuery)} 
          style={{ padding: '8px', marginLeft: '8px', cursor: 'pointer' }}
        >
          Search
        </button>
        <button 
          onClick={startScanning} 
          style={{ padding: '8px', marginLeft: '8px', cursor: 'pointer' }}
        >
          Scan
        </button>
      </div>

      {isScanning && (
        <div>
          <video ref={videoRef} style={{ width: '100%', maxWidth: '300px', marginTop: '10px' }} />
          {cameraError && <p style={{ color: 'red' }}>{cameraError}</p>}
        </div>
      )}

      {scannedBarcode && (
        <div style={{ marginTop: '20px' }}>
          <h2>Scanned Barcode</h2>
          <p>{scannedBarcode}</p>
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

          {/* Input for Count and Send Button */}
          <div style={{ marginTop: '20px' }}>
            <label htmlFor="count-input" style={{ marginRight: '10px' }}>Enter Count:</label>
            <input 
              type="number" 
              id="count-input" 
              value={count} 
              onChange={(e) => setCount(e.target.value)} 
              style={{ padding: '8px', width: '100px' }}
            />
            <button 
              onClick={handleSend} 
              style={{ padding: '8px 16px', marginLeft: '10px', cursor: 'pointer' }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickScanInventory;
