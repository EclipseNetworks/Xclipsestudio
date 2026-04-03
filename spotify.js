/** * XCLIPSE // DYNAMIC UPLINK ENGINE v2.5.1
 * Features: User-Auth, Intelligent Auto-Sync, UI Data Mapping, Volume Control, & History
 */

const Spotify = {
    token: localStorage.getItem('sp_access_token') || "",
    isPlaying: false,
    progress: 0,
    timeLeft: 0,
    currentVolume: 50,
    lastTrackId: null,

    // Helper for API communication
    getHeaders: function() {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    },

    // Main Data Sync
    sync: async function() {
        if (!this.token) return;

        try {
            const res = await fetch('https://api.spotify.com/v1/me/player', {
                headers: this.getHeaders()
            });

            if (res.status === 204) {
                this.updateUIOffline();
                return;
            }

            if (res.status === 200) {
                const data = await res.json();
                
                // 1. Logic for Track Changes
                if (data.item.id !== this.lastTrackId) {
                    this.lastTrackId = data.item.id;
                    console.log(`NEW_TRACK_DETECTED: ${data.item.name}`);
                }

                // 2. Calculate Timings
                this.isPlaying = data.is_playing;
                this.progress = (data.progress_ms / data.item.duration_ms) * 100;
                this.timeLeft = data.item.duration_ms - data.progress_ms;
                this.currentVolume = data.device.volume_percent;

                // 3. Update UI Elements
                this.updateUI(data);
                
            } else if (res.status === 401) {
                console.warn("AUTH_EXPIRED: RE-LINK REQUIRED");
                // Optional: Trigger refresh token logic here
            }
        } catch (e) {
            console.error("UPLINK_CRITICAL_FAILURE", e);
        }
    },

    updateUI: function(data) {
        const trackTitle = document.getElementById('track-title') || document.getElementById('track-name');
        const artistName = document.getElementById('artist-name');
        const mainArt = document.getElementById('main-art') || document.getElementById('main-cover');
        
        if (trackTitle) trackTitle.innerText = data.item.name.toUpperCase();
        if (artistName) artistName.innerText = data.item.artists[0].name.toUpperCase();
        
        if (data.item.album.images[0] && mainArt) {
            const artUrl = data.item.album.images[0].url;
            mainArt.src = artUrl;
            const blurBg = document.getElementById('blur-bg');
            if (blurBg) blurBg.style.backgroundImage = `url("${artUrl}")`;
        }
        
        document.documentElement.style.setProperty('--progress', this.progress + "%");
        
        const ppBtn = document.getElementById('play-pause-btn');
        if (ppBtn) ppBtn.innerText = this.isPlaying ? "PAUSE" : "PLAY";
    },

    updateUIOffline: function() {
        console.log("PLAYER_IDLE");
        const trackTitle = document.getElementById('track-title') || document.getElementById('track-name');
        if (trackTitle) trackTitle.innerText = "SYSTEM_IDLE";
    },

    // Playback Controls
    cmd: async function(type) {
        if (!this.token) return;

        let endpoint = `https://api.spotify.com/v1/me/player/${type}`;
        let method = (type === 'next' || type === 'previous') ? 'POST' : 'PUT';

        if (type === 'toggle') {
            endpoint = `https://api.spotify.com/v1/me/player/${this.isPlaying ? 'pause' : 'play'}`;
            method = 'PUT';
        }

        try {
            const res = await fetch(endpoint, { method: method, headers: this.getHeaders() });
            if (res.ok) {
                setTimeout(() => this.sync(), 400);
            } else {
                console.error("CMD_FAILED", res.status);
            }
        } catch (e) {
            console.error("EXECUTION_ERROR", e);
        }
    },

    // NEW: Volume Control (0 - 100)
    setVolume: async function(percent) {
        try {
            await fetch(`https://api.spotify.com/v1/me/player/volume?volume_percent=${percent}`, {
                method: 'PUT',
                headers: this.getHeaders()
            });
            this.currentVolume = percent;
        } catch (e) {
            console.error("VOLUME_ADJUST_ERROR", e);
        }
    },

    // NEW: Fetch Recently Played
    getHistory: async function() {
        try {
            const res = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=5', {
                headers: this.getHeaders()
            });
            const data = await res.json();
            console.log("RECENT_HISTORY_SYNCED", data.items);
            return data.items;
        } catch (e) {
            console.error("HISTORY_FETCH_ERROR", e);
        }
    }
};

window.Spotify = Spotify;