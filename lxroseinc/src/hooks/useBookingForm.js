import { useState } from 'react';
import { submitPublicForm } from '../firebase';

const EMPTY = { serviceType: '', name: '', email: '', phone: '', notes: '' };

export function useBookingForm(collectionName, serviceCategory) {
  const [formData, setFormData] = useState(EMPTY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alert, setAlert] = useState(null); // { type: 'success'|'error', message }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await submitPublicForm(collectionName, {
        ...formData,
        serviceCategory,
      });
      setAlert({ type: 'success', message: 'Booking submitted! We\'ll be in touch soon.' });
      setFormData(EMPTY);
      setTimeout(() => setAlert(null), 3000);
    } catch {
      setAlert({ type: 'error', message: 'Something went wrong. Please try again.' });
    }
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    setFormData(EMPTY);
    setAlert(null);
  };

  return {
    formData,
    isSubmitting,
    alert,
    handleChange,
    handleSubmit,
    handleCancel,
  };
}
