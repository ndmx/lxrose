import React, { useState, useRef } from 'react';
import { addDoc, collection, Timestamp } from 'firebase/firestore'; // Firebase imports
import { db } from '../firebase'; // Ensure Firebase is correctly set up

const nutritionServices = [
  {
    id: 1,
    title: 'Personalized Nutrition Plans',
    description: 'Custom diet plans tailored to your health goals and dietary preferences.',
  },
  {
    id: 2,
    title: 'Nutrition Workshops',
    description: 'Join our group sessions to learn about healthy eating, meal prep, and nutrients.',
  },
  {
    id: 3,
    title: 'Dietary Analysis',
    description: 'Get a detailed analysis of your current eating habits with professional recommendations.',
  },
  {
    id: 4,
    title: 'Weight Management Programs',
    description: 'Personalized programs for weight loss, gain, or maintenance, guided by nutritional experts.',
  },
];

const NutritionServices = () => {
  const [selectedService, setSelectedService] = useState(null);
  const formRef = useRef(null); // Reference to the form container
  const [formData, setFormData] = useState({ name: '', email: '', info: '' });

  const handleBookClick = (serviceId) => {
    setSelectedService(serviceId); // Show form for the selected service
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth' }); // Smooth scroll to the form
    }, 100); // Delay to ensure the form is rendered before scrolling
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const timestamp = Timestamp.fromDate(new Date()); // Add a timestamp
      await addDoc(collection(db, 'nutritionServiceBookings'), {
        serviceId: selectedService,
        serviceTitle: nutritionServices.find((service) => service.id === selectedService)?.title,
        ...formData,
        timestamp,
      });
      alert('Your booking has been submitted successfully!');
      setFormData({ name: '', email: '', info: '' });
      setSelectedService(null); // Hide the form after submission
    } catch (error) {
      console.error('Error submitting booking:', error);
      alert('An error occurred while submitting the booking. Please try again.');
    }
  };

  const handleFormCancel = () => {
    setSelectedService(null); // Hide the form without submission
    setFormData({ name: '', email: '', info: '' });
  };

  return (
    <div>
      <div id="home-banner4" className="banner">
        <div className="container">
          <div className="header-text">
            <h1>Our Nutrition Services</h1>
          </div>
        </div>
      </div>

      <section id="nutrition">
        <div id="home-banner5" className="banner">
          <div className="container">
            <div className="header-text" id="block-h1">
              <h1>Get a personalized nutritional health plan</h1>
            </div>

            <div className="nutrition-block-container">
              {nutritionServices.map((service) => (
                <div key={service.id} className="nutrition-block">
                  <h2>{service.title}</h2>
                  <p>{service.description}</p>
                  <button id="joinUsBtn" onClick={() => handleBookClick(service.id)}>
                    Book Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {selectedService && (
        <div ref={formRef} className="booking-form-container">
          <h2>{nutritionServices.find((service) => service.id === selectedService)?.title}</h2>
          <form onSubmit={handleFormSubmit}>
            <div>
              <label>Your Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your name"
                required
              />
            </div>
            <div>
              <label>Your Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label>Additional Information</label>
              <textarea
                name="info"
                value={formData.info}
                onChange={handleInputChange}
                placeholder="Let us know any additional details"
                required
              ></textarea>
            </div>
            <div className="form-actions">
              <button type="submit">Submit</button>
              <button type="button" onClick={handleFormCancel}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default NutritionServices;