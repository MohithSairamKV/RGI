import React, { useState } from 'react';
import { QrReader } from 'react-qr-barcode-scanner';

const QuickScanInventory = () => {
  const [barcode, setBarcode] = useState('');
  const [scanning, setScanning] = useState(false);

  const handleScan = (result) => {
    if (result) {
      setBarcode(result.text);
      setScanning(false);
    }
  };

  const handleError = (error) => {
    console.error("Error scanning barcode: ", error);
    setScanning(false);
  };

  return (
    <div className="quickscan-container">
      <h1>QuickScan Inventory</h1>
      <p>Scan the barcode to get the info</p>

      {!scanning && (
        <button onClick={() => setScanning(true)} className="scan-button">
          Scan Barcode
        </button>
      )}

      {scanning && (
        <div className="scanner">
          <QrReader
            onResult={handleScan}
            constraints={{ facingMode: 'environment' }}
            onError={handleError}
            style={{ width: '300px' }}
          />
        </div>
      )}

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
