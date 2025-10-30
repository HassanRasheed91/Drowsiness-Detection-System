class DrowsinessDetectionUI {
    constructor() {
        this.isRunning = false;
        this.sessionStartTime = null;
        this.sessionTimer = null;
        this.videoStream = null;
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
    }

    async startDetection() {
        try {
            this.addAlert('info', 'Starting drowsiness detection...');
            
            // Request camera access
            this.videoStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                    facingMode: 'user'
                }
            });
            
            this.videoElement.srcObject = this.videoStream;
            this.videoElement.play();
            
            // Update UI
            this.isRunning = true;
            this.startBtn.disabled = true;
            this.stopBtn.disabled = false;
            this.updateStatus('active', 'Detection Active');
            
            // Start session timer
            this.sessionStartTime = Date.now();
            this.startSessionTimer();
            
            // Start detection loop
            this.detectionLoop();
            
            this.addAlert('success', 'Drowsiness detection started successfully!');
            
        } catch (error) {
            console.error('Error starting detection:', error);
            this.addAlert('danger', 'Failed to start detection. Please check camera permissions.');
        }
    }

    stopDetection() {
        if (this.videoStream) {
            this.videoStream.getTracks().forEach(track => track.stop());
            this.videoStream = null;
        }
        
        this.isRunning = false;
        this.startBtn.disabled = false;
        this.stopBtn.disabled = true;
        this.updateStatus('ready', 'System Ready');
        
        // Stop session timer
        if (this.sessionTimer) {
            clearInterval(this.sessionTimer);
            this.sessionTimer = null;
        }
        
        this.addAlert('info', 'Drowsiness detection stopped.');
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

    detectionLoop() {
        if (!this.isRunning) return;
        
        // Simulate detection results (in real implementation, this would come from Python backend)
        this.simulateDetection();
        
        // Continue loop
        requestAnimationFrame(() => this.detectionLoop());
    }

    simulateDetection() {
        // Simulate EAR (Eye Aspect Ratio) - normally 0.2-0.3 for closed eyes
        const ear = 0.2 + Math.random() * 0.3;
        this.earValue.textContent = ear.toFixed(2);
        
        // Simulate yawn distance
        const yawnDistance = 15 + Math.random() * 25;
        this.yawnValue.textContent = yawnDistance.toFixed(1);
        
        // Update eye status
        if (ear < this.settings.earThreshold) {
            this.eyeStatus.textContent = 'Drowsy';
            this.eyeStatus.className = 'metric-value status-danger';
            this.addAlert('danger', 'Drowsiness detected! Please take a break.');
            this.playAlertSound();
        } else {
            this.eyeStatus.textContent = 'Normal';
            this.eyeStatus.className = 'metric-value status-normal';
        }
        
        // Update yawn status
        if (yawnDistance > this.settings.yawnThreshold) {
            this.yawnStatus.textContent = 'Yawning';
            this.yawnStatus.className = 'metric-value status-warning';
            this.addAlert('warning', 'Yawning detected. Consider taking a break.');
        } else {
            this.yawnStatus.textContent = 'Normal';
            this.yawnStatus.className = 'metric-value status-normal';
        }
    }

    addAlert(type, message) {
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
        // In a real implementation, this would play the selected alert sound
        console.log('Playing alert sound:', this.settings.alertSound);
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

    saveSettingsConfig() {
        this.settings.earThreshold = parseFloat(this.earThreshold.value);
        this.settings.yawnThreshold = parseInt(this.yawnThreshold.value);
        this.settings.alertSound = this.alertSound.value;
        
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