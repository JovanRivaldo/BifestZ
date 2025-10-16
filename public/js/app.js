// API Configuration
const API_BASE = "http://localhost:8000/api"
let currentUser = null
let currentPage = "landing"

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  checkAuth()
  renderApp()
})

// Check Authentication
async function checkAuth() {
  const token = localStorage.getItem("auth_token")
  if (token) {
    try {
      const response = await fetch(`${API_BASE}/user`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (response.ok) {
        currentUser = await response.json()
      } else {
        localStorage.removeItem("auth_token")
      }
    } catch (error) {
      console.error("Auth check failed:", error)
    }
  }
}

// Render Main App
function renderApp() {
  const app = document.getElementById("app")

  if (currentPage === "landing" && !currentUser) {
    app.innerHTML = renderLandingPage()
  } else if (currentUser) {
    app.innerHTML = renderMainPage()
  }

  attachEventListeners()
}

// Landing Page
function renderLandingPage() {
  return `
        <nav class="navbar">
            <div class="navbar-container">
                <a href="#" class="navbar-brand">
                    <span>💬</span> BiTalks
                </a>
                <div class="navbar-menu">
                    <a href="#" class="nav-link" onclick="showAbout()">About Us</a>
                    <div class="nav-buttons">
                        <button class="btn btn-secondary" onclick="showLoginModal()">Login</button>
                        <button class="btn btn-primary" onclick="showRegisterModal()">Register</button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="container">
            <div class="landing-hero">
                <h1>Welcome to BiTalks</h1>
                <p>Tempat terbaik untuk berbagi ide, diskusi, dan terhubung dengan komunitas</p>
                <div class="hero-buttons">
                    <button class="btn btn-primary" onclick="showLoginModal()">Mulai Diskusi</button>
                    <button class="btn btn-secondary" onclick="showRegisterModal()">Daftar Sekarang</button>
                </div>
            </div>

            <div class="about-section">
                <h2>Tentang BiTalks</h2>
                <p>BiTalks adalah platform forum diskusi online yang dirancang untuk memfasilitasi percakapan bermakna antar pengguna. Dengan fitur-fitur seperti threads, comments, dan likes, BiTalks memungkinkan Anda untuk berbagi pemikiran, bertanya, dan belajar dari komunitas global.</p>
            </div>

            <div class="threads-container" id="threadsContainer">
                <p style="text-align: center; color: var(--text-secondary);">Login untuk melihat threads terbaru</p>
            </div>
        </div>

        ${renderModals()}
    `
}

// Main Page (After Login)
function renderMainPage() {
  return `
        <nav class="navbar">
            <div class="navbar-container">
                <a href="#" class="navbar-brand" onclick="currentPage='main'; renderApp()">
                    <span>💬</span> BiTalks
                </a>
                <div class="navbar-menu">
                    <a href="#" class="nav-link" onclick="currentPage='main'; renderApp()">Home</a>
                    <a href="#" class="nav-link" onclick="showAbout()">About Us</a>
                    <div class="nav-buttons">
                        <div class="author-avatar" style="cursor: pointer;" onclick="showProfileModal()">${currentUser.username.charAt(0).toUpperCase()}</div>
                        <button class="btn btn-secondary btn-small" onclick="logout()">Logout</button>
                    </div>
                </div>
            </div>
        </nav>

        <div class="container">
            <div style="background-color: var(--surface); padding: 1.5rem; border-radius: 0.75rem; margin-bottom: 2rem; border: 1px solid var(--border);">
                <h3 style="margin-bottom: 1rem;">Buat Thread Baru</h3>
                <form onsubmit="createThread(event)">
                    <div class="form-group">
                        <input type="text" id="threadTitle" placeholder="Judul thread..." required>
                    </div>
                    <div class="form-group">
                        <textarea id="threadContent" placeholder="Apa yang ingin Anda diskusikan?" required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Post Thread</button>
                </form>
            </div>

            <div class="threads-container" id="threadsContainer">
                <p style="text-align: center; color: var(--text-secondary);">Loading threads...</p>
            </div>
        </div>

        ${renderModals()}
    `
}

// Load and Display Threads
async function loadThreads() {
  try {
    const response = await fetch(`${API_BASE}/threads`)
    const threads = await response.json()

    const container = document.getElementById("threadsContainer")

    if (threads.length === 0) {
      container.innerHTML =
        '<p style="text-align: center; color: var(--text-secondary);">Belum ada threads. Jadilah yang pertama!</p>'
      return
    }

    container.innerHTML = threads
      .map(
        (thread) => `
            <div class="thread-card">
                <div class="thread-header">
                    <div class="thread-author">
                        <div class="author-avatar">${thread.user.username.charAt(0).toUpperCase()}</div>
                        <div class="author-info">
                            <h3>${thread.user.username}</h3>
                            <p>${formatDate(thread.created_at)}</p>
                        </div>
                    </div>
                    ${
                      currentUser && currentUser.id === thread.user_id
                        ? `
                        <button class="btn btn-small" style="background-color: var(--error); color: white;" onclick="deleteThread(${thread.id})">Hapus</button>
                    `
                        : ""
                    }
                </div>
                <h2 class="thread-title">${thread.title}</h2>
                <p class="thread-content">${thread.content}</p>
                <div class="thread-actions">
                    <button class="action-btn ${currentUser && thread.likes.some((l) => l.user_id === currentUser.id) ? "liked" : ""}" onclick="toggleThreadLike(${thread.id})">
                        ❤️ ${thread.likes_count}
                    </button>
                    <button class="action-btn" onclick="showCommentsModal(${thread.id})">
                        💬 ${thread.comments_count}
                    </button>
                </div>
            </div>
        `,
      )
      .join("")
  } catch (error) {
    console.error("Error loading threads:", error)
  }
}

// Create Thread
async function createThread(event) {
  event.preventDefault()

  if (!currentUser) {
    alert("Silakan login terlebih dahulu")
    return
  }

  const title = document.getElementById("threadTitle").value
  const content = document.getElementById("threadContent").value
  const token = localStorage.getItem("auth_token")

  try {
    const response = await fetch(`${API_BASE}/threads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content }),
    })

    if (response.ok) {
      document.getElementById("threadTitle").value = ""
      document.getElementById("threadContent").value = ""
      loadThreads()
      alert("Thread berhasil dibuat!")
    } else {
      alert("Gagal membuat thread")
    }
  } catch (error) {
    console.error("Error creating thread:", error)
  }
}

// Delete Thread
async function deleteThread(threadId) {
  if (!confirm("Yakin ingin menghapus thread ini?")) return

  const token = localStorage.getItem("auth_token")

  try {
    const response = await fetch(`${API_BASE}/threads/${threadId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })

    if (response.ok) {
      loadThreads()
      alert("Thread berhasil dihapus")
    }
  } catch (error) {
    console.error("Error deleting thread:", error)
  }
}

// Toggle Like Thread
async function toggleThreadLike(threadId) {
  if (!currentUser) {
    alert("Silakan login terlebih dahulu")
    return
  }

  const token = localStorage.getItem("auth_token")

  try {
    const response = await fetch(`${API_BASE}/threads/${threadId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })

    if (response.ok) {
      loadThreads()
    }
  } catch (error) {
    console.error("Error toggling like:", error)
  }
}

// Show Comments Modal
async function showCommentsModal(threadId) {
  try {
    const response = await fetch(`${API_BASE}/threads/${threadId}`)
    const thread = await response.json()

    const modal = document.getElementById("commentsModal")
    const commentsContainer = document.getElementById("commentsContainer")

    commentsContainer.innerHTML = `
            <h3>${thread.title}</h3>
            <p style="color: var(--text-secondary); margin-bottom: 1.5rem;">${thread.content}</p>
            
            ${
              currentUser
                ? `
                <form onsubmit="addComment(event, ${threadId})">
                    <div class="form-group">
                        <textarea id="commentContent" placeholder="Tulis komentar..." required></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Kirim Komentar</button>
                </form>
            `
                : '<p style="color: var(--text-secondary);">Login untuk menambahkan komentar</p>'
            }

            <div class="comments-section">
                ${thread.comments.length === 0 ? '<p style="color: var(--text-secondary);">Belum ada komentar</p>' : ""}
                ${thread.comments
                  .map(
                    (comment) => `
                    <div class="comment-item">
                        <div class="comment-author">
                            <strong>${comment.user.username}</strong>
                            <small>${formatDate(comment.created_at)}</small>
                            ${
                              currentUser && currentUser.id === comment.user_id
                                ? `
                                <button class="btn btn-small" style="background-color: var(--error); color: white; margin-left: auto;" onclick="deleteComment(${comment.id})">Hapus</button>
                            `
                                : ""
                            }
                        </div>
                        <p class="comment-content">${comment.content}</p>
                        <button class="action-btn ${currentUser && comment.likes.some((l) => l.user_id === currentUser.id) ? "liked" : ""}" onclick="toggleCommentLike(${comment.id})">
                            ❤️ ${comment.likes_count}
                        </button>
                    </div>
                `,
                  )
                  .join("")}
            </div>
        `

    modal.classList.add("active")
  } catch (error) {
    console.error("Error loading comments:", error)
  }
}

// Add Comment
async function addComment(event, threadId) {
  event.preventDefault()

  const content = document.getElementById("commentContent").value
  const token = localStorage.getItem("auth_token")

  try {
    const response = await fetch(`${API_BASE}/threads/${threadId}/comments`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ content }),
    })

    if (response.ok) {
      document.getElementById("commentContent").value = ""
      showCommentsModal(threadId)
    }
  } catch (error) {
    console.error("Error adding comment:", error)
  }
}

// Delete Comment
async function deleteComment(commentId) {
  if (!confirm("Yakin ingin menghapus komentar ini?")) return

  const token = localStorage.getItem("auth_token")

  try {
    const response = await fetch(`${API_BASE}/comments/${commentId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    })

    if (response.ok) {
      // Reload comments
      const modal = document.getElementById("commentsModal")
      if (modal.classList.contains("active")) {
        modal.classList.remove("active")
      }
    }
  } catch (error) {
    console.error("Error deleting comment:", error)
  }
}

// Toggle Like Comment
async function toggleCommentLike(commentId) {
  if (!currentUser) {
    alert("Silakan login terlebih dahulu")
    return
  }

  const token = localStorage.getItem("auth_token")

  try {
    const response = await fetch(`${API_BASE}/comments/${commentId}/like`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })

    if (response.ok) {
      // Reload the current modal
      const modal = document.getElementById("commentsModal")
      if (modal.classList.contains("active")) {
        // Find the thread ID from the modal content
        const threadId = modal.dataset.threadId
        if (threadId) showCommentsModal(threadId)
      }
    }
  } catch (error) {
    console.error("Error toggling comment like:", error)
  }
}

