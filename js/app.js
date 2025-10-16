// BiTalks - Main Application JavaScript

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"

// Check if user is logged in on page load
document.addEventListener("DOMContentLoaded", () => {
  checkAuthStatus()
})

// Check authentication status and update navbar
async function checkAuthStatus() {
  const token = localStorage.getItem("auth_token")
  const navbarAuth = document.getElementById("navbarAuth")

  if (token) {
    try {
      const response = await fetch(`${API_BASE}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const user = await response.json()
        localStorage.setItem("user", JSON.stringify(user))
        updateNavbarForLoggedIn(user)
      } else {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user")
      }
    } catch (error) {
      console.error("Error checking auth:", error)
    }
  }
}

// Update navbar when user is logged in
function updateNavbarForLoggedIn(user) {
  const navbarAuth = document.getElementById("navbarAuth")
  if (navbarAuth) {
    navbarAuth.innerHTML = `
        <div class="user-menu">
            <img src="${user.avatar || "https://via.placeholder.com/40"}" alt="${user.username}" class="user-avatar">
            <span class="user-name">${user.username}</span>
            <button onclick="logout()" class="btn btn-outline btn-small">Logout</button>
        </div>
    `
  }
}

// Logout function
function logout() {
  localStorage.removeItem("auth_token")
  localStorage.removeItem("user")
  window.location.href = "index.html"
}

// Redirect to threads page if logged in
function redirectIfLoggedIn() {
  if (localStorage.getItem("auth_token")) {
    window.location.href = "threads.html"
  }
}

// Redirect to login if not logged in
function redirectIfNotLoggedIn() {
  if (!localStorage.getItem("auth_token")) {
    window.location.href = "login.html"
  }
}

// Utility function to escape HTML
function escapeHtml(text) {
  const div = document.createElement("div")
  div.textContent = text
  return div.innerHTML
}

// Utility function to get time ago
function getTimeAgo(date) {
  const now = new Date()
  const postDate = new Date(date)
  const seconds = Math.floor((now - postDate) / 1000)

  if (seconds < 60) return "baru saja"
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d`
  return postDate.toLocaleDateString("id-ID")
}

// Show notification
function showNotification(message, type = "success") {
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.textContent = message
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background-color: ${type === "success" ? "#10b981" : "#ef4444"};
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    z-index: 2000;
    animation: slideIn 0.3s ease;
  `
  document.body.appendChild(notification)

  setTimeout(() => {
    notification.style.animation = "slideOut 0.3s ease"
    setTimeout(() => notification.remove(), 300)
  }, 3000)
}

// Add animation styles
const style = document.createElement("style")
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(400px);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(400px);
      opacity: 0;
    }
  }
`
document.head.appendChild(style)
