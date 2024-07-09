import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

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
  commentsSection: {
    marginTop: '20px',
    backgroundColor: '#fff',
    padding: '15px',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  commentsLabel: {
    fontWeight: 'bold',
    marginBottom: '5px',
    color: '#333',
  },
  commentsText: {
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
    fontSize: '16px',
    fontWeight: 'bold',
  },
  printFooter: {
    textAlign: 'center',
    marginTop: '20px',
    fontSize: '12px',
    borderTop: '1px solid #e0e0e0',
    paddingTop: '10px',
  },
  '@media print': {
    container: {
      marginTop: '0',
      boxShadow: 'none',
    },
    header: {
      display: 'block',
      textAlign: 'center',
      marginBottom: '20px',
      fontSize: '16px',
      fontWeight: 'bold',
    },
    footer: {
      display: 'block',
      textAlign: 'center',
      marginTop: '20px',
      fontSize: '12px',
      borderTop: '1px solid #e0e0e0',
      paddingTop: '10px',
    },
    body: {
      margin: '0',
      padding: '0',
    },
    'table, th, td': {
      border: '1px solid #000',
      borderCollapse: 'collapse',
    },
    th: {
      padding: '10px',
      textAlign: 'left',
    },
    td: {
      padding: '10px',
      textAlign: 'left',
    },
    'textarea, button, input, select, a': {
      display: 'none',
    },
    '.header, .footer': {
      display: 'block',
    },
  },
};

function OrderDetails() {
  const { orderId } = useParams();
  const [orderDetails, setOrderDetails] = useState([]);
  const [status, setStatus] = useState('');
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    fetchOrderDetails();
  }, []);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/employee/orders/${orderId}`);
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
      const response = await fetch(`${API_BASE_URL}/employee/orders/${orderId}`, {
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

  const orderedBy = orderDetails.length > 0 ? orderDetails[0].Added_by : '';
  const comments = orderDetails.length > 0 ? orderDetails[0].Comments : '';

  return (
    <div style={styles.container}>
      <div id="printable-content">
        <div className="header" style={styles.printHeader}>
          Reshmi's Group Inc
        </div>
        {/* <h2 style={styles.heading}>Reshmisgroup</h2> */}
        <h3 style={styles.printHeader}>Order ID: {orderId}</h3>
        <h4 style={styles.printHeader}>Ordered by: {orderedBy}</h4>
        <table style={styles.table}>
          <thead>
            <tr>
            <th style={styles.th}>Quantity</th>
            <th style={styles.th}>SKU</th>
              <th style={styles.th}>Product Name</th>
              
              
              <th style={styles.th}>UOM</th>
            </tr>
          </thead>
          <tbody>
            {orderDetails.map(detail => (
              <tr key={detail.OrderItemID}>
               
                <td style={styles.td}>{detail.Quantity}</td>
                <td style={styles.td}>{detail.Sku}</td>
                <td style={styles.td}>{detail.Product_Name}</td>
                <td style={styles.td}>{detail.UOM}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div style={styles.commentsSection}>
          <label style={styles.commentsLabel}>Comments:</label>
          <p style={styles.commentsText}>{comments}</p>
        </div>
        {/* <div className="footer" style={styles.printFooter}>
          &copy; 2023 Reshmi's Group Inc
        </div> */}
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
