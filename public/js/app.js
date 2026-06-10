/* ============================================================
   AlertCart – Frontend App Logic
   v2: Login, Logout, Payments
============================================================ */

const API = '/api/products';

/* ── Simple credential store (frontend-only auth) ──────── */
const USERS = { admin: 'admin123' };
let currentUser = null;

/* ── Login ──────────────────────────────────────────────── */
function doLogin() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl    = document.getElementById('login-error');

  if (!username || !password) {
    errEl.textContent = '⚠️ Please enter username and password.';
    errEl.classList.remove('hidden');
    return;
  }

  if (USERS[username] && USERS[username] === password) {
    currentUser = username;
    errEl.classList.add('hidden');
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app-shell').classList.remove('hidden');
    // Show username in sidebar
    document.getElementById('sidebar-username').textContent =
      username.charAt(0).toUpperCase() + username.slice(1);
    document.getElementById('user-avatar-letter').textContent =
      username.charAt(0).toUpperCase();
    loadDashboard();
  } else {
    errEl.textContent = '❌ Invalid username or password.';
    errEl.classList.remove('hidden');
    document.getElementById('login-password').value = '';
  }
}

// Allow Enter key to login
['login-username','login-password'].forEach(id => {
  document.getElementById(id).addEventListener('keydown', (e) => {
    if (e.key === 'Enter') doLogin();
  });
});

/* ── Logout ─────────────────────────────────────────────── */
function doLogout() {
  document.getElementById('logoutModal').classList.remove('hidden');
}
function cancelLogout() {
  document.getElementById('logoutModal').classList.add('hidden');
}
function confirmLogout() {
  document.getElementById('logoutModal').classList.add('hidden');
  document.getElementById('app-shell').classList.add('hidden');
  document.getElementById('login-screen').classList.remove('hidden');
  // Clear fields for fresh login
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
  document.getElementById('login-error').classList.add('hidden');
  currentUser = null;
}

/* ── Platform Meta ──────────────────────────────────────── */
const PLATFORM_META = {
  amazon:   { label: 'Amazon',     color: '#ff9900', bg: '#fff7e6', emoji: '🟠' },
  flipkart: { label: 'Flipkart',   color: '#2874f0', bg: '#e8f0fe', emoji: '🔵' },
  myntra:   { label: 'Myntra',     color: '#ff3f6c', bg: '#fff0f3', emoji: '🩷' },
  ajio:     { label: 'Ajio',       color: '#d0021b', bg: '#fff0f0', emoji: '🔴' },
  nykaa:    { label: 'Nykaa',      color: '#fc2779', bg: '#fff0f6', emoji: '💄' },
  tata:     { label: 'Tata/1mg',   color: '#0061a8', bg: '#e6f2ff', emoji: '💙' },
  purplle:  { label: 'Purplle',    color: '#7b2ff7', bg: '#f3e8ff', emoji: '💜' },
  unknown:  { label: 'Unknown',    color: '#888',    bg: '#f5f5f5', emoji: '❓' },
};

/* ── Clock ──────────────────────────────────────────────── */
const updateClock = () => {
  const now = new Date();
  document.getElementById('topbar-clock').textContent =
    now.toLocaleString('en-IN', { weekday:'short', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit', hour12:true });
};
updateClock();
setInterval(updateClock, 30000);

/* ── Page Navigation ────────────────────────────────────── */
const PAGE_TITLES = {
  dashboard: 'Dashboard',
  products:  'Products',
  add:       'Add Product',
  alerts:    'Alerts',
  payments:  'Payments',
  settings:  'Settings',
};

const showPage = (name) => {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const page = document.getElementById('page-' + name);
  if (page) page.classList.add('active');

  const navItem = document.querySelector(`.nav-item[data-page="${name}"]`);
  if (navItem) navItem.classList.add('active');

  document.getElementById('page-title').textContent = PAGE_TITLES[name] || name;

  if (name === 'products')  loadProducts();
  if (name === 'dashboard') loadDashboard();
  if (name === 'alerts')    loadAlerts();
};

document.querySelectorAll('.nav-item[data-page]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    showPage(link.dataset.page);
  });
});

