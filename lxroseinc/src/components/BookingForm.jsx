import React from 'react';

const BookingForm = ({ service, options, formData, isSubmitting, alert, onChange, onSubmit, onCancel }) => (
  <div className="booking-form-wrapper">
    <div className="booking-form-container">
      <div className="booking-form-header">
        <h2>Book: {service.title}</h2>
        <p>{service.description}</p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="form-field">
          <label htmlFor="bf-service-type">What would you like to book?</label>
          <select
            id="bf-service-type"
            name="serviceType"
            value={formData.serviceType}
            onChange={onChange}
            required
            disabled={isSubmitting}
          >
            <option value="">Select a service</option>
            {options.map((option) => (
              <option value={option} key={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-field">
            <label htmlFor="bf-name">Full Name</label>
            <input
              id="bf-name"
              type="text"
              name="name" maxLength={120}
              value={formData.name}
              onChange={onChange}
              placeholder="Full name"
              required
              disabled={isSubmitting}
              autoComplete="name"
            />
          </div>
          <div className="form-field">
            <label htmlFor="bf-email">Email Address</label>
            <input
              id="bf-email"
              type="email"
              name="email" maxLength={254}
              value={formData.email}
              onChange={onChange}
              placeholder="Email Address"
              required
              disabled={isSubmitting}
              autoComplete="email"
            />
          </div>
        </div>

        <div className="form-field">
          <label htmlFor="bf-phone">
            Phone
            <span className="field-optional">Optional</span>
          </label>
          <input
            id="bf-phone"
            type="tel"
            name="phone" maxLength={40}
            value={formData.phone}
            onChange={onChange}
            placeholder="(885) 242-2860"
            disabled={isSubmitting}
            autoComplete="tel"
          />
        </div>

        <div className="form-field">
          <label htmlFor="bf-notes">Notes</label>
          <textarea
            id="bf-notes"
            name="notes" maxLength={4000}
            value={formData.notes}
            onChange={onChange}
            placeholder="Any details we should know before reaching out?"
            rows="4"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Booking'}
          </button>
          <button type="button" className="btn-secondary" onClick={onCancel} disabled={isSubmitting}>
            Clear Form
          </button>
        </div>
      </form>

      {alert && (
        <div role="status" className={`booking-alert booking-alert--${alert.type}`}>
          {alert.message}
        </div>
      )}
    </div>
  </div>
);

export default BookingForm;
