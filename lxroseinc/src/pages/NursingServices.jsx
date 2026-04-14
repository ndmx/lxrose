import React from 'react';
import ServicePage from './ServicePage';

const config = {
  title: 'Nursing Care Services',
  subtitle: 'Steady nursing support for home care, recovery, and ongoing needs.',
  cardTitle: 'Nursing Care',
  cardText:
    'Request nursing support for in-home care, recovery, senior care, or comfort-focused support through one simple booking form.',
  collectionName: 'nursingServiceBookings',
  heroClass: 'nursing-hero',
  options: ['In-Home Care', 'Post-Surgery Care', 'Elderly Care', 'Palliative Care'],
};

const NursingServices = () => <ServicePage config={config} />;

export default NursingServices;