document.querySelectorAll('.view-all-btn[data-page]').forEach(btn => {
  btn.addEventListener('click', () => showPage(btn.dataset.page));
});

/* ── Toast ──────────────────────────────────────────────── */
const toast = document.getElementById('toast');
const showToast = (msg, type = 'success') => {
  toast.textContent = msg;
  toast.className = `toast ${type}`;
  toast.classList.remove('hidden');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.add('hidden'), 3500);
};

/* ── Helpers ────────────────────────────────────────────── */
const formatDate = (d) => {
  if (!d) return 'Never';
  return new Date(d).toLocaleString('en-IN', {
    day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit'
  });
};

const esc = (s) =>
  String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

const platformBadge = (platform) => {
  const m = PLATFORM_META[platform] || PLATFORM_META.unknown;
  return `<span class="badge" style="background:${m.bg};color:${m.color};border:1px solid ${m.color}33">
    ${m.emoji} ${m.label}
  </span>`;
};

const productCardHTML = (p) => {
  const hasDrop = p.currentPrice !== null && p.currentPrice <= p.targetPrice;
  const priceClass = p.currentPrice === null ? 'price-na' : hasDrop ? 'price-current-drop' : 'price-current-ok';
  const priceDisplay = p.currentPrice !== null ? `₹${p.currentPrice.toLocaleString('en-IN')}` : '—';
  const arrow = `<div style="display:flex;align-items:center;color:#ccc;font-size:1.2rem">→</div>`;

  return `
    <div class="product-card ${p.notified ? 'notified' : ''}" id="card-${p._id}">
      <div class="pc-top">
        <div style="flex:1;min-width:0">
          <div class="pc-name">${esc(p.name)}</div>
          <a class="pc-url" href="${esc(p.productURL)}" target="_blank" rel="noopener">
            🔗 ${esc(p.productURL.substring(0,70))}${p.productURL.length > 70 ? '…' : ''}
          </a>
        </div>
        <div style="display:flex;gap:5px;flex-wrap:wrap;justify-content:flex-end">
          ${platformBadge(p.platform)}
          ${p.notified ? '<span class="badge badge-notified">✓ Alert Sent</span>' : ''}
        </div>
      </div>
      <div class="pc-prices">
        <div class="price-item">
          <div class="price-label">TARGET PRICE</div>
          <div class="price-value price-target">₹${p.targetPrice.toLocaleString('en-IN')}</div>
        </div>
        ${arrow}
        <div class="price-item">
          <div class="price-label">CURRENT PRICE</div>
          <div class="price-value ${priceClass}">${priceDisplay}</div>
        </div>
      </div>
      ${hasDrop ? `<div class="drop-banner">🎉 Price dropped! You save ₹${(p.targetPrice - p.currentPrice).toFixed(0)}.</div>` : ''}
      <div class="pc-meta">
        <span>📧 ${esc(p.userEmail)}</span>
        ${p.userPhone ? `<span>📱 ${esc(p.userPhone)}</span>` : ''}
        <span>🕐 Added: ${formatDate(p.createdAt)}</span>
        <span>🔍 Checked: ${formatDate(p.lastChecked)}</span>
      </div>
      <div class="pc-actions">
        <button class="btn btn-sm btn-check" onclick="checkNow('${p._id}', this)">⚡ Check Now</button>
        <button class="btn btn-sm btn-edit" onclick="openEdit('${p._id}', ${p.targetPrice}, '${esc(p.userEmail)}', '${esc(p.userPhone || '')}')">✏️ Edit</button>
        <button class="btn btn-sm btn-del" onclick="deleteProduct('${p._id}')">🗑️ Delete</button>
      </div>
    </div>`;
};

