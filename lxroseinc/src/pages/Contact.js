import React, { useState } from 'react';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';
import '../styles/contactPage.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [errors, setErrors] = useState({});
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [charCount, setCharCount] = useState(0);

  const subjectOptions = [
    { value: '', label: 'Select a subject...' },
    { value: 'general', label: 'General Inquiry' },
    { value: 'mental', label: 'Mental Health Services' },
    { value: 'nursing', label: 'Nursing Services' },
    { value: 'nutrition', label: 'Nutrition Services' },
    { value: 'appointment', label: 'Schedule Appointment' },
    { value: 'billing', label: 'Billing Question' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'other', label: 'Other' }
  ];

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone && !/^[\d\s\-+()]+$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (!formData.subject) {
      newErrors.subject = 'Please select a subject';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'message') {
      setCharCount(value.length);
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
  
    try {
      const timestamp = Timestamp.fromDate(new Date());
      await addDoc(collection(db, 'contactForms'), {
        ...formData,
        timestamp
      });
      
      setAlertMessage('✅ Thank you! We\'ll get back to you within 24 hours.');
      setShowAlert(true);
  
      setTimeout(() => {
        setShowAlert(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
        setCharCount(0);
        setIsSubmitting(false);
      }, 4000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setAlertMessage('❌ An error occurred. Please try again or contact us directly.');
      setShowAlert(true);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <div id="home-banner" className="banner">
        <div className="container">
          <div className="header-text">
            <h1>Contact Us</h1>
            <p className="banner-subtitle">We're here to help you every step of the way</p>
          </div>
        </div>
      </div>

      <div id="mainContent" className="contact-content">
        {/* Quick Contact Cards */}
        <section className="quick-contact-section">
          <div className="quick-contact-grid">
            <a href="mailto:info@lxroseinc.com" className="contact-card">
              <div className="card-icon email-icon">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
              <h3>Email Us</h3>
              <p>info@lxroseinc.com</p>
              <span className="card-action">Send an email →</span>
            </a>

            <a href="tel:+18852422860" className="contact-card">
              <div className="card-icon phone-icon">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
              </div>
              <h3>Call Us</h3>
              <p>(885) 242-2860</p>
              <span className="card-action">Make a call →</span>
            </a>

            <div className="contact-card info-card">
              <div className="card-icon hours-icon">
                <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
                  <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                </svg>
              </div>
              <h3>Office Hours</h3>
              <p>Mon-Fri: 9AM - 6PM</p>
              <span className="card-note">24/7 support available</span>
            </div>
          </div>
        </section>

        {/* Main Contact Form Section */}
        <section className="contact-form-section">
          <div className="form-container">
            <div className="form-header">
              <h2>Send Us a Message</h2>
              <p>Fill out the form below and we'll get back to you within 24 hours</p>
              <div className="trust-badges">
                <span className="trust-badge">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                  </svg>
                  Secure & Private
                </span>
                <span className="trust-badge">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Quick Response
                </span>
              </div>
            </div>

            <form className="modern-contact-form" onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="name">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={errors.name ? 'error' : ''}
                    placeholder="John Doe"
                    disabled={isSubmitting}
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'error' : ''}
                    placeholder="john@example.com"
                    disabled={isSubmitting}
                  />
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="phone">Phone Number <span className="optional">(Optional)</span></label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={errors.phone ? 'error' : ''}
                    placeholder="(885) 242-2860"
                    disabled={isSubmitting}
                  />
                  {errors.phone && <span className="error-message">{errors.phone}</span>}
                </div>

                <div className="form-field">
                  <label htmlFor="subject">Subject *</label>
                  <select
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleInputChange}
                    className={errors.subject ? 'error' : ''}
                    disabled={isSubmitting}
                  >
                    {subjectOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.subject && <span className="error-message">{errors.subject}</span>}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="message">
                  Message *
                  <span className="char-counter">{charCount}/1000</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className={errors.message ? 'error' : ''}
                  placeholder="Tell us how we can help you..."
                  rows="6"
                  maxLength="1000"
                  disabled={isSubmitting}
                ></textarea>
                {errors.message && <span className="error-message">{errors.message}</span>}
              </div>

              <button 
                type="submit" 
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                    </svg>
                  </>
                )}
              </button>

              {showAlert && (
                <div className={`alert-message ${alertMessage.includes('✅') ? 'success' : 'error'}`}>
                  <p>{alertMessage}</p>
                </div>
              )}
            </form>
          </div>

          {/* Quick Service Links */}
          <div className="service-links-section">
            <h3>Or Book Directly</h3>
            <p>Skip the form and book a service right away</p>
            <div className="service-links">
              <Link to="/mentalservices" className="service-link">
                <span className="service-emoji">🧠</span>
                <span>Mental Health</span>
              </Link>
              <Link to="/nursingservices" className="service-link">
                <span className="service-emoji">⚕️</span>
                <span>Nursing Care</span>
              </Link>
              <Link to="/nutritionservices" className="service-link">
                <span className="service-emoji">🥗</span>
                <span>Nutrition</span>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Contact;