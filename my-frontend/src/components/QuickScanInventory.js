import React, { useState } from 'react';
//import BarcodeReader from 'react-barcode-reader';

const QuickScanInventory = () => {
  const [barcode, setBarcode] = useState('');

  const handleScan = (data) => {
    if (data) {
      setBarcode(data);
    }
  };

  const handleError = (err) => {
    console.error(err);
  };

  return (
    <div className="quickscan-container">
      <h1>QuickScan Inventory</h1>
      <p>Scan the barcode to get the info</p>

      <button onClick={() => alert('Please scan a barcode!')} className="scan-button">
        Scan Barcode
      </button>

      <BarcodeReader
        onError={handleError}
        onScan={handleScan}
      />

      {barcode && (
        <div className="barcode-result">
          <h3>Scanned Barcode:</h3>
          <p>{barcode}</p>
        </div>
      )}
    </div>
  );
};

export default QuickScanInventory;
