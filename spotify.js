/** * XCLIPSE // DYNAMIC UPLINK ENGINE v3.1
 * AUTHOR: THEKIDLEEROY.M
 */

const Spotify = {
    clientId: 'ee9cf7fe920d4280804730690b3fb4e8',
    redirectUri: 'https://xclipsestudio.xclipsenetworks.com.au/callback',

    // THE FIX: Total System Purge & Fresh Handshake
    relink: async function() {
        console.log("SYSTEM_PURGE: Clearing all session data...");
        
        // 1. Wipe everything
        localStorage.clear(); 
        
        // 2. Generate NEW security keys immediately
        const verifier = Array.from(crypto.getRandomValues(new Uint8Array(64)))
            .map(x => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[x % 62]).join('');
        const hashed = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
        const challenge = btoa(String.fromCharCode.apply(null, new Uint8Array(hashed)))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        
        // 3. Save the NEW verifier before we leave
        localStorage.setItem('code_verifier', verifier);

        // 4. Determine return path
        const origin = window.location.pathname.split("/").pop() || 'hmm.html';

        const params = new URLSearchParams({
            response_type: 'code',
            client_id: this.clientId,
            scope: 'user-read-currently-playing user-modify-playback-state',
            redirect_uri: this.redirectUri,
            code_challenge_method: 'S256',
            code_challenge: challenge,
            state: origin
        });

        // 5. Force Redirect
        window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
    },

    // Standard Auth (used for first-time login)
    auth: function() {
        this.relink(); // Reuse the relink logic to ensure it's always a clean start
    },

    sync: async function(callback) {
        const token = localStorage.getItem('sp_access_token');
        if (!token) return false;

        try {
            const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401) { 
                console.warn("TOKEN_EXPIRED: Auto-Relinking...");
                this.relink(); 
                return false; 
            }
            
            if (res.status === 204) return false; // Nothing playing

            const data = await res.json();
            if (callback) callback(data);
            return true;
        } catch (e) { 
            return false; 
        }
    }
};
