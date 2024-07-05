import React, { useState, useEffect } from 'react';

const Profile = ({ username }) => {
  const [userDetails, setUserDetails] = useState({
    username: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    zip: ''
  });
  const [error, setError] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/user/${username}`);
        if (!response.ok) {
          throw new Error('Failed to fetch user details');
        }
        const data = await response.json();
        setUserDetails({
          username: data.ClientName,
          email: data.Email,
          phone: data.Phone,
          address: data.Address,
          city: data.City,
          country: data.Country,
          zip: data.Zip
        });
      } catch (error) {
        console.error('Error:', error);
        setError('Error fetching user details');
      }
    };

    fetchUserDetails();
  }, [username, API_BASE_URL]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`${API_BASE_URL}/user/${username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userDetails)
      });
      if (!response.ok) {
        throw new Error('Failed to update user details');
      }
      alert('User details updated successfully');
    } catch (error) {
      console.error('Error:', error);
      setError('Error updating user details');
    }
  };

  return (
    <div className="profile">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Username</label>
          <input
            type="text"
            name="username"
            value={userDetails.username}
            onChange={handleChange}
            disabled
          />
        </div>
        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={userDetails.email}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Phone</label>
          <input
            type="text"
            name="phone"
            value={userDetails.phone}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Address</label>
          <input
            type="text"
            name="address"
            value={userDetails.address}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>City</label>
          <input
            type="text"
            name="city"
            value={userDetails.city}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Country</label>
          <input
            type="text"
            name="country"
            value={userDetails.country}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Zip</label>
          <input
            type="text"
            name="zip"
            value={userDetails.zip}
            onChange={handleChange}
          />
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};

export default Profile;
