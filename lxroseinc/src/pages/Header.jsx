import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { servicePaths } from '../components/ServiceLinks';

export default function Header() {
  const [open, setOpen] = useState(false);
  const toggle = useRef(null);
  const location = useLocation();
  useEffect(() => { setOpen(false); }, [location.pathname, location.hash]);
  const closeOnEscape = (event) => {
    if (event.key === 'Escape' && open) { setOpen(false); toggle.current?.focus(); }
  };
  return (
    <header className="lx-header" onKeyDown={closeOnEscape}>
      <a className="lx-skip" href="#main-content">Skip to content</a>
      <Link className="lx-brand" to="/" aria-label="LxRose home">
        <img src="/logo512.png" alt="" width="48" height="48" />
        <span>LxRose<span className="lx-brand-note">Care, thoughtfully connected.</span></span>
      </Link>
      <button className="lx-menu-toggle" ref={toggle} type="button" aria-expanded={open} aria-controls="lx-navigation" onClick={() => setOpen(!open)}>
        {open ? 'Close' : 'Menu'} <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      <nav id="lx-navigation" className={`lx-navigation ${open ? 'is-open' : ''}`} aria-label="Main navigation">
        <Link to="/services" aria-current={location.pathname === "/services" ? "page" : servicePaths.includes(location.pathname) ? "true" : undefined} onClick={() => setOpen(false)}>Our services</Link>
        <NavLink to="/about" onClick={() => setOpen(false)}>About LxRose</NavLink>
        <NavLink to="/faq" onClick={() => setOpen(false)}>Questions</NavLink>
        <NavLink className="lx-button lx-button-small" to="/contact" onClick={() => setOpen(false)}>Find your care <span aria-hidden="true">↗</span></NavLink>
      </nav>
    </header>
  );
}
