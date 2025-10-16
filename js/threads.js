// Threads Management Functions

const API_BASE = "https://your-api-base-url.com" // Declare API_BASE variable

function redirectIfNotLoggedIn() {
  // Implementation for redirectIfNotLoggedIn function
  const token = localStorage.getItem("auth_token")
  if (!token) {
    window.location.href = "login.html"
  }
}

// Load threads on page load
document.addEventListener("DOMContentLoaded", () => {
  loadThreads()
  updateUserInfo()
  setupCharacterCounters()
  setupCreateThreadForm()
})

// Load all threads
async function loadThreads() {
  const threadsFeed = document.getElementById("threadsFeed")
  const loadingIndicator = document.getElementById("loadingIndicator")
  const emptyState = document.getElementById("emptyState")
  const token = localStorage.getItem("auth_token")

  loadingIndicator.style.display = "flex"

  try {
    const response = await fetch(`${API_BASE}/threads`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const threads = await response.json()
      loadingIndicator.style.display = "none"

      if (threads.length === 0) {
        emptyState.style.display = "block"
        return
      }

      threadsFeed.innerHTML = ""
      threads.forEach((thread) => {
        const threadCard = createThreadCard(thread)
        threadsFeed.appendChild(threadCard)
      })
    } else {
      loadingIndicator.style.display = "none"
      emptyState.style.display = "block"
    }
  } catch (error) {
    console.error("Error loading threads:", error)
    loadingIndicator.style.display = "none"
    emptyState.style.display = "block"
  }
}

// Create thread card element
function createThreadCard(thread) {
  const card = document.createElement("div")
  card.className = "thread-card"
  card.onclick = () => (window.location.href = `thread-detail.html?id=${thread.id}`)

  const timeAgo = getTimeAgo(thread.created_at)

  card.innerHTML = `
        <div class="thread-header">
            <img src="${thread.user.avatar || "https://via.placeholder.com/40"}" alt="${thread.user.username}" class="thread-avatar">
            <div class="thread-meta">
                <div>
                    <a href="profile.html?id=${thread.user.id}" class="thread-author">${thread.user.username}</a>
                    <span class="thread-username">@${thread.user.username}</span>
                    <span class="thread-time">${timeAgo}</span>
                </div>
            </div>
        </div>
        <h3 class="thread-title">${escapeHtml(thread.title)}</h3>
        <p class="thread-content">${escapeHtml(thread.content.substring(0, 200))}${thread.content.length > 200 ? "..." : ""}</p>
        <div class="thread-actions">
            <span class="thread-action">
                <span>💬</span>
                <span>${thread.comments_count || 0}</span>
            </span>
            <span class="thread-action ${thread.is_liked ? "liked" : ""}" onclick="toggleLike(event, ${thread.id})">
                <span>${thread.is_liked ? "❤️" : "🤍"}</span>
                <span>${thread.likes_count || 0}</span>
            </span>
        </div>
    `

  return card
}

// Update user info in navbar
async function updateUserInfo() {
  const user = JSON.parse(localStorage.getItem("user"))
  const navbarAuth = document.getElementById("navbarAuth")
  const userAvatar = document.getElementById("userAvatar")

  if (user) {
    navbarAuth.innerHTML = `
            <div class="user-menu">
                <img src="${user.avatar || "https://via.placeholder.com/40"}" alt="${user.username}" class="user-avatar">
                <span class="user-name">${user.username}</span>
                <button onclick="logout()" class="btn btn-outline btn-small">Logout</button>
            </div>
        `
    if (userAvatar) {
      userAvatar.src = user.avatar || "https://via.placeholder.com/48"
    }
  }
}

// Open create thread modal
function openCreateThreadModal() {
  document.getElementById("createThreadModal").style.display = "flex"
}

// Close create thread modal
function closeCreateThreadModal() {
  document.getElementById("createThreadModal").style.display = "none"
}

// Setup character counters
function setupCharacterCounters() {
  const titleInput = document.getElementById("threadTitle")
  const contentInput = document.getElementById("threadContent")

  if (titleInput) {
    titleInput.addEventListener("input", () => {
      document.getElementById("titleCount").textContent = `${titleInput.value.length}/200`
    })
  }

  if (contentInput) {
    contentInput.addEventListener("input", () => {
      document.getElementById("contentCount").textContent = `${contentInput.value.length}/5000`
    })
  }
}

// Setup create thread form
function setupCreateThreadForm() {
  const form = document.getElementById("createThreadForm")
  if (form) {
    form.addEventListener("submit", handleCreateThread)
  }
}

// Handle create thread
async function handleCreateThread(e) {
  e.preventDefault()

  const title = document.getElementById("threadTitle").value
  const content = document.getElementById("threadContent").value
  const token = localStorage.getItem("auth_token")

  try {
    const response = await fetch(`${API_BASE}/threads`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ title, content }),
    })

    if (response.ok) {
      closeCreateThreadModal()
      document.getElementById("createThreadForm").reset()
      loadThreads()
    }
  } catch (error) {
    console.error("Error creating thread:", error)
  }
}

// Toggle like on thread
async function toggleLike(event, threadId) {
  event.stopPropagation()

  const token = localStorage.getItem("auth_token")

  try {
    const response = await fetch(`${API_BASE}/threads/${threadId}/like`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      loadThreads()
    }
  } catch (error) {
    console.error("Error toggling like:", error)
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
