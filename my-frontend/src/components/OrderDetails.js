import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';

const styles = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#f9f9f9',
    borderRadius: '8px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  heading: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#333',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginBottom: '20px',
  },
  th: {
    borderBottom: '1px solid #e0e0e0',
    padding: '10px',
    textAlign: 'left',
    color: '#333',
  },
  td: {
    borderBottom: '1px solid #e0e0e0',
    padding: '10px',
    color: '#555',
  },
  list: {
    listStyle: 'none',
    padding: '0',
  },
  listItem: {
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '10px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    transition: 'transform 0.2s, boxShadow 0.2s',
  },
  listItemHover: {
    transform: 'translateY(-3px)',
    boxShadow: '0 3px 6px rgba(0, 0, 0, 0.15)',
  },
  listItemText: {
    margin: '5px 0',
    color: '#555',
  },
  updateStatusContainer: {
    textAlign: 'center',
    marginTop: '20px',
  },
  label: {
    marginRight: '10px',
    color: '#333',
  },
  select: {
    padding: '8px',
    borderRadius: '4px',
    border: '1px solid #ccc',
    marginRight: '10px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'backgroundColor 0.2s',
    marginRight: '10px',
  },
  buttonHover: {
    backgroundColor: '#0056b3',
  },
  printHeader: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  printSection: {
    display: 'none',
  },
};

function OrderDetails() {
  const { orderId } = useParams();
  const location = useLocation();
  const { orderAddedBy } = location.state || {};
  const [orderDetails, setOrderDetails] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`http://localhost:3000/employee/orders/${orderId}`);
      const data = await response.json();
      setOrderDetails(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const handleStatusChange = async () => {
    try {
      const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
      const username = loggedInUser ? loggedInUser.username : '';
      const response = await fetch(`http://localhost:3000/employee/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status, fulfilledBy: username }),
      });
      const data = await response.json();
      console.log(data.message);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={styles.container}>
      <div id="printable-content">
        <h2 style={styles.heading}>Reshmisgroup</h2>
        <h3 style={styles.printHeader}>Order ID: {orderId}</h3>
        <h4 style={styles.printHeader}>Ordered by: {orderAddedBy}</h4>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Product</th>
              <th style={styles.th}>Quantity</th>
              <th style={styles.th}>SKU</th>
              <th style={styles.th}>UOM</th>
            </tr>
          </thead>
          <tbody>
            {orderDetails.map(detail => (
              <tr key={detail.OrderItemID}>
                <td style={styles.td}>{detail.Product_Name}</td>
                <td style={styles.td}>{detail.Quantity}</td>
                <td style={styles.td}>{detail.Sku}</td>
                <td style={styles.td}>{detail.UOM}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={styles.updateStatusContainer}>
        <label htmlFor="status" style={styles.label}>Update Status:</label>
        <select id="status" onChange={(e) => setStatus(e.target.value)} style={styles.select}>
          <option value="">Select Status</option>
          <option value="processing">Processing</option>
          <option value="fulfilled">Fulfilled</option>
        </select>
        <button
          onClick={handleStatusChange}
          style={styles.button}
          onMouseOver={(e) => e.target.style.backgroundColor = styles.buttonHover.backgroundColor}
          onMouseOut={(e) => e.target.style.backgroundColor = styles.button.backgroundColor}
        >
          Update Status
        </button>
        <button
          onClick={handlePrint}
          style={styles.button}
          onMouseOver={(e) => e.target.style.backgroundColor = styles.buttonHover.backgroundColor}
          onMouseOut={(e) => e.target.style.backgroundColor = styles.button.backgroundColor}
        >
          Print
        </button>
      </div>
    </div>
  );
}

export default OrderDetails;