/* ── Load All Products ──────────────────────────────────── */
let allProducts = [];

const loadProducts = async () => {
  try {
    const res  = await fetch(API);
    const data = await res.json();
    allProducts = data.data || [];
    renderProductList(allProducts);
    updateStats(allProducts);
  } catch {
    document.getElementById('productList').innerHTML =
      `<p class="alert alert-error">Failed to load products. Is the server running?</p>`;
  }
};

const renderProductList = (products) => {
  const el = document.getElementById('productList');
  if (!products.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><p>No products tracked yet.</p></div>`;
    return;
  }
  el.innerHTML = products.map(productCardHTML).join('');
};

/* ── Dashboard ──────────────────────────────────────────── */
const loadDashboard = async () => {
  try {
    const res  = await fetch(API);
    const data = await res.json();
    allProducts = data.data || [];
    updateStats(allProducts);
    renderRecent(allProducts.slice(0, 3));
  } catch {
    document.getElementById('recent-list').innerHTML =
      `<p class="alert alert-error">Failed to load data.</p>`;
  }
};

const updateStats = (products) => {
  const byPlatform = (p) => products.filter(x => x.platform === p).length;
  document.getElementById('stat-total').textContent    = products.length;
  document.getElementById('stat-alerted').textContent  = products.filter(p => p.notified).length;
  document.getElementById('stat-amazon').textContent   = byPlatform('amazon');
  document.getElementById('stat-flipkart').textContent = byPlatform('flipkart');
  document.getElementById('stat-myntra').textContent   = byPlatform('myntra');
  document.getElementById('stat-ajio').textContent     = byPlatform('ajio');
  document.getElementById('stat-nykaa').textContent    = byPlatform('nykaa');
  document.getElementById('stat-tata').textContent     = byPlatform('tata');
  document.getElementById('stat-purplle').textContent  = byPlatform('purplle');
};

const renderRecent = (products) => {
  const el = document.getElementById('recent-list');
  if (!products.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">📭</div><p>No products yet. <a href="#" onclick="showPage('add');return false;">Add your first!</a></p></div>`;
    return;
  }
  el.innerHTML = products.map(productCardHTML).join('');
};

/* ── Alerts Page ────────────────────────────────────────── */
const loadAlerts = () => {
  const alerted = allProducts.filter(p => p.notified);
  const el = document.getElementById('alerts-list');
  if (!alerted.length) {
    el.innerHTML = `<div class="empty-state"><div class="empty-icon">🔕</div><p>No alerts sent yet.</p></div>`;
    return;
  }
  el.innerHTML = alerted.map(productCardHTML).join('');
};

/* ── Add Product Form ───────────────────────────────────── */
const form       = document.getElementById('addProductForm');
const formAlert  = document.getElementById('form-alert');
const addBtn     = document.getElementById('addBtn');
const addBtnText = document.getElementById('addBtnText');
const addBtnLoader = document.getElementById('addBtnLoader');

const showFormAlert = (msg, type) => {
  formAlert.className = `alert alert-${type}`;
  formAlert.textContent = msg;
  formAlert.classList.remove('hidden');
  setTimeout(() => formAlert.classList.add('hidden'), 5000);
};

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  addBtn.disabled = true;
  addBtnText.classList.add('hidden');
  addBtnLoader.classList.remove('hidden');

  const payload = {
    productURL:  document.getElementById('productURL').value.trim(),
    targetPrice: document.getElementById('targetPrice').value,
    userEmail:   document.getElementById('userEmail').value.trim(),
    userPhone:   document.getElementById('userPhone').value.trim(),
  };
  try {
    const res  = await fetch(API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (data.success) {
      showFormAlert(`✅ "${data.data.name}" added! Current price: ₹${data.data.currentPrice || '—'}`, 'success');
      form.reset();
      showToast('✅ Product added successfully!');
    } else {
      showFormAlert(`❌ ${data.message}`, 'error');
    }
  } catch {
    showFormAlert('❌ Network error. Is the server running?', 'error');
  } finally {
    addBtn.disabled = false;
    addBtnText.classList.remove('hidden');
    addBtnLoader.classList.add('hidden');
  }
});

