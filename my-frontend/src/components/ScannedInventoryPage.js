import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

const ScannedInventoryPage = () => {
  const [scannedData, setScannedData] = useState([]);
  const [selectedStore, setSelectedStore] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const stores = [
    'QFC 808',
    'QFC 819',
    'QFC 820',
    'QFC 826',
    'QFC 827',
    'QFC 850',
    'QFC 856',
    'QFC 860',
    'QFC 874',
    'QFC 871',
    'QFC 878',
    'H Mart Redmond',
    'H Mart Seattle',
    'H Mart Seattle Broadway',
    'H Mart Lynnwood',
    '7-Eleven'
  ];

  useEffect(() => {
    fetchScannedData();
  }, [selectedStore, startDate, endDate]);

  const fetchScannedData = async () => {
    const url = new URL(`${API_BASE_URL}/scannedinventory`);
    if (selectedStore) {
      url.searchParams.append('store', selectedStore);
    }
    if (startDate) {
      url.searchParams.append('startDate', startDate);
    }
    if (endDate) {
      url.searchParams.append('endDate', endDate);
    }

    try {
      const response = await fetch(url.toString());
      if (response.ok) {
        const data = await response.json();
        setScannedData(data);
      } else {
        console.error('Error fetching scanned inventory data:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching scanned inventory data:', error);
    }
  };

  const handleStoreChange = (event) => {
    setSelectedStore(event.target.value);
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  const downloadExcel = () => {
    const ws = XLSX.utils.json_to_sheet(scannedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "ScannedInventory");
    XLSX.writeFile(wb, "ScannedInventory.xlsx");
  };

  return (
    <div>
      <h1>Scanned Inventory</h1>
      
      {/* Filters for Store and Date */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div>
          <label htmlFor="store-select" style={{ marginRight: '10px' }}>Filter by Store:</label>
          <select 
            id="store-select" 
            value={selectedStore} 
            onChange={handleStoreChange} 
            style={{ padding: '8px' }}
          >
            <option value="">--All Stores--</option>
            {stores.map((store, index) => (
              <option key={index} value={store}>{store}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="start-date" style={{ marginRight: '10px' }}>Start Date:</label>
          <input 
            type="date" 
            id="start-date" 
            value={startDate} 
            onChange={handleStartDateChange} 
            style={{ padding: '8px' }}
          />
        </div>

        <div>
          <label htmlFor="end-date" style={{ marginRight: '10px' }}>End Date:</label>
          <input 
            type="date" 
            id="end-date" 
            value={endDate} 
            onChange={handleEndDateChange} 
            style={{ padding: '8px' }}
          />
        </div>

        {/* Download as Excel Button */}
        <button onClick={downloadExcel} style={{ padding: '10px 20px', cursor: 'pointer' }}>
          Download as Excel
        </button>
      </div>

      {/* Table to Display Scanned Inventory */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid black', padding: '8px' }}>Store</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Product SKU</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Product Name</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Count</th>
            <th style={{ border: '1px solid black', padding: '8px' }}>Scanned At</th>
          </tr>
        </thead>
        <tbody>
          {scannedData.map((item, index) => (
            <tr key={index}>
              <td style={{ border: '1px solid black', padding: '8px' }}>{item.store_name}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{item.product_sku}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{item.product_name}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{item.count}</td>
              <td style={{ border: '1px solid black', padding: '8px' }}>{new Date(item.scanned_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ScannedInventoryPage;
