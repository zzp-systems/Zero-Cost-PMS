/**
 * Z-BRIDGES ZERO-COST PMS - CORE ENGINE
 * Shared logic for Auth, Database, and State Management.
 */

// --- CONFIGURATION ---
const APP_CONFIG = {
    roles: ['admin', 'tenant', 'owner', 'vendor'],
    routes: {
        admin: 'manager.html',
        tenant: 'portal.html',
        owner: 'portal.html',
        vendor: 'portal.html',
        public: 'index.html',
        login: 'login.html'
    }
};

// --- 0. CLOUD & HYBRID INFRASTRUCTURE ---
const Infrastructure = {
    mode: 'local', // 'local' or 'cloud'
    db: null,
    gasUrl: localStorage.getItem('z-bridgesGAS') || '',

    init() {
        // Specific Configuration for Z-Bridges PMS
        const firebaseConfig = {
            apiKey: "AIzaSyBZLVvtDE6_bK_Hiv9fyXhEIEDdeuP5stQ",
            authDomain: "zero-cost-pms.firebaseapp.com",
            projectId: "zero-cost-pms",
            storageBucket: "zero-cost-pms.firebasestorage.app",
            messagingSenderId: "60852657304",
            appId: "1:60852657304:web:15b5eb4cb417efbde4c4ed",
            measurementId: "G-0S0M9KKE6G"
        };

        if (typeof firebase !== 'undefined') {
            try {
                if (!firebase.apps.length) {
                    const app = firebase.initializeApp(firebaseConfig);
                    this.db = firebase.firestore();
                    this.mode = 'cloud';
                    console.log("Z-Bridges: Firebase Connected (zero-cost-pms)");
                    
                    // Analytics initialization (Optional, only if SDK is present)
                    if (firebase.analytics) {
                        firebase.analytics();
                    }
                }
            } catch (e) {
                console.error("Firebase Init Failed:", e);
                this.mode = 'local';
            }
        }
        this.updateStatusUI();
    },

    updateStatusUI() {
        const badge = document.getElementById('db-status');
        if(badge) {
            if(this.mode === 'cloud') {
                badge.innerHTML = '<i class="fas fa-cloud"></i> Firebase Live';
                badge.className = "px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-700 border border-green-200";
            } else {
                badge.innerHTML = '<i class="fas fa-hdd"></i> Local Storage';
                badge.className = "px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-500 border border-slate-200";
            }
        }
    },

    saveCloudConfig(configStr) {
        // Deprecated: Config is now hardcoded, but kept for GAS URL
        console.log("Config is hardcoded.");
    },

    reset() {
        localStorage.removeItem('z-bridgesFirebaseConfig'); // Cleanup old config
        location.reload();
    }
};

// --- 1. CORE DATA STORE ---
const Store = {
    data: {
        properties: [
            { id: 1, name: 'Sunset Villa Unit A', address: '123 Sunset Blvd', type: 'Apartment', rent: 1200, status: 'Occupied', ownerId: 101 },
            { id: 2, name: 'Oak Street House', address: '1024 Oak St', type: 'House', rent: 2400, status: 'Vacant', ownerId: 102 },
            { id: 3, name: 'TechHub Office 5', address: '500 Main St', type: 'Commercial', rent: 4500, status: 'Occupied', ownerId: 101 }
        ],
        users: [
            { id: 1, name: 'Admin User', role: 'admin', email: 'admin@z-bridges.com', password: 'admin' },
            { id: 2, name: 'Alice Tenant', role: 'tenant', email: 'alice@mail.com', password: 'user', propertyId: 1 },
            { id: 3, name: 'Bob Owner', role: 'owner', email: 'bob@investor.com', password: 'user', properties: [1, 3] },
            { id: 4, name: 'FixIt Vendor', role: 'vendor', email: 'fix@repair.com', password: 'user', skill: 'Plumbing' }
        ],
        leads: [],
        tickets: [],
        ledger: [],
        listings: [],
        kb: [
            { id: 1, title: 'How to Pay Rent Online', category: 'Tenant', content: 'Go to the Finance tab...' },
            { id: 2, title: 'Emergency Maintenance', category: 'Employee', content: 'Call 911 for fire...' }
        ]
    },
    
    async init() {
        Infrastructure.init();
        if (Infrastructure.mode === 'local') {
            const stored = localStorage.getItem('z-bridgesERP');
            if (stored) this.data = JSON.parse(stored);
            else this.saveLocal();
        } else {
            // In a real app, you'd fetch specific collections here
            console.log("Cloud Mode Active: Fetching data...");
        }
    },

    saveLocal() {
        localStorage.setItem('z-bridgesERP', JSON.stringify(this.data));
    },

    // Generic Add
    async add(collection, item) {
        item.id = Date.now();
        if(Infrastructure.mode === 'local') {
            if(!this.data[collection]) this.data[collection] = [];
            this.data[collection].push(item);
            this.saveLocal();
        } else {
            try {
                await Infrastructure.db.collection(collection).add(item);
                if(!this.data[collection]) this.data[collection] = [];
                this.data[collection].push(item); // Optimistic UI update
            } catch(e) { console.error(e); }
        }
        return item;
    }
};

// --- 2. AUTHENTICATION ---
const Auth = {
    currentUser: null,

    // Check if user is allowed on this page
    guard(requiredRole) {
        const session = sessionStorage.getItem('z-bridgesSession');
        if (!session) {
            window.location.href = APP_CONFIG.routes.login;
            return;
        }
        
        this.currentUser = JSON.parse(session);
        
        // Simple Role Guard
        if (requiredRole === 'admin' && this.currentUser.role !== 'admin') {
            alert("Access Denied: Admins Only");
            window.location.href = APP_CONFIG.routes.tenant; // Fallback
        }
    },

    login(email, password) {
        // 1. Simulate Auth (Replace with Firebase Auth in prod)
        const user = Store.data.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            sessionStorage.setItem('z-bridgesSession', JSON.stringify(user));
            // Redirect
            if (user.role === 'admin') window.location.href = APP_CONFIG.routes.admin;
            else window.location.href = APP_CONFIG.routes.tenant; // Portals share one file
        } else {
            alert("Invalid credentials. Try admin@z-bridges.com / admin");
        }
    },

    logout() {
        sessionStorage.removeItem('z-bridgesSession');
        window.location.href = APP_CONFIG.routes.login;
    },
    
    // Helper to get initials
    getInitials() {
        return this.currentUser ? this.currentUser.name.match(/\b(\w)/g).join('') : '??';
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    Store.init();
});
