import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as HashRouter, Route, Routes } from 'react-router-dom';
import Header from './pages/Header';
import Home from './pages/Home';
import Contact from './pages/Contact';
import About from './pages/About';
import Footer from './pages/Footer';
import { publicTheme } from './theme';
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
  return (
    <HashRouter>
      <div className="public-site-shell lumina-public" style={publicTheme}>
        <Header />
        <main id="main-content" className="page-content" tabIndex={-1}>
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
        <CookieBanner />
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