/* ── Delete ─────────────────────────────────────────────── */
const deleteProduct = async (id) => {
  if (!confirm('Delete this product from tracking?')) return;
  try {
    const res  = await fetch(`${API}/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) { showToast('🗑️ Product removed.'); loadProducts(); loadDashboard(); }
    else showToast(data.message, 'error');
  } catch { showToast('Delete failed.', 'error'); }
};

/* ── Check Now ──────────────────────────────────────────── */
const checkNow = async (id, btn) => {
  btn.disabled = true; btn.textContent = '⏳…';
  try {
    const res  = await fetch(`${API}/${id}/check`, { method: 'POST' });
    const data = await res.json();
    if (data.success) { showToast(data.message); loadDashboard(); loadProducts(); }
    else showToast(data.message, 'error');
  } catch { showToast('Check failed.', 'error'); }
  finally { btn.disabled = false; btn.textContent = '⚡ Check Now'; }
};

/* ── Edit Modal ─────────────────────────────────────────── */
const openEdit = (id, targetPrice, userEmail, userPhone) => {
  document.getElementById('editId').value          = id;
  document.getElementById('editTargetPrice').value = targetPrice;
  document.getElementById('editUserEmail').value   = userEmail;
  document.getElementById('editUserPhone').value   = userPhone || '';
  document.getElementById('editModal').classList.remove('hidden');
};
const closeModal = () => document.getElementById('editModal').classList.add('hidden');

const saveEdit = async () => {
  const id          = document.getElementById('editId').value;
  const targetPrice = document.getElementById('editTargetPrice').value;
  const userEmail   = document.getElementById('editUserEmail').value;
  const userPhone   = document.getElementById('editUserPhone').value.trim();
  try {
    const res  = await fetch(`${API}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetPrice, userEmail, userPhone }),
    });
    const data = await res.json();
    if (data.success) { showToast('✏️ Product updated!'); closeModal(); loadDashboard(); loadProducts(); }
    else showToast(data.message, 'error');
  } catch { showToast('Update failed.', 'error'); }
};

document.getElementById('editModal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeModal();
});

/* ── Payments ───────────────────────────────────────────── */
function showAddPayment() {
  document.getElementById('add-payment-section').classList.remove('hidden');
}
function hideAddPayment() {
  document.getElementById('add-payment-section').classList.add('hidden');
}

function switchPayTab(btn, tabId) {
  document.querySelectorAll('.pay-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.pay-tab-content').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(tabId).classList.add('active');
}

function formatCardNumber(input) {
  let v = input.value.replace(/\D/g,'').substring(0,16);
  input.value = v.replace(/(.{4})/g,'$1 ').trim();
}

function formatExpiry(input) {
  let v = input.value.replace(/\D/g,'');
  if (v.length >= 2) v = v.substring(0,2) + '/' + v.substring(2,4);
  input.value = v;
}

function saveCard() {
  const num  = document.getElementById('card-number').value.trim();
  const name = document.getElementById('card-name').value.trim();
  if (!num || !name) { showToast('Please fill in card number and name.','error'); return; }
  const last4 = num.replace(/\s/g,'').slice(-4);
  addPaymentRow(`<div class="pm-icon pm-visa">VISA</div>`,
    `Card ending in ${last4}`, `Added just now`);
  document.getElementById('card-number').value = '';
  document.getElementById('card-name').value   = '';
  document.getElementById('card-expiry').value = '';
  document.getElementById('card-cvv').value    = '';
  hideAddPayment();
  showToast('💳 Card saved successfully!');
}

