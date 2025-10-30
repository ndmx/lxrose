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
            {contactForms.map((form, index) => (
              <li key={index}>
                Name: {form.name} --|-- {form.timestamp ? format(form.timestamp.toDate(), 'h aaaa, MMM d yyyy') : 'N/A'}<br />
                Email: {form.email}  <br />
                Message: {form.message}
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'join' && (
        <div className="mailbox">
          <ul>
            {joinForms.map((form, index) => (
              <li key={index}>
                Name: {form.name} --|-- time: {form.timestamp ? format(form.timestamp.toDate(), 'h aaaa, MMM d yyyy') : 'N/A'}<br />
                Email: {form.email}
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === 'mental' && (
        <div className="mailbox">
          <h3>Mental Health Service Bookings</h3>
          <ul>
            {mentalBookings.length > 0 ? (
              mentalBookings.map((booking, index) => (
                <li key={index}>
                  Name: {booking.name} --|-- {booking.timestamp ? format(booking.timestamp.toDate(), 'h aaaa, MMM d yyyy') : 'N/A'}<br />
                  Email: {booking.email}<br />
                  Service: {booking.selectedService || 'N/A'}<br />
                  Additional Info: {booking.additionalInfo || 'None'}
                </li>
              ))
            ) : (
              <li>No mental health bookings yet.</li>
            )}
          </ul>
        </div>
      )}

      {activeTab === 'nursing' && (
        <div className="mailbox">
          <h3>Nursing Service Bookings</h3>
          <ul>
            {nursingBookings.length > 0 ? (
              nursingBookings.map((booking, index) => (
                <li key={index}>
                  Service Type: {booking.serviceType} --|-- {booking.timestamp ? format(booking.timestamp.toDate(), 'h aaaa, MMM d yyyy') : 'N/A'}<br />
                  Patient Age: {booking.patientAge}<br />
                  Care Duration: {booking.careDuration}<br />
                  Start Date: {booking.startDate}<br />
                  Contact Info: {booking.contactInfo}<br />
                  Additional Notes: {booking.additionalNotes || 'None'}
                </li>
              ))
            ) : (
              <li>No nursing bookings yet.</li>
            )}
          </ul>
        </div>
      )}

      {activeTab === 'nurses' && (
        <div className="mailbox">
          <h3>Nurse Registrations</h3>
          <ul>
            {nurseRegistrations.length > 0 ? (
              nurseRegistrations.map((registration, index) => (
                <li key={index}>
                  Name: {registration.name} --|-- {registration.timestamp ? format(registration.timestamp.toDate(), 'h aaaa, MMM d yyyy') : 'N/A'}<br />
                  Email: {registration.email}<br />
                  Qualifications: {registration.qualifications}<br />
                  Experience: {registration.yearsOfExperience} years<br />
                  Availability: {registration.availability}
                </li>
              ))
            ) : (
              <li>No nurse registrations yet.</li>
            )}
          </ul>
        </div>
      )}

      {activeTab === 'nutrition' && (
        <div className="mailbox">
          <h3>Nutrition Service Bookings</h3>
          <ul>
            {nutritionBookings.length > 0 ? (
              nutritionBookings.map((booking, index) => (
                <li key={index}>
                  Name: {booking.name} --|-- {booking.timestamp ? format(booking.timestamp.toDate(), 'h aaaa, MMM d yyyy') : 'N/A'}<br />
                  Email: {booking.email}<br />
                  Service: {booking.serviceTitle || `Service ID: ${booking.serviceId}`}<br />
                  Info: {booking.info || 'None'}
                </li>
              ))
            ) : (
              <li>No nutrition bookings yet.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Mail;
