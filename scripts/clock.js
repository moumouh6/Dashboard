// Clock and date functionality

class Clock {
    constructor() {
        this.timeElement = document.getElementById('current-time');
        this.dateElement = document.getElementById('current-date');
        this.timezoneElement = document.getElementById('timezone');
        this.timezoneSelector = document.getElementById('timezone-selector');
        this.is24Hour = this.load24HourPreference();
        this.selectedTimezone = this.loadTimezonePreference();
        
        this.init();
    }

    init() {
        this.updateClock();
        this.updateTimezone();
        this.setupEventListeners();
        
        // Update every second
        setInterval(() => {
            this.updateClock();
        }, 1000);
    }

    setupEventListeners() {
        // Add click listener to toggle 12/24 hour format
        if (this.timeElement) {
            this.timeElement.addEventListener('click', () => {
                this.toggle24Hour();
            });
            this.timeElement.style.cursor = 'pointer';
            this.timeElement.title = 'Click to toggle 12/24 hour format';
        }

        // Timezone selector
        if (this.timezoneSelector) {
            this.timezoneSelector.value = this.selectedTimezone;
            this.timezoneSelector.addEventListener('change', (e) => {
                this.selectedTimezone = e.target.value;
                this.saveTimezonePreference();
                this.updateClock();
                this.updateTimezone();
            });
        }
    }

    updateClock() {
        let now;
        
        if (this.selectedTimezone === 'auto') {
            now = new Date();
        } else {
            now = new Date().toLocaleString("en-US", {timeZone: this.selectedTimezone});
            now = new Date(now);
        }
        
        // Update time
        if (this.timeElement) {
            const timeString = this.formatTime(now);
            this.timeElement.textContent = timeString;
            
            // Add subtle animation on minute change
            if (now.getSeconds() === 0) {
                Utils.animateElement(this.timeElement, 'pulse 0.5s ease');
            }
        }
        
        // Update date
        if (this.dateElement) {
            this.dateElement.textContent = Utils.formatDate(now);
        }
    }

    formatTime(date) {
        if (this.is24Hour) {
            return `${Utils.formatTime(date.getHours())}:${Utils.formatTime(date.getMinutes())}:${Utils.formatTime(date.getSeconds())}`;
        } else {
            let hours = date.getHours();
            const minutes = date.getMinutes();
            const seconds = date.getSeconds();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            
            hours = hours % 12;
            hours = hours ? hours : 12; // 0 should be 12
            
            return `${Utils.formatTime(hours)}:${Utils.formatTime(minutes)}:${Utils.formatTime(seconds)} ${ampm}`;
        }
    }

    updateTimezone() {
        if (this.timezoneElement) {
            if (this.selectedTimezone === 'auto') {
                this.timezoneElement.textContent = Utils.getTimezone();
            } else {
                const shortName = this.selectedTimezone.split('/')[1]?.replace('_', ' ') || this.selectedTimezone;
                this.timezoneElement.textContent = shortName;
            }
        }
    }

    toggle24Hour() {
        this.is24Hour = !this.is24Hour;
        this.save24HourPreference();
        this.updateClock();
        
        // Show feedback
        const feedback = this.is24Hour ? '24-hour format' : '12-hour format';
        this.showFormatFeedback(feedback);
    }

    showFormatFeedback(message) {
        // Create temporary feedback element
        const feedback = document.createElement('div');
        feedback.textContent = `Switched to ${message}`;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(feedback);
        
        // Remove after 2 seconds
        setTimeout(() => {
            feedback.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => {
                if (document.body.contains(feedback)) {
                    document.body.removeChild(feedback);
                }
            }, 300);
        }, 2000);
    }

    save24HourPreference() {
        Utils.saveToStorage('clock_24hour', this.is24Hour);
    }

    load24HourPreference() {
        return Utils.loadFromStorage('clock_24hour', false);
    }

    saveTimezonePreference() {
        Utils.saveToStorage('clock_timezone', this.selectedTimezone);
    }

    loadTimezonePreference() {
        return Utils.loadFromStorage('clock_timezone', 'auto');
    }

    // Get current time for other components
    getCurrentTime() {
        if (this.selectedTimezone === 'auto') {
            return new Date();
        } else {
            const now = new Date().toLocaleString("en-US", {timeZone: this.selectedTimezone});
            return new Date(now);
        }
    }

    // Format time for other components
    static formatTimeString(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${Utils.formatTime(hours)}:${Utils.formatTime(mins)}`;
    }

    // Get time until next hour
    getTimeUntilNextHour() {
        const now = this.getCurrentTime();
        const nextHour = new Date(now);
        nextHour.setHours(now.getHours() + 1, 0, 0, 0);
        return nextHour - now;
    }

    // Get greeting based on time
    getGreeting() {
        const hour = this.getCurrentTime().getHours();
        
        if (hour < 6) return 'Good night';
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        if (hour < 22) return 'Good evening';
        return 'Good night';
    }
}

// CSS for feedback animations
const feedbackStyles = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
        }
        to {
            opacity: 0;
        }
    }
    
    @keyframes pulse {
        0%, 100% {
            transform: scale(1);
        }
        50% {
            transform: scale(1.05);
        }
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = feedbackStyles;
document.head.appendChild(styleSheet);

// Initialize clock when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.clockInstance = new Clock();
});