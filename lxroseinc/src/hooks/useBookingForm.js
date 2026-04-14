import { useState } from 'react';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

const EMPTY = { serviceType: '', name: '', email: '', phone: '', notes: '' };

const toServiceId = (value) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

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
      const selectedService = formData.serviceType;
      const contactInfo = [formData.name, formData.email, formData.phone]
        .filter(Boolean)
        .join(' | ');

      await addDoc(collection(db, collectionName), {
        serviceCategory,
        service: selectedService,
        selectedService,
        serviceType: selectedService,
        serviceTitle: selectedService,
        serviceId: selectedService ? toServiceId(selectedService) : null,
        additionalInfo: formData.notes,
        additionalNotes: formData.notes,
        info: formData.notes,
        contactInfo,
        status: 'new',
        ...formData,
        timestamp: Timestamp.fromDate(new Date()),
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
