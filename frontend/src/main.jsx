import './style.css'

const API_BASE_URL = 'http://localhost:8000/api/properties/';
let currentTab = 'dashboard';
let backendStatus = 'checking';
const app = document.querySelector('#app');

async function checkBackendStatus() {
  try {
    const response = await fetch(`${API_BASE_URL}test/`);
    if (response.ok) {
      backendStatus = 'online';
      console.log('Backend connected');
    } else {
      backendStatus = 'offline';
    }
  } catch (error) {
    backendStatus = 'offline';
    console.log('Backend not reachable');
  }
  render();
}

async function uploadPDF(file) {
  const formData = new FormData();
  formData.append('pdf', file);
  formData.append('property_id', '1');

  try {
    const response = await fetch(`${API_BASE_URL}upload/`, {
      method: 'POST',
      body: formData,
    });
    
    if (response.ok) {
      const result = await response.json();
      showNotification('success', result.message || 'Bill uploaded successfully!');
    } else {
      showNotification('error', 'Upload failed');
    }
  } catch (error) {
    showNotification('error', 'Connection error');
  }
}

function showNotification(type, message) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `<span>${type === 'success' ? '✅' : '❌'}</span><span>${message}</span>`;
  document.body.appendChild(notification);
  setTimeout(() => notification.remove(), 3000);
}

function renderDashboard() {
  return `
    <div class="dashboard-container">
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-icon">📄</div><div class="stat-info"><h3>Total Bills</h3><p class="stat-value">0</p></div></div>
        <div class="stat-card"><div class="stat-icon">💰</div><div class="stat-info"><h3>Total Spent</h3><p class="stat-value">R0</p></div></div>
        <div class="stat-card"><div class="stat-icon">🎯</div><div class="stat-info"><h3>Potential Savings</h3><p class="stat-value savings">R0</p></div></div>
        <div class="stat-card"><div class="stat-icon">🏠</div><div class="stat-info"><h3>Properties</h3><p class="stat-value">1</p></div></div>
      </div>
    </div>
  `;
}

function renderUpload() {
  return `
    <div class="upload-container">
      <div class="property-selector">
        <label>Select Property</label>
        <select id="propertySelect">
          <option value="1">Home - Johannesburg</option>
        </select>
      </div>
      <div class="dropzone" id="dropzone">
        <div class="dropzone-content">
          <span class="dropzone-icon">📁</span>
          <p>Drag & drop your municipal bill here</p>
          <small>PDF files only</small>
          <button class="btn-secondary" id="selectFileBtn" type="button">Or click to select</button>
        </div>
      </div>
      <div class="info-box">
        <h4>💡 How it works</h4>
        <ol>
          <li>Upload your municipal bill (PDF)</li>
          <li>Our AI analyzes for overcharges</li>
          <li>Get a detailed savings report</li>
        </ol>
      </div>
    </div>
  `;
}

function renderProperties() {
  return `
    <div class="properties-container">
      <button class="btn-primary" id="addPropertyBtn" type="button">+ Add New Property</button>
      <div class="property-card">
        <div class="property-header">
          <span class="property-icon">🏠</span>
          <h3>Home</h3>
          <span class="property-badge">Residential</span>
        </div>
        <p class="property-address">123 Main Street, Johannesburg</p>
        <p class="property-account">Account: JHB-12345</p>
      </div>
    </div>
  `;
}

function renderSavings() {
  return `
    <div class="savings-container">
      <div class="savings-card">
        <h2>Total Savings</h2>
        <div class="savings-amount">R0.00</div>
        <p>Across all properties</p>
      </div>
      <div class="savings-tips">
        <h3>💰 Money Saving Tips</h3>
        <ul>
          <li>Check for estimated readings vs actual</li>
          <li>Verify your property tariff category</li>
          <li>Look for sewer overcharges</li>
        </ul>
      </div>
    </div>
  `;
}

function render() {
  let content = '';
  if (currentTab === 'dashboard') content = renderDashboard();
  else if (currentTab === 'upload') content = renderUpload();
  else if (currentTab === 'properties') content = renderProperties();
  else if (currentTab === 'savings') content = renderSavings();
  else content = renderDashboard();
  
  const statusClass = backendStatus === 'online' ? 'online' : 'offline';
  const statusText = backendStatus === 'online' ? 'Connected' : 'Disconnected';
  
  app.innerHTML = `
    <div class="app">
      <aside class="sidebar">
        <div class="logo"><span class="logo-icon">⚡</span><span class="logo-text">MunicipalFlow</span></div>
        <nav class="nav">
          <button class="nav-item ${currentTab === 'dashboard' ? 'active' : ''}" data-tab="dashboard">📊 Dashboard</button>
          <button class="nav-item ${currentTab === 'upload' ? 'active' : ''}" data-tab="upload">📤 Upload Bill</button>
          <button class="nav-item ${currentTab === 'properties' ? 'active' : ''}" data-tab="properties">🏠 Properties</button>
          <button class="nav-item ${currentTab === 'savings' ? 'active' : ''}" data-tab="savings">💰 Savings</button>
        </nav>
        <div class="status-indicator"><div class="status-dot ${statusClass}"></div><span class="status-text">Backend: ${statusText}</span></div>
      </aside>
      <main class="main-content">
        <header class="content-header">
          <h1 class="content-title">MunicipalFlow</h1>
          <div class="user-badge"><span class="user-icon">👤</span><span>Property Owner</span></div>
        </header>
        ${content}
      </main>
    </div>
  `;
  
  attachEventListeners();
}

function attachEventListeners() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      currentTab = btn.dataset.tab;
      render();
    });
  });
  
  if (currentTab === 'upload') {
    const dropzone = document.getElementById('dropzone');
    if (dropzone) {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.pdf';
      
      dropzone.addEventListener('click', (e) => {
        if (e.target.id !== 'selectFileBtn') fileInput.click();
      });
      
      const selectBtn = document.getElementById('selectFileBtn');
      if (selectBtn) {
        selectBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          fileInput.click();
        });
      }
      
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });
      
      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
      });
      
      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'application/pdf') {
          uploadPDF(file);
        } else {
          showNotification('error', 'Please upload a PDF file');
        }
      });
      
      fileInput.addEventListener('change', () => {
        if (fileInput.files[0]) uploadPDF(fileInput.files[0]);
      });
    }
  }
}

async function init() {
  await checkBackendStatus();
  render();
  setInterval(checkBackendStatus, 30000);
}

init();