import PageIntro from '../components/PageIntro';
import React, { useState } from 'react';
import { submitPublicForm } from '../firebase';
import { Link } from 'react-router-dom';

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

    if (name === 'message') setCharCount(value.length);

    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await submitPublicForm('contactForms', formData);
      setAlertMessage('Thank you! We\'ll get back to you within 24 hours.');
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setCharCount(0);
        setIsSubmitting(false);
      }, 4000);
    } catch (error) {
      console.error('Error submitting form:', error);
      setAlertMessage('An error occurred. Please try again or contact us directly.');
      setShowAlert(true);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="lx-page contact-page">

      {/* Hero */}
      <PageIntro eyebrow="Find your care" title="A conversation is a good start.">
        <p>Have a question or ready to start? Reach out and our team will respond within one business day.</p>
      </PageIntro>

      <div className="contact-section">

        {/* Contact details row */}
        <section className="contact-details-section">
          <a href="mailto:info@lxroseinc.com" className="contact-detail-card">
            <svg className="contact-detail-icon" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            <div>
              <span className="contact-detail-label">Email</span>
              <span className="contact-detail-value">info@lxroseinc.com</span>
            </div>
          </a>

          <a href="tel:+18852422860" className="contact-detail-card">
            <svg className="contact-detail-icon" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            <div>
              <span className="contact-detail-label">Phone</span>
              <span className="contact-detail-value">(885) 242-2860</span>
            </div>
          </a>

          <div className="contact-detail-card">
            <svg className="contact-detail-icon" viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
            </svg>
            <div>
              <span className="contact-detail-label">Office Hours</span>
              <span className="contact-detail-value">Mon – Fri: 9 AM – 6 PM</span>
              <span className="contact-detail-note">24/7 support available</span>
            </div>
          </div>
        </section>

        {/* Main panel: info + form */}
        <section className="contact-main-section">

          {/* Left info */}
          <div className="contact-info-col">
            <span className="contact-kicker">How can we help?</span>
            <h2>We're here whenever you need us.</h2>
            <p>
              Whether you have a question about our services, want to schedule
              an appointment, or need to get in touch with our team — we're
              always happy to hear from you.
            </p>

            <div className="contact-service-list">
              <p className="contact-service-list-label">Book directly</p>
              <Link to="/mentalservices" className="contact-service-link">
                Mental Health
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
              </Link>
              <Link to="/nursingservices" className="contact-service-link">
                Nursing Care
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
              </Link>
              <Link to="/nutritionservices" className="contact-service-link">
                Nutrition
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6z"/></svg>
              </Link>
            </div>
          </div>

          {/* Right form */}
          <div className="contact-form-col">
            <span className="contact-kicker">Send a message</span>
            <h2>Tell us what you need.</h2>

            <form className="contact-form" onSubmit={handleSubmit} noValidate>

              <div className="cf-row">
                <div className="cf-field">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name" maxLength={120}
                    value={formData.name}
                    onChange={handleInputChange}
                    className={errors.name ? 'cf-error' : ''}
                    placeholder="Full name"
                    disabled={isSubmitting}
                    autoComplete="name"
                  />
                  {errors.name && <span className="cf-error-msg">{errors.name}</span>}
                </div>

                <div className="cf-field">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email" maxLength={254}
                    value={formData.email}
                    onChange={handleInputChange}
                    className={errors.email ? 'cf-error' : ''}
                    placeholder="Email Address"
                    disabled={isSubmitting}
                    autoComplete="email"
                  />
                  {errors.email && <span className="cf-error-msg">{errors.email}</span>}
                </div>
              </div>

              <div className="cf-row">
                <div className="cf-field">
                  <label htmlFor="phone">
                    Phone
                    <span className="cf-optional">Optional</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone" maxLength={40}
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={errors.phone ? 'cf-error' : ''}
                    placeholder="(885) 242-2860"
                    disabled={isSubmitting}
                    autoComplete="tel"
                  />
                  {errors.phone && <span className="cf-error-msg">{errors.phone}</span>}
                </div>

                <div className="cf-field">
                  <label htmlFor="subject">Subject</label>
                  <div className="cf-select-wrap">
                    <select
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className={errors.subject ? 'cf-error' : ''}
                      disabled={isSubmitting}
                    >
                      {subjectOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <svg className="cf-chevron" viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>
                  </div>
                  {errors.subject && <span className="cf-error-msg">{errors.subject}</span>}
                </div>
              </div>

              <div className="cf-field">
                <label htmlFor="message">
                  Message
                  <span className="cf-char-count">{charCount}/1000</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  className={errors.message ? 'cf-error' : ''}
                  placeholder="Tell us how we can help you..."
                  rows="6"
                  maxLength="1000"
                  disabled={isSubmitting}
                />
                {errors.message && <span className="cf-error-msg">{errors.message}</span>}
              </div>

              <button id="contact-form-btn" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <><span className="cf-spinner" /> Sending…</>
                ) : (
                  'Send Message'
                )}
              </button>

              {showAlert && (
                <div id="customAlertContact" role="status" aria-live="polite">
                  <p id="alertMessageContact">{alertMessage}</p>
                  <button
                    id="closeAlertContact"
                    type="button"
                    onClick={() => setShowAlert(false)}
                    aria-label="Dismiss message"
                  >
                    Close
                  </button>
                </div>
              )}

            </form>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Contact;
