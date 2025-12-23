/**
 * Z-Bridges PMS - Core Application Logic
 * Architecture: Zero-Cost MPA (Multi-Page Application)
 * Backend: Firebase (Auth, Firestore)
 * * SIKLAB NOTE: This file acts as the central nervous system. 
 * It is imported as a module in every HTML file.
 */

// Import Firebase SDKs (Using CDN for Zero-Cost/No-Build setup)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, 
    doc, 
    getDoc 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// --- CONFIGURATION ---
// Based on Z-Bridges PMS Report ID: 1:60852657304:web:15b5eb4cb417efbde4c4ed
const firebaseConfig = {
    apiKey: "AIzaSyBZLVvtDE6_bK_Hiv9fyXhEIEDdeuP5stQ",
    authDomain: "zero-cost-pms.firebaseapp.com",
    projectId: "zero-cost-pms",
    storageBucket: "zero-cost-pms.firebasestorage.app",
    messagingSenderId: "60852657304", // Inferred from App ID
    appId: "1:60852657304:web:15b5eb4cb417efbde4c4ed"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

/**
 * CORE STATE MANAGEMENT
 * Simple store pattern to manage UI state
 */
const store = {
    user: null,
    userRole: null,
    isLoading: true
};

/**
 * AUTHENTICATION FUNCTIONS
 */

// Login Function
export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Fetch user profile to get role (assuming 'roles' collection exists)
        // For prototype, we can infer role from email or claims.
        // SIKLAB OPTIMIZATION: Using a simple Firestore lookup for role.
        const role = await getUserRole(user.uid);
        
        console.log("Login Successful:", user.email, "Role:", role);
        
        // Redirect based on role
        if (role === 'admin' || role === 'manager') {
            window.location.href = 'manager.html';
        } else {
            window.location.href = 'portal.html';
        }
        return { success: true };
    } catch (error) {
        console.error("Login Error:", error.code, error.message);
        return { success: false, message: formatErrorMessage(error.code) };
    }
}

// Logout Function
export async function logoutUser() {
    try {
        await signOut(auth);
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Logout Error:", error);
    }
}

// Helper: Get User Role (Mock implementation for now if Firestore isn't populated)
async function getUserRole(uid) {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (userDoc.exists()) {
            return userDoc.data().role;
        } else {
            // Default fallback for prototype phase
            return 'user'; 
        }
    } catch (e) {
        console.warn("Role fetch failed, defaulting to user.", e);
        return 'user';
    }
}

// Helper: Format Firebase Error Codes
function formatErrorMessage(code) {
    switch (code) {
        case 'auth/invalid-credential':
            return "Invalid email or password.";
        case 'auth/user-not-found':
            return "No user found with this email.";
        case 'auth/wrong-password':
            return "Incorrect password.";
        case 'auth/too-many-requests':
            return "Too many attempts. Try again later.";
        default:
            return "An unexpected error occurred.";
    }
}

/**
 * AUTH GUARD
 * Protects pages from unauthorized access.
 * Usage: Call app.authGuard('admin') at the top of protected pages.
 */
export function authGuard(requiredRole = null) {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            // No user? Go to login.
            console.warn("Access Denied: No User");
            window.location.href = 'login.html';
        } else {
            // User exists, check role if necessary
            store.user = user;
            if (requiredRole) {
                // In a real app, we await the role fetch here.
                // For speed in this prototype, we might skip strict RBAC on client side
                // and rely on Firestore security rules.
                // But let's do a basic check:
                const role = await getUserRole(user.uid);
                if (requiredRole === 'admin' && role !== 'admin' && role !== 'manager') {
                     console.warn("Access Denied: Insufficient Permissions");
                     window.location.href = 'portal.html'; // Demote to portal
                }
            }
            // If we get here, access is granted.
            // Initialize Page specific logic
            document.body.classList.remove('hidden'); // Show body (prevent flash of unauth content)
            initPageLogic(); 
        }
    });
}

// Generic Page Initializer
function initPageLogic() {
    const userDisplay = document.getElementById('user-display');
    if (userDisplay && store.user) {
        userDisplay.textContent = store.user.email;
    }
}

// Export auth to window for console debugging if needed
window.zBridges = { auth, loginUser, logoutUser };
