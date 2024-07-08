import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './EmployeeCustomers.css';

function EmployeeCustomers() {
    const [customers, setCustomers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    useEffect(() => {
        fetchCustomers();
    }, []);

    const fetchCustomers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/employee/customers`);
            const data = await response.json();
            setCustomers(data);
        } catch (error) {
            console.error('Error fetching customers:', error);
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredCustomers = customers.filter(customer =>
        customer.Name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="customers-container">
            <h2>Customers List</h2>
            <input
                type="text"
                placeholder="Search by Name"
                value={searchTerm}
                onChange={handleSearch}
                className="search-bar"
            />
            <table className="customers-table">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>Current Orders</th>
                        <th>Fulfilled Orders</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredCustomers.map((customer) => (
                        <tr key={customer.UserId}>
                            <td>{customer.UserId}</td>
                            <td>{customer.Name}</td>
                            <td>{customer.Email}</td>
                            <td>{customer.Phone}</td>
                            <td>{customer.FullAddress}</td>
                            <td>
                                <Link to={`/employee/orders/${customer.Name}/current`}>{customer.CurrentOrders}</Link>
                            </td>
                            <td>
                                <Link to={`/employee/orders/${customer.Name}/fulfilled`}>{customer.FulfilledOrders}</Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default EmployeeCustomers;
