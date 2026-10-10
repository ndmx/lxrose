import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  changeOwnPassword,
  createAdminUser,
  formatAdminTimestamp,
  getAllUsers,
  getConversationMessages,
  getConversations,
  getCurrentUser,
  getDashboardAnalytics,
  getUnifiedSubmissions,
  markConversationRead,
  sendConversationMessage,
  resetUserPassword,
  updateSubmission
} from "../utils/api";

const statusLabels = {
  new: "New",
  reviewed: "Reviewed",
  contacted: "Contacted",
  scheduled: "Scheduled",
  closed: "Closed"
};

const defaultStats = {
  total: 0,
  newContacts: 0,
  bookingsToday: 0,
  openFollowUps: 0
};

const defaultAnalytics = {
  contactForms: { total: 0, today: 0, thisWeek: 0, unread: 0 },
  joinForms: { total: 0, today: 0, thisWeek: 0 },
  timestamp: null
};

const emptyNewUser = {
  username: "",
  email: "",
  password: "",
  role: "admin"
};

const emptyPasswordForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: ""
};

const emptyResetForm = {
  userId: "",
  newPassword: ""
};

const formatSubmissionDate = (timestamp) => {
  const date = formatAdminTimestamp(timestamp);
  return date ? format(date, "MMM d, yyyy h:mm a") : "No date";
};

const getInitials = (value = "Admin") => value
  .split(" ")
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part[0])
  .join("")
  .toUpperCase() || "A";

