import PageIntro from '../components/PageIntro';
import React from 'react';

const teamMembers = [
  {
    name: 'Alexander',
    role: 'Technology and Engineering',
    credentials: 'MSc, PEng',
    description:
      'Alexander brings systems thinking to healthcare. His work focuses on turning complex care needs into practical tools that feel simple, reliable, and useful for the people who depend on them.',
  },
  {
    name: 'Roberta',
    role: 'Nutrition and Wellness',
    credentials: 'MSc Nutrition',
    description:
      'Roberta guides clients toward healthier routines through balanced nutrition, prevention-focused support, and thoughtful planning that respects real life.',
  },
  {
    name: 'Laura',
    role: 'Mental Health and Art Therapy',
    credentials: 'BSc, ATR-BC',
    description:
      'Laura supports emotional wellness through creative therapeutic methods that help clients reflect, process, and build a deeper understanding of their needs.',
  },
  {
    name: 'Kunmi',
    role: 'Nursing and Patient Care',
    credentials: 'LPN, BScN',
    description:
      'Kunmi brings frontline healthcare experience, steady clinical judgment, and a patient-first approach shaped by work across demanding care environments.',
  },
];

const values = [
  {
    title: 'Personal Care',
    text: 'We treat every client as a person first, with care plans shaped around their goals, routines, and comfort.',
  },
  {
    title: 'Clear Communication',
    text: 'We keep the process simple and understandable, from the first question to ongoing support.',
  },
  {
    title: 'Modern Support',
    text: 'We use technology where it helps, while keeping the human relationship at the center of care.',
  },
];

const About = () => {
  return (
    <div className="lx-page about-page">
      <PageIntro eyebrow="About LxRose" title="Care that connects people.">
        <p>LxRose brings mental health, nursing, and nutrition support together with practical technology, keeping people at the centre of care.</p>
      </PageIntro>

      <div id="mainContent" className="about-section">
        <section className="about-story-section">
          <div className="about-copy-block">
            <span>Our Work</span>
            <h2>We help people take the next step in their health journey.</h2>
            <p>
              Our services are designed for people who want thoughtful support
              without unnecessary complexity. Whether someone is seeking mental
              health care, nutritional guidance, or nursing support, our goal is
              to make the experience feel clear, respectful, and grounded.
            </p>
          </div>

          <div className="about-copy-block">
            <span>Our Approach</span>
            <h2>Professional care, supported by simple systems.</h2>
            <p>
              We believe technology should reduce friction, not replace human
              care. LxRose combines clinical knowledge, wellness expertise, and
              practical digital tools so clients can receive support that is
              organized, responsive, and personal.
            </p>
          </div>
        </section>

        <section className="about-values-section">
          <div className="about-section-header">
            <p className="about-kicker">What Guides Us</p>
            <h2>A calm, capable way to care.</h2>
          </div>
          <div className="about-values-grid">
            {values.map((value) => (
              <article className="about-value-card" key={value.title}>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="team-stats-section">
          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-number">30+</div>
              <div className="stat-label">Years Combined Experience</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">500+</div>
              <div className="stat-label">Patients Helped</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">98%</div>
              <div className="stat-label">Satisfaction Rating</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">24/7</div>
              <div className="stat-label">Support Available</div>
            </div>
          </div>
        </section>

        <section id="team-members-section">
          <div className="about-section-header">
            <p className="about-kicker">Our Team</p>
            <h2>Different specialties, one shared standard.</h2>
            <p>
              Our team combines experience in healthcare, nutrition, therapy,
              and technology so clients can receive support from multiple angles.
            </p>
          </div>

          <div className="team-members-container">
            {teamMembers.map((member) => (
              <article className="team-member-card" key={member.name}>
                <div className="member-header">
                  <div>
                    <h3>{member.name}</h3>
                    <p className="member-role">{member.role}</p>
                  </div>
                  <span className="member-credentials">{member.credentials}</span>
                </div>
                <p>{member.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="closing-section">
          <p>
            LxRose exists to make care feel more connected, more approachable,
            and more useful in everyday life. We are building a healthier
            experience around the people who need it most.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;
