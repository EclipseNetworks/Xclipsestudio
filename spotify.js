/** * XCLIPSE // DYNAMIC UPLINK ENGINE v3.0
 * AUTHOR: TheKidLeeroy.M
 */

const Spotify = {
    clientId: 'ee9cf7fe920d4280804730690b3fb4e8',
    redirectUri: 'https://xclipsestudio.xclipsenetworks.com.au/callback',

    // Standardized Storage Key
    getToken: () => localStorage.getItem('sp_access_token'),

    relink: function() {
        localStorage.removeItem('sp_access_token');
        localStorage.removeItem('sp_expiry');
        localStorage.removeItem('code_verifier');
        console.log("SYSTEM_PURGE: Session Terminated.");
        setTimeout(() => this.auth(), 300);
    },

    auth: async function() {
        const verifier = Array.from(crypto.getRandomValues(new Uint8Array(64)))
            .map(x => 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'[x % 62]).join('');
        const hashed = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
        const challenge = btoa(String.fromCharCode.apply(null, new Uint8Array(hashed)))
            .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
        
        localStorage.setItem('code_verifier', verifier);
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
        const token = this.getToken();
        if (!token) return false;

        try {
            const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.status === 401) { this.relink(); return false; }
            if (res.status === 204) return false;

            const data = await res.json();
            if (callback) callback(data);
            return true;
        } catch (e) { return false; }
    }
};
