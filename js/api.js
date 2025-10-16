const API_BASE = "https://your-api-base-url.com"

// Get authorization headers
function getAuthHeaders() {
  const token = localStorage.getItem("auth_token")
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  }
}

// Generic fetch wrapper with error handling
async function apiCall(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`
  const defaultOptions = {
    headers: getAuthHeaders(),
  }

  const finalOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, finalOptions)

    if (response.status === 401) {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("user")
      window.location.href = "login.html"
      return null
    }

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "API Error")
    }

    return await response.json()
  } catch (error) {
    console.error("API Error:", error)
    throw error
  }
}

// Thread API calls
const ThreadAPI = {
  getAll: () => apiCall("/threads"),
  getById: (id) => apiCall(`/threads/${id}`),
  create: (data) => apiCall("/threads", { method: "POST", body: JSON.stringify(data) }),
  update: (id, data) => apiCall(`/threads/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/threads/${id}`, { method: "DELETE" }),
  like: (id) => apiCall(`/threads/${id}/like`, { method: "POST" }),
  getComments: (id) => apiCall(`/threads/${id}/comments`),
}

// Comment API calls
const CommentAPI = {
  create: (threadId, data) => apiCall(`/threads/${threadId}/comments`, { method: "POST", body: JSON.stringify(data) }),
  delete: (id) => apiCall(`/comments/${id}`, { method: "DELETE" }),
  like: (id) => apiCall(`/comments/${id}/like`, { method: "POST" }),
}

// User API calls
const UserAPI = {
  getProfile: () => apiCall("/user"),
  getById: (id) => apiCall(`/users/${id}`),
  updateProfile: (data) => {
    const formData = new FormData()
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key])
    })
    return apiCall("/user/profile", {
      method: "POST",
      headers: { Authorization: `Bearer ${localStorage.getItem("auth_token")}` },
      body: formData,
    })
  },
  getThreads: (id) => apiCall(`/users/${id}/threads`),
  getComments: (id) => apiCall(`/users/${id}/comments`),
}
