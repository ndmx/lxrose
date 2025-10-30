import React, { useState } from 'react';
import '../styles/nursingForms.css';

const NursingForms = ({ onSubmitBooking, onRegister }) => {
  const [activeTab, setActiveTab] = useState('booking');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Booking State
  const [bookingDetails, setBookingDetails] = useState({
    serviceType: '',
    patientAge: '',
    careDuration: '',
    startDate: '',
    contactInfo: '',
    additionalNotes: '',
  });

  // Registration State
  const [nurseInfo, setNurseInfo] = useState({
    name: '',
    qualifications: '',
    yearsOfExperience: '',
    availability: '',
    email: '',
  });

  // Handle input changes for booking form
  const handleBookingChange = (e) => {
    setBookingDetails({ ...bookingDetails, [e.target.name]: e.target.value });
  };

  // Handle input changes for registration form
  const handleRegistrationChange = (e) => {
    setNurseInfo({ ...nurseInfo, [e.target.name]: e.target.value });
  };

  // Handle booking form submission
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmitBooking(bookingDetails);
      setSuccessMessage('✓ Booking submitted successfully! We\'ll contact you soon.');
      setBookingDetails({
        serviceType: '',
        patientAge: '',
        careDuration: '',
        startDate: '',
        contactInfo: '',
        additionalNotes: '',
      });
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error) {
      setSuccessMessage('× Error submitting booking. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  // Handle registration form submission
  const handleRegistrationSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onRegister(nurseInfo);
      setSuccessMessage('✓ Registration submitted successfully! We\'ll review your application.');
      setNurseInfo({
        name: '',
        qualifications: '',
        yearsOfExperience: '',
        availability: '',
        email: '',
      });
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
    } catch (error) {
      setSuccessMessage('× Error submitting registration. Please try again.');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="nursing-forms-container">
      {/* Tab Navigation */}
      <div className="nursing-tabs">
        <button
          className={`tab-button ${activeTab === 'booking' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('booking');
            setSuccessMessage('');
          }}
        >
          <span className="tab-icon">📋</span>
          Book a Nurse
        </button>
        <button
          className={`tab-button ${activeTab === 'registration' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('registration');
            setSuccessMessage('');
          }}
        >
          <span className="tab-icon">👨‍⚕️</span>
          Register as Nurse
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'booking' ? (
          <div className="form-wrapper">
            <div className="form-header">
              <h3>Book Nursing Services</h3>
              <p>Connect with our network of professional nurses for quality care</p>
            </div>

            <form className="nursing-form" onSubmit={handleBookingSubmit}>
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="serviceType">
                    Service Type <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="serviceType"
                    name="serviceType"
                    value={bookingDetails.serviceType}
                    onChange={handleBookingChange}
                    placeholder="e.g., In-home care, Post-surgery assistance"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="patientAge">
                    Patient Age <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="patientAge"
                    name="patientAge"
                    value={bookingDetails.patientAge}
                    onChange={handleBookingChange}
                    placeholder="Enter age"
                    required
                    disabled={isSubmitting}
                    min="0"
                    max="120"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="careDuration">
                    Care Duration <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="careDuration"
                    name="careDuration"
                    value={bookingDetails.careDuration}
                    onChange={handleBookingChange}
                    placeholder="e.g., 2 weeks, 3 months"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="startDate">
                    Start Date <span className="required">*</span>
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={bookingDetails.startDate}
                    onChange={handleBookingChange}
                    required
                    disabled={isSubmitting}
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="contactInfo">
                  Contact Information <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="contactInfo"
                  name="contactInfo"
                  value={bookingDetails.contactInfo}
                  onChange={handleBookingChange}
                  placeholder="Phone number or email"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-field">
                <label htmlFor="additionalNotes">Additional Notes</label>
                <textarea
                  id="additionalNotes"
                  name="additionalNotes"
                  value={bookingDetails.additionalNotes}
                  onChange={handleBookingChange}
                  placeholder="Any specific requirements or information?"
                  rows="4"
                  disabled={isSubmitting}
                />
              </div>

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Submitting...
                  </>
                ) : (
                  <>Submit Booking</>
                )}
              </button>

              {successMessage && (
                <div className={`success-message ${successMessage.includes('×') ? 'error' : ''}`}>
                  {successMessage}
                </div>
              )}
            </form>
          </div>
        ) : (
          <div className="form-wrapper">
            <div className="form-header">
              <h3>Register as a Nurse</h3>
              <p>Join our team and connect with clients who need your expertise</p>
            </div>

            <form className="nursing-form" onSubmit={handleRegistrationSubmit}>
              <div className="form-field">
                <label htmlFor="name">
                  Full Name <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={nurseInfo.name}
                  onChange={handleRegistrationChange}
                  placeholder="Enter your full name"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-field">
                <label htmlFor="email">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={nurseInfo.email}
                  onChange={handleRegistrationChange}
                  placeholder="your.email@example.com"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="qualifications">
                    Qualifications <span className="required">*</span>
                  </label>
                  <input
                    type="text"
                    id="qualifications"
                    name="qualifications"
                    value={nurseInfo.qualifications}
                    onChange={handleRegistrationChange}
                    placeholder="e.g., RN, LPN, CNA"
                    required
                    disabled={isSubmitting}
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="yearsOfExperience">
                    Years of Experience <span className="required">*</span>
                  </label>
                  <input
                    type="number"
                    id="yearsOfExperience"
                    name="yearsOfExperience"
                    value={nurseInfo.yearsOfExperience}
                    onChange={handleRegistrationChange}
                    placeholder="Years"
                    required
                    disabled={isSubmitting}
                    min="0"
                    max="60"
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="availability">
                  Availability <span className="required">*</span>
                </label>
                <select
                  id="availability"
                  name="availability"
                  value={nurseInfo.availability}
                  onChange={handleRegistrationChange}
                  required
                  disabled={isSubmitting}
                >
                  <option value="">Select availability</option>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Weekends only">Weekends only</option>
                  <option value="On-call">On-call</option>
                  <option value="Flexible">Flexible</option>
                </select>
              </div>

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    Submitting...
                  </>
                ) : (
                  <>Submit Registration</>
                )}
              </button>

              {successMessage && (
                <div className={`success-message ${successMessage.includes('×') ? 'error' : ''}`}>
                  {successMessage}
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default NursingForms;