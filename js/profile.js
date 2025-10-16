// Profile Functions

function redirectIfNotLoggedIn() {
  // Implementation for redirectIfNotLoggedIn
}

const API_BASE = "https://your-api-base-url.com" // Declare API_BASE variable

// Load profile on page load
document.addEventListener("DOMContentLoaded", () => {
  redirectIfNotLoggedIn()
  const userId = getUserIdFromURL()
  const currentUser = JSON.parse(localStorage.getItem("user"))

  loadProfile(userId)
  loadUserThreads(userId)
  updateUserInfo()
  setupEditProfileForm()

  // Show edit button only for own profile
  if (currentUser && currentUser.id == userId) {
    document.getElementById("profileActions").innerHTML = `
            <button class="btn btn-primary" onclick="openEditProfileModal()">Edit Profil</button>
        `
  }
})

// Get user ID from URL
function getUserIdFromURL() {
  const params = new URLSearchParams(window.location.search)
  const userId = params.get("id")
  if (!userId) {
    const currentUser = JSON.parse(localStorage.getItem("user"))
    return currentUser.id
  }
  return userId
}

// Load user profile
async function loadProfile(userId) {
  const token = localStorage.getItem("auth_token")

  try {
    const response = await fetch(`${API_BASE}/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const user = await response.json()
      displayProfile(user)
    }
  } catch (error) {
    console.error("Error loading profile:", error)
  }
}

// Display profile information
function displayProfile(user) {
  document.getElementById("profileAvatar").src = user.avatar || "https://via.placeholder.com/120"
  document.getElementById("profileUsername").textContent = user.username
  document.getElementById("profileBio").textContent = user.bio || "Belum ada bio"
  document.getElementById("profileJoinDate").textContent =
    `Bergabung pada ${new Date(user.created_at).toLocaleDateString("id-ID")}`
}

// Load user threads
async function loadUserThreads(userId) {
  const userThreads = document.getElementById("userThreads")
  const emptyThreads = document.getElementById("emptyThreads")
  const token = localStorage.getItem("auth_token")

  try {
    const response = await fetch(`${API_BASE}/users/${userId}/threads`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const threads = await response.json()

      if (threads.length === 0) {
        emptyThreads.style.display = "block"
        return
      }

      userThreads.innerHTML = ""
      threads.forEach((thread) => {
        const threadCard = createThreadCard(thread)
        userThreads.appendChild(threadCard)
      })
    }
  } catch (error) {
    console.error("Error loading user threads:", error)
    emptyThreads.style.display = "block"
  }
}

// Load user comments
async function loadUserComments(userId) {
  const userComments = document.getElementById("userComments")
  const emptyComments = document.getElementById("emptyComments")
  const token = localStorage.getItem("auth_token")

  try {
    const response = await fetch(`${API_BASE}/users/${userId}/comments`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const comments = await response.json()

      if (comments.length === 0) {
        emptyComments.style.display = "block"
        return
      }

      userComments.innerHTML = ""
      comments.forEach((comment) => {
        const commentElement = createCommentElement(comment)
        userComments.appendChild(commentElement)
      })
    }
  } catch (error) {
    console.error("Error loading user comments:", error)
    emptyComments.style.display = "block"
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
            <span class="thread-action ${thread.is_liked ? "liked" : ""}">
                <span>${thread.is_liked ? "❤️" : "🤍"}</span>
                <span>${thread.likes_count || 0}</span>
            </span>
        </div>
    `

  return card
}

// Create comment element
function createCommentElement(comment) {
  const div = document.createElement("div")
  div.className = "comment-card"
  const timeAgo = getTimeAgo(comment.created_at)

  div.innerHTML = `
        <div class="comment-header">
            <img src="${comment.user.avatar || "https://via.placeholder.com/40"}" alt="${comment.user.username}" class="comment-avatar">
            <div class="comment-meta">
                <a href="profile.html?id=${comment.user.id}" class="comment-author">${comment.user.username}</a>
                <span class="comment-username">@${comment.user.username}</span>
                <span class="comment-time">${timeAgo}</span>
            </div>
        </div>
        <p class="comment-text">${escapeHtml(comment.content)}</p>
        <div class="comment-actions">
            <span class="comment-action">
                <span>${comment.is_liked ? "❤️" : "🤍"}</span>
                <span>${comment.likes_count || 0}</span>
            </span>
        </div>
    `

  return div
}

// Switch between tabs
function switchTab(tabName) {
  const userId = getUserIdFromURL()

  // Hide all tabs
  document.getElementById("threadsTab").classList.remove("active")
  document.getElementById("commentsTab").classList.remove("active")

  // Remove active class from all buttons
  document.querySelectorAll(".tab-button").forEach((btn) => btn.classList.remove("active"))

  // Show selected tab
  if (tabName === "threads") {
    document.getElementById("threadsTab").classList.add("active")
    document.querySelectorAll(".tab-button")[0].classList.add("active")
  } else if (tabName === "comments") {
    document.getElementById("commentsTab").classList.add("active")
    document.querySelectorAll(".tab-button")[1].classList.add("active")
    loadUserComments(userId)
  }
}

// Open edit profile modal
function openEditProfileModal() {
  const user = JSON.parse(localStorage.getItem("user"))
  document.getElementById("editUsername").value = user.username
  document.getElementById("editBio").value = user.bio || ""
  document.getElementById("editProfileModal").style.display = "flex"
}

// Close edit profile modal
function closeEditProfileModal() {
  document.getElementById("editProfileModal").style.display = "none"
}

// Setup edit profile form
function setupEditProfileForm() {
  const form = document.getElementById("editProfileForm")
  const bioInput = document.getElementById("editBio")
  const avatarInput = document.getElementById("editAvatar")

  if (form) {
    form.addEventListener("submit", handleEditProfile)
  }

  if (bioInput) {
    bioInput.addEventListener("input", () => {
      document.getElementById("bioCount").textContent = `${bioInput.value.length}/500`
    })
  }

  if (avatarInput) {
    avatarInput.addEventListener("change", (e) => {
      const file = e.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (event) => {
          const preview = document.getElementById("avatarPreview")
          preview.src = event.target.result
          preview.style.display = "block"
        }
        reader.readAsDataURL(file)
      }
    })
  }
}

// Handle edit profile
async function handleEditProfile(e) {
  e.preventDefault()

  const username = document.getElementById("editUsername").value
  const bio = document.getElementById("editBio").value
  const avatarInput = document.getElementById("editAvatar")
  const token = localStorage.getItem("auth_token")

  const formData = new FormData()
  formData.append("username", username)
  formData.append("bio", bio)

  if (avatarInput.files.length > 0) {
    formData.append("avatar", avatarInput.files[0])
  }

  try {
    const response = await fetch(`${API_BASE}/user/profile`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (response.ok) {
      const updatedUser = await response.json()
      localStorage.setItem("user", JSON.stringify(updatedUser))
      closeEditProfileModal()
      location.reload()
    }
  } catch (error) {
    console.error("Error updating profile:", error)
  }
}

// Update user info in navbar
async function updateUserInfo() {
  const user = JSON.parse(localStorage.getItem("user"))
  const navbarAuth = document.getElementById("navbarAuth")

  if (user) {
    navbarAuth.innerHTML = `
            <div class="user-menu">
                <img src="${user.avatar || "https://via.placeholder.com/40"}" alt="${user.username}" class="user-avatar">
                <span class="user-name">${user.username}</span>
                <button onclick="logout()" class="btn btn-outline btn-small">Logout</button>
            </div>
        `
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
