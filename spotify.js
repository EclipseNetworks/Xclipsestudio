/** * XCLIPSE // DYNAMIC UPLINK ENGINE v2.7
 * AUTHOR: TheKidLeeroy.M
 */

const Spotify = {
    clientId: 'ee9cf7fe920d4280804730690b3fb4e8',
    redirectUri: 'https://xclipsestudio.xclipsenetworks.com.au/callback',

    // THE RELINK FIX
    relink: function() {
        console.log("SYSTEM_PURGE: Clearing Session...");
        // 1. Clear all possible token keys
        localStorage.removeItem('sp_access_token');
        localStorage.removeItem('sp_refresh_token');
        localStorage.removeItem('sp_expiry');
        localStorage.removeItem('code_verifier');
        localStorage.removeItem('spotify_token'); // clearing old version key just in case
        
        // 2. Short delay to ensure storage is clear, then trigger fresh auth
        setTimeout(() => {
            this.auth();
        }, 300);
    },

    auth: async function() {
        // Create a fresh security verifier
        const verifier = Array.from(crypto.getRandomValues(new Uint8Array(64)))
            .map(x => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[x % 62])
            .join('');
        
        // Hash it for Spotify PKCE
        const hashed = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
        const challenge = btoa(String.fromCharCode.apply(null, new Uint8Array(hashed)))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        
        // Save new verifier for the callback to use
        localStorage.setItem('code_verifier', verifier);

        // Determine where to send the user back to (hmm.html or spotify.html)
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

        window.location.href = `https://accounts.spotify.com/authorize?${params.toString()}`;
    },

    sync: async function(callback) {
        const token = localStorage.getItem('sp_access_token');
        if (!token) return;

        try {
            const res = await fetch('https://api.spotify.com/v1/me/player', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401) {
                // If token is dead, don't just stop, force a relink
                this.relink(); 
                return;
            }
            if (res.status === 204) return;

            const data = await res.json();
            if (callback) callback(data);
        } catch (e) { console.error("SYNC_ERR", e); }
    }
};