// Render Modals
function renderModals() {
  return `
        <!-- Login Modal -->
        <div id="loginModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Login</h2>
                    <button class="close-btn" onclick="closeModal('loginModal')">×</button>
                </div>
                <form onsubmit="login(event)">
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="loginEmail" required>
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="loginPassword" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Login</button>
                </form>
                <p style="text-align: center; margin-top: 1rem; color: var(--text-secondary);">
                    Belum punya akun? <a href="#" onclick="switchModal('loginModal', 'registerModal')" style="color: var(--primary); text-decoration: none;">Daftar di sini</a>
                </p>
            </div>
        </div>

        <!-- Register Modal -->
        <div id="registerModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Register</h2>
                    <button class="close-btn" onclick="closeModal('registerModal')">×</button>
                </div>
                <form onsubmit="register(event)">
                    <div class="form-group">
                        <label>Username</label>
                        <input type="text" id="registerUsername" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" id="registerEmail" required>
                    </div>
                    <div class="form-group">
                        <label>Password</label>
                        <input type="password" id="registerPassword" required>
                    </div>
                    <div class="form-group">
                        <label>Konfirmasi Password</label>
                        <input type="password" id="registerPasswordConfirm" required>
                    </div>
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Register</button>
                </form>
                <p style="text-align: center; margin-top: 1rem; color: var(--text-secondary);">
                    Sudah punya akun? <a href="#" onclick="switchModal('registerModal', 'loginModal')" style="color: var(--primary); text-decoration: none;">Login di sini</a>
                </p>
            </div>
        </div>

        <!-- Profile Modal -->
        <div id="profileModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Profile</h2>
                    <button class="close-btn" onclick="closeModal('profileModal')">×</button>
                </div>
                <div class="profile-container">
                    <div class="profile-header">
                        <div class="profile-avatar">${currentUser ? currentUser.username.charAt(0).toUpperCase() : ""}</div>
                        <div class="profile-info">
                            <h2>${currentUser ? currentUser.username : ""}</h2>
                            <p>${currentUser ? currentUser.email : ""}</p>
                        </div>
                    </div>
                    <form onsubmit="updateProfile(event)">
                        <div class="form-group">
                            <label>Bio</label>
                            <textarea id="profileBio" placeholder="Tulis bio Anda...">${currentUser && currentUser.bio ? currentUser.bio : ""}</textarea>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%;">Update Profile</button>
                    </form>
                </div>
            </div>
        </div>

        <!-- Comments Modal -->
        <div id="commentsModal" class="modal">
            <div class="modal-content" style="max-width: 600px; max-height: 80vh; overflow-y: auto;">
                <div class="modal-header">
                    <h2>Comments</h2>
                    <button class="close-btn" onclick="closeModal('commentsModal')">×</button>
                </div>
                <div id="commentsContainer"></div>
            </div>
        </div>

        <!-- About Modal -->
        <div id="aboutModal" class="modal">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Tentang BiTalks</h2>
                    <button class="close-btn" onclick="closeModal('aboutModal')">×</button>
                </div>
                <div class="about-section">
                    <p>BiTalks adalah platform forum diskusi online yang dirancang untuk memfasilitasi percakapan bermakna antar pengguna.</p>
                    <h3 style="margin-top: 1.5rem; margin-bottom: 0.5rem;">Fitur Utama:</h3>
                    <ul style="margin-left: 1.5rem; color: var(--text-secondary);">
                        <li>Buat dan bagikan threads</li>
                        <li>Komentar pada threads</li>
                        <li>Like threads dan comments</li>
                        <li>Kelola profile pribadi</li>
                        <li>Komunitas yang ramah dan interaktif</li>
                    </ul>
                </div>
            </div>
        </div>
    `
}

