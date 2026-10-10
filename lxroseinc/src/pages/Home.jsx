import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { submitPublicForm } from '../firebase';
import careImage from '../components/images/nurse-with-child.png';

const services = [
  { number: '01', title: 'Mental health', path: '/mentalservices', description: 'Make room for your wellbeing. Explore support for your emotional and mental health.', detail: 'Support for your whole self' },
  { number: '02', title: 'Nursing care', path: '/nursingservices', description: 'Find practical, personal care for you or someone close to you.', detail: 'Care with a human connection' },
  { number: '03', title: 'Nutrition', path: '/nutritionservices', description: 'Take the next step toward eating well, with guidance shaped around your needs.', detail: 'Everyday habits, personal guidance' },
];
const emptyForm = { name: '', email: '', message: '' };

export default function Home() {
  const [form, setForm] = useState(emptyForm);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const submit = async (event) => {
    event.preventDefault();
    if (sending) return;
    setSending(true); setFeedback(null);
    try {
      await submitPublicForm('contactForms', form);
      setForm(emptyForm);
      setFeedback({ type: 'success', message: 'Your message has been received. Our team will follow up by email.' });
    } catch {
      setFeedback({ type: 'error', message: 'Your message could not be sent. Your details are still here—please try again.' });
    } finally { setSending(false); }
  };
  const change = ({ target }) => setForm(current => ({ ...current, [target.name]: target.value }));
  return (
    <div className="lx-home">
      <section className="lx-hero" aria-labelledby="hero-title">
        <div className="lx-hero-copy">
          <p className="lx-eyebrow"><span aria-hidden="true" /> A little connection. A better beginning.</p>
          <h1 id="hero-title">Care that<br />starts with <em>you.</em></h1>
          <p className="lx-intro">Mental health, nursing, and nutrition support.<br className="lx-desktop-break" /> A thoughtful next step for you and the people you care about.</p>
          <div className="lx-hero-actions">
            <Link className="lx-button" to="/contact">Find your care <span aria-hidden="true">↗</span></Link>
            <a className="lx-text-link" href="#services">Explore our services <span aria-hidden="true">↓</span></a>
          </div>
          <p className="lx-hero-footnote">People first. Technology in support.</p>
        </div>
        <figure className="lx-hero-image">
          <img src={careImage} alt="A nurse connecting with a young patient" fetchpriority="high" width="2048" height="1033" />
          <figcaption><span className="lx-caption-mark" aria-hidden="true">✳</span><span>Small moments.<br /><strong>Meaningful care.</strong></span></figcaption>
        </figure>
      </section>

      <section id="services" className="lx-services" aria-labelledby="services-title">
        <div className="lx-section-heading"><p className="lx-eyebrow">Our services</p><h2 id="services-title">Different needs.<br /><em>The same thoughtful care.</em></h2></div>
        <div className="lx-service-list">
          {services.map(service => <Link className="lx-service" key={service.path} to={service.path}>
            <span className="lx-service-number">{service.number}</span>
            <div><p className="lx-service-detail">{service.detail}</p><h3>{service.title}</h3><p>{service.description}</p></div>
            <span className="lx-service-arrow" aria-hidden="true">↗</span>
          </Link>)}
        </div>
      </section>

      <section className="lx-approach" aria-labelledby="approach-title">
        <div><p className="lx-eyebrow">Your next step</p><h2 id="approach-title">You don’t need to<br /><em>have it all figured out.</em></h2><p>Start with what matters to you. We’ll help you explore the next step.</p><Link className="lx-text-link" to="/about">Get to know LxRose <span aria-hidden="true">↗</span></Link></div>
        <ol className="lx-steps">
          <li><span>01</span><div><h3>Tell us what you need</h3><p>Choose a service or send a short message.</p></div></li>
          <li><span>02</span><div><h3>Connect with our team</h3><p>We’ll follow up to learn more about your needs and discuss available options.</p></div></li>
          <li><span>03</span><div><h3>Decide on your next step</h3><p>Ask questions and find an approach that works for you.</p></div></li>
        </ol>
      </section>

      <section id="contact" className="lx-contact" aria-labelledby="contact-title">
        <div><p className="lx-eyebrow">Let’s start a conversation</p><h2 id="contact-title">A simple hello<br /><em>is a good start.</em></h2><p>Have a question about our services?<br />Leave a note and we’ll follow up.</p><a className="lx-text-link" href="mailto:info@lxroseinc.com">info@lxroseinc.com <span aria-hidden="true">↗</span></a></div>
        <form className="lx-form" onSubmit={submit} aria-label="Contact LxRose">
          <div className="lx-form-row"><label>Full name<input name="name" autoComplete="name" value={form.name} onChange={change} required maxLength={120} disabled={sending} /></label><label>Email address<input name="email" type="email" autoComplete="email" value={form.email} onChange={change} required maxLength={254} disabled={sending} /></label></div>
          <label>How can we help?<textarea name="message" rows={4} value={form.message} onChange={change} required maxLength={4000} disabled={sending} /></label>
          <p className="lx-form-note">A brief note is enough. Please leave out detailed medical information. Read our <Link to="/privacy-policy">privacy policy</Link>.</p>
          <button className="lx-button" type="submit" disabled={sending}>{sending ? 'Sending…' : 'Send your message'} <span aria-hidden="true">↗</span></button>
          {feedback && <p className={`lx-feedback lx-feedback-${feedback.type}`} role={feedback.type === 'error' ? 'alert' : 'status'}>{feedback.message}</p>}
        </form>
      </section>
    </div>
  );
}
