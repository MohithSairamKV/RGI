import React, { useState } from 'react';
import useZxing from './useZxing'; // Ensure the path is correct based on your file structure

const QuickScanInventory = () => {
  const [barcode, setBarcode] = useState('');

  const { ref } = useZxing({
    onResult: (result) => {
      setBarcode(result.getText());
    },
    onError: (error) => {
      console.error('Barcode scan error:', error);
    },
  });

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
    </div>
  );
};

export default QuickScanInventory;