function saveUPI() {
  const id = document.getElementById('upi-id').value.trim();
  if (!id) { showToast('Please enter your UPI ID.','error'); return; }
  addPaymentRow(`<div class="pm-icon pm-upi">UPI</div>`,
    `UPI – ${id}`, 'Linked just now');
  document.getElementById('upi-id').value = '';
  hideAddPayment();
  showToast('📱 UPI ID linked!');
}

function saveNetBanking() {
  const bank = document.getElementById('bank-select').value;
  if (!bank) { showToast('Please select a bank.','error'); return; }
  addPaymentRow(`<div class="pm-icon" style="background:#1a5ac4;color:#fff;font-size:0.6rem;text-align:center">BANK</div>`,
    bank, 'Net Banking');
  hideAddPayment();
  showToast('🏦 Bank linked!');
}

function saveWallet() {
  const selected = document.querySelector('.upi-app-btn.selected');
  if (!selected) { showToast('Please select a wallet.','error'); return; }
  const name = selected.querySelector('span:last-child').textContent;
  addPaymentRow(`<div class="pm-icon" style="background:#FF9800;color:#fff;font-size:0.6rem">WLLT</div>`,
    name + ' Wallet', 'Linked just now');
  document.querySelectorAll('.upi-app-btn').forEach(b => b.classList.remove('selected'));
  hideAddPayment();
  showToast('👛 Wallet linked!');
}

function addPaymentRow(iconHTML, name, sub) {
  const list = document.getElementById('payment-methods-list');
  const row  = document.createElement('div');
  row.className = 'payment-method-row';
  row.innerHTML = `
    ${iconHTML}
    <div class="pm-info">
      <div class="pm-name">${esc(name)}</div>
      <div class="pm-sub">${esc(sub)}</div>
    </div>
    <button class="btn btn-sm btn-del" onclick="removePayment(this)">🗑️ Remove</button>`;
  list.appendChild(row);
}

function removePayment(btn) {
  if (!confirm('Remove this payment method?')) return;
  btn.closest('.payment-method-row').remove();
  showToast('🗑️ Payment method removed.');
}

function selectUpiApp(el, name) {
  document.querySelectorAll('#tab-upi .upi-app-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('upi-id').value = '';
  document.getElementById('upi-id').placeholder = `Enter your ${name} UPI ID`;
}

function selectWallet(el) {
  document.querySelectorAll('#tab-wallet .upi-app-btn').forEach(b => b.classList.remove('selected'));
  el.classList.add('selected');
}

/* ── Settings ───────────────────────────────────────────── */
function showChangePassword() {
  document.getElementById('change-password-panel').classList.remove('hidden');
}
function hideChangePassword() {
  document.getElementById('change-password-panel').classList.add('hidden');
}
function changePassword() {
  const oldPw  = document.getElementById('old-password').value;
  const newPw  = document.getElementById('new-password').value;
  const confPw = document.getElementById('confirm-password').value;
  if (!oldPw || !newPw || !confPw) { showToast('Please fill all fields.','error'); return; }
  if (!USERS[currentUser] || USERS[currentUser] !== oldPw) {
    showToast('❌ Current password is incorrect.','error'); return;
  }
  if (newPw !== confPw) { showToast('❌ New passwords do not match.','error'); return; }
  if (newPw.length < 6) { showToast('❌ Password must be at least 6 characters.','error'); return; }
  USERS[currentUser] = newPw;
  document.getElementById('old-password').value  = '';
  document.getElementById('new-password').value  = '';
  document.getElementById('confirm-password').value = '';
  hideChangePassword();
  showToast('🔑 Password updated successfully!');
}

/* ── Init: do NOT auto-load, wait for login ─────────────── */
// Dashboard auto-refresh (only fires if logged in)
setInterval(() => { if (currentUser) loadDashboard(); }, 60000);
