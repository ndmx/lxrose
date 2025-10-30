import React, { useState } from 'react';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

const Popup = ({ handleClose }) => {
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    const { name, email } = formData;

    try {
      const timestamp = Timestamp.fromDate(new Date());
      await addDoc(collection(db, 'joinForms'), {
        name,
        email,
        timestamp,
      });
      setMessage('✅ Thanks for joining! We\'ll be in touch soon.');
      setFormData({ name: '', email: '' });
      
      setTimeout(() => {
        handleClose();
      }, 3000);
    } catch (error) {
      console.error('Error adding document: ', error);
      setMessage('❌ An error occurred. Please try again later.');
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleDismiss = () => {
    // Store dismissal in localStorage so it doesn't show again this session
    localStorage.setItem('welcomeBannerDismissed', 'true');
    handleClose();
  };

  return (
    <div className="welcome-banner-container">
      <div className="welcome-banner">
        {!showForm ? (
          <div className="banner-content">
            <span className="banner-emoji">👋</span>
            <div className="banner-text">
              <strong>Welcome to LxRose!</strong>
              <span>Join our community for exclusive health tips and updates.</span>
            </div>
            <div className="banner-actions">
              <button className="banner-btn primary" onClick={() => setShowForm(true)}>
                Join Now
              </button>
              <button className="banner-btn close" onClick={handleDismiss} aria-label="Close banner">
                ✕
              </button>
            </div>
          </div>
        ) : (
          <div className="banner-form-content">
            {message ? (
              <div className="banner-message">
                <p>{message}</p>
              </div>
            ) : (
              <form className="banner-form" onSubmit={handleSubmit}>
                <div className="form-inputs">
                  <input
                    type="text"
                    placeholder="Your name"
                    name="name"
                    required
                    onChange={handleInputChange}
                    value={formData.name}
                    disabled={isSubmitting}
                  />
                  <input
                    type="email"
                    placeholder="Your email"
                    name="email"
                    required
                    onChange={handleInputChange}
                    value={formData.email}
                    disabled={isSubmitting}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="banner-btn primary" disabled={isSubmitting}>
                    {isSubmitting ? 'Joining...' : 'Sign Up'}
                  </button>
                  <button 
                    type="button" 
                    className="banner-btn secondary" 
                    onClick={() => setShowForm(false)}
                    disabled={isSubmitting}
                  >
                    Back
                  </button>
                  <button 
                    type="button" 
                    className="banner-btn close" 
                    onClick={handleDismiss}
                    disabled={isSubmitting}
                    aria-label="Close banner"
                  >
                    ✕
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Popup;