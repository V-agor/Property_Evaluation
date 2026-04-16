// ================= API CONFIG =================

// Works locally and on Render
const API =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : window.location.origin;

// ================= AUTH =================

// REGISTER
async function register() {
  const name = document.getElementById('name')?.value?.trim();
  const email = document.getElementById('email')?.value?.trim();
  const password = document.getElementById('password')?.value;
  const role = document.getElementById('role')?.value || 'user';

  if (!name || !email || !password) {
    alert('Please fill in all required fields.');
    return;
  }

  try {
    const res = await fetch(API + '/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role })
    });

    const text = await res.text();
    let data = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }

    console.log('REGISTER RESPONSE:', data);

    if (!res.ok || !data._id) {
      alert(data.error || data.message || 'Registration failed');
      return;
    }

    localStorage.setItem('userId', data._id);
    localStorage.setItem('role', data.role || 'user');

    if (data.role === 'admin') {
      window.location.href = 'municipal.html';
    } else {
      window.location.href = 'dashboard.html';
    }
  } catch (err) {
    console.error('REGISTER ERROR:', err);
    alert('Error connecting to server');
  }
}

// LOGIN
async function login() {
  const email = document.getElementById('email')?.value?.trim();
  const password = document.getElementById('password')?.value;

  if (!email || !password) {
    alert('Please enter your email and password.');
    return;
  }

  try {
    const res = await fetch(API + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const text = await res.text();
    let data = {};

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { message: text };
    }

    console.log('LOGIN RESPONSE:', data);

    if (!res.ok || !data._id) {
      alert(data.error || data.message || 'Invalid login');
      return;
    }

    localStorage.setItem('userId', data._id);
    localStorage.setItem('role', data.role || 'user');

    if (data.role === 'admin') {
      window.location.href = 'municipal.html';
    } else {
      window.location.href = 'dashboard.html';
    }
  } catch (err) {
    console.error('LOGIN ERROR:', err);
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
  console.log('ROLE:', role);

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
  const propertyId = document.getElementById('propId')?.value?.trim();
  const reason = document.getElementById('reason')?.value?.trim();

  if (!propertyId || !reason) {
    alert('Please enter the property ID and reason.');
    return;
  }

  try {
    const res = await fetch(API + '/objections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, propertyId, reason })
    });

    if (!res.ok) {
      const msg = await res.text();
      alert(msg || 'Failed to submit objection');
      return;
    }

    alert('✅ Objection submitted');
  } catch (err) {
    console.error('SUBMIT OBJECTION ERROR:', err);
    alert('Error connecting to server');
  }
}

// LOAD USER OBJECTIONS
async function loadObjections() {
  const userId = localStorage.getItem('userId');

  try {
    const res = await fetch(API + '/objections/' + userId);
    const data = await res.json();

    const target = document.getElementById('objections');
    if (!target) return;

    if (!Array.isArray(data) || data.length === 0) {
      target.innerHTML = `<div class="card">No objections found.</div>`;
      return;
    }

    target.innerHTML = data.map(o => `
      <div class="card">
        <strong>${o.propertyId || 'N/A'}</strong><br>
        ${o.reason || 'No reason provided'}<br>
        <span style="color:${getStatusColor(o.status)}; font-weight:bold;">
          ${o.status || 'Pending'}
        </span>
      </div>
    `).join('');
  } catch (err) {
    console.error('LOAD OBJECTIONS ERROR:', err);
    alert('Error loading objections');
  }
}

