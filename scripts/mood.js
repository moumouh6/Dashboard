// Mood tracker functionality

class MoodTracker {
    constructor() {
        this.moodButtons = document.querySelectorAll('.mood-btn');
        this.moodStreak = document.getElementById('mood-streak');
        this.moodHistory = document.getElementById('mood-history');
        
        this.moods = this.loadMoods();
        this.todayDate = new Date().toDateString();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.updateDisplay();
        this.renderHistory();
    }

    setupEventListeners() {
        this.moodButtons.forEach(button => {
            button.addEventListener('click', () => {
                const mood = parseInt(button.getAttribute('data-mood'));
                this.setMood(mood);
            });
        });
    }

    setMood(moodValue) {
        this.moods[this.todayDate] = {
            value: moodValue,
            timestamp: new Date().toISOString()
        };

        this.saveMoods();
        this.updateDisplay();
        this.renderHistory();
        this.showMoodFeedback(moodValue);
    }

    updateDisplay() {
        const todayMood = this.moods[this.todayDate];
        
        // Update button states
        this.moodButtons.forEach(button => {
            const moodValue = parseInt(button.getAttribute('data-mood'));
            if (todayMood && todayMood.value === moodValue) {
                button.classList.add('selected');
            } else {
                button.classList.remove('selected');
            }
        });

        // Update streak
        this.updateStreak();
    }

    updateStreak() {
        if (!this.moodStreak) return;

        const streak = this.calculateStreak();
        const todayMood = this.moods[this.todayDate];
        
        if (todayMood) {
            const moodText = this.getMoodText(todayMood.value);
            this.moodStreak.textContent = `Today: ${moodText} • ${streak} day streak`;
        } else {
            this.moodStreak.textContent = `Track your mood • ${streak} day streak`;
        }
    }

    calculateStreak() {
        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const dateString = checkDate.toDateString();
            
            if (this.moods[dateString]) {
                streak++;
            } else {
                break;
            }
        }
        
        return streak;
    }

    renderHistory() {
        if (!this.moodHistory) return;

        const last7Days = this.getLast7Days();
        
        this.moodHistory.innerHTML = last7Days.map(day => {
            const mood = this.moods[day.dateString];
            const emoji = mood ? this.getMoodEmoji(mood.value) : '⚪';
            
            return `
                <div class="mood-day" title="${day.label}${mood ? ': ' + this.getMoodText(mood.value) : ''}">
                    <div class="mood-emoji">${emoji}</div>
                    <div class="mood-date">${day.short}</div>
                </div>
            `;
        }).join('');
    }

    getLast7Days() {
        const days = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            
            days.push({
                dateString: date.toDateString(),
                label: date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }),
                short: date.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 1)
            });
        }
        
        return days;
    }

    getMoodEmoji(value) {
        const emojis = {
            1: '😢',
            2: '😕',
            3: '😐',
            4: '😊',
            5: '😄'
        };
        return emojis[value] || '😐';
    }

    getMoodText(value) {
        const texts = {
            1: 'Very Sad',
            2: 'Sad',
            3: 'Neutral',
            4: 'Happy',
            5: 'Very Happy'
        };
        return texts[value] || 'Neutral';
    }

    showMoodFeedback(moodValue) {
        const messages = {
            1: "It's okay to have tough days. Tomorrow is a new opportunity. 💙",
            2: "Feeling down? Remember that this too shall pass. 🌤️",
            3: "Neutral days are perfectly normal. Take it easy! 😌",
            4: "Great to see you're feeling good today! 🌟",
            5: "Fantastic mood! Your positive energy is contagious! ✨"
        };

        const message = messages[moodValue];
        if (message) {
            this.showFeedback(message);
        }
    }

    showFeedback(message) {
        const feedback = document.createElement('div');
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--glass-bg);
            backdrop-filter: blur(20px);
            border: 1px solid var(--glass-border);
            color: var(--text-primary);
            padding: 16px 20px;
            border-radius: 12px;
            font-size: 14px;
            z-index: 1000;
            max-width: 400px;
            text-align: center;
            animation: slideDown 0.3s ease;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.style.animation = 'slideUp 0.3s ease forwards';
            setTimeout(() => {
                if (document.body.contains(feedback)) {
                    document.body.removeChild(feedback);
                }
            }, 300);
        }, 4000);
    }

    saveMoods() {
        Utils.saveToStorage('mood_tracker', this.moods);
    }

    loadMoods() {
        return Utils.loadFromStorage('mood_tracker', {});
    }

    getStatistics() {
        const todayMood = this.moods[this.todayDate];
        const streak = this.calculateStreak();
        const last7Days = this.getLast7Days();
        const recentMoods = last7Days
            .map(day => this.moods[day.dateString])
            .filter(mood => mood)
            .map(mood => mood.value);
        
        const averageMood = recentMoods.length > 0 ? 
            recentMoods.reduce((sum, mood) => sum + mood, 0) / recentMoods.length : 0;

        return {
            todayMood: todayMood ? todayMood.value : null,
            streak,
            averageMood: Math.round(averageMood * 10) / 10,
            trackedDays: Object.keys(this.moods).length,
            recentMoods
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.moodInstance = new MoodTracker();
});