// Auth Functions
async function login(event) {
  event.preventDefault()

  const email = document.getElementById("loginEmail").value
  const password = document.getElementById("loginPassword").value

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (data.success) {
      localStorage.setItem("auth_token", data.token || "token")
      currentUser = data.user
      closeModal("loginModal")
      currentPage = "main"
      renderApp()
      loadThreads()
    } else {
      alert(data.message || "Login gagal")
    }
  } catch (error) {
    console.error("Login error:", error)
    alert("Terjadi kesalahan saat login")
  }
}

async function register(event) {
  event.preventDefault()

  const username = document.getElementById("registerUsername").value
  const email = document.getElementById("registerEmail").value
  const password = document.getElementById("registerPassword").value
  const passwordConfirm = document.getElementById("registerPasswordConfirm").value

  if (password !== passwordConfirm) {
    alert("Password tidak cocok")
    return
  }

  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, password_confirmation: passwordConfirm }),
    })

    const data = await response.json()

    if (data.success) {
      localStorage.setItem("auth_token", data.token || "token")
      currentUser = data.user
      closeModal("registerModal")
      currentPage = "main"
      renderApp()
      loadThreads()
      alert("Registrasi berhasil!")
    } else {
      alert(data.message || "Registrasi gagal")
    }
  } catch (error) {
    console.error("Register error:", error)
    alert("Terjadi kesalahan saat registrasi")
  }
}

