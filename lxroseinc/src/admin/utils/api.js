const getDefaultApiBaseUrl = () => {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:5001";
  }

  return "";
};

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const API_BASE_URL = configuredApiBaseUrl !== undefined ? configuredApiBaseUrl : getDefaultApiBaseUrl();

export const getAuthToken = () => (
  localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
);

const getAuthHeaders = () => {
  const token = getAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const apiRequest = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers
    }
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    return response.text();
  }

  return response.json();
};

export const getCurrentUser = (userId) => apiRequest(`/getUser/${userId}`);

export const getAllUsers = () => apiRequest("/api/users/all");

export const createAdminUser = (user) => apiRequest("/register", {
  method: "POST",
  body: JSON.stringify(user)
});

export const changeOwnPassword = async (passwords) => {
  const result = await apiRequest("/api/users/me/password", {
  method: "POST",
  body: JSON.stringify(passwords)
  });
  for (const storage of [localStorage, sessionStorage]) {
    storage.removeItem('authToken');
    storage.removeItem('userId');
  }
  window.location.assign('/');
  return result;
};

export const resetUserPassword = (userId, newPassword) => apiRequest(`/api/users/${userId}/password`, {
  method: "PATCH",
  body: JSON.stringify({ newPassword })
});

export const getUnifiedSubmissions = (cursor) => apiRequest(`/api/submissions${cursor ? `?cursor=${encodeURIComponent(cursor)}` : ""}`);

export const getDashboardAnalytics = () => apiRequest("/api/analytics/dashboard");

export const updateSubmission = (type, id, updates) => apiRequest(`/api/submissions/${type}/${id}`, {
  method: "PATCH",
  body: JSON.stringify(updates)
});

export const getConversations = (userId) => apiRequest(`/api/messages/conversations/${userId}`);

export const getConversationMessages = (userId, partnerId) => (
  apiRequest(`/api/messages/conversation/${userId}/${partnerId}`)
);

export const sendConversationMessage = (fromUserId, toUserId, message) => apiRequest("/api/messages/send", {
  method: "POST",
  body: JSON.stringify({ fromUserId, toUserId, message })
});

export const markConversationRead = (userId, partnerId) => apiRequest(
  `/api/messages/conversation/${userId}/${partnerId}/mark-read`,
  { method: "PUT" }
);

export const formatAdminTimestamp = (timestamp) => {
  if (!timestamp) {
    return null;
  }

  if (typeof timestamp.toDate === "function") {
    return timestamp.toDate();
  }

  if (typeof timestamp === "string" || typeof timestamp === "number") {
    const date = new Date(timestamp);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  if (typeof timestamp._seconds === "number") {
    return new Date(timestamp._seconds * 1000);
  }

  if (typeof timestamp.seconds === "number") {
    return new Date(timestamp.seconds * 1000);
  }

  return null;
};
