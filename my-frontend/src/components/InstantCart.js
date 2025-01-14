import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EditQuantityPopup from './EditQuantityPopup';

const InstantCart = () => {
    const [cartItems, setCartItems] = useState([]);
    const [comments, setComments] = useState('');
    const [editQuantityPopup, setEditQuantityPopup] = useState(null);
    const navigate = useNavigate();
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        // Fetch cart items from local storage or API
        const storedCartItems = JSON.parse(localStorage.getItem('instantCart')) || [];
        setCartItems(storedCartItems);
    }, []);

    const handleBackToOrder = () => {
        navigate('/orderinstantly');
    };

    const handleEditQuantity = (sku, newQuantity) => {
        const updatedItems = cartItems.map(item =>
            item.sku === sku ? { ...item, quantity: newQuantity } : item
        );
        setCartItems(updatedItems);
        localStorage.setItem('instantCart', JSON.stringify(updatedItems));
    };

    const handleDeleteItem = (sku) => {
        const updatedItems = cartItems.filter(item => item.sku !== sku);
        setCartItems(updatedItems);
        localStorage.setItem('instantCart', JSON.stringify(updatedItems));
    };

    const handleSendOrder = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/instantorders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ items: cartItems, comments }),
            });
            if (response.ok) {
                alert('Order placed successfully.');
                setCartItems([]);
                setComments('');
                localStorage.removeItem('instantCart');
            } else {
                const errMsg = await response.text();
                console.error('Failed to send order:', errMsg);
                alert('Failed to send order.');
            }
        } catch (error) {
            console.error('Error sending order:', error);
            alert('Network error: ' + error.message);
        }
    };

    const handleEditQuantityClick = (sku, initialQuantity) => {
        setEditQuantityPopup({ sku, initialQuantity });
    };

    const handleSaveEditQuantity = (sku, newQuantity) => {
        handleEditQuantity(sku, newQuantity);
        setEditQuantityPopup(null);
    };

    const handleCloseEditQuantityPopup = () => {
        setEditQuantityPopup(null);
    };

    return (
        <div>
            <h1>Instant Cart</h1>
            <table>
                <thead>
                    <tr>
                        <th>SKU</th>
                        <th>Product Name</th>
                        <th>Quantity</th>
                        <th>UOM</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {cartItems.map((item, index) => (
                        <tr key={index}>
                            <td>{item.sku}</td>
                            <td>{item.productName}</td>
                            <td>{item.quantity}</td>
                            <td>{item.uom}</td>
                            <td>
                                <button onClick={() => handleEditQuantityClick(item.sku, item.quantity)}>
                                    Edit Quantity
                                </button>
                                <button onClick={() => handleDeleteItem(item.sku)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {cartItems.length === 0 && <p>No items in the cart.</p>}
            <div>
                <label htmlFor="comments">Comments:</label>
                <textarea
                    id="comments"
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    rows="2"
                    cols="25"
                />
            </div>
            <button onClick={handleBackToOrder}>Back to Order</button>
            <button onClick={handleSendOrder}>Send Order</button>

            {editQuantityPopup && (
                <EditQuantityPopup
                    sku={editQuantityPopup.sku}
                    initialQuantity={editQuantityPopup.initialQuantity}
                    onSave={handleSaveEditQuantity}
                    onClose={handleCloseEditQuantityPopup}
                />
            )}
        </div>
    );
};

export default InstantCart;
