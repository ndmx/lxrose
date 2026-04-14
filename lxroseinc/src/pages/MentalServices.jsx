import React from 'react';
import ServicePage from './ServicePage';

const config = {
  title: 'Mental Health Services',
  subtitle: 'Support for emotional wellness, relationships, and personal growth.',
  cardTitle: 'Mental Health Support',
  cardText:
    'Request professional support for yourself, your child, your family, or a group setting through one simple booking form.',
  collectionName: 'mentalServicesBookings',
  options: ['Individual Therapy', 'Group Therapy', 'Child Therapy', 'Family Therapy'],
};

const MentalServices = () => <ServicePage config={config} />;

export default MentalServices;
