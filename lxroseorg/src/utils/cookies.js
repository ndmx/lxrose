// src/utils/useCookieConsent.js
import { useEffect } from 'react';

const setCookie = (name, value, days) => {
  const maxAge = days * 24 * 60 * 60;
  document.cookie = `${name}=${value}; max-age=${maxAge}`;
};

export const useCookieConsent = () => {
  useEffect(() => {
    if (localStorage.getItem('visited') === null) {
      console.log('Welcome to our site!');
      localStorage.setItem('visited', 'true');
    } else {
      console.log('Welcome back!');
    }

    const hasConsent = document.cookie.split(';').some((item) => item.trim().startsWith('consent=true'));

    if (!hasConsent) {
      const hasSeenBanner = localStorage.getItem('hasSeenBanner');
      if (!hasSeenBanner) {
        const cookieBanner = document.createElement('div');
        // Add styles to the cookieBanner if needed
        cookieBanner.style.position = 'fixed';  // or 'absolute' or 'relative' based on your need
        cookieBanner.style.bottom = '60px';  // Adjust the position so it doesn't overlap with footer
        cookieBanner.style.left = '0';
        cookieBanner.style.zIndex = '10000';  // High z-index to make it appear on top
        cookieBanner.style.width = '100%';
        cookieBanner.style.backgroundColor = '#333';
        cookieBanner.style.color = 'white';
        cookieBanner.style.textAlign = 'center';
        cookieBanner.innerHTML = 'We use cookies to improve your experience. <button id="acceptCookies">Accept</button> <button id="rejectCookies">Reject</button>';

        document.body.appendChild(cookieBanner);

        document.getElementById('acceptCookies').addEventListener('click', function () {
          setCookie('consent', 'true', 3);
          cookieBanner.remove();
        });

        document.getElementById('rejectCookies').addEventListener('click', function () {
          setCookie('consent', 'false', 3);
          cookieBanner.remove();
        });

        localStorage.setItem('hasSeenBanner', 'true');
      }
    }

    localStorage.setItem('lastVisit', new Date().toLocaleDateString());
  }, []);
};