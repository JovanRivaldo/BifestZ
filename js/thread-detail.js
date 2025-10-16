// Thread Detail & Comments Functions

function redirectIfNotLoggedIn() {
  // Implementation for redirectIfNotLoggedIn
  // This function should check if the user is logged in and redirect if not
}

const API_BASE = "https://your-api-base-url.com" // Declare API_BASE variable

// Load thread detail on page load
document.addEventListener("DOMContentLoaded", () => {
  redirectIfNotLoggedIn()
  const threadId = getThreadIdFromURL()
  loadThreadDetail(threadId)
  loadComments(threadId)
  updateUserInfo()
  setupCommentCounter()
})

// Get thread ID from URL
function getThreadIdFromURL() {
  const params = new URLSearchParams(window.location.search)
  return params.get("id")
}

// Load thread detail
async function loadThreadDetail(threadId) {
  const threadDetail = document.getElementById("threadDetail")
  const token = localStorage.getItem("auth_token")

  try {
    const response = await fetch(`${API_BASE}/threads/${threadId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const thread = await response.json()
      threadDetail.innerHTML = createThreadDetailHTML(thread)
      setupThreadActions(thread)
    } else {
      threadDetail.innerHTML = "<p>Thread tidak ditemukan</p>"
    }
  } catch (error) {
    console.error("Error loading thread:", error)
    threadDetail.innerHTML = "<p>Terjadi kesalahan saat memuat thread</p>"
  }
}

// Create thread detail HTML
function createThreadDetailHTML(thread) {
  const timeAgo = getTimeAgo(thread.created_at)
  const isAuthor = JSON.parse(localStorage.getItem("user")).id === thread.user.id

  return `
        <div class="thread-detail-header">
            <div class="thread-detail-meta">
                <img src="${thread.user.avatar || "https://via.placeholder.com/48"}" alt="${thread.user.username}" class="thread-avatar-large">
                <div>
                    <a href="profile.html?id=${thread.user.id}" class="thread-author-link">${thread.user.username}</a>
                    <p class="thread-username-detail">@${thread.user.username}</p>
                    <p class="thread-time-detail">${timeAgo}</p>
                </div>
            </div>
            ${isAuthor ? `<button class="btn btn-outline btn-small" onclick="deleteThread(${thread.id})">Hapus</button>` : ""}
        </div>

        <div class="thread-detail-content">
            <h1 class="thread-detail-title">${escapeHtml(thread.title)}</h1>
            <p class="thread-detail-text">${escapeHtml(thread.content)}</p>
        </div>

        <div class="thread-detail-stats">
            <div class="stat">
                <span class="stat-number">${thread.likes_count || 0}</span>
                <span class="stat-label">Suka</span>
            </div>
            <div class="stat">
                <span class="stat-number">${thread.comments_count || 0}</span>
                <span class="stat-label">Komentar</span>
            </div>
        </div>

        <div class="thread-detail-actions">
            <button class="thread-action-btn ${thread.is_liked ? "liked" : ""}" onclick="toggleThreadLike(${thread.id})">
                <span>${thread.is_liked ? "❤️" : "🤍"}</span>
                <span>Suka</span>
            </button>
            <button class="thread-action-btn" onclick="document.getElementById('commentInput').focus()">
                <span>💬</span>
                <span>Komentar</span>
            </button>
        </div>
    `
}

// Load comments
async function loadComments(threadId) {
  const commentsList = document.getElementById("commentsList")
  const loadingComments = document.getElementById("loadingComments")
  const emptyComments = document.getElementById("emptyComments")
  const token = localStorage.getItem("auth_token")

  loadingComments.style.display = "flex"

  try {
    const response = await fetch(`${API_BASE}/threads/${threadId}/comments`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      const comments = await response.json()
      loadingComments.style.display = "none"

      if (comments.length === 0) {
        emptyComments.style.display = "block"
        return
      }

      commentsList.innerHTML = ""
      comments.forEach((comment) => {
        const commentElement = createCommentElement(comment)
        commentsList.appendChild(commentElement)
      })
    } else {
      loadingComments.style.display = "none"
      emptyComments.style.display = "block"
    }
  } catch (error) {
    console.error("Error loading comments:", error)
    loadingComments.style.display = "none"
    emptyComments.style.display = "block"
  }
}

// Create comment element
function createCommentElement(comment) {
  const div = document.createElement("div")
  div.className = "comment-card"
  const timeAgo = getTimeAgo(comment.created_at)
  const currentUser = JSON.parse(localStorage.getItem("user"))
  const isAuthor = currentUser.id === comment.user.id

  div.innerHTML = `
        <div class="comment-header">
            <img src="${comment.user.avatar || "https://via.placeholder.com/40"}" alt="${comment.user.username}" class="comment-avatar">
            <div class="comment-meta">
                <a href="profile.html?id=${comment.user.id}" class="comment-author">${comment.user.username}</a>
                <span class="comment-username">@${comment.user.username}</span>
                <span class="comment-time">${timeAgo}</span>
                ${isAuthor ? `<button class="comment-delete" onclick="deleteComment(${comment.id})">Hapus</button>` : ""}
            </div>
        </div>
        <p class="comment-text">${escapeHtml(comment.content)}</p>
        <div class="comment-actions">
            <button class="comment-action ${comment.is_liked ? "liked" : ""}" onclick="toggleCommentLike(${comment.id})">
                <span>${comment.is_liked ? "❤️" : "🤍"}</span>
                <span>${comment.likes_count || 0}</span>
            </button>
        </div>
    `

  return div
}

// Submit comment
async function submitComment() {
  const threadId = getThreadIdFromURL()
  const content = document.getElementById("commentInput").value
  const token = localStorage.getItem("auth_token")

  if (!content.trim()) {
    alert("Komentar tidak boleh kosong")
    return
  }

  try {
    const response = await fetch(`${API_BASE}/threads/${threadId}/comments`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    })

    if (response.ok) {
      document.getElementById("commentInput").value = ""
      document.getElementById("commentCount").textContent = "0/1000"
      loadComments(threadId)
    }
  } catch (error) {
    console.error("Error submitting comment:", error)
  }
}

// Delete comment
async function deleteComment(commentId) {
  if (!confirm("Apakah Anda yakin ingin menghapus komentar ini?")) return

  const threadId = getThreadIdFromURL()
  const token = localStorage.getItem("auth_token")

  try {
    const response = await fetch(`${API_BASE}/comments/${commentId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      loadComments(threadId)
    }
  } catch (error) {
    console.error("Error deleting comment:", error)
  }
}

// Toggle comment like
async function toggleCommentLike(commentId) {
  const threadId = getThreadIdFromURL()
  const token = localStorage.getItem("auth_token")

  try {
    const response = await fetch(`${API_BASE}/comments/${commentId}/like`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      loadComments(threadId)
    }
  } catch (error) {
    console.error("Error toggling comment like:", error)
  }
}

// Toggle thread like
async function toggleThreadLike(threadId) {
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
      loadThreadDetail(threadId)
    }
  } catch (error) {
    console.error("Error toggling thread like:", error)
  }
}

