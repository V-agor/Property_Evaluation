// ================= API CONFIG =================

// 🔥 AUTO SWITCH (LOCAL vs RENDER)
const API =
  window.location.hostname === 'localhost'
    ? 'http://localhost:3000'
    : 'https://your-backend-name.onrender.com'; // 🔴 REPLACE THIS

// ================= AUTH =================

// REGISTER
async function register() {
  const name = document.getElementById('name')?.value;
  const email = document.getElementById('email')?.value;
  const password = document.getElementById('password')?.value;
  const role = document.getElementById('role')?.value;

  try {
    const res = await fetch(API + '/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });

    const data = await res.json();

    console.log("REGISTER RESPONSE:", data);

    if (!data._id) {
      alert('Registration failed');
      return;
    }

    localStorage.setItem('userId', data._id);
    localStorage.setItem('role', data.role);

    // 🔁 REDIRECT
    if (data.role === 'admin') {
      window.location.href = 'municipal.html';
    } else {
      window.location.href = 'dashboard.html';
    }

  } catch (err) {
    console.error(err);
    alert('Error connecting to server');
  }
}

// LOGIN
async function login() {
  const email = document.getElementById('email')?.value;
  const password = document.getElementById('password')?.value;

  try {
    const res = await fetch(API + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      alert('Invalid login');
      return;
    }

    const data = await res.json();

    console.log("LOGIN RESPONSE:", data);

    localStorage.setItem('userId', data._id);
    localStorage.setItem('role', data.role);

    // 🔁 REDIRECT
    if (data.role === 'admin') {
      window.location.href = 'municipal.html';
    } else {
      window.location.href = 'dashboard.html';
    }

  } catch (err) {
    console.error(err);
    alert('Error connecting to server');
  }
}

// CHECK AUTH
function checkAuth() {
  if (!localStorage.getItem('userId')) {
    window.location.href = 'login.html';
  }
}

// ADMIN CHECK
function checkAdmin() {
  const role = localStorage.getItem('role');

  console.log("ROLE:", role);

  if (role !== 'admin') {
    alert('Access denied');
    window.location.href = 'dashboard.html';
  }
}

// LOGOUT
function logout() {
  localStorage.clear();
  window.location.href = 'login.html';
}

// ================= FEATURES =================

// DOWNLOAD FORM
function downloadForm() {
  const link = document.createElement('a');
  link.href = 'objection-form.pdf';
  link.download = 'objection-form.pdf';
  link.click();
}

// SUBMIT OBJECTION
async function submitObjection() {
  const userId = localStorage.getItem('userId');
  const propertyId = document.getElementById('propId')?.value;
  const reason = document.getElementById('reason')?.value;

  await fetch(API + '/objections', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, propertyId, reason })
  });

  alert('✅ Objection submitted');
}

// LOAD USER OBJECTIONS
async function loadObjections() {
  const userId = localStorage.getItem('userId');

  const res = await fetch(API + '/objections/' + userId);
  const data = await res.json();

  document.getElementById('objections').innerHTML = data.map(o => `
    <div class="card">
      <strong>${o.propertyId}</strong><br>
      ${o.reason}<br>
      <span style="color:${getStatusColor(o.status)}">${o.status}</span>
    </div>
  `).join('');
}

// ADMIN: LOAD ALL OBJECTIONS
async function loadAllObjections() {
  const content = document.getElementById('adminContent');

  const res = await fetch(API + '/all-objections');
  const data = await res.json();

  if (data.length === 0) {
    content.innerHTML = "<p>No objections found.</p>";
    return;
  }

  content.innerHTML = `
    <h3>📋 All Objections</h3>
    ${data.map(o => `
      <div class="card">
        <strong>User:</strong> ${o.userId}<br>
        <strong>Property:</strong> ${o.propertyId}<br>
        <strong>Reason:</strong> ${o.reason}<br>
        <strong>Status:</strong> ${o.status}
      </div>
    `).join('')}
  `;
}

// APPEALS
async function submitAppeal() {
  const objectionId = document.getElementById('objId')?.value;
  const reason = document.getElementById('appealReason')?.value;

  await fetch(API + '/appeals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ objectionId, reason })
  });

  alert('✅ Appeal submitted');
}

// UPLOAD
async function uploadFile() {
  const fileInput = document.getElementById('file');

  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  await fetch(API + '/upload', {
    method: 'POST',
    body: formData
  });

  alert('✅ File uploaded');
}

// NOTIFICATIONS
async function loadNotifications() {
  const userId = localStorage.getItem('userId');

  const res = await fetch(API + '/notifications/' + userId);
  const data = await res.json();

  document.getElementById('notifications').innerHTML = data.map(n =>
    `<div class="card">🔔 ${n.message}</div>`
  ).join('');
}

// ================= ADMIN TOOLS =================

// ESTIMATOR
function estimateValue() {
  document.getElementById('adminContent').innerHTML = `
    <h3>💰 Market Estimator</h3>
    <input id="size" placeholder="Size (m²)">
    <input id="rate" placeholder="Rate per m²">
    <button onclick="calculate()">Calculate</button>
    <p id="result"></p>
  `;
}

function calculate() {
  const size = document.getElementById('size').value;
  const rate = document.getElementById('rate').value;

  document.getElementById('result').innerText =
    "Estimated Value: R" + (size * rate);
}

// AI TOOL
function aiValuation() {
  document.getElementById('adminContent').innerHTML = `
    <h3>🤖 AI Comparison</h3>
    <input id="value1" placeholder="Municipal Value">
    <input id="value2" placeholder="Market Value">
    <button onclick="compare()">Compare</button>
    <p id="aiResult"></p>
  `;
}

function compare() {
  const v1 = document.getElementById('value1').value;
  const v2 = document.getElementById('value2').value;

  const diff = Math.abs(v1 - v2);

  document.getElementById('aiResult').innerText =
    diff > 50000 ? "⚠️ Large difference" : "✅ Values aligned";
}

// ================= HELPERS =================

function getStatusColor(status) {
  if (status === 'Approved') return 'green';
  if (status === 'Rejected') return 'red';
  return 'orange';
}
