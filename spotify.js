/** * GITHUB AUTO-DEPLOY ENGINE
 * Checks for new commits and refreshes the OS
 */
const GitHubSync = {
    repo: 'EclipseNetworks/Xclipsestudio', // e.g., 'TheKidLeeroy/Xclipse-OS'
    lastCommit: null,

    checkUpdates: async function() {
        try {
            const response = await fetch(`https://api.github.com/repos/${this.repo}/commits/main`);
            const data = await response.json();
            const currentCommit = data.sha;

            if (this.lastCommit && this.lastCommit !== currentCommit) {
                console.log("NEW_UPDATE_DETECTED: Rebooting...");
                
                // Trigger a "Glitch" before refreshing for effect
                document.getElementById('glitch').style.opacity = '1';
                setTimeout(() => window.location.reload(), 1000);
            }
            this.lastCommit = currentCommit;
        } catch (e) {
            console.error("GITHUB_SYNC_ERROR", e);
        }
    },

    init: function() {
        // Check every 30 seconds
        setInterval(() => this.checkUpdates(), 30000);
        this.checkUpdates();
    }
};

// Start the observer
GitHubSync.init();
