const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

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

export const getUnifiedSubmissions = () => apiRequest("/api/submissions");

export const updateSubmission = (type, id, updates) => apiRequest(`/api/submissions/${type}/${id}`, {
  method: "PATCH",
  body: JSON.stringify(updates)
});

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
