import React from 'react';
import alexanderIcon from '../components/images/engineer icon.png';
import robertaIcon from '../components/images/nutrition icon.png';
import lauraIcon from '../components/images/camera_outline.png'; 
import kunmiIcon from '../components/images/health icon.png';
import healthBanner from '../components/images/health_banner.png'; 

const About = () => {
  // Hardcoded team member information
  const teamMembers = [
    {
      username: 'Alexander',
      role: 'Healthcare Technology Engineer',
      credentials: 'MSc, PEng',
      icon: alexanderIcon,
      description: `An innovative engineer and designer who excels in merging healthcare and technology. 
      He specializes in transforming intricate medical requirements into streamlined tech applications. 
      His multi-disciplinary approach is shaping the future of healthcare, aiming for user-centric solutions that revolutionize how we interact with healthcare systems.`,
    },
    {
      username: 'Roberta',
      role: 'Nutrition Specialist',
      credentials: 'RD, MSc Nutrition',
      icon: robertaIcon,
      description: `Our in-house Nutrition Specialist passionately advocates for a balanced lifestyle through thoughtful food choices. 
      She focuses on the intrinsic relationship between a healthy body and mind. Offering both preventive and therapeutic nutrition plans, her holistic methods contribute to overall wellness, both physically and mentally.`,
    },
    {
      username: 'Laura',
      role: 'Psychological Art Therapist',
      credentials: 'PhD, ATR-BC',
      icon: lauraIcon,
      description: `Her work centers around creating immersive experiences that prompt meaningful engagement and emotional resonance, 
      making her a vital asset in our holistic approach to health. By using visual and mental cues, she opens doors to deeper self-understanding and quicker recovery. 
      With a rich portfolio in psychological art interventions, she has the unique ability to channel therapeutic techniques into visual formats.`,
    },
    {
      username: 'Kunmi',
      role: 'Registered Nurse & Healthcare Professional',
      credentials: 'RN, BScN',
      icon: kunmiIcon,
      description: `Our versatile In-House Nurse and Healthcare Professional brings a wealth of experience from various medical settings, 
      including mental health units across Canada. Her deep understanding of patient care, particularly in high-stakes environments, has made her invaluable to both colleagues and patients. 
      Her commitment to patient care is unparalleled, making her a cornerstone in our team.`,
    },
  ];

  return (
    <div>
      <div id="home-banner4" className="banner">
        <div className="container">
          <div className="header-text">
            <h1>
              Meet the Dream Team <br />
              Redefining Healthcare
            </h1>
          </div>
        </div>
      </div>

      <div id="mainContent" className="about-section">
        {/* Intro Paragraph */}
        <section id="intro-section">
          <p>
            At LxRose, our team comprises a unique blend of experts passionate
            about changing lives. From tech-savvy engineers to healthcare
            specialists, we are united in our mission to bring the best of both
            worlds to your healthcare experience.
          </p>
        </section>

        {/* Team Statistics */}
        <section id="team-stats-section">
          <div className="stats-container">
            <div className="stat-item">
              <div className="stat-number">50+</div>
              <div className="stat-label">Years Combined Experience</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">1000+</div>
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

        {/* Team Members Section */}
        <section id="team-members-section">
          <div className="team-wrapper">
            <div className="team-members-container">
              {teamMembers.map((member, index) => (
                <div
                  className={`team-member ${
                    index % 2 === 1 ? 'team-member-reverse' : ''
                  }`}
                  key={index}
                >
                  <div className="team-member-details">
                    <div className="member-header">
                      <h1>{member.username}</h1>
                      <span className="member-credentials">{member.credentials}</span>
                    </div>
                    <h3 className="member-role">{member.role}</h3>
                    <p>{member.description}</p>
                  </div>
                  <div className="team-member-picture">
                    <img src={member.icon} alt={`${member.username} - ${member.role}`} />
                  </div>
                </div>
              ))}
            </div>
            <div className="image-container">
            <img src={healthBanner} alt="Health Banner" />
            </div>
          </div>
        </section>

        {/* Closing Paragraph */}
        <section id="closing-section">
          <p>
            We are proud to have such a distinguished team of professionals at
            the forefront of health and innovation. Their collective expertise
            ensures not just superior care but also a vision for a healthier
            future.
          </p>
        </section>
      </div>
    </div>
  );
};

export default About;