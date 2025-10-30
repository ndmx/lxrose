import React from 'react';
import NursingForms from '../utils/NursingForms'; // Updated component import
import { addDoc, collection, Timestamp } from 'firebase/firestore'; // Firebase imports
import { db } from '../firebase'; // Ensure Firebase is correctly set up

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
    <div>
      <div id="home-banner4" className="banner">
        <div className="container">
          <div className="header-text">
            <h1>Nursing Services</h1>
          </div>
        </div>
      </div>

      <section id="nursing-services-section">
        <div id="home-banner5" className="banner">
          <div className="container">
            <div className="header-text" id="block-h1">
              <h1>Book a Nurse or Register as one today</h1>
            </div>

            <div className="nursing-block-container">
              <div className="nursing-block">
                <NursingForms
                  onRegister={handleNurseRegister}
                  onSubmitBooking={handleBookingSubmit}
                />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default NursingServices;