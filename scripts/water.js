// Water intake tracker functionality

class WaterTracker {
    constructor() {
        this.addWaterButton = document.getElementById('add-water');
        this.resetWaterButton = document.getElementById('reset-water');
        this.waterGoal = document.getElementById('water-goal');
        this.waterLevel = document.getElementById('water-level');
        
        this.dailyGoal = 8; // 8 glasses per day
        this.glassSize = 250; // ml per glass
        this.currentIntake = this.loadWaterIntake();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay();
    }

    setupEventListeners() {
        if (this.addWaterButton) {
            this.addWaterButton.addEventListener('click', () => {
                this.addWater();
            });
        }

        if (this.resetWaterButton) {
            this.resetWaterButton.addEventListener('click', () => {
                this.resetWater();
            });
        }
    }

    addWater() {
        this.currentIntake++;
        this.saveWaterIntake();
        this.updateDisplay();
        this.showWaterFeedback();
        
        // Check if goal is reached
        if (this.currentIntake === this.dailyGoal) {
            this.showGoalReached();
        }
    }

    resetWater() {
        if (this.currentIntake > 0 && !confirm('Reset water intake for today?')) {
            return;
        }

        this.currentIntake = 0;
        this.saveWaterIntake();
        this.updateDisplay();
    }

    updateDisplay() {
        // Update goal text
        if (this.waterGoal) {
            this.waterGoal.textContent = `${this.currentIntake}/${this.dailyGoal} glasses`;
            
            if (this.currentIntake >= this.dailyGoal) {
                this.waterGoal.style.color = 'var(--success-color)';
            } else {
                this.waterGoal.style.color = 'var(--text-secondary)';
            }
        }

        // Update water level visual
        if (this.waterLevel) {
            const percentage = Math.min((this.currentIntake / this.dailyGoal) * 100, 100);
            this.waterLevel.style.height = `${percentage}%`;
            
            // Change color based on progress
            if (percentage >= 100) {
                this.waterLevel.style.background = 'var(--success-color)';
            } else if (percentage >= 75) {
                this.waterLevel.style.background = 'var(--accent-color)';
            } else if (percentage >= 50) {
                this.waterLevel.style.background = 'var(--primary-color)';
            } else {
                this.waterLevel.style.background = 'var(--secondary-color)';
            }
        }

        // Update button state
        if (this.addWaterButton) {
            if (this.currentIntake >= this.dailyGoal) {
                this.addWaterButton.textContent = '💧 Extra Glass';
            } else {
                this.addWaterButton.textContent = '💧 Add Glass';
            }
        }
    }

    showWaterFeedback() {
        const messages = [
            'Great! Keep hydrating! 💧',
            'Good job staying hydrated! 🌊',
            'Your body thanks you! 💙',
            'Hydration level up! ⬆️',
            'Keep it flowing! 🚰'
        ];

        const message = messages[Math.floor(Math.random() * messages.length)];
        this.showFeedback(message, 'success');
    }

    showGoalReached() {
        const celebration = document.createElement('div');
        celebration.innerHTML = `
            <div style="font-size: 24px; margin-bottom: 12px;">🎉 Daily Goal Reached! 🎉</div>
            <div>You've successfully drunk ${this.dailyGoal} glasses of water today!</div>
            <div style="margin-top: 12px; font-size: 14px; opacity: 0.8;">
                That's ${this.dailyGoal * this.glassSize}ml of hydration!
            </div>
        `;
        celebration.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 2px solid var(--success-color);
            color: var(--text-primary);
            padding: 24px;
            border-radius: 16px;
            text-align: center;
            z-index: 2000;
            animation: bounceIn 0.6s ease;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        `;
        
        document.body.appendChild(celebration);
        
        setTimeout(() => {
            celebration.style.animation = 'fadeOut 0.5s ease forwards';
            setTimeout(() => {
                if (document.body.contains(celebration)) {
                    document.body.removeChild(celebration);
                }
            }, 500);
        }, 4000);
    }

    showFeedback(message, type) {
        const feedback = document.createElement('div');
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--${type === 'success' ? 'success' : 'primary'}-color);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => {
                if (document.body.contains(feedback)) {
                    document.body.removeChild(feedback);
                }
            }, 300);
        }, 2000);
    }

    saveWaterIntake() {
        const today = new Date().toDateString();
        Utils.saveToStorage(`water_intake_${today}`, this.currentIntake);
    }

    loadWaterIntake() {
        const today = new Date().toDateString();
        return Utils.loadFromStorage(`water_intake_${today}`, 0);
    }

    getStatistics() {
        const percentage = Math.round((this.currentIntake / this.dailyGoal) * 100);
        const remainingGlasses = Math.max(0, this.dailyGoal - this.currentIntake);
        
        return {
            current: this.currentIntake,
            goal: this.dailyGoal,
            percentage,
            remaining: remainingGlasses,
            goalReached: this.currentIntake >= this.dailyGoal,
            totalMl: this.currentIntake * this.glassSize
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.waterInstance = new WaterTracker();
});