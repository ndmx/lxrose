import React, { useState, useRef } from 'react';
import { addDoc, collection, Timestamp } from 'firebase/firestore'; // Import Firebase functions
import { db } from '../firebase'; // Ensure Firebase is correctly set up in your project

const mentalHealthServices = [
  {
    id: 1,
    title: 'Singles Therapy Session',
    description: 'Personalized therapy focusing on individual needs, providing a private space to discuss and navigate personal challenges.',
  },
  {
    id: 2,
    title: 'Group Therapy Session',
    description: 'Join a supportive group of peers facing similar challenges, facilitated by a professional therapist to guide the discussion.',
  },
  {
    id: 3,
    title: 'Child Therapy Session',
    description: 'Specialized therapy for children, using engaging methods to help them express their feelings and work through issues.',
  },
  {
    id: 4,
    title: 'Family Therapy Session',
    description: 'Therapy sessions for families looking to improve communication, resolve conflicts, and strengthen their bond.',
  },
];

const MentalServices = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', additionalInfo: '' });
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const formRef = useRef(null); // Reference for smooth scrolling

  // Firebase submission function
  const handleFormSubmitToFirestore = async (data) => {
    try {
      const timestamp = Timestamp.fromDate(new Date());
      const docRef = await addDoc(collection(db, 'mentalServicesBookings'), {
        ...data,
        timestamp,
      });
      console.log('Document written with ID:', docRef.id);
      return true;
    } catch (error) {
      console.error('Error adding document:', error);
      return false;
    }
  };

  const handleBookClick = (serviceId) => {
    const service = mentalHealthServices.find((s) => s.id === serviceId);
    setSelectedService(service);

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' }); // Smooth scroll to the form
    }, 100);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsFormDisabled(true);

    const bookingData = {
      name: formData.name,
      email: formData.email,
      additionalInfo: formData.additionalInfo,
      service: selectedService.title,
    };

    const isSuccessful = await handleFormSubmitToFirestore(bookingData);

    if (isSuccessful) {
      setAlertMessage('Booking submitted successfully!');
      setShowAlert(true);
      setTimeout(() => {
        setShowAlert(false);
        setIsFormDisabled(false);
        setFormData({ name: '', email: '', additionalInfo: '' });
        setSelectedService(null);
      }, 2000);
    } else {
      setAlertMessage('An error occurred. Please try again later.');
      setShowAlert(true);
      setIsFormDisabled(false);
    }
  };

  const handleCancel = () => {
    setSelectedService(null);
    setFormData({ name: '', email: '', additionalInfo: '' });
  };

  return (
    <div>
      <div id="home-banner4" className="banner">
        <div className="container">
          <div className="header-text">
            <h1>Mental Health Services</h1>
          </div>
        </div>
      </div>

      <section id="mental-health-services">
        <div id="home-banner5" className="banner">
          <div className="container">
            <div className="header-text" id="block-h1">
              <h1>We Offer a variety of Services for your mental wellbeing</h1>
            </div>

            <div className="mental-block-container">
              {mentalHealthServices.map((service) => (
                <div key={service.id} className="mental-block">
                  <h2>{service.title}</h2>
                  <p>{service.description}</p>
                  <button
                    id="joinUsBtn"
                    className="center-button"
                    onClick={() => handleBookClick(service.id)}
                  >
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Form */}
        {selectedService && (
          <div ref={formRef} className="booking-form-container">
            <h2>Booking for: {selectedService.title}</h2>
            <form onSubmit={handleSubmit} disabled={isFormDisabled}>
              <div>
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  disabled={isFormDisabled}
                />
              </div>
              <div>
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={isFormDisabled}
                />
              </div>
              <div>
                <label>Additional Information</label>
                <textarea
                  name="additionalInfo"
                  placeholder="Let us know any additional details"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  rows="4"
                  disabled={isFormDisabled}
                />
              </div>
              <div className="form-actions">
                <button type="submit" id="joinUsBtn" className="center-button" disabled={isFormDisabled}>
                  {isFormDisabled ? 'Submitting...' : 'Submit Booking'}
                </button>
                <button
                  type="button"
                  id="cancelBtn"
                  className="center-button"
                  onClick={handleCancel}
                  disabled={isFormDisabled}
                >
                  Cancel
                </button>
              </div>
            </form>
            {showAlert && (
              <div id="customAlertContact" className="form-group">
                <p id="alertMessageContact">{alertMessage}</p>
                <button id="closeAlertContact" onClick={() => setShowAlert(false)}>
                  Close
                </button>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default MentalServices;