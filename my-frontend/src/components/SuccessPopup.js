// SuccessPopup.js

import React from 'react';

function SuccessPopup({ onClose }) {
    return (
        <div className="success-popup">
            <div className="success-popup-inner">
                <div className="success-icon">&#10004;</div>
                <h2>Success</h2>
                <p>Item added to cart successfully!</p>
                <button onClick={onClose}>Close</button>
            </div>
        </div>
    );
}

export default SuccessPopup;
