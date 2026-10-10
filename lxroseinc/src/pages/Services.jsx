import React from 'react';
import { Link } from 'react-router-dom';
import PageIntro from '../components/PageIntro';
import ServiceLinks from '../components/ServiceLinks';

export default function Services() {
  return <div className="lx-page lx-services-page">
    <PageIntro eyebrow="Our services" title="Care for the way you live.">
      <p>Explore mental health, nursing, and nutrition support. Choose a service to learn more and request care.</p>
    </PageIntro>
    <section className="lx-services" aria-label="Explore care services">
      <div><h2>Different needs.<br /><em>The same thoughtful care.</em></h2>
        <p>Unsure where to start? Tell us what you need and we’ll help you explore your options.</p>
        <Link className="lx-text-link" to="/contact">Talk with our team <span aria-hidden="true">↗</span></Link>
      </div>
      <ServiceLinks />
    </section>
  </div>;
}
