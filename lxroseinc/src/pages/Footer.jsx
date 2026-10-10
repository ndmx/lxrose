import React from 'react';
import { Link } from 'react-router-dom';
export default function Footer() {
  return <footer className="lx-footer">
    <div><strong>LxRose Inc.</strong><p>Care, thoughtfully connected.</p><p>© {new Date().getFullYear()} LxRose Inc.</p></div>
    <div className="lx-footer-links"><Link to="/contact">Contact us</Link><Link to="/privacy-policy">Privacy policy</Link><a href="https://lxrose.org">Staff sign in ↗</a></div>
  </footer>;
}
