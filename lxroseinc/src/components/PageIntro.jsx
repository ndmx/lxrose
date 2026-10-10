import React from 'react';

export default function PageIntro({ eyebrow, title, children }) {
  return <div className="lx-page-intro">
    <p className="lx-eyebrow">{eyebrow}</p>
    <h1>{title}</h1>
    <div className="lx-page-description">{children}</div>
  </div>;
}
