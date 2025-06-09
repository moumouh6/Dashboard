// Daily habits tracker functionality

class HabitTracker {
    constructor() {
        this.habitInput = document.getElementById('habit-input');
        this.addButton = document.getElementById('add-habit');
        this.habitList = document.getElementById('habit-list');
        this.habitStreak = document.getElementById('habit-streak');
        
        this.habits = this.loadHabits();
        this.todayDate = new Date().toDateString();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderHabits();
        this.updateStreak();
    }

    setupEventListeners() {
        if (this.addButton) {
            this.addButton.addEventListener('click', () => {
                this.addHabit();
            });
        }

        if (this.habitInput) {
            this.habitInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addHabit();
                }
            });
        }
    }

    addHabit() {
        const text = this.habitInput?.value.trim();
        if (!text) return;

        const habit = {
            id: Utils.generateId(),
            name: text,
            createdAt: new Date().toISOString(),
            completions: {},
            streak: 0
        };

        this.habits.push(habit);
        this.saveHabits();
        this.renderHabits();
        
        if (this.habitInput) this.habitInput.value = '';
    }

    toggleHabit(id) {
        const habit = this.habits.find(h => h.id === id);
        if (!habit) return;

        const today = this.todayDate;
        
        if (habit.completions[today]) {
            delete habit.completions[today];
        } else {
            habit.completions[today] = true;
        }

        this.updateHabitStreak(habit);
        this.saveHabits();
        this.renderHabits();
        this.updateStreak();
    }

    updateHabitStreak(habit) {
        let streak = 0;
        const today = new Date();
        
        for (let i = 0; i < 30; i++) {
            const checkDate = new Date(today);
            checkDate.setDate(today.getDate() - i);
            const dateString = checkDate.toDateString();
            
            if (habit.completions[dateString]) {
                streak++;
            } else {
                break;
            }
        }
        
        habit.streak = streak;
    }

    deleteHabit(id) {
        this.habits = this.habits.filter(h => h.id !== id);
        this.saveHabits();
        this.renderHabits();
        this.updateStreak();
    }

    renderHabits() {
        if (!this.habitList) return;

        this.habitList.innerHTML = '';

        if (this.habits.length === 0) {
            this.habitList.innerHTML = `
                <div class="empty-state">
                    No habits yet. Add one to start building consistency! 🎯
                </div>
            `;
            return;
        }

        this.habits.forEach(habit => {
            const habitElement = this.createHabitElement(habit);
            this.habitList.appendChild(habitElement);
        });
    }

    createHabitElement(habit) {
        const div = document.createElement('div');
        div.className = 'habit-item';
        
        const isCompletedToday = habit.completions[this.todayDate];
        
        div.innerHTML = `
            <div class="habit-checkbox ${isCompletedToday ? 'checked' : ''}" 
                 data-action="toggle" data-id="${habit.id}">
                ${isCompletedToday ? '✓' : ''}
            </div>
            <div class="habit-info">
                <span class="habit-name">${this.escapeHtml(habit.name)}</span>
                <span class="habit-streak">🔥 ${habit.streak} days</span>
            </div>
            <button class="habit-delete" data-action="delete" data-id="${habit.id}">×</button>
        `;

        div.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action');
            const id = e.target.getAttribute('data-id');
            
            if (action === 'toggle') {
                this.toggleHabit(id);
            } else if (action === 'delete') {
                this.deleteHabit(id);
            }
        });

        return div;
    }

    updateStreak() {
        if (!this.habitStreak) return;

        const completedToday = this.habits.filter(h => h.completions[this.todayDate]).length;
        const totalHabits = this.habits.length;
        
        if (totalHabits === 0) {
            this.habitStreak.textContent = 'Add habits to track';
            return;
        }

        const percentage = Math.round((completedToday / totalHabits) * 100);
        
        if (completedToday === totalHabits) {
            this.habitStreak.textContent = `🔥 Perfect day! ${completedToday}/${totalHabits}`;
            this.habitStreak.style.color = 'var(--success-color)';
        } else {
            this.habitStreak.textContent = `${completedToday}/${totalHabits} completed (${percentage}%)`;
            this.habitStreak.style.color = 'var(--text-secondary)';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveHabits() {
        Utils.saveToStorage('habits', this.habits);
    }

    loadHabits() {
        return Utils.loadFromStorage('habits', []);
    }

    getStatistics() {
        const completedToday = this.habits.filter(h => h.completions[this.todayDate]).length;
        const totalHabits = this.habits.length;
        const averageStreak = this.habits.length > 0 ? 
            this.habits.reduce((sum, h) => sum + h.streak, 0) / this.habits.length : 0;

        return {
            total: totalHabits,
            completedToday,
            completionRate: totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0,
            averageStreak: Math.round(averageStreak)
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.habitInstance = new HabitTracker();
});