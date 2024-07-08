import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const PreviousOrderDetails = () => {
    const { orderId } = useParams();
    const [orderDetails, setOrderDetails] = useState([]);
    const navigate = useNavigate();
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        const fetchOrderDetails = async () => {
            try {
                const response = await fetch(`${API_BASE_URL}/user/main/order-details/${orderId}`);
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setOrderDetails(data);
            } catch (error) {
                console.error("Could not fetch order details:", error);
            }
        };

        fetchOrderDetails();
    }, [orderId, API_BASE_URL]);

    const repeatOrder = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/user/main/repeat-order/${orderId}`, { method: 'POST' });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const newOrderId = await response.json();
            alert(`Order has been repeated with new Order ID: ${newOrderId}`);
            navigate(`/order-details/${newOrderId}`);
        } catch (error) {
            console.error('Failed to repeat the order:', error);
            alert('Failed to repeat the order');
        }
    };

    return (
        <div>
            <h1>Order Details for Order ID: {orderId}</h1>
            {orderDetails.length === 0 ? (
                <p>No details found for this order.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Order Item ID</th>
                            <th>Product Name</th>
                            <th>Quantity</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orderDetails.map((item, index) => (
                            <tr key={index}>
                                <td>{item.OrderItemID}</td>
                                <td>{item.Product_Name}</td>
                                <td>{item.Quantity}</td>
                                <td>{item.OrderStatus}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
            <button onClick={() => navigate(-1)}>Back to Orders List</button>
            <button onClick={repeatOrder}>Repeat This Order</button>
        </div>
    );
};

export default PreviousOrderDetails;
