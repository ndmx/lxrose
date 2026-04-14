import React, { useState, useEffect } from 'react';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('hasSeenBanner')) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    document.cookie = 'consent=true; max-age=31536000; path=/; SameSite=Strict';
    localStorage.setItem('hasSeenBanner', 'true');
    setIsVisible(false);
  };

  const handleReject = () => {
    document.cookie = 'consent=false; max-age=31536000; path=/; SameSite=Strict';
    localStorage.setItem('hasSeenBanner', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="cookie-banner">
      <p>
        We use cookies to improve your experience. By continuing, you agree to our{' '}
        <a href="/privacy-policy" target="_blank">Privacy Policy</a>.
      </p>
      <div className="cookie-buttons">
        <button className="accept" onClick={handleAccept}>Accept</button>
        <button className="reject" onClick={handleReject}>Reject</button>
      </div>
    </div>
  );
};

export default CookieBanner;