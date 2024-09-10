import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './components/Home';
import Header from './components/Header';
import Footer from './components/Footer';
import MainContent from './components/MainContent';
import OrderDetails from './components/OrderDetails';
import CustomerContent from './components/CustomerContent';
import QFCContent from './components/QFCContent'; // Import the new component
import EmployeeHeader from './components/EmployeeHeader';
import CustomerHeader from './components/CustomerHeader';
import QFCHeader from './components/QFCHeader'; // Import the new header component
import EditProduct from './components/EditProduct';
import Signup from './components/Signup';
import Profile from './components/Profile';
import SideNav from './components/SideNav';
import NewArrivals from './components/NewArrivals';
import SpecialDeals from './components/SpecialDeals';
import OrderList from './components/OrderList';
import EmployeeOrders from './components/EmployeeOrders';
import EmployeeProducts from './components/EmployeeProducts';
import EmployeeCustomers from './components/EmployeeCustomers';
import PreviousOrderDetails from './components/PreviousOrderDetails';
import PreviousOrders from './components/PreviousOrders';
import ForgotPassword from './components/ForgotPassword';
import EmployeeOrderDetails from './components/EmployeeOrderDetails';
import EmployeeViewDetails from './components/EmployeeViewDetails';
import './App.css';
import HomeFooter from './components/HomeFooter';
import OrderInstantly from './components/OrderInstantly';
import QuickScanInventory from './components/QuickScanInventory';
import ScannedInventoryPage from './components/ScannedInventoryPage';

function App() {
  const [userRole, setUserRole] = useState(null);
  const [username, setUsername] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isNavOpen, setIsNavOpen] = useState(true);
  

  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  useEffect(() => {
    const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
    if (loggedInUser) {
      setUserRole(loggedInUser.role);
      setUsername(loggedInUser.username);
    }
    setLoading(false);
  }, []);

  const handleLogin = (data) => {
    setUserRole(data.userRole);
    setUsername(data.clientName);
    localStorage.setItem('loggedInUser', JSON.stringify({ username: data.clientName, role: data.userRole }));
  };

  const handleLogout = () => {
    setUserRole(null);
    setUsername(null);
    localStorage.removeItem('loggedInUser');
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  const renderHeader = () => {
    switch (userRole) {
      case 'admin':
        return <Header username={username} onLogout={handleLogout} />;
      case 'employee':
        return <EmployeeHeader username={username} onLogout={handleLogout} />;
      case 'user':
        return <CustomerHeader username={username} onLogout={handleLogout} />;
      case 'qfc':  // Add the case for qfc
        return <QFCHeader username={username} onLogout={handleLogout} />;
      default:
        return null;
    }
  };

  return (
    <Router>
      <div className={`app-container ${isNavOpen ? 'with-sidenav' : ''}`} id="root">
        {userRole && renderHeader()}
        {userRole && <SideNav toggleNav={toggleNav} />}
        <div className={`main-content ${isNavOpen ? 'with-sidenav' : ''}`}>
          <Routes>
            <Route
              path="/"
              element={
                !userRole ? (
                  <Home onLogin={handleLogin} />
                ) : (
                  <Navigate replace to={`/${userRole}/main`} />
                )
              }
            />
            <Route path="/signup" element={<Signup />} />
            <Route path="/orderinstantly" element={<OrderInstantly />} />
          
            <Route
              path="/admin/main"
              element={userRole === 'admin' ? <MainContent username={username} /> : <Navigate replace to="/" />}
            />
            <Route
              path="/user/main"
              element={userRole === 'user' ? <CustomerContent username={username} /> : <Navigate replace to="/" />}
            />
            <Route
              path="/qfc/main"
              element={userRole === 'qfc' ? <QFCContent username={username} /> : <Navigate replace to="/" />}
            />
            <Route
              path="/employee/main"
              element={userRole === 'employee' ? <EmployeeOrders username={username} /> : <Navigate replace to="/" />}
            />
            <Route
              path="/employee/orders"
              element={userRole === 'employee' ? <EmployeeOrders /> : <Navigate replace to="/" />}
            />
            <Route
              path="/employee/orders/:orderId"
              element={userRole === 'employee' ? <OrderDetails /> : <Navigate replace to="/" />}
            />
            <Route
              path="/employee/products"
              element={userRole === 'employee' ? <EmployeeProducts /> : <Navigate replace to="/" />}
            />
            <Route
              path="/employee/customers"
              element={userRole === 'employee' ? <EmployeeCustomers /> : <Navigate replace to="/" />}
            />
            <Route
              path="/employee/quickscan"
              element={userRole === 'employee' ? <QuickScanInventory /> : <Navigate replace to="/" />}
            />
             <Route
        path="/employee/inventory"
        element={userRole === 'employee' ? <ScannedInventoryPage /> : <Navigate replace to="/" />}
      />
            <Route
  path="/cart"
  element={(userRole === 'admin' || userRole === 'user' || userRole === 'qfc' || !userRole) ? <OrderList username={username} /> : <Navigate replace to="/" />}
/>

            <Route
              path="/edit/:productId"
              element={userRole === 'admin' ? <EditProduct /> : <Navigate replace to="/" />}
            />
            <Route
              path="/profile"
              element={userRole ? <Profile username={username} /> : <Navigate replace to="/" />}
            />
            <Route path="/new-arrivals" element={<NewArrivals username={username} />} />
            <Route path="/special-deals" element={<SpecialDeals username={username} />} />
            <Route
              path="/previous-orders"
              element={userRole === 'user' ? <PreviousOrders username={username} /> : <Navigate replace to="/" />}
            />
            <Route
              path="/previous-order-details/:orderId"
              element={userRole === 'user' ? <PreviousOrderDetails /> : <Navigate replace to="/" />}
            />
            <Route
              path="/employee/orders/:clientName/:orderType"
              element={userRole === 'employee' ? <EmployeeOrderDetails /> : <Navigate replace to="/" />}
            />
            <Route
              path="/employee/orders/:clientName/:orderType/:orderId"
              element={userRole === 'employee' ? <EmployeeViewDetails /> : <Navigate replace to="/" />}
            />
          </Routes>
        </div>
        {userRole && <Footer />}
      </div>
    </Router>
  );
}

export default App;
