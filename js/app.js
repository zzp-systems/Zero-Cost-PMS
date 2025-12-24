// Z-Bridges PMS - Core Logic Engine
// Mode: Adaptive (Auto-switches between Firebase and LocalStorage)

export const Store = {
  data: {
    leads: [],
    users: [],
    tickets: [],
    ledger: []
  },
  mode: 'local', // defaults to 'local' until config is found
  user: null
};

// --- Initialization Cycle ---

async function tryLoadConfig() {
  try {
    // Dynamic import allows the app to survive if config.js is missing
    const cfg = await import('./config.js');
    if (cfg && cfg.FIREBASE_CONFIG && cfg.FIREBASE_CONFIG.apiKey !== "REPLACE_WITH_YOUR_API_KEY") {
      return cfg.FIREBASE_CONFIG;
    }
    console.warn('Z-Bridges: config.js found but contains placeholder values. Using Local Mode.');
    return null;
  } catch (err) {
    console.info('Z-Bridges: No config.js found. Operating in Zero-Cost Local Prototype Mode.');
    return null;
  }
}

async function initApp() {
  const firebaseConfig = await tryLoadConfig();

  if (firebaseConfig) {
    initFirebase(firebaseConfig);
    Store.mode = 'firebase';
    console.log('✅ Z-Bridges: Firebase Mode Activated');
  } else {
    Store.mode = 'local';
    console.log('⚠️ Z-Bridges: Local Storage Mode Activated');
  }

  loadFromStorage();
  exposeGlobalAPI();
  
  // Signal to UI scripts that the engine is running
  document.dispatchEvent(new Event('ZB_READY'));
}

// --- Data Layer ---

function initFirebase(firebaseConfig) {
  // Lazy load Firebase SDKs to keep initial bundle size small (Zero-Cost Optimization)
  import('https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js')
    .then(({ initializeApp }) => {
      const app = initializeApp(firebaseConfig);
      // Initialize other services (Auth, Firestore) here as needed
    })
    .catch(err => console.error('Firebase Init Error:', err));
}

function loadFromStorage() {
  const raw = localStorage.getItem('ZB_STORE');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      Object.assign(Store.data, parsed);
    } catch (e) {
      console.error('Data Corruption Error:', e);
    }
  } else {
    seedDemoData();
  }
}

function saveToStorage() {
  if (Store.mode === 'local') {
    localStorage.setItem('ZB_STORE', JSON.stringify(Store.data));
  } else {
    console.log('Syncing to Firebase... (Implementation pending)');
  }
}

function seedDemoData() {
  Store.data.leads = [
    { id: 'L1', name: 'Demo Lead', email: 'prospect@example.com', propertyId: 'P1', status: 'new' }
  ];
  Store.data.ledger = [
    { id: 'TX1', description: 'Initial Deposit', amount: 500, type: 'credit', date: new Date().toISOString() }
  ];
  saveToStorage();
}

// --- Access Control ---

function requireAuth(roleRequired = null) {
  // In a real app, check Firebase Auth state here.
  // For prototype/local: check sessionStorage.
  const session = sessionStorage.getItem('ZB_USER');
  
  if (!session) {
    window.location.href = 'login.html';
    return false;
  }

  if (roleRequired) {
    const user = JSON.parse(session);
    if (user.role !== roleRequired && user.role !== 'admin') {
      alert('Access Denied: Insufficient Privileges');
      window.location.href = 'portal.html';
      return false;
    }
  }
  return true;
}

// --- Global API (The Bridge) ---

function exposeGlobalAPI() {
  window.ZB = {
    Store,
    save: saveToStorage,
    requireAuth,
    utils: {
      formatCurrency: (n) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(n),
      generateId: (prefix) => prefix + Date.now().toString(36)
    }
  };
}

// Boot the system
window.addEventListener('DOMContentLoaded', initApp);
