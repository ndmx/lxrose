import React, { useState, useEffect } from "react";
import { sendMessage, getUser } from "../utils/mockDatabase";
import { useCookieConsent } from "../utils/cookies";
import Mail from "../utils/Mail";
import { db } from "../firebase";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { Timestamp } from 'firebase/firestore';
import { format } from 'date-fns';

const Home = ({ userId }) => {
  useCookieConsent();

  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [showUserList, setShowUserList] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const userDocRef = doc(db, "users", userId);
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        setUser(userData);
      } else {
        console.error("No such user!");
      }
    };

    fetchData();
  }, [userId]);

  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const usersCollection = collection(db, "users");
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAllUsers(usersList);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchAllUsers();
  }, []);

  const [activeTab, setActiveTab] = useState("contact");
  const [newMessage, setNewMessage] = useState("");
  const [receiverId, setReceiverId] = useState("");

  const handleSendMessage = async () => {
    if (!user) return;

    const messageObj = {
      fromName: user.username,
      fromEmail: user.email,
      message: newMessage,
      timestamp: Timestamp.fromDate(new Date()),
    };

    if (await sendMessage(userId, receiverId, messageObj)) {
      const refreshedUser = await getUser(userId);
      setUser(refreshedUser);

      setNewMessage("");
      setReceiverId("");
    } else {
      console.error("Failed to send the message. User IDs might be incorrect.");
    }
  };


  const filteredMailbox = user?.mailbox?.filter(email =>
    email.fromName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.fromEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    email.message.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div id="homePage">
      <div className="admin-header">
        <h1 className="admin-title">Admin Dashboard</h1>
        <p className="admin-subtitle">Manage your forms, bookings, and messages</p>
      </div>

      <div className="homepage-container">
        <div className="left-section">
          <div className="user-card">
            <div className="user-avatar">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
            </div>
            <div className="user-info">
              <div className="username">
                {user ? user.username : "Loading..."}
              </div>
              <div className="email">{user ? user.email : "Loading..."}</div>
            </div>
            <div className="user-status">
              <span className="status-indicator"></span>
              <span className="status-text">Active</span>
            </div>
          </div>

          <div className="stats-card">
            <h3 className="stats-title">Quick Stats</h3>
            <div className="stat-item">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
              </svg>
              <div className="stat-content">
                <span className="stat-label">Total Forms</span>
                <span className="stat-value">View All</span>
              </div>
            </div>
            <div className="stat-item">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
              </svg>
              <div className="stat-content">
                <span className="stat-label">Today</span>
                <span className="stat-value">{format(new Date(), 'MMM d, yyyy')}</span>
              </div>
            </div>
          </div>

          <div className="session-card">
            <div className="session-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
              </svg>
            </div>
            <div className="session-info">
              <span className="session-label">Session Started</span>
              <span className="session-time">{format(new Date(), 'h:mm a')}</span>
            </div>
          </div>

          <div className="users-list-card">
            <button 
              className="users-list-header" 
              onClick={() => setShowUserList(!showUserList)}
            >
              <div className="users-list-title">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
                <span>All Users ({allUsers.length})</span>
              </div>
              <svg 
                viewBox="0 0 24 24" 
                fill="currentColor" 
                className={`users-list-toggle ${showUserList ? 'open' : ''}`}
              >
                <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z"/>
              </svg>
            </button>
            
            {showUserList && (
              <div className="users-list-content">
                {allUsers.length > 0 ? (
                  allUsers.map((usr) => (
                    <div 
                      key={usr.id} 
                      className={`user-list-item ${usr.id === userId ? 'current-user' : ''}`}
                      onClick={() => {
                        if (usr.id !== userId) {
                          setReceiverId(usr.id);
                          setShowUserList(false);
                        }
                      }}
                    >
                      <div className="user-list-avatar">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                      </div>
                      <div className="user-list-info">
                        <span className="user-list-name">
                          {usr.username}
                          {usr.id === userId && <span className="you-badge">You</span>}
                        </span>
                        <span className="user-list-id">ID: {usr.id}</span>
                      </div>
                      {usr.id !== userId && (
                        <svg viewBox="0 0 24 24" fill="currentColor" className="user-list-action">
                          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                        </svg>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="users-list-empty">
                    <p>No users found</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="right-section">
          <div className="tabs-container">
            <div className="tabs">
              <button
                className={`tab ${activeTab === "contact" ? "active" : ""}`}
                onClick={() => setActiveTab("contact")}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
                Contact
              </button>
              <button
                className={`tab ${activeTab === "join" ? "active" : ""}`}
                onClick={() => setActiveTab("join")}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                </svg>
                Join
              </button>
              <button
                className={`tab ${activeTab === "mental" ? "active" : ""}`}
                onClick={() => setActiveTab("mental")}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                </svg>
                Mental
              </button>
              <button
                className={`tab ${activeTab === "nursing" ? "active" : ""}`}
                onClick={() => setActiveTab("nursing")}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3h4v2h-4V6zm0 4h4v2h-4v-2zM5 14v-2h2v2H5zm0-4V8h2v2H5zm0 8v-2h2v2H5zm4 0v-2h2v2H9zm0-4v-2h2v2H9zm0-4V8h2v2H9z"/>
                </svg>
                Nursing
              </button>
              <button
                className={`tab ${activeTab === "nurses" ? "active" : ""}`}
                onClick={() => setActiveTab("nurses")}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M15 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm-9-2V7H4v3H1v2h3v3h2v-3h3v-2H6zm9 4c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                </svg>
                Nurses
              </button>
              <button
                className={`tab ${activeTab === "nutrition" ? "active" : ""}`}
                onClick={() => setActiveTab("nutrition")}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 6v8h3v8h2V2c-2.76 0-5 2.24-5 4zm-5 3H9V2H7v7H5V2H3v7c0 2.21 1.79 4 4 4v9h2v-9c2.21 0 4-1.79 4-4V2h-2v7z"/>
                </svg>
                Nutrition
              </button>
              <button
                className={`tab ${activeTab === "third" ? "active" : ""}`}
                onClick={() => setActiveTab("third")}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                </svg>
                Mailbox
              </button>
            </div>
          </div>

          <div className="content-area">
            {activeTab === "third" && user && (
              <div className="search-container">
                <svg viewBox="0 0 24 24" fill="currentColor" className="search-icon">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
                </svg>
                <input
                  type="text"
                  placeholder="Search mailbox by name, email, or message..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            )}
            
            <Mail activeTab={activeTab} setActiveTab={setActiveTab} />
            
            {activeTab === "third" && user && (
              <div className="mailbox">
                <ul>
                  {filteredMailbox.length > 0 ? (
                    filteredMailbox.map((email, index) => (
                      <li key={index} className="mail-card">
                        <div className="mail-header">
                          <div className="mail-from">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                            </svg>
                            <span className="from-name">{email.fromName}</span>
                          </div>
                          <span className="mail-time">{email.timestamp ? format(new Date(email.timestamp), 'MMM d, yyyy h:mm a') : 'N/A'}</span>
                        </div>
                        <div className="mail-email">{email.fromEmail}</div>
                        <div className="mail-message">{email.message}</div>
                      </li>
                    ))
                  ) : (
                    <li className="empty-state">
                      <svg viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                      </svg>
                      <p>{searchTerm ? "No matching emails found." : "No emails in the mailbox."}</p>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="send-message-section">
        <div className="send-message-form">
          <h3 className="form-title">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
            </svg>
            Send Internal Message
          </h3>
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="userID">Receiver ID</label>
              <input
                id="userID"
                type="text"
                placeholder="Enter receiver's user ID"
                value={receiverId}
                onChange={(e) => setReceiverId(e.target.value)}
              />
            </div>
            <div className="form-group full-width">
              <label htmlFor="mailMessage">Message</label>
              <textarea
                id="mailMessage"
                placeholder="Type your message here..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
              />
            </div>
            <div className="form-actions">
              <button onClick={handleSendMessage} className="send-button">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;