import React, { useState } from 'react';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const faqData = [
    {
      category: 'General Questions',
      icon: '❓',
      questions: [
        {
          question: 'What is LxRose?',
          answer: 'LxRose is a comprehensive healthcare platform that connects you with qualified professionals in mental health, nursing, and nutrition services. We combine technology with healthcare expertise to provide personalized, accessible, and effective treatment solutions.'
        },
        {
          question: 'How do your services work?',
          answer: 'Simply browse our services, select the one that fits your needs, and fill out the booking form. Our team will review your request and connect you with the most suitable professional. You\'ll receive confirmation and next steps via email within 24 hours.'
        },
        {
          question: 'Are services available online or in-person?',
          answer: 'We offer both online and in-person services depending on your location and the type of service you need. Mental health sessions are available via secure video calls, while nursing services are typically provided in-person. Contact us to discuss the best option for you.'
        },
        {
          question: 'What areas do you serve?',
          answer: 'We primarily serve clients across Canada, with select services available internationally through our online platform. Contact us to confirm availability in your specific location.'
        }
      ]
    },
    {
      category: 'Mental Health Services',
      icon: '🧠',
      questions: [
        {
          question: 'What types of therapy do you offer?',
          answer: 'We offer singles therapy, group therapy sessions, child therapy, and family therapy. Each session is facilitated by licensed mental health professionals with specialized training in their respective areas.'
        },
        {
          question: 'How do I book a therapy session?',
          answer: 'Navigate to our Mental Services page, select the type of therapy you need, and fill out the booking form with your details. Our team will match you with an appropriate therapist and contact you within 24 hours to schedule your first session.'
        },
        {
          question: 'What if I need to cancel or reschedule?',
          answer: 'We understand that life happens! Please provide at least 24 hours notice for cancellations or rescheduling. You can contact us directly via email or phone to make changes to your appointment.'
        },
        {
          question: 'Are the therapy sessions confidential?',
          answer: 'Absolutely. All therapy sessions are completely confidential and comply with healthcare privacy regulations. Your information is protected and will never be shared without your explicit consent, except where required by law.'
        },
        {
          question: 'How long is each therapy session?',
          answer: 'Standard therapy sessions are 50-60 minutes long. Initial assessment sessions may be slightly longer. Your therapist will discuss the session structure during your first meeting.'
        }
      ]
    },
    {
      category: 'Nursing Services',
      icon: '⚕️',
      questions: [
        {
          question: 'How do I book a nurse?',
          answer: 'Visit our Nursing Services page and fill out the booking form with details about the type of care needed, patient age, duration, and start date. We\'ll match you with a qualified nurse and contact you to finalize arrangements.'
        },
        {
          question: 'What qualifications do your nurses have?',
          answer: 'All our nurses are registered professionals with valid licenses and certifications. They have diverse experience across various medical settings and undergo regular training to maintain the highest standards of care.'
        },
        {
          question: 'Can I choose my nurse?',
          answer: 'While we carefully match nurses based on your specific needs and preferences, you can request to work with a specific nurse if you\'ve worked with them before. We\'ll do our best to accommodate your preference.'
        },
        {
          question: 'What types of nursing care do you provide?',
          answer: 'We provide various types of care including in-home care, post-surgery assistance, elderly care, pediatric nursing, palliative care, and specialized medical support. Let us know your needs and we\'ll find the right nurse for you.'
        },
        {
          question: 'Are nurses available for emergency situations?',
          answer: 'For emergencies, please call 911 immediately. Our nursing services are for scheduled, non-emergency care. However, we do offer expedited scheduling for urgent (but non-emergency) care needs.'
        }
      ]
    },
    {
      category: 'Nutrition Services',
      icon: '🥗',
      questions: [
        {
          question: 'What does a nutrition plan include?',
          answer: 'Our personalized nutrition plans include a comprehensive dietary analysis, customized meal plans, nutrient recommendations, recipe suggestions, and ongoing support from our certified nutritionists. Plans are tailored to your specific health goals and lifestyle.'
        },
        {
          question: 'How are plans personalized?',
          answer: 'We consider your current eating habits, health goals, medical conditions, food preferences, allergies, lifestyle, and activity level. Our nutritionists conduct a thorough assessment and create a plan that fits seamlessly into your daily routine.'
        },
        {
          question: 'Do you handle dietary restrictions?',
          answer: 'Yes! We specialize in creating plans for various dietary needs including vegetarian, vegan, gluten-free, dairy-free, keto, low-sodium, diabetic-friendly, and other medical dietary requirements.'
        },
        {
          question: 'Can I attend nutrition workshops if I already work with a nutritionist?',
          answer: 'Absolutely! Our workshops are open to everyone, whether you\'re currently working with a nutritionist or just interested in learning more about healthy eating and meal preparation.'
        },
        {
          question: 'How often will I meet with my nutritionist?',
          answer: 'Meeting frequency depends on your goals and chosen program. Typically, clients meet bi-weekly initially, then monthly for maintenance. Your nutritionist will recommend a schedule that works best for your needs.'
        }
      ]
    },
    {
      category: 'Professional Registration',
      icon: '📋',
      questions: [
        {
          question: 'How can I join as a healthcare professional?',
          answer: 'We\'re always looking for qualified professionals! Navigate to the relevant service page (Nursing Services for nurses, etc.) and click on the registration option. Fill out your credentials, experience, and availability, and our team will review your application.'
        },
        {
          question: 'What are the requirements to join?',
          answer: 'Requirements vary by profession but generally include valid professional licenses, liability insurance, relevant certifications, and background checks. Specific requirements will be outlined during the application process.'
        },
        {
          question: 'How does payment work for professionals?',
          answer: 'We offer competitive compensation based on service type, experience, and market rates. Payment details, including structure and frequency, are discussed during the onboarding process.'
        }
      ]
    },
    {
      category: 'Billing & Privacy',
      icon: '💳',
      questions: [
        {
          question: 'How much do services cost?',
          answer: 'Pricing varies depending on the service type, duration, and specific requirements. Contact us for a detailed quote tailored to your needs. We strive to keep our services accessible while maintaining the highest quality of care.'
        },
        {
          question: 'Do you accept insurance?',
          answer: 'We work with many insurance providers. Please contact us with your insurance information, and we\'ll verify coverage and help you understand your benefits. Some services may be covered partially or fully depending on your plan.'
        },
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept major credit cards, debit cards, electronic bank transfers, and some health spending accounts. Payment options will be discussed when you book your service.'
        },
        {
          question: 'How is my data protected?',
          answer: 'We take your privacy seriously. All personal and medical information is encrypted and stored securely in compliance with healthcare privacy regulations (PIPEDA in Canada). We never share your information without your consent, except where required by law.'
        },
        {
          question: 'Can I request my data to be deleted?',
          answer: 'Yes, you have the right to request deletion of your personal data, subject to legal and medical record-keeping requirements. Contact us to initiate a data deletion request, and we\'ll guide you through the process.'
        }
      ]
    }
  ];

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  // Filter FAQ based on search term
  const filteredFAQ = faqData.map(category => ({
    ...category,
    questions: category.questions.filter(
      q =>
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.category.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

  return (
    <div className="faq-container">
      <div className="faq-header">
        <h1>Frequently Asked Questions</h1>
        <p>Find answers to common questions about our services</p>
      </div>

      <div className="faq-search">
        <input
          type="text"
          placeholder="Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="faq-search-input"
        />
        <span className="search-icon">🔍</span>
      </div>

      <div className="faq-content">
        {filteredFAQ.length > 0 ? (
          filteredFAQ.map((category, categoryIndex) => (
            <div key={categoryIndex} className="faq-category">
              <h2 className="category-title">
                <span className="category-icon">{category.icon}</span>
                {category.category}
              </h2>
              <div className="faq-questions">
                {category.questions.map((item, questionIndex) => {
                  const globalIndex = `${categoryIndex}-${questionIndex}`;
                  const isActive = activeIndex === globalIndex;

                  return (
                    <div
                      key={questionIndex}
                      className={`faq-item ${isActive ? 'active' : ''}`}
                    >
                      <button
                        className="faq-question"
                        onClick={() => toggleAccordion(globalIndex)}
                      >
                        <span className="question-text">{item.question}</span>
                        <span className={`accordion-icon ${isActive ? 'rotated' : ''}`}>
                          ▼
                        </span>
                      </button>
                      <div className={`faq-answer ${isActive ? 'show' : ''}`}>
                        <p>{item.answer}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            <p>No questions match your search. Try different keywords or browse all categories.</p>
          </div>
        )}
      </div>

      <div className="faq-footer">
        <h3>Still have questions?</h3>
        <p>Can't find what you're looking for? Our team is here to help!</p>
        <a href="/contact" className="contact-button">Contact Us</a>
      </div>
    </div>
  );
};

export default FAQ;