// ADMIN: LOAD ALL OBJECTIONS
async function loadAllObjections() {
  const content = document.getElementById('adminContent');
  if (!content) return;

  try {
    const res = await fetch(API + '/all-objections');
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      content.innerHTML = `<div class="card"><p>No objections found.</p></div>`;
      return;
    }

    content.innerHTML = `
      <h3>📋 All Objections</h3>
      ${data.map(o => `
        <div class="card">
          <strong>User:</strong> ${o.userId || 'N/A'}<br>
          <strong>Property:</strong> ${o.propertyId || 'N/A'}<br>
          <strong>Reason:</strong> ${o.reason || 'N/A'}<br>
          <strong>Status:</strong>
          <span style="color:${getStatusColor(o.status)}; font-weight:bold;">
            ${o.status || 'Pending'}
          </span>
        </div>
      `).join('')}
    `;
  } catch (err) {
    console.error('LOAD ALL OBJECTIONS ERROR:', err);
    content.innerHTML = `<div class="card"><p>Failed to load objections.</p></div>`;
  }
}

// APPEALS
async function submitAppeal() {
  const objectionId = document.getElementById('objId')?.value?.trim();
  const reason = document.getElementById('appealReason')?.value?.trim();

  if (!objectionId || !reason) {
    alert('Please enter the objection ID and reason for appeal.');
    return;
  }

  try {
    const res = await fetch(API + '/appeals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ objectionId, reason })
    });

    if (!res.ok) {
      const msg = await res.text();
      alert(msg || 'Failed to submit appeal');
      return;
    }

    alert('✅ Appeal submitted');
  } catch (err) {
    console.error('SUBMIT APPEAL ERROR:', err);
    alert('Error connecting to server');
  }
}

// UPLOAD
async function uploadFile() {
  const fileInput = document.getElementById('file');

  if (!fileInput || !fileInput.files || !fileInput.files[0]) {
    alert('Please choose a file first.');
    return;
  }

  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  try {
    const res = await fetch(API + '/upload', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const msg = await res.text();
      alert(msg || 'File upload failed');
      return;
    }

    alert('✅ File uploaded');
  } catch (err) {
    console.error('UPLOAD ERROR:', err);
    alert('Error connecting to server');
  }
}

// NOTIFICATIONS
async function loadNotifications() {
  const userId = localStorage.getItem('userId');
  const target = document.getElementById('notifications');
  if (!target) return;

  try {
    const res = await fetch(API + '/notifications/' + userId);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      target.innerHTML = `<div class="card">No notifications yet.</div>`;
      return;
    }

    target.innerHTML = data.map(n =>
      `<div class="card">🔔 ${n.message || 'Notification'}</div>`
    ).join('');
  } catch (err) {
    console.error('LOAD NOTIFICATIONS ERROR:', err);
    alert('Error loading notifications');
  }
}

// ================= ADMIN TOOLS =================

// ESTIMATOR
function estimateValue() {
  const target = document.getElementById('adminContent');
  if (!target) return;

  target.innerHTML = `
    <h3>💰 Market Estimator</h3>
    <input id="size" type="number" placeholder="Size (m²)">
    <input id="rate" type="number" placeholder="Rate per m²">
    <button onclick="calculate()">Calculate</button>
    <p id="result"></p>
  `;
}

function calculate() {
  const size = Number(document.getElementById('size')?.value || 0);
  const rate = Number(document.getElementById('rate')?.value || 0);

  document.getElementById('result').innerText =
    `Estimated Value: R${(size * rate).toLocaleString()}`;
}

// AI TOOL
function aiValuation() {
  const target = document.getElementById('adminContent');
  if (!target) return;

  target.innerHTML = `
    <h3>🤖 AI Comparison</h3>
    <input id="value1" type="number" placeholder="Municipal Value">
    <input id="value2" type="number" placeholder="Market Value">
    <button onclick="compare()">Compare</button>
    <p id="aiResult"></p>
  `;
}

function compare() {
  const v1 = Number(document.getElementById('value1')?.value || 0);
  const v2 = Number(document.getElementById('value2')?.value || 0);
  const diff = Math.abs(v1 - v2);

  document.getElementById('aiResult').innerText =
    diff > 50000
      ? '⚠️ Large difference'
      : '✅ Values aligned';
}

// ================= HELPERS =================

function getStatusColor(status) {
  if (status === 'Approved') return 'green';
  if (status === 'Rejected') return 'red';
  return 'orange';
}
