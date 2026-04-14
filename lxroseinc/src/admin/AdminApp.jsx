import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Header from './pages/Header';
import Home from './pages/Home';
import Footer from './pages/Footer';
import { getCurrentUser } from './utils/api';
import '../styles/admin.css';

function AdminApp() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [routeKey, setRouteKey] = useState(0);
  const [userId, setUserId] = useState(null);

  const handleLoginStatusChange = (status, userId) => {
    setLoggedIn(status);
    setUserId(userId);
  };

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('authToken');
    sessionStorage.removeItem('userId');
    sessionStorage.removeItem('authToken');
    setLoggedIn(false);
    setUserId(null);
    setRouteKey((prevKey) => prevKey + 1);
  };

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId') || sessionStorage.getItem('userId');
    const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    if (storedUserId && authToken) {
      getCurrentUser(storedUserId)
        .then(() => {
          setLoggedIn(true);
          setUserId(storedUserId);
        })
        .catch(() => {
          handleLogout();
        });
    }

    // Clear any previously stored dark theme
    localStorage.removeItem('theme');
    document.documentElement.removeAttribute('data-theme');
  }, []);

  useEffect(() => {
    document.body.classList.add('admin-body');

    return () => {
      document.body.classList.remove('admin-body');
    };
  }, []);

  return (
    <Router>
      <div className="admin-app-shell">
        <Header onLogout={handleLogout} loggedIn={loggedIn} />
        <Routes>
          <Route
            path="*"
            element={loggedIn ? <Home userId={userId} /> : <Login onLoginStatusChange={handleLoginStatusChange} />}
            key={routeKey}
          />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default AdminApp;
