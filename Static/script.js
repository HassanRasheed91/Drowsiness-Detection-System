class DrowsinessDetectionUI {
    constructor() {
        this.isRunning = false;
        this.sessionStartTime = null;
        this.sessionTimer = null;
        this.metricsInterval = null;
        this.settings = {
            earThreshold: 0.3,
            yawnThreshold: 20,
            alertSound: 'Alert.wav'
        };
        
        this.initializeElements();
        this.bindEvents();
        this.loadSettings();
    }

    initializeElements() {
        // Video elements
        this.videoElement = document.getElementById('videoElement');
        this.canvasElement = document.getElementById('canvasElement');
        
        // Buttons
        this.startBtn = document.getElementById('startBtn');
        this.stopBtn = document.getElementById('stopBtn');
        this.settingsBtn = document.getElementById('settingsBtn');
        
        // Status and metrics
        this.statusIndicator = document.getElementById('statusIndicator');
        this.eyeStatus = document.getElementById('eyeStatus');
        this.yawnStatus = document.getElementById('yawnStatus');
        this.sessionTime = document.getElementById('sessionTime');
        this.earValue = document.getElementById('earValue');
        this.yawnValue = document.getElementById('yawnValue');
        
        // Alerts
        this.alertsContainer = document.getElementById('alertsContainer');
        
        // Settings modal
        this.settingsModal = document.getElementById('settingsModal');
        this.closeSettings = document.getElementById('closeSettings');
        this.saveSettings = document.getElementById('saveSettings');
        this.resetSettings = document.getElementById('resetSettings');
        
        // Settings inputs
        this.earThreshold = document.getElementById('earThreshold');
        this.yawnThreshold = document.getElementById('yawnThreshold');
        this.alertSound = document.getElementById('alertSound');
        this.earThresholdValue = document.getElementById('earThresholdValue');
        this.yawnThresholdValue = document.getElementById('yawnThresholdValue');
    }

    bindEvents() {
        // Control buttons
        this.startBtn.addEventListener('click', () => this.startDetection());
        this.stopBtn.addEventListener('click', () => this.stopDetection());
        this.settingsBtn.addEventListener('click', () => this.openSettings());
        
        // Settings modal
        this.closeSettings.addEventListener('click', () => this.closeSettingsModal());
        this.saveSettings.addEventListener('click', () => this.saveSettingsConfig());
        this.resetSettings.addEventListener('click', () => this.resetSettingsConfig());
        
        // Settings inputs
        this.earThreshold.addEventListener('input', (e) => {
            this.earThresholdValue.textContent = parseFloat(e.target.value).toFixed(2);
        });
        
        this.yawnThreshold.addEventListener('input', (e) => {
            this.yawnThresholdValue.textContent = e.target.value;
        });
        
        // Close modal on outside click
        this.settingsModal.addEventListener('click', (e) => {
            if (e.target === this.settingsModal) {
                this.closeSettingsModal();
            }
        });

        // Video element events
        this.videoElement.addEventListener('loadedmetadata', () => {
            console.log('Video metadata loaded');
        });

        this.videoElement.addEventListener('error', (e) => {
            console.error('Video error:', e);
            this.addAlert('danger', 'Error loading video stream');
        });
    }

    async startDetection() {
        try {
            this.addAlert('info', 'Starting drowsiness detection...');
            
            // Start backend detection
            const response = await fetch('/api/start_detection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                // Set video source to backend stream (for <img> tag)
                this.videoElement.src = '/video_feed';
                // No .play() for <img>
                
                // Update UI
                this.isRunning = true;
                this.startBtn.disabled = true;
                this.stopBtn.disabled = false;
                this.updateStatus('active', 'Detection Active');
                
                // Start session timer
                this.sessionStartTime = Date.now();
                this.startSessionTimer();
                
                // Start metrics polling
                this.startMetricsPolling();
                
                this.addAlert('success', 'Drowsiness detection started successfully!');
            } else {
                throw new Error(result.message);
            }
            
        } catch (error) {
            console.error('Error starting detection:', error);
            this.addAlert('danger', 'Failed to start detection. Please check camera permissions.');
        }
    }

    async stopDetection() {
        try {
            // Stop backend detection
            await fetch('/api/stop_detection', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            // Clear video element for <img>
            this.videoElement.src = '';
            
            this.isRunning = false;
            this.startBtn.disabled = false;
            this.stopBtn.disabled = true;
            this.updateStatus('ready', 'System Ready');
            
            // Stop session timer
            if (this.sessionTimer) {
                clearInterval(this.sessionTimer);
                this.sessionTimer = null;
            }
            
            // Stop metrics polling
            if (this.metricsInterval) {
                clearInterval(this.metricsInterval);
                this.metricsInterval = null;
            }
            
            this.addAlert('info', 'Drowsiness detection stopped.');
            
        } catch (error) {
            console.error('Error stopping detection:', error);
            this.addAlert('danger', 'Error stopping detection.');
        }
    }

    updateStatus(type, message) {
        const icon = this.statusIndicator.querySelector('i');
        const text = this.statusIndicator.querySelector('span');
        
        // Remove existing status classes
        icon.className = 'fas';
        this.statusIndicator.className = 'status-indicator';
        
        // Add new status
        switch (type) {
            case 'ready':
                icon.classList.add('fa-check-circle');
                this.statusIndicator.classList.add('status-normal');
                break;
            case 'active':
                icon.classList.add('fa-play-circle');
                this.statusIndicator.classList.add('status-normal');
                break;
            case 'warning':
                icon.classList.add('fa-exclamation-triangle');
                this.statusIndicator.classList.add('status-warning');
                break;
            case 'danger':
                icon.classList.add('fa-exclamation-circle');
                this.statusIndicator.classList.add('status-danger');
                break;
        }
        
        text.textContent = message;
    }

    startSessionTimer() {
        this.sessionTimer = setInterval(() => {
            if (this.sessionStartTime) {
                const elapsed = Date.now() - this.sessionStartTime;
                const minutes = Math.floor(elapsed / 60000);
                const seconds = Math.floor((elapsed % 60000) / 1000);
                this.sessionTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            }
        }, 1000);
    }

    startMetricsPolling() {
        this.metricsInterval = setInterval(async () => {
            if (!this.isRunning) return;
            
            try {
                const response = await fetch('/api/metrics');
                const metrics = await response.json();
                
                this.updateMetrics(metrics);
            } catch (error) {
                console.error('Error fetching metrics:', error);
            }
        }, 1000); // Poll every second
    }

    updateMetrics(metrics) {
        // Update EAR value
        this.earValue.textContent = metrics.ear.toFixed(2);
        
        // Update yawn distance
        this.yawnValue.textContent = metrics.yawn_distance.toFixed(1);
        
        // Update eye status
        this.eyeStatus.textContent = metrics.eye_status;
        this.eyeStatus.className = `metric-value ${this.getStatusClass(metrics.eye_status)}`;
        
        // Update yawn status
        this.yawnStatus.textContent = metrics.yawn_status;
        this.yawnStatus.className = `metric-value ${this.getStatusClass(metrics.yawn_status)}`;
        
        // Handle alerts based on status
        if (metrics.eye_status === 'Drowsy') {
            this.addAlert('danger', 'Drowsiness detected! Please take a break.');
            this.playAlertSound();
        } else if (metrics.yawn_status === 'Yawning') {
            this.addAlert('warning', 'Yawning detected. Consider taking a break.');
        }
        
        // Update status indicator if no face detected
        if (!metrics.face_detected) {
            this.updateStatus('warning', 'No Face Detected');
        } else if (metrics.eye_status === 'Drowsy') {
            this.updateStatus('danger', 'Drowsiness Alert!');
        } else if (metrics.yawn_status === 'Yawning') {
            this.updateStatus('warning', 'Yawning Detected');
        } else {
            this.updateStatus('active', 'Detection Active');
        }
    }

    getStatusClass(status) {
        switch (status) {
            case 'Normal':
                return 'status-normal';
            case 'Warning':
                return 'status-warning';
            case 'Drowsy':
            case 'Yawning':
                return 'status-danger';
            case 'No Face':
                return 'status-warning';
            default:
                return 'status-normal';
        }
    }

    addAlert(type, message) {
        // Check if alert already exists to avoid duplicates
        const existingAlerts = this.alertsContainer.querySelectorAll('.alert-item');
        for (let alert of existingAlerts) {
            if (alert.textContent.includes(message)) {
                return; // Alert already exists
            }
        }
        
        const alertItem = document.createElement('div');
        alertItem.className = `alert-item ${type}`;
        alertItem.innerHTML = `
            <i class="fas fa-${this.getAlertIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        this.alertsContainer.appendChild(alertItem);
        
        // Remove old alerts if too many
        const alerts = this.alertsContainer.querySelectorAll('.alert-item');
        if (alerts.length > 5) {
            alerts[0].remove();
        }
        
        // Auto-remove info alerts after 5 seconds
        if (type === 'info') {
            setTimeout(() => {
                if (alertItem.parentNode) {
                    alertItem.remove();
                }
            }, 5000);
        }
    }

    getAlertIcon(type) {
        switch (type) {
            case 'info': return 'info-circle';
            case 'success': return 'check-circle';
            case 'warning': return 'exclamation-triangle';
            case 'danger': return 'exclamation-circle';
            default: return 'info-circle';
        }
    }

    playAlertSound() {
        console.log('Playing alert sound:', this.settings.alertSound);
        
        // Create audio element and play sound
        const audio = new Audio(`/static/sounds/${this.settings.alertSound}`);
        audio.play().catch(e => console.log('Could not play alert sound:', e));
    }

    openSettings() {
        this.settingsModal.style.display = 'block';
        
        // Set current values
        this.earThreshold.value = this.settings.earThreshold;
        this.earThresholdValue.textContent = this.settings.earThreshold.toFixed(2);
        this.yawnThreshold.value = this.settings.yawnThreshold;
        this.yawnThresholdValue.textContent = this.settings.yawnThreshold;
        this.alertSound.value = this.settings.alertSound;
    }

    closeSettingsModal() {
        this.settingsModal.style.display = 'none';
    }

    async saveSettingsConfig() {
        this.settings.earThreshold = parseFloat(this.earThreshold.value);
        this.settings.yawnThreshold = parseInt(this.yawnThreshold.value);
        this.settings.alertSound = this.alertSound.value;
        
        // Save to backend
        try {
            await fetch('/api/settings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.settings)
            });
        } catch (error) {
            console.error('Error saving settings:', error);
        }
        
        localStorage.setItem('drowsinessSettings', JSON.stringify(this.settings));
        this.addAlert('success', 'Settings saved successfully!');
        this.closeSettingsModal();
    }

    resetSettingsConfig() {
        this.settings = {
            earThreshold: 0.3,
            yawnThreshold: 20,
            alertSound: 'Alert.wav'
        };
        
        this.earThreshold.value = this.settings.earThreshold;
        this.earThresholdValue.textContent = this.settings.earThreshold.toFixed(2);
        this.yawnThreshold.value = this.settings.yawnThreshold;
        this.yawnThresholdValue.textContent = this.settings.yawnThreshold;
        this.alertSound.value = this.settings.alertSound;
        
        localStorage.removeItem('drowsinessSettings');
        this.addAlert('info', 'Settings reset to default values.');
    }

    loadSettings() {
        const savedSettings = localStorage.getItem('drowsinessSettings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DrowsinessDetectionUI();
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Page hidden - pausing detection');
    } else {
        console.log('Page visible - resuming detection');
    }
}); 