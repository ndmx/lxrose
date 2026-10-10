import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const [open, setOpen] = useState(false);
  const toggle = useRef(null);
  const location = useLocation();
  useEffect(() => { setOpen(false); }, [location.pathname, location.hash]);
  useEffect(() => {
    if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
    else window.scrollTo({ top: 0, behavior: 'instant' });
  }, [location.pathname, location.hash]);
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
        <Link to="/#services" onClick={() => setOpen(false)}>Our services</Link>
        <Link to="/about" onClick={() => setOpen(false)}>About LxRose</Link>
        <Link to="/faq" onClick={() => setOpen(false)}>Questions</Link>
        <Link className="lx-button lx-button-small" to="/contact" onClick={() => setOpen(false)}>Find your care <span aria-hidden="true">↗</span></Link>
      </nav>
    </header>
  );
}
