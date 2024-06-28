import React, { useState } from 'react';
import './EditQuantityPopup.css'; // Ensure this path is correct

const EditQuantityPopup = ({ sku, initialQuantity, onSave, onClose }) => {
    const [quantity, setQuantity] = useState(initialQuantity);

    const handleSave = () => {
        onSave(sku, quantity);
        onClose();
    };

    return (
        <>
            <div className="custom-popup-overlay" onClick={onClose}></div>
            <div className="custom-popup">
                <h2>Edit Quantity</h2>
                <label>
                    Quantity:
                    <input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                    />
                </label>
                <div className="button-container">
                    <button className="save-button" onClick={handleSave}>Save</button>
                    <button className="cancel-button" onClick={onClose}>Cancel</button>
                </div>
            </div>
        </>
    );
};

export default EditQuantityPopup;
