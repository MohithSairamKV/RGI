import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PreviousOrders = ({ username }) => {
    const [orders, setOrders] = useState([]);
    const navigate = useNavigate();

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        const fetchPreviousOrders = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/user/main/previous-orders/${username}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setOrders(data);
            } catch (error) {
                console.error("Could not fetch previous orders:", error);
            }
        };

        fetchPreviousOrders();
    }, [username, API_BASE_URL]);

    const viewOrderDetails = (orderId) => {
        navigate(`/previous-order-details/${orderId}`);
    };

    return (
        <div>
            <h1>Previous Orders</h1>
            {orders.length === 0 ? (
                <p>No previous orders found.</p>
            ) : (
                <ul>
                    {orders.map(order => (
                        <li key={order.OrderID}>
                            <button onClick={() => viewOrderDetails(order.OrderID)}>
                                Order ID: {order.OrderID} (Date: {order.OrderSentDate})
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <button onClick={() => navigate(-1)}>Back to Home</button>
        </div>
    );
};

export default PreviousOrders;
