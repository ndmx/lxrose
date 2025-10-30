import React, { useEffect, useState } from 'react';
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
import './styles/faq.css';

function App() {
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
      <Header />
      <CookieBanner /> {/* Render Cookie Banner */}
      {showPopup && <Popup handleClose={handleClose} />}
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
      <Footer />
    </HashRouter>
  );
}

export default App;