// Productivity score calculator

class ProductivityScore {
    constructor() {
        this.scoreElement = document.getElementById('productivity-score');
        this.scoreCircle = document.querySelector('.score-circle');
        this.currentScore = parseInt(this.scoreElement.textContent) || 0;
        this.tooltip = document.createElement('div');
        this.tooltip.className = 'score-tooltip';
        this.scoreCircle.appendChild(this.tooltip);
        
        // Create score breakdown element
        this.breakdown = document.createElement('div');
        this.breakdown.className = 'score-breakdown';
        this.scoreCircle.parentElement.appendChild(this.breakdown);
        
        this.initializeScore();
        this.setupEventListeners();
        this.init();
    }

    initializeScore() {
        this.updateScoreClass(this.currentScore);
        this.updateTooltip(this.currentScore);
    }

    init() {
        this.updateScore();
        
        // Update score every 5 minutes
        setInterval(() => {
            this.updateScore();
        }, 5 * 60 * 1000);
    }

    updateScoreClass(score) {
        // Remove all score classes
        this.scoreCircle.classList.remove('score-excellent', 'score-high', 'score-medium', 'score-low');
        
        // Add appropriate class based on score
        if (score >= 90) {
            this.scoreCircle.classList.add('score-excellent');
        } else if (score >= 75) {
            this.scoreCircle.classList.add('score-high');
        } else if (score >= 60) {
            this.scoreCircle.classList.add('score-medium');
        } else {
            this.scoreCircle.classList.add('score-low');
        }
    }

    updateTooltip(score) {
        let message = '';
        if (score >= 90) {
            message = 'Excellent! Keep up the great work!';
        } else if (score >= 75) {
            message = 'Great job! You\'re doing well!';
        } else if (score >= 60) {
            message = 'Good effort! Room for improvement.';
        } else {
            message = 'Let\'s work on improving your productivity.';
        }
        this.tooltip.textContent = message;
    }

    calculateScore() {
        let score = 0;
        let maxScore = 0;

        // Todo completion (25 points)
        if (window.todoInstance) {
            const todoStats = window.todoInstance.getStatistics();
            maxScore += 25;
            if (todoStats.total > 0) {
                score += (todoStats.completionRate / 100) * 25;
            } else {
                score += 10; // Base points for having the system ready
            }
        }

        // Habit completion (20 points)
        if (window.habitInstance) {
            const habitStats = window.habitInstance.getStatistics();
            maxScore += 20;
            if (habitStats.total > 0) {
                score += (habitStats.completionRate / 100) * 20;
            } else {
                score += 5; // Base points
            }
        }

        // Timer usage (15 points)
        if (window.timerInstance) {
            const timerStats = window.timerInstance.getStatistics();
            maxScore += 15;
            if (timerStats.isRunning) {
                score += 15;
            } else if (timerStats.progress > 0) {
                score += (timerStats.progress / 100) * 15;
            } else {
                score += 3; // Base points
            }
        }

        // Water intake (10 points)
        if (window.waterInstance) {
            const waterStats = window.waterInstance.getStatistics();
            maxScore += 10;
            score += (waterStats.percentage / 100) * 10;
        }

        // Mood tracking (10 points)
        if (window.moodInstance) {
            const moodStats = window.moodInstance.getStatistics();
            maxScore += 10;
            if (moodStats.todayMood !== null) {
                score += 10;
            } else {
                score += 2; // Base points
            }
        }

        // Notes usage (10 points)
        if (window.notesInstance) {
            const notesStats = window.notesInstance.getStatistics();
            maxScore += 10;
            if (notesStats.hasContent) {
                score += Math.min(notesStats.words / 10, 10); // 1 point per 10 words, max 10
            } else {
                score += 2; // Base points
            }
        }

        // Expense tracking (10 points)
        if (window.expenseInstance) {
            const expenseStats = window.expenseInstance.getStatistics();
            maxScore += 10;
            if (expenseStats.count > 0) {
                score += Math.min(expenseStats.count * 2, 10); // 2 points per expense, max 10
            } else {
                score += 2; // Base points
            }
        }

        // Calculate final percentage
        const finalScore = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
        return Math.min(finalScore, 100);
    }

    updateScore() {
        const score = this.calculateScore();
        this.updateScoreWithAnimation(score);
    }

    updateScoreWithAnimation(newScore) {
        // Animate the score change
        const startScore = this.currentScore;
        const endScore = newScore;
        const duration = 1000; // 1 second
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentScore = Math.round(startScore + (endScore - startScore) * easeOutQuart);

            this.scoreElement.textContent = currentScore;
            this.updateScoreClass(currentScore);
            this.updateTooltip(currentScore);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.currentScore = endScore;
                this.updateScoreClass(endScore);
                this.updateTooltip(endScore);
                this.updateBreakdown();
            }
        };

        requestAnimationFrame(animate);
    }

    setupEventListeners() {
        // Toggle breakdown on click
        this.scoreCircle.addEventListener('click', () => {
            this.breakdown.classList.toggle('visible');
            if (this.breakdown.classList.contains('visible')) {
                this.updateBreakdown();
            }
        });

        // Close breakdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.scoreCircle.contains(e.target) && !this.breakdown.contains(e.target)) {
                this.breakdown.classList.remove('visible');
            }
        });
    }

    updateBreakdown() {
        const breakdown = this.getScoreBreakdown();
        let html = '';
        
        for (const [key, data] of Object.entries(breakdown)) {
            html += `
                <div class="breakdown-item">
                    <span class="breakdown-label">${this.formatLabel(key)}</span>
                    <span class="breakdown-value">${data.score}/${data.max} - ${data.description}</span>
                </div>
            `;
        }
        
        this.breakdown.innerHTML = html;
    }

    formatLabel(key) {
        return key.charAt(0).toUpperCase() + key.slice(1);
    }

    getScoreBreakdown() {
        const breakdown = {};
        
        if (window.todoInstance) {
            const stats = window.todoInstance.getStatistics();
            breakdown.todos = {
                score: stats.total > 0 ? (stats.completionRate / 100) * 25 : 10,
                max: 25,
                description: `${stats.completed}/${stats.total} tasks completed`
            };
        }

        if (window.habitInstance) {
            const stats = window.habitInstance.getStatistics();
            breakdown.habits = {
                score: stats.total > 0 ? (stats.completionRate / 100) * 20 : 5,
                max: 20,
                description: `${stats.completedToday}/${stats.total} habits completed`
            };
        }

        if (window.timerInstance) {
            const stats = window.timerInstance.getStatistics();
            breakdown.timer = {
                score: stats.isRunning ? 15 : (stats.progress / 100) * 15,
                max: 15,
                description: stats.isRunning ? 'Timer active' : `${stats.progress}% progress`
            };
        }

        if (window.waterInstance) {
            const stats = window.waterInstance.getStatistics();
            breakdown.water = {
                score: (stats.percentage / 100) * 10,
                max: 10,
                description: `${stats.current}/${stats.goal} glasses`
            };
        }

        if (window.moodInstance) {
            const stats = window.moodInstance.getStatistics();
            breakdown.mood = {
                score: stats.todayMood !== null ? 10 : 2,
                max: 10,
                description: stats.todayMood !== null ? 'Mood tracked' : 'Not tracked'
            };
        }

        return breakdown;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.productivityInstance = new ProductivityScore();
    
    // Make updateProductivityScore available globally
    window.updateProductivityScore = (newScore) => {
        window.productivityInstance.updateScoreWithAnimation(newScore);
    };
});