import React, { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  formatAdminTimestamp,
  getAllUsers,
  getCurrentUser,
  getUnifiedSubmissions,
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
  const [stats, setStats] = useState(defaultStats);
  const [typeOptions, setTypeOptions] = useState([]);
  const [statusOptions, setStatusOptions] = useState(Object.keys(statusLabels));
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [draftStatus, setDraftStatus] = useState("new");
  const [draftAssignedTo, setDraftAssignedTo] = useState("");
  const [draftNotes, setDraftNotes] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    setIsLoading(true);
    setError("");

    try {
      const [currentUser, users, inbox] = await Promise.all([
        userId ? getCurrentUser(userId) : Promise.resolve(null),
        getAllUsers(),
        getUnifiedSubmissions()
      ]);

      setUser(currentUser);
      setAllUsers(users);
      setSubmissions(inbox.submissions || []);
      setStats(inbox.stats || defaultStats);
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

  useEffect(() => {
    loadDashboard();
  }, [userId]);

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
    { label: "Total Submissions", value: stats.total || submissions.length }
  ];

  const selectedUserLabel = user?.email || user?.username || "admin@lxrose.org";

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
              <p>{filteredSubmissions.length} visible of {submissions.length} total</p>
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

              <div className="detail-controls">
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

                <button className="save-detail-button" type="button" onClick={handleSaveSubmission} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </>
          ) : (
            <div className="admin-empty-state">Select a submission to see the details.</div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default Home;
