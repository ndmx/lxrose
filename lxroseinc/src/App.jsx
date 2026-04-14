import React, { Suspense, lazy, useEffect, useState } from 'react';
import { BrowserRouter as HashRouter, Route, Routes } from 'react-router-dom';
import Header from './pages/Header';
import Home from './pages/Home';
import Contact from './pages/Contact';
import About from './pages/About';
import Footer from './pages/Footer';
import Popup from './pages/Popup';
import CookieBanner from './utils/CookieBanner'; // Adjusted import path
import PrivacyPolicy from './pages/PrivacyPolicy';
import NutritionServices from './pages/NutritionServices';
import MentalServices from './pages/MentalServices';
import NursingServices from './pages/NursingServices';
import FAQ from './components/FAQ';

const AdminApp = lazy(() => import('./admin/AdminApp'));

const isAdminHost = () => {
  const configuredMode = import.meta.env.VITE_SITE_MODE;

  if (configuredMode) {
    return configuredMode.toLowerCase() === 'admin';
  }

  return ['lxrose.org', 'www.lxrose.org'].includes(window.location.hostname);
};

const setMetaContent = (selector, content) => {
  const element = document.head.querySelector(selector);
  if (element) {
    element.setAttribute('content', content);
  }
};

function PublicApp() {
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    // Check if banner was dismissed this session
    const bannerDismissed = sessionStorage.getItem('welcomeBannerDismissed');
    const bannerDismissedPermanent = localStorage.getItem('welcomeBannerDismissed');
    
    // Show banner only if not dismissed in this session or permanently
    if (!bannerDismissed && !bannerDismissedPermanent) {
      // Small delay before showing banner for better UX
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setShowPopup(false);
    // Store in sessionStorage so it doesn't show again this session
    sessionStorage.setItem('welcomeBannerDismissed', 'true');
  };

  return (
    <HashRouter>
      <div className="public-site-shell">
        <Header />
        <CookieBanner /> {/* Render Cookie Banner */}
        {showPopup && <Popup handleClose={handleClose} />}
        <main className="page-content">
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/mentalservices" element={<MentalServices />} />
            <Route path="/nutritionservices" element={<NutritionServices />} />
            <Route path="/nursingservices" element={<NursingServices />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/about" element={<About />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
}

function App() {
  const adminHost = isAdminHost();

  useEffect(() => {
    const siteUrl = adminHost ? 'https://lxrose.org' : 'https://lxroseinc.com';
    const siteName = adminHost ? 'LxRose.Org' : 'LxRose Inc.';
    const title = adminHost ? 'LxRose.Org' : 'LxRose Inc.';

    document.title = title;
    setMetaContent('meta[property="og:title"]', adminHost ? 'Transforming Healthcare Through Tech - LxRose' : 'Transforming Healthcare Through Tech - LxRose Inc.');
    setMetaContent('meta[property="og:url"]', siteUrl);
    setMetaContent('meta[property="og:site_name"]', siteName);
    setMetaContent('meta[name="twitter:site"]', adminHost ? '@LxRose' : '@LxRoseInc');
    setMetaContent('meta[name="twitter:title"]', adminHost ? 'Revolutionizing Healthcare - LxRose' : 'Revolutionizing Healthcare - LxRose Inc.');

    const canonical = document.head.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', siteUrl);
    }
  }, [adminHost]);

  if (adminHost) {
    return (
      <Suspense fallback={<div />}>
        <AdminApp />
      </Suspense>
    );
  }

  return <PublicApp />;
}

export default App;
