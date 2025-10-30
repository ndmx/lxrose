import React from 'react';
import NursingForms from '../utils/NursingForms'; // Updated component import
import { addDoc, collection, Timestamp } from 'firebase/firestore'; // Firebase imports
import { db } from '../firebase'; // Ensure Firebase is correctly set up
import '../styles/servicePages.css'; // Import service pages styling

const NursingServices = () => {
  const handleBookingSubmit = async (bookingDetails) => {
    try {
      const timestamp = Timestamp.fromDate(new Date()); // Add a timestamp
      const docRef = await addDoc(collection(db, 'nursingServiceBookings'), {
        ...bookingDetails,
        timestamp,
      });
      console.log('Booking submitted successfully:', docRef.id);
      alert('Nurse booking submitted successfully!');
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('An error occurred while submitting the booking. Please try again later.');
    }
  };

  const handleNurseRegister = async (nurseInfo) => {
    try {
      const timestamp = Timestamp.fromDate(new Date()); // Add a timestamp
      const docRef = await addDoc(collection(db, 'nurseRegistrations'), {
        ...nurseInfo,
        timestamp,
      });
      console.log('Registration submitted successfully:', docRef.id);
      alert('Nurse registration submitted successfully!');
    } catch (error) {
      console.error('Error submitting registration:', error);
      alert('An error occurred while submitting the registration. Please try again later.');
    }
  };

  return (
    <div className="service-page">
      {/* Hero Banner */}
      <div className="service-hero-banner nursing-hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">Nursing Care Services</h1>
          <p className="hero-subtitle">Professional nursing care for your loved ones</p>
        </div>
      </div>

      {/* Services Section */}
      <section className="services-section nursing-section">
        <div className="section-header">
          <h2>Book a Nurse or Register as One</h2>
          <p>Connect with our network of professional nurses or join our team</p>
        </div>

        <div className="nursing-forms-wrapper">
          <NursingForms
            onRegister={handleNurseRegister}
            onSubmitBooking={handleBookingSubmit}
          />
        </div>
      </section>
    </div>
  );
};

export default NursingServices;