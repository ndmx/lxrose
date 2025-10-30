import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ onLogout, loggedIn, theme, toggleTheme }) => {
  return (
    <header id="mainHeader">
      <div id="logo">
        <Link to="/">
          <img
            src="/logo512.png"
            id="logo-img"
            alt="Logo"
          />
        </Link>
      </div>
      <nav id="mainNav">
        <ul>
          {loggedIn ? (
            <li><Link to="/logout" onClick={onLogout}>Logout</Link></li>
          ) : (
            <li><Link to="/">Login</Link></li>
          )}
          <li>
            <button onClick={toggleTheme} className="theme-toggle">
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;