async function logout() {
  const token = localStorage.getItem("auth_token")

  try {
    await fetch(`${API_BASE}/logout`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    })
  } catch (error) {
    console.error("Logout error:", error)
  }

  localStorage.removeItem("auth_token")
  currentUser = null
  currentPage = "landing"
  renderApp()
}

async function updateProfile(event) {
  event.preventDefault()

  const bio = document.getElementById("profileBio").value
  const token = localStorage.getItem("auth_token")

  try {
    const response = await fetch(`${API_BASE}/profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ bio }),
    })

    if (response.ok) {
      const data = await response.json()
      currentUser = data.user
      closeModal("profileModal")
      alert("Profile berhasil diupdate")
    }
  } catch (error) {
    console.error("Update profile error:", error)
  }
}

// Modal Functions
function showLoginModal() {
  document.getElementById("loginModal").classList.add("active")
}

function showRegisterModal() {
  document.getElementById("registerModal").classList.add("active")
}

function showProfileModal() {
  document.getElementById("profileModal").classList.add("active")
}

function showAbout() {
  document.getElementById("aboutModal").classList.add("active")
}

function closeModal(modalId) {
  document.getElementById(modalId).classList.remove("active")
}

function switchModal(closeId, openId) {
  closeModal(closeId)
  document.getElementById(openId).classList.add("active")
}

// Utility Functions
function formatDate(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Baru saja"
  if (diffMins < 60) return `${diffMins}m yang lalu`
  if (diffHours < 24) return `${diffHours}h yang lalu`
  if (diffDays < 7) return `${diffDays}d yang lalu`

  return date.toLocaleDateString("id-ID")
}

// Attach Event Listeners
function attachEventListeners() {
  // Close modal when clicking outside
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active")
      }
    })
  })

  // Load threads on main page
  if (currentPage === "main" || (currentPage === "landing" && currentUser)) {
    loadThreads()
  }
}
