import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EditQuantityPopup from './EditQuantityPopup.js';

const OrderList = ({ username }) => {
    const [orders, setOrders] = useState([]);
    const [comments, setComments] = useState("");
    const [editQuantityPopup, setEditQuantityPopup] = useState(null);
    const navigate = useNavigate();

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/user/main/orders/${username}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setOrders(data);
            } catch (error) {
                console.error("Could not fetch orders:", error);
            }
        };

        fetchOrders();
    }, [username, API_BASE_URL]);

    const handleBack = () => {
        navigate(-1);
    };

    const EditQuantity = async (sku) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/edit-quantity/${sku}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) throw new Error('Error saving Excel data');
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const DeleteProduct = async (sku) => {
        if (window.confirm(`Are you sure you want to delete the product with SKU ${sku}?`)) {
            try {
                const response = await fetch(`${API_BASE_URL}/api/delete-order-product/${sku}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    throw new Error(`Error deleting product: ${errorText}`);
                }
                alert('Product deleted successfully.');
                setOrders((prevOrders) => prevOrders.filter(order => order.Sku !== sku));
            } catch (error) {
                console.error('Error:', error);
                alert(`Failed to delete product: ${error.message}`);
            }
        }
    };

    const handleSendOrder = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/user/main/orders/send/${orders[0].OrderID}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ comments })
            });
            if (response.ok) {
                alert('Order placed successfully. Thanks!');
                setOrders([]);
                setComments(""); // Clear the comments field after successful order submission
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

    const handleSaveEditQuantity = async (sku, newQuantity) => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/edit-quantity/${sku}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ newQuantity }),
            });

            if (!response.ok) {
                const errorText = await response.text();  // Get the error text from the response
                console.error('Error saving edited quantity:', errorText);
                throw new Error('Error saving edited quantity: ' + errorText);
            }
            alert('Quantity updated successfully.');
        } catch (error) {
            console.error('Error saving edited quantity:', error);
            alert('Failed to save edited quantity. Please try again later.');
        }
        setEditQuantityPopup(null);
    };

    const handleCloseEditQuantityPopup = () => {
        setEditQuantityPopup(null);
    };

    return (
        <div>
            <h1 className="orderlist">My Order List</h1>
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
                    {orders.map((order, index) => (
                        <tr key={index}>
                            <td>{order.Sku}</td>
                            <td>{order.Product_Name}</td>
                            <td>{order.Quantity}</td>
                            <td>{order.UOM}</td>
                            <td>
                                <button onClick={() => handleEditQuantityClick(order.Sku, order.Quantity)}>
                                    Edit Quantity
                                </button>
                                <button onClick={() => DeleteProduct(order.Sku)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {orders.length === 0 && <p>No orders yet.</p>}
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
            <button onClick={handleBack}>Back to Home</button>
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

export default OrderList;
