import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function EmployeeViewDetails() {
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState([]);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const fetchOrderDetails = useCallback(async () => {
    console.log('Fetching order details for orderId:', orderId); // Debug log
    try {
      const response = await fetch(`${API_BASE_URL}/employee/orders/${orderId}/details`);
      const data = await response.json();
      console.log('Fetched order details:', data); // Debugging log
      setOrderDetails(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  }, [orderId, API_BASE_URL]);

  useEffect(() => {
    fetchOrderDetails();
  }, [fetchOrderDetails]);

  const handleBackClick = () => {
    navigate(-1); // Navigate to the previous page
  };

  return (
    <div>
      <button onClick={handleBackClick}>Back to Orders</button>
      <h2>Order Details for Order ID: {orderId}</h2>
      <table>
        <thead>
          <tr>
            <th>Order Item ID</th>
            <th>SKU</th>
            <th>Product Name</th>
            <th>Quantity</th>
            <th>Status</th>
            <th>Order Sent Date</th>
            <th>Fulfilled Date</th>
          </tr>
        </thead>
        <tbody>
          {orderDetails.map(detail => (
            <tr key={detail.OrderItemID}>
              <td>{detail.OrderItemID}</td>
              <td>{detail.Sku}</td>
              <td>{detail.Product_Name}</td>
              <td>{detail.Quantity}</td>
              <td>{detail.OrderStatus}</td>
              <td>{detail.OrderSentDate}</td>
              <td>{detail.FulfilledDate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeViewDetails;
