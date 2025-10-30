import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Login from './pages/Login';
import Header from './pages/Header';
import Home from './pages/Home';
import Footer from './pages/Footer';

function App() {
  
  const [loggedIn, setLoggedIn] = useState(false);
  const [routeKey, setRouteKey] = useState(0);
  const [userId, setUserId] = useState(null); // Use null instead of 'null'

  const handleLoginStatusChange = (status, userId) => {
    setLoggedIn(status);
    setUserId(userId);
  };

  const handleLogout = () => {
    // Remove userId from localStorage during logout
    localStorage.removeItem('userId');
    setLoggedIn(false);
    setUserId(null);
    setRouteKey((prevKey) => prevKey + 1);
  };

  useEffect(() => {
    // Check if a userId exists in localStorage
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setLoggedIn(true);
      setUserId(storedUserId);
    }
  }, []);

  useEffect(() => {
    console.log('User ID:', userId);
  }, [userId]);

  return (
    <Router>
      <Header onLogout={handleLogout} loggedIn={loggedIn} />
      <Routes>
        <Route path="/" element={loggedIn ? <Home userId={userId} /> : <Login onLoginStatusChange={handleLoginStatusChange} />} key={routeKey} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;
