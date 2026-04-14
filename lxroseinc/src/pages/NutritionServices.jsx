import React from 'react';
import ServicePage from './ServicePage';

const config = {
  title: 'Nutrition Services',
  subtitle: 'Practical nutrition guidance shaped around your goals and routine.',
  cardTitle: 'Nutrition Guidance',
  cardText:
    'Request support for planning, education, analysis, or weight goals through one simple booking form.',
  collectionName: 'nutritionServiceBookings',
  heroClass: 'nutrition-hero',
  options: [
    'Personalized Nutrition Plan',
    'Nutrition Workshop',
    'Dietary Analysis',
    'Weight Management',
  ],
};

const NutritionServices = () => <ServicePage config={config} />;

export default NutritionServices;
