import React, { useState } from 'react';
import SuccessPopup from './SuccessPopup'; // Ensure this component exists in your project

const ProductOrderPopup = ({ product, storeName, onClose }) => {
    const [quantity, setQuantity] = useState(1);
    const [uom, setUOM] = useState('Each'); // State for Unit of Measurement
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false); // State to control success popup
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    const handleSave = async () => {
        setError(''); // Clear previous errors

        // Constructing the order object
        const order = {
            ProductName: product.ProductName,
            SKU: product.SKU,
            Quantity: parseInt(quantity, 10),
            UOM: uom, // Include UOM in the order object
            AddedBy: storeName || 'Unknown Store', // Use store name or fallback to 'Unknown Store'
        };

        const endpoint = `${API_BASE_URL}/store/instant-orders`; // New endpoint for instant orders

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(order),
            });

            if (response.ok) {
                setShowSuccess(true); // Show success popup
                setTimeout(() => {
                    setShowSuccess(false);
                    onClose(); // Close the product popup after 3 seconds
                }, 3000);
            } else {
                const errMsg = await response.text();
                console.log('Failed to save order', errMsg);
                setError(errMsg || 'Failed to save order');
            }
        } catch (error) {
            console.error('Error saving order:', error);
            setError('Network error: ' + error.message);
        }
    };

    const handleCloseSuccess = () => {
        setShowSuccess(false);
        onClose(); // Close the product popup as well
    };

    return (
        <div>
            {showSuccess ? (
                <SuccessPopup onClose={handleCloseSuccess} />
            ) : (
                <div className="popup">
                    <div className="popup-inner">
                        <h3>{product.ProductName}</h3>
                        <p>SKU: {product.SKU}</p>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            min="1"
                            placeholder="Enter quantity"
                        />
                        <select value={uom} onChange={(e) => setUOM(e.target.value)}>
                            <option value="Each">Each</option>
                            <option value="Case">Case</option>
                        </select>
                        {error && <p className="error">{error}</p>}
                        <button onClick={handleSave}>Save</button>
                        <button onClick={onClose}>Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductOrderPopup;
