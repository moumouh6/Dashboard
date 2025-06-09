// Pomodoro timer functionality

class PomodoroTimer {
    constructor() {
        this.timerTime = document.getElementById('timer-time');
        this.timerMode = document.getElementById('timer-mode');
        this.startButton = document.getElementById('start-timer');
        this.pauseButton = document.getElementById('pause-timer');
        this.resetButton = document.getElementById('reset-timer');
        this.progressCircle = document.querySelector('.progress-ring-circle');
        this.sessionsToday = document.getElementById('sessions-today');
        
        this.isRunning = false;
        this.isPaused = false;
        this.timeLeft = 25 * 60; // 25 minutes in seconds
        this.totalTime = 25 * 60;
        this.timerInterval = null;
        this.completedSessions = this.loadCompletedSessions();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay();
        this.updateProgress();
        this.updateSessionsDisplay();
        this.requestNotificationPermission();
    }

    setupEventListeners() {
        if (this.startButton) {
            this.startButton.addEventListener('click', () => {
                this.startTimer();
            });
        }

        if (this.pauseButton) {
            this.pauseButton.addEventListener('click', () => {
                this.pauseTimer();
            });
        }

        if (this.resetButton) {
            this.resetButton.addEventListener('click', () => {
                this.resetTimer();
            });
        }

        if (this.timerMode) {
            this.timerMode.addEventListener('change', () => {
                this.changeMode();
            });
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case ' ':
                        e.preventDefault();
                        this.isRunning ? this.pauseTimer() : this.startTimer();
                        break;
                    case 'r':
                        e.preventDefault();
                        this.resetTimer();
                        break;
                }
            }
        });
    }

    async requestNotificationPermission() {
        await Utils.requestNotificationPermission();
    }

    startTimer() {
        if (this.isPaused) {
            this.isPaused = false;
        }
        
        this.isRunning = true;
        this.updateButtonStates();
        
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            this.updateProgress();
            
            if (this.timeLeft <= 0) {
                this.timerComplete();
            }
        }, 1000);
    }

    pauseTimer() {
        this.isRunning = false;
        this.isPaused = true;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        this.updateButtonStates();
    }

    resetTimer() {
        this.isRunning = false;
        this.isPaused = false;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        const selectedMinutes = parseInt(this.timerMode?.value || 25);
        this.timeLeft = selectedMinutes * 60;
        this.totalTime = selectedMinutes * 60;
        
        this.updateDisplay();
        this.updateProgress();
        this.updateButtonStates();
    }

    changeMode() {
        if (!this.isRunning) {
            this.resetTimer();
        }
    }

    timerComplete() {
        this.isRunning = false;
        this.isPaused = false;
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        // Count completed session
        const currentMode = parseInt(this.timerMode?.value || 25);
        if (currentMode === 25 || currentMode === 45) { // Work sessions
            this.completedSessions++;
            this.saveCompletedSessions();
            this.updateSessionsDisplay();
        }
        
        this.updateButtonStates();
        this.showCompletionNotification();
        this.playCompletionSound();
        this.showCompletionAnimation();
        
        // Auto-switch to break if it was a work session
        if (currentMode === 25) { // Work session completed
            // Switch to short break
            if (this.timerMode) {
                this.timerMode.value = '5';
                this.resetTimer();
            }
        } else if (currentMode === 45) { // Deep work completed
            // Switch to long break
            if (this.timerMode) {
                this.timerMode.value = '15';
                this.resetTimer();
            }
        }
    }

    updateDisplay() {
        if (!this.timerTime) return;
        
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        
        this.timerTime.textContent = `${Utils.formatTime(minutes)}:${Utils.formatTime(seconds)}`;
        
        // Update document title with timer
        if (this.isRunning) {
            document.title = `${this.timerTime.textContent} - Productivity Dashboard`;
        } else {
            document.title = 'Productivity Dashboard';
        }
        
        // Change color based on time remaining
        if (this.timeLeft <= 60 && this.isRunning) { // Last minute
            this.timerTime.style.color = 'var(--error-color)';
        } else if (this.timeLeft <= 300 && this.isRunning) { // Last 5 minutes
            this.timerTime.style.color = 'var(--warning-color)';
        } else {
            this.timerTime.style.color = 'var(--text-primary)';
        }
    }

    updateProgress() {
        if (!this.progressCircle) return;
        
        const progress = (this.totalTime - this.timeLeft) / this.totalTime;
        const circumference = 2 * Math.PI * 54; // radius = 54
        const strokeDashoffset = circumference - (progress * circumference);
        
        this.progressCircle.style.strokeDashoffset = strokeDashoffset;
        
        // Change color based on mode
        const currentMode = parseInt(this.timerMode?.value || 25);
        if (currentMode === 25 || currentMode === 45) {
            this.progressCircle.style.stroke = 'var(--primary-color)';
        } else {
            this.progressCircle.style.stroke = 'var(--success-color)';
        }
    }

    updateButtonStates() {
        if (this.startButton) {
            this.startButton.disabled = this.isRunning;
            this.startButton.style.opacity = this.isRunning ? '0.5' : '1';
            this.startButton.textContent = this.isPaused ? 'Resume' : 'Start';
        }
        
        if (this.pauseButton) {
            this.pauseButton.disabled = !this.isRunning;
            this.pauseButton.style.opacity = this.isRunning ? '1' : '0.5';
        }
        
        if (this.resetButton) {
            this.resetButton.disabled = false;
            this.resetButton.style.opacity = '1';
        }
    }

    updateSessionsDisplay() {
        if (this.sessionsToday) {
            this.sessionsToday.textContent = this.completedSessions;
        }
    }

    showCompletionNotification() {
        const currentMode = parseInt(this.timerMode?.value || 25);
        const isWorkSession = currentMode === 25 || currentMode === 45;
        
        const title = isWorkSession ? '🎉 Focus Session Complete!' : '☕ Break Time Over!';
        const message = isWorkSession ? 
            'Great job! Time for a well-deserved break.' : 
            'Break time is over. Ready to get back to work?';
        
        Utils.showNotification(title, {
            body: message,
            tag: 'pomodoro-timer'
        });
        
        // Also show in-app notification
        this.showInAppNotification(title, message);
    }

    showInAppNotification(title, message) {
        const notification = document.createElement('div');
        notification.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 8px;">${title}</div>
            <div>${message}</div>
        `;
        notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            color: var(--text-primary);
            padding: 24px;
            border-radius: 16px;
            font-size: 16px;
            z-index: 2000;
            text-align: center;
            min-width: 300px;
            animation: scaleIn 0.3s ease;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'scaleOut 0.3s ease forwards';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    playCompletionSound() {
        // Create a simple beep sound using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('Audio not supported');
        }
    }

    showCompletionAnimation() {
        const timerWidget = document.querySelector('.timer-widget');
        if (timerWidget) {
            Utils.animateElement(timerWidget, 'bounce 0.6s ease');
        }
    }

    saveCompletedSessions() {
        const today = new Date().toDateString();
        Utils.saveToStorage(`timer_sessions_${today}`, this.completedSessions);
    }

    loadCompletedSessions() {
        const today = new Date().toDateString();
        return Utils.loadFromStorage(`timer_sessions_${today}`, 0);
    }

    // Get timer statistics for other components
    getStatistics() {
        const currentMode = parseInt(this.timerMode?.value || 25);
        const progress = ((this.totalTime - this.timeLeft) / this.totalTime) * 100;
        
        return {
            currentMode: currentMode === 25 || currentMode === 45 ? 'Work' : 'Break',
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            timeLeft: this.timeLeft,
            totalTime: this.totalTime,
            progress: Math.round(progress),
            timeElapsed: this.totalTime - this.timeLeft,
            sessionsToday: this.completedSessions
        };
    }

    // Get formatted time remaining
    getFormattedTimeLeft() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        return `${Utils.formatTime(minutes)}:${Utils.formatTime(seconds)}`;
    }
}

// CSS for timer animations
const timerStyles = `
    @keyframes scaleIn {
        from {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
        }
        to {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
    }
    
    @keyframes scaleOut {
        from {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
        }
        to {
            opacity: 0;
            transform: translate(-50%, -50%) scale(0.8);
        }
    }
    
    @keyframes bounce {
        0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
        }
        40% {
            transform: translateY(-10px);
        }
        60% {
            transform: translateY(-5px);
        }
    }
`;

// Inject styles
const timerStyleSheet = document.createElement('style');
timerStyleSheet.textContent = timerStyles;
document.head.appendChild(timerStyleSheet);

// Initialize timer when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.timerInstance = new PomodoroTimer();
});