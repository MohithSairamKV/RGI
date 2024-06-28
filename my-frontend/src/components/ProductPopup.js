import React, { useState } from 'react';
import SuccessPopup from './SuccessPopup';  // Correctly import the component

function ProductPopup({ product, username, onClose }) {
    const [Quantity, setQuantity] = useState(1);
    const [UOM, setUOM] = useState('Each');  // State for UOM
    const [error, setError] = useState('');
    const [showSuccess, setShowSuccess] = useState(false);  // State to control success popup

    const handleSave = async () => {
        setError('');  // Clear previous errors
        const order = {
            Product_Name: product.Product_Name,
            Sku: product.sku,
            Quantity: parseInt(Quantity, 10),
            UOM: UOM,  // Include UOM in the order object
            added_by: username
        };

        try {
            const response = await fetch('http://localhost:3000/user/main/orders', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(order)
            });

            if (response.ok) {
                setShowSuccess(true);  // Show success popup
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
        onClose();  // Close the product popup as well
    };

    return (
        <div>
            {showSuccess ? (
                <SuccessPopup onClose={handleCloseSuccess} />
            ) : (
                <div className="popup">
                    <div className="popup-inner">
                        <h3>{product.Product_Name}</h3>
                        <p>SKU: {product.sku}</p>
                        <input type="number" value={Quantity} onChange={(e) => setQuantity(e.target.value)} min="1"/>
                        <select value={UOM} onChange={(e) => setUOM(e.target.value)}>
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
}

export default ProductPopup;
