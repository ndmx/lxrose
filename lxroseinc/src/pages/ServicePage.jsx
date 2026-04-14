import React, { useRef } from 'react';
import BookingForm from '../components/BookingForm';
import { useBookingForm } from '../hooks/useBookingForm';

const ServicePage = ({ config }) => {
  const formRef = useRef(null);
  const booking = useBookingForm(config.collectionName, config.title);

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="service-page">
      <div className={`service-hero-banner ${config.heroClass || ''}`}>
        <div className="hero-overlay" />
        <div className="hero-content">
          <h1 className="hero-title">{config.title}</h1>
          <p className="hero-subtitle">{config.subtitle}</p>
        </div>
      </div>

      <section className="services-section">
        <div className="section-header">
          <h2>Start with one simple request</h2>
          <p>Choose the support you need in the form and our team will follow up with next steps.</p>
        </div>

        <article className="service-card service-card--single">
          <div className="service-card-content">
            <h3>{config.cardTitle}</h3>
            <p>{config.cardText}</p>
            <ul className="service-options-list">
              {config.options.map((option) => (
                <li key={option}>{option}</li>
              ))}
            </ul>
          </div>
          <button className="service-book-btn" onClick={scrollToForm}>
            Book This Service
          </button>
        </article>
      </section>

      <div ref={formRef}>
        <BookingForm
          service={{
            title: config.title,
            description: 'Select the type of support you want, then share the best way to reach you.',
          }}
          options={config.options}
          formData={booking.formData}
          isSubmitting={booking.isSubmitting}
          alert={booking.alert}
          onChange={booking.handleChange}
          onSubmit={booking.handleSubmit}
          onCancel={booking.handleCancel}
        />
      </div>
    </div>
  );
};

export default ServicePage;