const Home = ({ userId }) => {
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [stats, setStats] = useState(defaultStats);
  const [typeOptions, setTypeOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState(Object.keys(statusLabels));
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [siteAnalytics, setSiteAnalytics] = useState(defaultAnalytics);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [draftStatus, setDraftStatus] = useState("new");
  const [draftAssignedTo, setDraftAssignedTo] = useState("");
  const [draftNotes, setDraftNotes] = useState("");
  const [replyDraft, setReplyDraft] = useState("");
  const [newUser, setNewUser] = useState(emptyNewUser);
  const [userMessage, setUserMessage] = useState("");
  const [passwordForm, setPasswordForm] = useState(emptyPasswordForm);
  const [resetForm, setResetForm] = useState(emptyResetForm);
  const [passwordMessage, setPasswordMessage] = useState("");
  const [activePanel, setActivePanel] = useState("submissions");
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [conversationMessages, setConversationMessages] = useState([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isThreadLoading, setIsThreadLoading] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [messageError, setMessageError] = useState("");

  const loadDashboard = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [currentUser, users, inbox, analytics] = await Promise.all([
        userId ? getCurrentUser(userId) : Promise.resolve(null),
        getAllUsers(),
        getUnifiedSubmissions(),
        getDashboardAnalytics()
      ]);

      setUser(currentUser);
      setAllUsers(users);
      setSubmissions(inbox.submissions || []);
      setNextCursor(inbox.nextCursor);
      setStats(inbox.stats || defaultStats);
      setSiteAnalytics(analytics || defaultAnalytics);
      setTypeOptions(inbox.typeOptions || []);
      setStatusOptions(inbox.statusOptions || Object.keys(statusLabels));

      if (!selectedSubmission && inbox.submissions?.length) {
        setSelectedSubmission(inbox.submissions[0]);
      }
    } catch (loadError) {
      setError(loadError.message || "Unable to load admin dashboard.");
    } finally {
      setIsLoading(false);
    }
  };

  const loadMoreSubmissions = async () => {
    setLoadingMore(true);
    try {
      const page = await getUnifiedSubmissions(nextCursor);
      setSubmissions(current => [...new Map([...current, ...page.submissions].map(item => [`${item.type}/${item.id}`, item])).values()]);
      setNextCursor(page.nextCursor);
    } catch (error) { setError(error.message); }
    finally { setLoadingMore(false); }
  };

  useEffect(() => {
    loadDashboard();
  }, [userId]);

  const getUserLabel = (lookupUserId) => {
    const matchedUser = allUsers.find((adminUser) => adminUser.id === lookupUserId);
    return matchedUser?.email || matchedUser?.username || lookupUserId || "Unknown user";
  };

  const loadConversations = async () => {
    if (!userId) {
      return;
    }

    setIsMessagesLoading(true);
    setMessageError("");

    try {
      const data = await getConversations(userId);
      setConversations(data);

      if (!selectedConversation && data.length) {
        setSelectedConversation(data[0]);
      }
    } catch (loadError) {
      setMessageError(loadError.message || "Unable to load messages.");
    } finally {
      setIsMessagesLoading(false);
    }
  };

  useEffect(() => {
    if (activePanel === "messages") {
      loadConversations();
    }
  }, [activePanel, userId]);

  const loadThread = async (conversation) => {
    if (!userId || !conversation?.userId) {
      setConversationMessages([]);
      return;
    }

    setIsThreadLoading(true);
    setMessageError("");

    try {
      const messages = await getConversationMessages(userId, conversation.userId);
      setConversationMessages(messages);

      if (conversation.unread) {
        await markConversationRead(userId, conversation.userId);
        setConversations((current) => current.map((item) => (
          item.userId === conversation.userId ? { ...item, unread: false } : item
        )));
      }
    } catch (loadError) {
      setMessageError(loadError.message || "Unable to load this conversation.");
    } finally {
      setIsThreadLoading(false);
    }
  };

  useEffect(() => {
    if (activePanel === "messages" && selectedConversation) {
      loadThread(selectedConversation);
    }
  }, [activePanel, selectedConversation?.userId, userId]);

  useEffect(() => {
    if (!selectedSubmission) {
      setDraftStatus("new");
      setDraftAssignedTo("");
      setDraftNotes("");
      return;
    }

    setDraftStatus(selectedSubmission.status || "new");
    setDraftAssignedTo(selectedSubmission.assignedTo || "");
    setDraftNotes(selectedSubmission.internalNotes || "");
    setReplyDraft(`Hello ${selectedSubmission.name || "there"},\n\nThank you for reaching out to LxRose. `);
  }, [selectedSubmission]);

  const filteredSubmissions = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();

    return submissions.filter((submission) => {
      const matchesType = typeFilter === "all" || submission.type === typeFilter;
      const matchesStatus = statusFilter === "all" || submission.status === statusFilter;
      const searchableText = [
        submission.name,
        submission.email,
        submission.phone,
        submission.service,
        submission.subject,
        submission.message,
        submission.typeLabel,
        submission.status
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesType && matchesStatus && (!term || searchableText.includes(term));
    });
  }, [searchTerm, statusFilter, submissions, typeFilter]);

  const summaryCards = [
    { label: "New Contacts", value: stats.newContacts || 0 },
    { label: "Bookings Today", value: stats.bookingsToday || 0 },
    { label: "Open Follow-ups", value: stats.openFollowUps || 0 },
    { label: "Total Submissions", value: stats.total || submissions.length },
    { label: "Admin Users", value: allUsers.length }
  ];

  const selectedUserLabel = user?.email || user?.username || "admin@lxrose.org";
  const unreadConversationCount = conversations.filter((conversation) => conversation.unread).length;
  const typeBreakdown = typeOptions.map((option) => ({
    ...option,
    count: stats.byType?.[option.value] || 0
  }));
  const statusBreakdown = statusOptions.map((status) => ({
    label: statusLabels[status] || status,
    count: stats.byStatus?.[status] || 0
  }));

  const handleSelectSubmission = (submission) => {
    setSelectedSubmission(submission);
  };

  const handleSaveSubmission = async () => {
    if (!selectedSubmission) {
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const updated = await updateSubmission(selectedSubmission.type, selectedSubmission.id, {
        status: draftStatus,
        assignedTo: draftAssignedTo,
        internalNotes: draftNotes
      });

      setSubmissions((current) => current.map((submission) => (
        submission.id === updated.id && submission.type === updated.type ? updated : submission
      )));
      setSelectedSubmission(updated);
    } catch (saveError) {
      setError(saveError.message || "Unable to update submission.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendMessage = async (event) => {
    event.preventDefault();

    if (!userId || !selectedConversation?.userId || !messageDraft.trim()) {
      return;
    }

    setIsSendingMessage(true);
    setMessageError("");

    try {
      await sendConversationMessage(userId, selectedConversation.userId, messageDraft.trim());
      setMessageDraft("");
      await loadThread(selectedConversation);
      await loadConversations();
    } catch (sendError) {
      setMessageError(sendError.message || "Unable to send message.");
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleNewUserChange = (event) => {
    const { name, value } = event.target;
    setNewUser((current) => ({ ...current, [name]: value }));
  };

  const handlePasswordFormChange = (event) => {
    const { name, value } = event.target;
    setPasswordForm((current) => ({ ...current, [name]: value }));
  };

  const handleResetFormChange = (event) => {
    const { name, value } = event.target;
    setResetForm((current) => ({ ...current, [name]: value }));
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setIsCreatingUser(true);
    setUserMessage("");

    try {
      const created = await createAdminUser(newUser);
      setAllUsers((current) => [...current, created.user]);
      setNewUser(emptyNewUser);
      setUserMessage("Admin user created. Share the temporary password privately and have them change it soon.");
    } catch (createError) {
      setUserMessage(createError.message || "Unable to create admin user.");
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleChangePassword = async (event) => {
    event.preventDefault();
    setPasswordMessage("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMessage("New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);

    try {
      await changeOwnPassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordForm(emptyPasswordForm);
      setPasswordMessage("Your password was changed successfully.");
      setUser((current) => current ? { ...current, mustChangePassword: false } : current);
    } catch (changeError) {
      setPasswordMessage(changeError.message || "Unable to change password.");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleResetUserPassword = async (event) => {
    event.preventDefault();
    setPasswordMessage("");

    if (!resetForm.userId || !resetForm.newPassword) {
      setPasswordMessage("Choose a user and enter a temporary password.");
      return;
    }

    setIsResettingPassword(true);

    try {
      const result = await resetUserPassword(resetForm.userId, resetForm.newPassword);
      setAllUsers((current) => current.map((adminUser) => (
        adminUser.id === result.user.id ? result.user : adminUser
      )));
      setResetForm(emptyResetForm);
      setPasswordMessage("Temporary password set. Ask the user to sign in and change it.");
    } catch (resetError) {
      setPasswordMessage(resetError.message || "Unable to reset password.");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleOpenReply = () => {
    if (!selectedSubmission?.email) {
      return;
    }

    const subject = `Re: ${selectedSubmission.subject || selectedSubmission.typeLabel || "LxRose inquiry"}`;
    const body = `${replyDraft.trim()}\n\n--\nLxRose Admin`;
    const mailtoUrl = `mailto:${encodeURIComponent(selectedSubmission.email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
    setDraftStatus("contacted");
  };

  return (
    <div id="homePage">
      <div className="admin-header">
        <div>
          <p className="admin-kicker">Operations</p>
          <h1 className="admin-title">Admin Dashboard</h1>
          <p className="admin-subtitle">Review submissions, assign follow-ups, and keep care requests moving.</p>
        </div>
        <button className="admin-refresh-button" type="button" onClick={loadDashboard} disabled={isLoading}>
          {isLoading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <section className="admin-summary-grid" aria-label="Dashboard summary">
        {summaryCards.map((card) => (
          <div className="admin-summary-card" key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
          </div>
        ))}
      </section>

      <div className="admin-panel-tabs" role="tablist" aria-label="Admin workspace">
        <button
          type="button"
          className={activePanel === "submissions" ? "active" : ""}
          onClick={() => setActivePanel("submissions")}
        >
          Submissions
        </button>
        <button
          type="button"
          className={activePanel === "messages" ? "active" : ""}
          onClick={() => setActivePanel("messages")}
        >
          Messages
          {unreadConversationCount > 0 && <span>{unreadConversationCount}</span>}
        </button>
        <button
          type="button"
          className={activePanel === "stats" ? "active" : ""}
          onClick={() => setActivePanel("stats")}
        >
          Stats
        </button>
        <button
          type="button"
          className={activePanel === "users" ? "active" : ""}
          onClick={() => setActivePanel("users")}
        >
          Users
        </button>
      </div>

      {activePanel === "submissions" && (
      <div className="admin-workspace">
        <aside className="admin-sidebar">
          <div className="user-card">
            <div className="user-avatar">{getInitials(user?.username || user?.email)}</div>
            <div className="user-info">
              <div className="username">{user?.username || "Admin"}</div>
              <div className="email">{selectedUserLabel}</div>
            </div>
            <div className="user-status">
              <span className="status-indicator"></span>
              <span className="status-text">Active</span>
            </div>
          </div>

          <div className="stats-card">
            <h3 className="stats-title">Filters</h3>
            <label className="filter-field" htmlFor="type-filter">
              Type
              <select id="type-filter" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                <option value="all">All types</option>
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>

            <label className="filter-field" htmlFor="status-filter">
              Status
              <select id="status-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="all">All statuses</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>{statusLabels[status] || status}</option>
                ))}
              </select>
            </label>
          </div>

          <div className="session-card">
            <div className="session-icon">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/>
              </svg>
            </div>
            <div className="session-info">
              <span className="session-label">Today</span>
              <span className="session-time">{format(new Date(), "MMM d, yyyy")}</span>
            </div>
          </div>
        </aside>

        <section className="inbox-panel" aria-labelledby="inbox-title">
          <div className="inbox-toolbar">
            <div>
              <h2 id="inbox-title">Unified Inbox</h2>
              <p>{filteredSubmissions.length} visible of {submissions.length} loaded</p>
            </div>
            <div className="inbox-search">
              <svg viewBox="0 0 24 24" fill="currentColor" className="search-icon">
                <path d="M9.5 3C5.91 3 3 5.91 3 9.5S5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5C16 5.91 13.09 3 9.5 3zm0 2C11.99 5 14 7.01 14 9.5S11.99 14 9.5 14 5 11.99 5 9.5 7.01 5 9.5 5z"/>
              </svg>
              <input
                type="search"
                placeholder="Search name, email, phone, service, status..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
              />
            </div>
          </div>

          {error && <div className="admin-alert" role="alert">{error}</div>}

          {isLoading ? (
            <div className="admin-empty-state">Loading submissions...</div>
          ) : filteredSubmissions.length ? (
            <div className="submission-list">
              {filteredSubmissions.map((submission) => (
                <button
                  type="button"
                  key={`${submission.type}-${submission.id}`}
                  className={`submission-row ${selectedSubmission?.id === submission.id && selectedSubmission?.type === submission.type ? "active" : ""}`}
                  onClick={() => handleSelectSubmission(submission)}
                >
                  <div className="submission-row-main">
                    <span className="submission-type">{submission.typeLabel}</span>
                    <strong>{submission.title}</strong>
                    <p>{submission.message || submission.subject || "No message provided."}</p>
                  </div>
                  <div className="submission-row-meta">
                    <span className={`submission-status status-${submission.status}`}>
                      {statusLabels[submission.status] || submission.status}
                    </span>
                    <span>{formatSubmissionDate(submission.timestamp)}</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="admin-empty-state">No submissions match those filters.</div>
          )}
          {nextCursor && <button type="button" className="admin-refresh-button" onClick={loadMoreSubmissions} disabled={loadingMore}>
            {loadingMore ? 'Loading…' : 'Load older requests'}
          </button>}
        </section>

        <aside className={`detail-drawer ${selectedSubmission ? "open" : ""}`} aria-label="Submission details">
          {selectedSubmission ? (
            <>
              <div className="detail-header">
                <div>
                  <span className="submission-type">{selectedSubmission.typeLabel}</span>
                  <h2>{selectedSubmission.title}</h2>
                  <p>{formatSubmissionDate(selectedSubmission.timestamp)}</p>
                </div>
                <button type="button" onClick={() => setSelectedSubmission(null)} aria-label="Close details">
                  Close
                </button>
              </div>

              <div className="detail-grid">
                <div>
                  <span>Name</span>
                  <strong>{selectedSubmission.name || "Not provided"}</strong>
                </div>
                <div>
                  <span>Email</span>
                  <strong>{selectedSubmission.email || "Not provided"}</strong>
                </div>
                <div>
                  <span>Phone</span>
                  <strong>{selectedSubmission.phone || "Not provided"}</strong>
                </div>
                <div>
                  <span>Service</span>
                  <strong>{selectedSubmission.service || selectedSubmission.subject || "Not provided"}</strong>
                </div>
              </div>

              <div className="detail-message">
                <span>Message</span>
                <p>{selectedSubmission.message || selectedSubmission.subject || "No message provided."}</p>
              </div>

              <div className="reply-helper">
                <div>
                  <span>Reply</span>
                  <p>
                    Draft a response, open it in your email app, then save the submission as contacted.
                  </p>
                </div>
                <textarea
                  value={replyDraft}
                  onChange={(event) => setReplyDraft(event.target.value)}
                  placeholder="Write a reply for this inquiry."
                />
                <button
                  type="button"
                  onClick={handleOpenReply}
                  disabled={!selectedSubmission.email || !replyDraft.trim()}
                >
                  Open Email Reply
                </button>
              </div>

              {selectedSubmission.invalidFields?.length > 0 && <p className="admin-alert" role="status">Some fields in this older request are invalid and have been hidden. Review the original record before processing.</p>}
              <fieldset className="detail-controls" disabled={!["admin", "staff"].includes(user?.role)}>
                <label htmlFor="submission-status">
                  Status
                  <select id="submission-status" value={draftStatus} onChange={(event) => setDraftStatus(event.target.value)}>
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>{statusLabels[status] || status}</option>
                    ))}
                  </select>
                </label>

                <label htmlFor="submission-assignee">
                  Assigned To
                  <select id="submission-assignee" value={draftAssignedTo} onChange={(event) => setDraftAssignedTo(event.target.value)}>
                    <option value="">Unassigned</option>
                    <option value="admin@lxrose.org">admin@lxrose.org</option>
                    {allUsers.map((adminUser) => {
                      const label = adminUser.email || adminUser.username || adminUser.id;
                      return <option key={adminUser.id} value={label}>{label}</option>;
                    })}
                  </select>
                </label>

                <label htmlFor="submission-notes">
                  Internal Notes
                  <textarea
                    id="submission-notes"
                    value={draftNotes}
                    onChange={(event) => setDraftNotes(event.target.value)}
                    placeholder="Add follow-up notes for the admin team."
                  />
                </label>

                <button className="save-detail-button" type="button" onClick={handleSaveSubmission} disabled={isSaving || !["admin", "staff"].includes(user?.role)}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </fieldset>
            </>
          ) : (
            <div className="admin-empty-state">Select a submission to see the details.</div>
          )}
        </aside>
      </div>
      )}

      {activePanel === "messages" && (
      <div className="messages-workspace">
        <aside className="conversations-panel">
          <div className="messages-toolbar">
            <div>
              <h2>Messages</h2>
              <p>{conversations.length} conversation{conversations.length === 1 ? "" : "s"}</p>
            </div>
            <button type="button" onClick={loadConversations} disabled={isMessagesLoading}>
              {isMessagesLoading ? "Loading..." : "Refresh"}
            </button>
          </div>

          {messageError && <div className="admin-alert" role="alert">{messageError}</div>}

          {isMessagesLoading ? (
            <div className="admin-empty-state">Loading conversations...</div>
          ) : conversations.length ? (
            <div className="conversation-list">
              {conversations.map((conversation) => (
                <button
                  type="button"
                  key={conversation.userId}
                  className={`conversation-row ${selectedConversation?.userId === conversation.userId ? "active" : ""} ${conversation.unread ? "unread" : ""}`}
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <div className="conversation-avatar">{getInitials(getUserLabel(conversation.userId))}</div>
                  <div className="conversation-summary">
                    <strong>{getUserLabel(conversation.userId)}</strong>
                    <span>{conversation.lastMessage || "No message text"}</span>
                  </div>
                  {conversation.unread && <span className="unread-dot" aria-label="Unread messages"></span>}
                </button>
              ))}
            </div>
          ) : (
            <div className="admin-empty-state">No messages yet.</div>
          )}
        </aside>

        <section className="message-thread-panel" aria-label="Message thread">
          {selectedConversation ? (
            <>
              <div className="thread-header">
                <div>
                  <span>Conversation</span>
                  <h2>{getUserLabel(selectedConversation.userId)}</h2>
                </div>
              </div>

              <div className="message-thread">
                {isThreadLoading ? (
                  <div className="admin-empty-state">Loading thread...</div>
                ) : conversationMessages.length ? (
                  conversationMessages.map((message) => (
                    <div
                      className={`message-bubble ${message.fromUserId === userId ? "outgoing" : "incoming"}`}
                      key={message.id}
                    >
                      <p>{message.message}</p>
                      <span>{formatSubmissionDate(message.timestamp)}</span>
                    </div>
                  ))
                ) : (
                  <div className="admin-empty-state">No messages in this conversation.</div>
                )}
              </div>

              <form className="message-compose" onSubmit={handleSendMessage}>
                <label htmlFor="message-draft">Message</label>
                <textarea
                  id="message-draft"
                  value={messageDraft}
                  onChange={(event) => setMessageDraft(event.target.value)}
                  placeholder="Type your reply..."
                />
                <button type="submit" disabled={isSendingMessage || !messageDraft.trim()}>
                  {isSendingMessage ? "Sending..." : "Send Message"}
                </button>
              </form>
            </>
          ) : (
            <div className="admin-empty-state">Select a conversation to read messages.</div>
          )}
        </section>
      </div>
      )}

      {activePanel === "stats" && (
        <div className="admin-secondary-panel">
          <div className="admin-section-heading">
            <div>
              <p className="admin-kicker">Site Activity</p>
              <h2>Stats</h2>
            </div>
            <button className="admin-refresh-button" type="button" onClick={loadDashboard} disabled={isLoading}>
              {isLoading ? "Refreshing..." : "Refresh Stats"}
            </button>
          </div>

          <section className="admin-stats-grid">
            <div className="admin-stat-card">
              <span>Contacts Today</span>
              <strong>{siteAnalytics.contactForms?.today || 0}</strong>
              <p>{siteAnalytics.contactForms?.thisWeek || 0} this week</p>
            </div>
            <div className="admin-stat-card">
              <span>Total Contacts</span>
              <strong>{siteAnalytics.contactForms?.total || 0}</strong>
              <p>{siteAnalytics.contactForms?.unread || stats.newContacts || 0} waiting for review</p>
            </div>
            <div className="admin-stat-card">
              <span>Community Signups</span>
              <strong>{siteAnalytics.joinForms?.total || 0}</strong>
              <p>{siteAnalytics.joinForms?.thisWeek || 0} this week</p>
            </div>
            <div className="admin-stat-card">
              <span>Messages</span>
              <strong>{conversations.length}</strong>
              <p>{unreadConversationCount} unread conversations</p>
            </div>
          </section>

          <div className="stats-breakdown-grid">
            <section className="breakdown-panel">
              <h3>Submissions by Type</h3>
              {typeBreakdown.map((item) => (
                <div className="breakdown-row" key={item.value}>
                  <span>{item.label}</span>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </section>

            <section className="breakdown-panel">
              <h3>Submissions by Status</h3>
              {statusBreakdown.map((item) => (
                <div className="breakdown-row" key={item.label}>
                  <span>{item.label}</span>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </section>
          </div>
        </div>
      )}

      {activePanel === "users" && (
        <div className="admin-secondary-panel">
          <div className="admin-section-heading">
            <div>
              <p className="admin-kicker">Staff Access</p>
              <h2>Admin Users</h2>
            </div>
            <span>{allUsers.length} users</span>
          </div>

          <div className="users-workspace">
            <section className="users-list-panel">
              {allUsers.map((adminUser) => (
                <article className="admin-user-row" key={adminUser.id}>
                  <div className="conversation-avatar">{getInitials(adminUser.username || adminUser.email)}</div>
                  <div>
                    <strong>{adminUser.username || adminUser.id}</strong>
                    <span>{adminUser.email || "No email saved"}</span>
                  </div>
                  <p>{adminUser.mustChangePassword ? "password reset" : (adminUser.role || "admin")}</p>
                </article>
              ))}
            </section>

            <section className="create-user-panel">
              <div>
                <p className="admin-kicker">Account Security</p>
                <h3>Change My Password</h3>
              </div>

              {user?.mustChangePassword && (
                <div className="admin-alert" role="alert">
                  Your password was reset. Change it before continuing normal admin work.
                </div>
              )}

              {passwordMessage && <div className="admin-alert" role="status">{passwordMessage}</div>}

              <form className="stacked-admin-form" onSubmit={handleChangePassword}>
                <label htmlFor="current-password">
                  Current Password
                  <input
                    id="current-password"
                    name="currentPassword"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={handlePasswordFormChange}
                    required
                  />
                </label>

                <label htmlFor="new-password">
                  New Password
                  <input
                    id="new-password"
                    name="newPassword"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordFormChange}
                    minLength="8"
                    required
                  />
                </label>

                <label htmlFor="confirm-password">
                  Confirm New Password
                  <input
                    id="confirm-password"
                    name="confirmPassword"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordFormChange}
                    minLength="8"
                    required
                  />
                </label>

                <button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? "Changing..." : "Change Password"}
                </button>
              </form>
            </section>

            {user?.role === 'admin' && <form className="create-user-panel" onSubmit={handleCreateUser}>
              <div>
                <p className="admin-kicker">New Access</p>
                <h3>Add Admin User</h3>
              </div>

              {userMessage && <div className="admin-alert" role="status">{userMessage}</div>}

              <label htmlFor="new-user-username">
                Username
                <input
                  id="new-user-username"
                  name="username"
                  value={newUser.username}
                  onChange={handleNewUserChange}
                  placeholder="Full name or short username"
                  required
                />
              </label>

              <label htmlFor="new-user-email">
                Email
                <input
                  id="new-user-email"
                  name="email"
                  type="email"
                  value={newUser.email}
                  onChange={handleNewUserChange}
                  placeholder="admin@lxrose.org"
                  required
                />
              </label>

              <label htmlFor="new-user-password">
                Temporary Password
                <input
                  id="new-user-password"
                  name="password"
                  type="password"
                  value={newUser.password}
                  onChange={handleNewUserChange}
                  placeholder="Create a strong temporary password"
                  required
                />
              </label>

              <label htmlFor="new-user-role">
                Role
                <select id="new-user-role" name="role" value={newUser.role} onChange={handleNewUserChange}>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="viewer">Viewer</option>
                </select>
              </label>

              <button type="submit" disabled={isCreatingUser}>
                {isCreatingUser ? "Creating..." : "Create User"}
              </button>
            </form>}

            {user?.role === 'admin' && <form className="create-user-panel" onSubmit={handleResetUserPassword}>
              <div>
                <p className="admin-kicker">Password Reset</p>
                <h3>Reset User Password</h3>
              </div>

              <p className="panel-helper-text">
                Set a temporary password. The user will be marked for password change after reset.
              </p>

              <label htmlFor="reset-user-id">
                User
                <select
                  id="reset-user-id"
                  name="userId"
                  value={resetForm.userId}
                  onChange={handleResetFormChange}
                  required
                >
                  <option value="">Choose user</option>
                  {allUsers.map((adminUser) => (
                    <option key={adminUser.id} value={adminUser.id}>
                      {adminUser.username || adminUser.email || adminUser.id}
                    </option>
                  ))}
                </select>
              </label>

              <label htmlFor="reset-password">
                Temporary Password
                <input
                  id="reset-password"
                  name="newPassword"
                  type="password"
                  value={resetForm.newPassword}
                  onChange={handleResetFormChange}
                  placeholder="Create a temporary password"
                  minLength="8"
                  required
                />
              </label>

              <button type="submit" disabled={isResettingPassword}>
                {isResettingPassword ? "Resetting..." : "Reset Password"}
              </button>
            </form>}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
