// Z-Bridges PMS - Manager Interface
// Dependencies: Assumes js/app.js has loaded and exposed window.ZB

function initAdminUI() {
  console.log('Initializing Admin UI...');
  
  // 1. Security Check
  if (!ZB.requireAuth('admin')) return;

  // 2. Render Dashboard
  renderLeads();
  renderDirectory();
  renderLedger();

  // 3. Attach Listeners
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    sessionStorage.removeItem('ZB_USER');
    window.location.href = 'login.html';
  });
}

function renderLeads() {
  const container = document.getElementById('leads-list');
  if (!container) return;

  container.innerHTML = ZB.Store.data.leads.length ? '' : '<p class="text-gray-500">No new leads.</p>';

  ZB.Store.data.leads.forEach(lead => {
    const el = document.createElement('div');
    el.className = 'p-3 bg-white border rounded shadow-sm flex justify-between items-center mb-2';
    el.innerHTML = `
      <div>
        <div class="font-bold">${lead.name}</div>
        <div class="text-sm text-gray-600">${lead.email}</div>
      </div>
      <button class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm" onclick="convertLead('${lead.id}')">
        Onboard
      </button>
    `;
    container.appendChild(el);
  });
}

function renderDirectory() {
  const container = document.getElementById('users-list');
  if (!container) return;

  container.innerHTML = '';
  ZB.Store.data.users.forEach(user => {
    const el = document.createElement('div');
    el.className = 'flex justify-between py-2 border-b';
    el.innerHTML = `<span>${user.name}</span> <span class="text-xs bg-gray-200 px-2 py-1 rounded">${user.role}</span>`;
    container.appendChild(el);
  });
}

function renderLedger() {
  const container = document.getElementById('ledger-summary');
  if (!container) return;

  const credits = ZB.Store.data.ledger
    .filter(x => x.type === 'credit')
    .reduce((acc, curr) => acc + curr.amount, 0);
    
  const debits = ZB.Store.data.ledger
    .filter(x => x.type === 'debit')
    .reduce((acc, curr) => acc + curr.amount, 0);

  container.innerHTML = `
    <div class="grid grid-cols-2 gap-4 text-center">
      <div class="bg-green-50 p-4 rounded">
        <div class="text-sm text-green-800">Revenue</div>
        <div class="text-xl font-bold text-green-700">${ZB.utils.formatCurrency(credits)}</div>
      </div>
      <div class="bg-red-50 p-4 rounded">
        <div class="text-sm text-red-800">Expenses</div>
        <div class="text-xl font-bold text-red-700">${ZB.utils.formatCurrency(debits)}</div>
      </div>
    </div>
  `;
}

// Global scope for HTML onclick handlers
window.convertLead = (id) => {
  const leadIdx = ZB.Store.data.leads.findIndex(l => l.id === id);
  if (leadIdx === -1) return;
  
  const lead = ZB.Store.data.leads[leadIdx];
  const newUser = {
    id: ZB.utils.generateId('U'),
    name: lead.name,
    email: lead.email,
    role: 'tenant',
    onboardedAt: new Date().toISOString()
  };

  ZB.Store.data.users.push(newUser);
  ZB.Store.data.leads.splice(leadIdx, 1);
  ZB.save();
  
  renderLeads();
  renderDirectory();
  alert(`${newUser.name} has been converted to a Tenant.`);
};

// Wait for the Core Engine
if (window.ZB) {
  initAdminUI();
} else {
  document.addEventListener('ZB_READY', initAdminUI);
}
