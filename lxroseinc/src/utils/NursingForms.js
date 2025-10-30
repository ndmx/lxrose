import React, { useState } from 'react';

const NursingForms = ({ onSubmitBooking, onRegister }) => {
  const [isBooking, setIsBooking] = useState(true);

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
  const handleBookingSubmit = (e) => {
    e.preventDefault();
    onSubmitBooking(bookingDetails);
    setBookingDetails({
      serviceType: '',
      patientAge: '',
      careDuration: '',
      startDate: '',
      contactInfo: '',
      additionalNotes: '',
    });
  };

  // Handle registration form submission
  const handleRegistrationSubmit = (e) => {
    e.preventDefault();
    onRegister(nurseInfo);
    setNurseInfo({
      name: '',
      qualifications: '',
      yearsOfExperience: '',
      availability: '',
      email: '',
    });
  };

  return (
    <div id="nurse-services-wrapper" className="nurse-services-wrapper">
      {isBooking ? (
        <form id="nurse-booking-form" className="nurse-booking-form" onSubmit={handleBookingSubmit}>
          <h2>Book Nursing Services</h2>
          <p>
            Here on our health platform, we can connect you with our vast network of nurses to meet your care needs.
          </p>
          <div>
            <label>Service Type</label>
            <input
              type="text"
              name="serviceType"
              value={bookingDetails.serviceType}
              onChange={handleBookingChange}
              placeholder="e.g., In-home care, Post-surgery assistance"
              required
            />
          </div>
          <div>
            <label>Patient Age</label>
            <input
              type="number"
              name="patientAge"
              value={bookingDetails.patientAge}
              onChange={handleBookingChange}
              placeholder="Enter patient age"
              required
            />
          </div>
          <div>
            <label>Care Duration</label>
            <input
              type="text"
              name="careDuration"
              value={bookingDetails.careDuration}
              onChange={handleBookingChange}
              placeholder="e.g., 2 weeks, 3 months"
              required
            />
          </div>
          <div>
            <label>Start Date</label>
            <input
              type="date"
              name="startDate"
              value={bookingDetails.startDate}
              onChange={handleBookingChange}
              required
            />
          </div>
          <div>
            <label>Contact Info</label>
            <input
              type="text"
              name="contactInfo"
              value={bookingDetails.contactInfo}
              onChange={handleBookingChange}
              placeholder="Enter phone number or email"
              required
            />
          </div>
          <div>
            <label>Additional Notes</label>
            <textarea
              name="additionalNotes"
              value={bookingDetails.additionalNotes}
              onChange={handleBookingChange}
              placeholder="Any specific requirements or information?"
            />
          </div>
          <button id="nurse-submit-booking" className="nurse-submit-button" type="submit">
            Submit Booking
          </button>
          <div className="nurse-services-toggle">
            <button
              id="nurse-register-btn"
              className="nurse-toggle-button"
              onClick={(e) => {
                e.preventDefault();
                setIsBooking(false);
              }}
            >
              Register as a Nurse
            </button>
          </div>
        </form>
      ) : (
        <form id="nurse-registration-form" className="nurse-registration-form" onSubmit={handleRegistrationSubmit}>
          <h2>Register as a Nurse</h2>
          <p>
            Register on our platform and we will connect you with clients looking for compassionate and skilled nurses.
          </p>
          <div>
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={nurseInfo.name}
              onChange={handleRegistrationChange}
              placeholder="Enter your full name"
              required
            />
          </div>
          <div>
            <label>Qualifications</label>
            <input
              type="text"
              name="qualifications"
              value={nurseInfo.qualifications}
              onChange={handleRegistrationChange}
              placeholder="e.g., Registered Nurse, Certified Caregiver"
              required
            />
          </div>
          <div>
            <label>Years of Experience</label>
            <input
              type="number"
              name="yearsOfExperience"
              value={nurseInfo.yearsOfExperience}
              onChange={handleRegistrationChange}
              placeholder="Enter years of experience"
              required
            />
          </div>
          <div>
            <label>Availability</label>
            <input
              type="text"
              name="availability"
              value={nurseInfo.availability}
              onChange={handleRegistrationChange}
              placeholder="e.g., Full-time, Part-time"
              required
            />
          </div>
          <div>
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={nurseInfo.email}
              onChange={handleRegistrationChange}
              placeholder="Enter your email"
              required
            />
          </div>
          <button id="nurse-submit-registration" className="nurse-submit-button" type="submit">
            Register
          </button>
          <div className="nurse-services-toggle">
            <button
              id="nurse-booking-btn"
              className="nurse-toggle-button"
              onClick={(e) => {
                e.preventDefault();
                setIsBooking(true);
              }}
            >
              Book Nursing Services
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default NursingForms;