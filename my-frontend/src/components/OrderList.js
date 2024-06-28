import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EditQuantityPopup from './EditQuantityPopup.js';

const OrderList = ({ username }) => {
    const [orders, setOrders] = useState([]);
    const [editQuantityPopup, setEditQuantityPopup] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const response = await fetch(`http://localhost:3000/user/main/orders/${username}`);
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
    }, [username]);

    const handleBack = () => {
        navigate(-1);
    };

    const EditQuantity = async (sku) => {
        try {
            const response = await fetch(`http://localhost:3000/api/edit-quantity/${sku}`, {
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
                const response = await fetch(`http://localhost:3001/api/delete-order-product/${sku}`, {
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
            const response = await fetch(`http://localhost:3000/user/main/orders/send/${orders[0].OrderID}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' }
            });
            if (response.ok) {
                alert('Order placed successfully. Thanks!');
                setOrders([]);
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
        const response = await fetch(`http://localhost:3001/api/edit-quantity/${sku}`, {
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
                            </td>
                            <td>
                                <button onClick={() => DeleteProduct(order.Sku)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {orders.length === 0 && <p>No orders yet.</p>}
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
