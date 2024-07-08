import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

function EmployeeOrderDetails() {
  const { clientName, orderType } = useParams();
  const [orders, setOrders] = useState([]);
  const navigate = useNavigate();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    fetchOrders();
  }, [clientName, orderType]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/employee/orders/${clientName}/${orderType}`);
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleBackClick = () => {
    navigate('/employee/customers');
  };

  return (
    <div>
      <button onClick={handleBackClick}>Back to Customers</button>
      <h2>{orderType === 'current' ? 'Current Orders' : 'Fulfilled Orders'} for {clientName}</h2>
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Order Item Count</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(order => (
            <tr key={order.OrderId}>
              <td>{order.OrderId}</td>
              <td>{order.OrderItemCount}</td>
              <td>{order.OrderStatus}</td>
              <td>
                <Link to={`/employee/orders/${clientName}/${orderType}/${order.OrderId}`}>View Details</Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeOrderDetails;
