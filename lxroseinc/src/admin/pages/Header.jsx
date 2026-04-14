import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ onLogout, loggedIn }) => {
  return (
    <header className="admin-topbar">
      <div className="admin-brand">
        <Link to="/">
          <img
            src="/logo512.png"
            className="admin-brand-logo"
            alt="LxRose"
          />
          <span>LxRose Admin</span>
        </Link>
      </div>
      <nav className="admin-nav" aria-label="Admin navigation">
        <ul>
          {loggedIn ? (
            <li><Link to="/logout" onClick={onLogout}>Sign Out</Link></li>
          ) : (
            <li><Link to="/">Login</Link></li>
          )}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
