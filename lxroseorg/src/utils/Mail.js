import React, { useEffect, useState } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';

const Mail = ({ activeTab, setActiveTab }) => {
  const [contactForms, setContactForms] = useState([]);
  const [joinForms, setJoinForms] = useState([]);
  const [mentalBookings, setMentalBookings] = useState([]);
  const [nursingBookings, setNursingBookings] = useState([]);
  const [nurseRegistrations, setNurseRegistrations] = useState([]);
  const [nutritionBookings, setNutritionBookings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all documents from contactForms collection
        const contactSnapshot = await getDocs(collection(db, 'contactForms'));
        const contactData = contactSnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
        setContactForms(contactData);

        // Fetch all documents from joinForms collection
        const joinSnapshot = await getDocs(collection(db, 'joinForms'));
        const joinData = joinSnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
        setJoinForms(joinData);

        // Fetch mental health bookings
        const mentalSnapshot = await getDocs(collection(db, 'mentalServicesBookings'));
        const mentalData = mentalSnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
        setMentalBookings(mentalData);

        // Fetch nursing service bookings
        const nursingSnapshot = await getDocs(collection(db, 'nursingServiceBookings'));
        const nursingData = nursingSnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
        setNursingBookings(nursingData);

        // Fetch nurse registrations
        const nursesSnapshot = await getDocs(collection(db, 'nurseRegistrations'));
        const nursesData = nursesSnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
        setNurseRegistrations(nursesData);

        // Fetch nutrition bookings
        const nutritionSnapshot = await getDocs(collection(db, 'nutritionServiceBookings'));
        const nutritionData = nutritionSnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));
        setNutritionBookings(nutritionData);
      } catch (error) {
        console.log('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {activeTab === 'contact' && (
        <div className="mailbox">
          <ul>
            {contactForms.length > 0 ? (
              contactForms.map((form, index) => (
                <li key={index} className="mail-card">
                  <div className="mail-header">
                    <div className="mail-from">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                      <span className="from-name">{form.name}</span>
                    </div>
                    <span className="mail-time">{form.timestamp ? format(form.timestamp.toDate(), 'MMM d, yyyy h:mm a') : 'N/A'}</span>
                  </div>
                  <div className="mail-email">{form.email}</div>
                  {form.subject && <div className="mail-subject"><strong>Subject:</strong> {form.subject}</div>}
                  <div className="mail-message">{form.message}</div>
                </li>
              ))
            ) : (
              <li className="empty-state">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                <p>No contact forms yet.</p>
              </li>
            )}
          </ul>
        </div>
      )}

      {activeTab === 'join' && (
        <div className="mailbox">
          <ul>
            {joinForms.length > 0 ? (
              joinForms.map((form, index) => (
                <li key={index} className="mail-card">
                  <div className="mail-header">
                    <div className="mail-from">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                      </svg>
                      <span className="from-name">{form.name}</span>
                    </div>
                    <span className="mail-time">{form.timestamp ? format(form.timestamp.toDate(), 'MMM d, yyyy h:mm a') : 'N/A'}</span>
                  </div>
                  <div className="mail-email">{form.email}</div>
                </li>
              ))
            ) : (
              <li className="empty-state">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
                <p>No join forms yet.</p>
              </li>
            )}
          </ul>
        </div>
      )}

      {activeTab === 'mental' && (
        <div className="mailbox">
          <ul>
            {mentalBookings.length > 0 ? (
              mentalBookings.map((booking, index) => (
                <li key={index} className="mail-card">
                  <div className="mail-header">
                    <div className="mail-from">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                      </svg>
                      <span className="from-name">{booking.name}</span>
                    </div>
                    <span className="mail-time">{booking.timestamp ? format(booking.timestamp.toDate(), 'MMM d, yyyy h:mm a') : 'N/A'}</span>
                  </div>
                  <div className="mail-email">{booking.email}</div>
                  <div className="mail-subject"><strong>Service:</strong> {booking.service || 'N/A'}</div>
                  {booking.additionalInfo && <div className="mail-message"><strong>Notes:</strong> {booking.additionalInfo}</div>}
                </li>
              ))
            ) : (
              <li className="empty-state">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                <p>No mental health bookings yet.</p>
              </li>
            )}
          </ul>
        </div>
      )}

      {activeTab === 'nursing' && (
        <div className="mailbox">
          <ul>
            {nursingBookings.length > 0 ? (
              nursingBookings.map((booking, index) => (
                <li key={index} className="mail-card">
                  <div className="mail-header">
                    <div className="mail-from">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3h4v2h-4V6zm0 4h4v2h-4v-2zM5 14v-2h2v2H5zm0-4V8h2v2H5zm0 8v-2h2v2H5zm4 0v-2h2v2H9zm0-4v-2h2v2H9zm0-4V8h2v2H9z"/>
                      </svg>
                      <span className="from-name">{booking.serviceType}</span>
                    </div>
                    <span className="mail-time">{booking.timestamp ? format(booking.timestamp.toDate(), 'MMM d, yyyy h:mm a') : 'N/A'}</span>
                  </div>
                  <div className="mail-subject"><strong>Patient Age:</strong> {booking.patientAge}</div>
                  <div className="mail-subject"><strong>Care Duration:</strong> {booking.careDuration}</div>
                  <div className="mail-subject"><strong>Start Date:</strong> {booking.startDate}</div>
                  <div className="mail-email"><strong>Contact:</strong> {booking.contactInfo}</div>
                  {booking.additionalNotes && <div className="mail-message"><strong>Notes:</strong> {booking.additionalNotes}</div>}
                </li>
              ))
            ) : (
              <li className="empty-state">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3h4v2h-4V6zm0 4h4v2h-4v-2zM5 14v-2h2v2H5zm0-4V8h2v2H5zm0 8v-2h2v2H5zm4 0v-2h2v2H9zm0-4v-2h2v2H9zm0-4V8h2v2H9z"/>
                </svg>
                <p>No nursing bookings yet.</p>
              </li>
            )}
          </ul>
        </div>
      )}

      {activeTab === 'nurses' && (
        <div className="mailbox">
          <ul>
            {nurseRegistrations.length > 0 ? (
              nurseRegistrations.map((registration, index) => (
                <li key={index} className="mail-card">
                  <div className="mail-header">
                    <div className="mail-from">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                      </svg>
                      <span className="from-name">{registration.name}</span>
                    </div>
                    <span className="mail-time">{registration.timestamp ? format(registration.timestamp.toDate(), 'MMM d, yyyy h:mm a') : 'N/A'}</span>
                  </div>
                  <div className="mail-email">{registration.email}</div>
                  <div className="mail-subject"><strong>Qualifications:</strong> {registration.qualifications}</div>
                  <div className="mail-subject"><strong>Experience:</strong> {registration.yearsOfExperience} years</div>
                  <div className="mail-message"><strong>Availability:</strong> {registration.availability}</div>
                </li>
              ))
            ) : (
              <li className="empty-state">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                <p>No nurse registrations yet.</p>
              </li>
            )}
          </ul>
        </div>
      )}

      {activeTab === 'nutrition' && (
        <div className="mailbox">
          <ul>
            {nutritionBookings.length > 0 ? (
              nutritionBookings.map((booking, index) => (
                <li key={index} className="mail-card">
                  <div className="mail-header">
                    <div className="mail-from">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16 6v8h3v8h2V2c-2.76 0-5 2.24-5 4zm-5 3H9V2H7v7H5V2H3v7c0 2.21 1.79 4 4 4v9h2v-9c2.21 0 4-1.79 4-4V2h-2v7z"/>
                      </svg>
                      <span className="from-name">{booking.name}</span>
                    </div>
                    <span className="mail-time">{booking.timestamp ? format(booking.timestamp.toDate(), 'MMM d, yyyy h:mm a') : 'N/A'}</span>
                  </div>
                  <div className="mail-email">{booking.email}</div>
                  <div className="mail-subject"><strong>Service:</strong> {booking.serviceTitle || `Service ID: ${booking.serviceId}`}</div>
                  {booking.info && <div className="mail-message"><strong>Notes:</strong> {booking.info}</div>}
                </li>
              ))
            ) : (
              <li className="empty-state">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 6v8h3v8h2V2c-2.76 0-5 2.24-5 4zm-5 3H9V2H7v7H5V2H3v7c0 2.21 1.79 4 4 4v9h2v-9c2.21 0 4-1.79 4-4V2h-2v7z"/>
                </svg>
                <p>No nutrition bookings yet.</p>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Mail;
