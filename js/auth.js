const API_BASE = "https://your-api-base-url.com"

// Handle Login Form Submission
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm")
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin)
  }

  const registerForm = document.getElementById("registerForm")
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister)
  }
})

// Login Handler
async function handleLogin(e) {
  e.preventDefault()

  const email = document.getElementById("email").value
  const password = document.getElementById("password").value
  const errorMessage = document.getElementById("errorMessage")

  try {
    const response = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (response.ok) {
      localStorage.setItem("auth_token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      window.location.href = "threads.html"
    } else {
      errorMessage.textContent = data.message || "Login gagal. Silakan coba lagi."
      errorMessage.classList.add("show")
    }
  } catch (error) {
    console.error("Login error:", error)
    errorMessage.textContent = "Terjadi kesalahan. Silakan coba lagi."
    errorMessage.classList.add("show")
  }
}

// Register Handler
async function handleRegister(e) {
  e.preventDefault()

  const username = document.getElementById("username").value
  const email = document.getElementById("email").value
  const password = document.getElementById("password").value
  const password_confirmation = document.getElementById("password_confirmation").value
  const errorMessage = document.getElementById("errorMessage")

  if (password !== password_confirmation) {
    errorMessage.textContent = "Password tidak cocok"
    errorMessage.classList.add("show")
    return
  }

  try {
    const response = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, email, password, password_confirmation }),
    })

    const data = await response.json()

    if (response.ok) {
      localStorage.setItem("auth_token", data.token)
      localStorage.setItem("user", JSON.stringify(data.user))
      window.location.href = "threads.html"
    } else {
      errorMessage.textContent = data.message || "Registrasi gagal. Silakan coba lagi."
      errorMessage.classList.add("show")
    }
  } catch (error) {
    console.error("Register error:", error)
    errorMessage.textContent = "Terjadi kesalahan. Silakan coba lagi."
    errorMessage.classList.add("show")
  }
}
