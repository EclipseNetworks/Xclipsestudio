/**
 * XCLIPSE STUDIO | GLOBAL NETWORK CORE v2.0.26
 * Centralized State Management & Security Firewall
 */

// 1. GLOBAL CONFIGURATION (Ensure this matches your Firebase Console)
const firebaseConfig = {
    apiKey: "AIzaSyCdv6yESBrKhlEvU2URCXoVRVO-2OjAEv4",
    authDomain: "xclipse-security.firebaseapp.com",
    databaseURL: "https://xclipse-security-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "xclipse-security",
    storageBucket: "xclipse-security.firebasestorage.app",
    messagingSenderId: "161353959200",
    appId: "1:161353959200:web:d0b36f7817b31842cff945"
};

// Initialize Firebase if not already initialized
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const networkDB = firebase.database();

// 2. GLOBAL NETWORK NODES
const nodes = {
    security: networkDB.ref('network/security_shield'),
    blacklist: networkDB.ref('network/blacklist'),
    broadcast: networkDB.ref('network/global_marquee'),
    logs: networkDB.ref('system_logs')
};

// 3. THE FIREWALL (Runs on every page load)
async function initGlobalFirewall() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        const userIP = data.ip.replace(/\./g, '-');

        // Listen for Real-time IP Blacklisting
        nodes.blacklist.child(userIP).on('value', (snap) => {
            if (snap.val()) {
                document.body.innerHTML = `
                    <div style="background:#000;color:#ff4444;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;font-family:monospace;text-align:center;padding:20px;">
                        <h1 style="letter-spacing:10px;">ACCESS_DENIED</h1>
                        <p style="opacity:0.5;font-size:10px;margin-top:20px;">IP_BLACKLISTED: ${data.ip}<br>XCLIPSE SECURITY PROTOCOL ACTIVE</p>
                    </div>`;
                window.stop(); // Stop all other scripts
            }
        });

        // Log the visit to your master access log (Optional)
        networkDB.ref(`network/traffic/${userIP}`).update({
            last_active: Date.now(),
            current_page: window.location.pathname,
            user_agent: navigator.userAgent
        });

    } catch (e) {
        console.warn("Firewall Uplink Delayed...");
    }
}

// 4. GLOBAL UI SYNCHRONIZATION
function initNetworkSync() {
    // Sync Security Badge (if it exists on the page)
    nodes.security.on('value', (snap) => {
        const status = snap.val() || 'Active';
        const badge = document.getElementById('security-badge');
        if (badge) {
            badge.innerText = `Shield: ${status}`;
            badge.style.color = status === 'Active' ? '#22c55e' : '#ef4444';
        }
    });

    // Sync Global Marquee (if it exists on the page)
    nodes.broadcast.on('value', (snap) => {
        const marquee = document.getElementById('global-marquee');
        if (marquee) marquee.innerText = snap.val() || "XCLIPSE STUDIO // SECURE NETWORK";
    });
}

// 5. GLOBAL AUTHENTICATION CHECK
function isAuthorized() {
    return sessionStorage.getItem('xclipse_auth') === 'true';
}

// Launch Core
initGlobalFirewall();
initNetworkSync();