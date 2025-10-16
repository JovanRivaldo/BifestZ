const API_BASE = "http://localhost:8000/api";

document.addEventListener("DOMContentLoaded", () => {
  loadThreads();

  document.getElementById("btn-new-thread").addEventListener("click", showNewThreadForm);
  document.getElementById("modal-close").addEventListener("click", () => toggleModal(false));

  document.getElementById("btn-login").addEventListener("click", showLoginForm);
  document.getElementById("btn-register").addEventListener("click", showRegisterForm);
});

async function loadThreads() {
  const el = document.getElementById("threads");
  el.innerHTML = "Loading...";
  try {
    const res = await fetch(`${API_BASE}/threads`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Failed");
    el.innerHTML = "";
    (data.data || data).forEach(t => {
      const node = document.createElement("div");
      node.className = "thread-card";
      node.innerHTML = `<h3>${escapeHtml(t.title)}</h3>
                        <p>${escapeHtml(t.excerpt || '')}</p>
                        <small>By ${t.user ? t.user.name : 'Anonymous'} • ${new Date(t.created_at).toLocaleString()}</small>`;
      node.addEventListener("click", () => viewThread(t.id));
      el.appendChild(node);
    });
  } catch (err) {
    el.innerHTML = "Gagal memuat topik.";
    console.error(err);
  }
}

function showLoginForm() {
  const body = document.getElementById("modal-body");
  body.innerHTML = `
    <h3>Login</h3>
    <input id="login-email" type="email" placeholder="Email" style="width:100%;padding:8px;margin-bottom:8px" />
    <input id="login-password" type="password" placeholder="Password" style="width:100%;padding:8px;margin-bottom:8px" />
    <div style="text-align:right"><button id="login-submit">Masuk</button></div>
  `;
  toggleModal(true);

  document.getElementById("login-submit").addEventListener("click", handleLogin);
}

function showRegisterForm() {
  const body = document.getElementById("modal-body");
  body.innerHTML = `
    <h3>Register</h3>
    <input id="reg-name" placeholder="Nama" style="width:100%;padding:8px;margin-bottom:8px" />
    <input id="reg-email" type="email" placeholder="Email" style="width:100%;padding:8px;margin-bottom:8px" />
    <input id="reg-password" type="password" placeholder="Password" style="width:100%;padding:8px;margin-bottom:8px" />
    <div style="text-align:right"><button id="register-submit">Daftar</button></div>
  `;
  toggleModal(true);

  document.getElementById("register-submit").addEventListener("click", handleRegister);
}

async function handleLogin() {
  const email = document.getElementById("login-email").value;
  const password = document.getElementById("login-password").value;

  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  if (res.ok) {
    localStorage.setItem("token", data.token || data.access_token);
    alert("Login berhasil!");
    toggleModal(false);
  } else {
    alert(data.message || "Gagal login.");
  }
}

async function handleRegister() {
  const name = document.getElementById("reg-name").value;
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;

  const res = await fetch(`${API_BASE}/register`, {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();
  if (res.ok) {
    alert("Pendaftaran berhasil! Silakan login.");
    toggleModal(false);
  } else {
    alert(data.message || "Gagal mendaftar.");
  }
}

function showNewThreadForm() {
  const body = document.getElementById("modal-body");
  body.innerHTML = `
    <h3>Buat Topik Baru</h3>
    <input id="thread-title" placeholder="Judul" style="width:100%;padding:8px;margin-bottom:8px" />
    <textarea id="thread-body" placeholder="Tulis..." style="width:100%;height:140px;padding:8px"></textarea>
    <div style="margin-top:8px;text-align:right">
      <button id="create-thread-btn">Posting</button>
    </div>
  `;
  toggleModal(true);
  document.getElementById("create-thread-btn").addEventListener("click", createThread);
}

async function createThread() {
  const title = document.getElementById("thread-title").value;
  const body = document.getElementById("thread-body").value;
  const token = localStorage.getItem("token");
  if (!token) return alert("Silakan login dulu.");

  const res = await fetch(`${API_BASE}/threads`, {
    method: "POST",
    headers: {
      "Content-Type":"application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ title, body })
  });
  const data = await res.json();
  if (res.ok) {
    toggleModal(false);
    loadThreads();
  } else {
    alert(data.message || "Gagal membuat topik");
  }
}

async function viewThread(id) {
  const res = await fetch(`${API_BASE}/threads/${id}`);
  const data = await res.json();
  const body = document.getElementById("modal-body");
  if (!res.ok) { body.innerHTML = "Gagal memuat thread"; toggleModal(true); return; }
  const t = data.data;
  body.innerHTML = `<h3>${escapeHtml(t.title)}</h3>
                    <p>${escapeHtml(t.body)}</p>
                    <hr />
                    <div id="comments"></div>
                    <textarea id="reply-body" placeholder="Tulis balasan..." style="width:100%;height:90px;padding:8px"></textarea>
                    <div style="text-align:right;margin-top:8px"><button id="reply-btn">Kirim</button></div>`;
  toggleModal(true);
  document.getElementById("reply-btn").addEventListener("click", async () => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Login dulu");
    const bodyText = document.getElementById("reply-body").value;
    const r = await fetch(`${API_BASE}/threads/${id}/posts`, {
      method: "POST",
      headers: {"Content-Type":"application/json","Authorization":`Bearer ${token}`},
      body: JSON.stringify({ body: bodyText })
    });
    if (r.ok) {
      viewThread(id);
    } else {
      const err = await r.json(); alert(err.message || "Gagal");
    }
  });
  const commentsEl = document.getElementById("comments");
  commentsEl.innerHTML = (t.posts || []).map(p => `<div style="padding:8px;background:#f2f6ff;border-radius:6px;margin-bottom:8px"><b>${escapeHtml(p.user ? p.user.name : 'Anon')}</b><p>${escapeHtml(p.body)}</p></div>`).join("");
}

function toggleModal(show){
  document.getElementById("modal").classList.toggle("hidden", !show);
}

function escapeHtml(unsafe){
  return unsafe
    ? unsafe.replace(/[&<"'>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]))
    : '';
}
