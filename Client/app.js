
// ✅ AUTO SWITCH BETWEEN LOCAL + RENDER
const API = window.location.hostname === 'localhost'
  ? 'http://localhost:3000'
  : 'https://your-backend-name.onrender.com';

// ================= AUTH =================

// REGISTER
async function register() {
  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const role = document.getElementById('role').value;

  const res = await fetch(API + '/register', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ name, email, password, role })
  });

  const data = await res.json();

  if (!data._id) {
    alert('Registration failed');
    return;
  }

  // ✅ SAVE ROLE
  localStorage.setItem('userId', data._id);
  localStorage.setItem('role', data.role);

  console.log("REGISTER ROLE:", data.role); // DEBUG

  if (data.role === 'admin') {
    window.location.href = 'municipal.html';
  } else {
    window.location.href = 'dashboard.html';
  }
}

// LOGIN
async function login() {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const res = await fetch(API + '/login', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ email, password })
  });

  if (!res.ok) {
    alert('Invalid login');
    return;
  }

  const data = await res.json();

  // ✅ SAVE ROLE
  localStorage.setItem('userId', data._id);
  localStorage.setItem('role', data.role);

  console.log("LOGIN ROLE:", data.role); // DEBUG

  if (data.role === 'admin') {
    window.location.href = 'municipal.html';
  } else {
    window.location.href = 'dashboard.html';
  }
}

// CHECK AUTH
function checkAuth() {
  if (!localStorage.getItem('userId')) {
    window.location.href = 'login.html';
  }
}

// ✅ ADMIN CHECK (WITH DEBUG)
function checkAdmin() {
  const role = localStorage.getItem('role');

  console.log("ROLE:", role); // 🔥 DEBUG LINE

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

// ================= ADMIN FUNCTIONS =================

// 📋 LOAD ALL OBJECTIONS
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

function estimateValue() {
  const content = document.getElementById('adminContent');

  content.innerHTML = `
    <h3>💰 Market Estimator</h3>

    <input id="size" placeholder="Property Size (m²)">
    <input id="rate" placeholder="Rate per m²">

    <button onclick="calculate()">Calculate</button>

    <p id="result"></p>
  `;
}

function calculate() {
  const size = document.getElementById('size').value;
  const rate = document.getElementById('rate').value;

  const total = size * rate;

  document.getElementById('result').innerText =
    "Estimated Value: R" + total;
}

function aiValuation() {
  const content = document.getElementById('adminContent');

  content.innerHTML = `
    <h3>🤖 AI Valuation Comparison</h3>

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
    diff > 50000
      ? "⚠️ Significant discrepancy detected"
      : "✅ Values are consistent";
}