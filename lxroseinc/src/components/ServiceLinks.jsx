import React from 'react';
import { Link } from 'react-router-dom';

const services = [
  { number: '01', title: 'Mental health', path: '/mentalservices', description: 'Make room for your wellbeing. Explore support for your emotional and mental health.', detail: 'Support for your whole self' },
  { number: '02', title: 'Nursing care', path: '/nursingservices', description: 'Find practical, personal care for you or someone close to you.', detail: 'Care with a human connection' },
  { number: '03', title: 'Nutrition', path: '/nutritionservices', description: 'Take the next step toward eating well, with guidance shaped around your needs.', detail: 'Everyday habits, personal guidance' },
];
export const servicePaths = services.map(service => service.path);

export default function ServiceLinks() {
  return <div className="lx-service-list">
    {services.map(service => <Link className="lx-service" key={service.path} to={service.path}>
      <span className="lx-service-number">{service.number}</span>
      <div><p className="lx-service-detail">{service.detail}</p><h3>{service.title}</h3><p>{service.description}</p></div>
      <span className="lx-service-arrow" aria-hidden="true">↗</span>
    </Link>)}
  </div>;
}