// Delete thread
async function deleteThread(threadId) {
  if (!confirm("Apakah Anda yakin ingin menghapus thread ini?")) return

  const token = localStorage.getItem("auth_token")

  try {
    const response = await fetch(`${API_BASE}/threads/${threadId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (response.ok) {
      window.location.href = "threads.html"
    }
  } catch (error) {
    console.error("Error deleting thread:", error)
  }
}

// Setup comment counter
function setupCommentCounter() {
  const commentInput = document.getElementById("commentInput")
  if (commentInput) {
    commentInput.addEventListener("input", () => {
      document.getElementById("commentCount").textContent = `${commentInput.value.length}/1000`
    })
  }
}

// Setup thread actions
function setupThreadActions(thread) {
  // Additional setup if needed
}

// Update user info
async function updateUserInfo() {
  const user = JSON.parse(localStorage.getItem("user"))
  const navbarAuth = document.getElementById("navbarAuth")
  const userAvatarComment = document.getElementById("userAvatarComment")

  if (user) {
    navbarAuth.innerHTML = `
            <div class="user-menu">
                <img src="${user.avatar || "https://via.placeholder.com/40"}" alt="${user.username}" class="user-avatar">
                <span class="user-name">${user.username}</span>
                <button onclick="logout()" class="btn btn-outline btn-small">Logout</button>
            </div>
        `
    if (userAvatarComment) {
      userAvatarComment.src = user.avatar || "https://via.placeholder.com/40"
    }
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
