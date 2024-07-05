import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const styles = {
  ordersContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '20px',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  orderCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '20px',
    width: '300px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s, boxShadow 0.2s',
    textAlign: 'center',
  },
  orderCardHover: {
    transform: 'translateY(-3px)',
    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.15)',
  },
  orderCardHeading: {
    margin: '10px 0',
    color: '#333',
  },
  orderCardText: {
    color: '#555',
  },
  orderLink: {
    display: 'inline-block',
    marginTop: '10px',
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    textDecoration: 'none',
    borderRadius: '4px',
    transition: 'backgroundColor 0.2s',
  },
  orderLinkHover: {
    backgroundColor: '#0056b3',
  },
};

function EmployeeOrders() {
  const [orders, setOrders] = useState([]);
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/employee/orders`, {
        headers: { 'Accept': 'application/json' }
      });
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  return (
    <div style={styles.ordersContainer}>
      {orders.map(order => (
        <div
          key={order.OrderID}
          style={styles.orderCard}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = styles.orderCardHover.transform;
            e.currentTarget.style.boxShadow = styles.orderCardHover.boxShadow;
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'none';
            e.currentTarget.style.boxShadow = styles.orderCard.boxShadow;
          }}
        >
          <h3 style={styles.orderCardHeading}>Order ID: {order.OrderID}</h3>
          <p style={styles.orderCardText}>Ordered by: {order.Added_by}</p>
          <Link
            to={{
              pathname: `/employee/orders/${order.OrderID}`,
              state: { orderAddedBy: order.Added_by }
            }}
            style={styles.orderLink}
            onMouseOver={(e) => (e.target.style.backgroundColor = styles.orderLinkHover.backgroundColor)}
            onMouseOut={(e) => (e.target.style.backgroundColor = styles.orderLink.backgroundColor)}
          >
            View Details
          </Link>
        </div>
      ))}
    </div>
  );
}

export default EmployeeOrders;
