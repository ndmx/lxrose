import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { addDoc, collection, Timestamp } from 'firebase/firestore'; // Import Timestamp
import { db } from '../firebase';

const handleContactForm = async (name, email, message) => {
  try {
    const timestamp = Timestamp.fromDate(new Date()); // Firestore's built-in Timestamp
    const docRef = await addDoc(collection(db, 'contactForms'), {
      name,
      email,
      message,
      timestamp, // Add the timestamp here
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding document: ', error);
    return null;
  }
};

const Home = () => {
  const nameRef = useRef(null);
    const emailRef = useRef(null);
    const messageRef = useRef(null);
  
    const [showAlert, setShowAlert] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [isFormDisabled, setFormDisabled] = useState(false);
  
    const handleSubmit = async (event) => {
      event.preventDefault();
      setFormDisabled(true);
    
      const name = nameRef.current.value;
      const email = emailRef.current.value;
      const message = messageRef.current.value;
    
      try {
        await handleContactForm(name, email, message);
        setAlertMessage('Thank You. We will contact you shortly!');
        setShowAlert(true);
    
        setTimeout(() => {
          setShowAlert(false);
          setFormDisabled(false);
          nameRef.current.value = '';
          emailRef.current.value = '';
          messageRef.current.value = '';
          document.getElementById('contactForm').reset();
        }, 2000);
      } catch (error) {
        console.error('An error occurred in handleContactForm:', error);
        setAlertMessage('An error occurred. Please try again later.');
        setShowAlert(true);
        setFormDisabled(false);
      }
    };

  return (
    <div>
      <div id="home-banner" className="banner">
        <div className="container">
          <div className="header-text">
            <h1>
              Technology & Healthcare
              <br />
              Uniting to Transform Lives!
            </h1>
          </div>
        </div>
      </div>

      <div id="mainContent" className="home">
        <section id="home">
          <p>
            By combining cutting-edge
            technology with expert-led services, we're setting new standards in
            mental and physical well-being. Your journey towards a healthier,
            happier you starts here!
          </p>
          <Link to="/contact">
            <button id="primary-cta-button" className="center-button">
              Get Started
            </button>
          </Link>
        </section>

        <section id="about">
          <p>
            Welcome to the future of healthcare. Our mission
            is simple yet transformative: to combine the wonders of technology
            with the expertise of healthcare professionals to create
            personalized, effective, and accessible treatments. <br />From mental
            health therapies that use art and technology to custom nutrition
            plans monitored in real-time, we're not just changing the game;
            we're creating a whole new playbook.
          </p>
        </section>

        <section id="services" className="home-services-section">
          <div className="services-header">
            <h2>Our Expert-Led Services</h2>
            <p>Choose from our comprehensive range of healthcare services designed to transform your wellbeing</p>
          </div>

          <div className="home-services-grid">
            <Link to="/mentalservices" className="home-service-card">
              <h3>Mental Health Services</h3>
              <p>
                Step into a world where technology meets compassion. We revolutionize therapy with virtual experiences tailored to your mental health journey.
              </p>
              <span className="service-arrow">Explore</span>
            </Link>

            <Link to="/nutritionservices" className="home-service-card">
              <h3>Nutritional Health Services</h3>
              <p>
                Transform your approach to wellness. Our experts craft adaptive nutrition plans powered by real-time insights for dynamic health results.
              </p>
              <span className="service-arrow">Explore</span>
            </Link>

            <Link to="/nursingservices" className="home-service-card">
              <h3>Nursing Care Services</h3>
              <p>
                Discover the future of care. Our nursing services merge traditional expertise with modern innovations for personalized healthcare.
              </p>
              <span className="service-arrow">Explore</span>
            </Link>
          </div>
        </section>
      
      </div>

      <div id="mainContent" className="contact">
        <section id="contact">
          <h2>Let's Get in Touch and Transform Your Health Journey</h2>
          <p>
            We're excited to hear from you! Whether you have a question, want to
            sign up for our services, or are simply curious about how technology
            and healthcare can come together to create magic, don't hesitate to
            reach out.
          </p>
        </section>

        <section id="contact-form" className="home-contact-form-section">
          <div className="home-contact-panel">
            <div className="home-contact-intro">
              <span>Quick Message</span>
              <h3>Tell us what kind of support you need.</h3>
              <p>
                Send a short note and we will follow up with the next best step
                for your care needs.
              </p>
            </div>

            <form id="contactForm" className="home-contact-form" onSubmit={handleSubmit}>
              <div className="home-form-grid">
                <div className="form-group">
                  <label htmlFor="home-name">Full Name</label>
                  <input
                    type="text"
                    placeholder="Full name"
                    id="home-name"
                    name="name"
                    ref={nameRef}
                    required
                    disabled={isFormDisabled}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="home-email">Email Address</label>
                  <input
                    type="email"
                    placeholder="Email Address"
                    id="home-email"
                    name="email"
                    ref={emailRef}
                    required
                    disabled={isFormDisabled}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="home-message">Message</label>
                <textarea
                  id="home-message"
                  placeholder="How can we help?"
                  name="message"
                  ref={messageRef}
                  required
                  disabled={isFormDisabled}
                ></textarea>
              </div>

              <button id="home-contact-form-btn" type="submit" disabled={isFormDisabled}>
                {isFormDisabled ? 'Submitting...' : 'Send Message'}
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
}

export default Home;
