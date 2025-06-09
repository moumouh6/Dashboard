// Main application controller

class ProductivityDashboard {
    constructor() {
        this.components = {
            clock: null,
            weather: null,
            todo: null,
            quote: null,
            expense: null,
            timer: null
        };
        
        this.init();
    }

    init() {
        this.waitForComponents();
        this.setupGlobalEventListeners();
        this.setupPerformanceMonitoring();
        this.showWelcomeMessage();
    }

    waitForComponents() {
        // Wait for all components to be initialized
        const checkComponents = () => {
            this.components = {
                clock: window.clockInstance,
                weather: window.weatherInstance,
                todo: window.todoInstance,
                quote: window.quoteInstance,
                expense: window.expenseInstance,
                timer: window.timerInstance
            };

            // Check if all components are loaded
            const allLoaded = Object.values(this.components).every(component => component !== null && component !== undefined);
            
            if (allLoaded) {
                console.log('✅ All dashboard components loaded successfully');
                this.setupComponentIntegration();
            } else {
                // Try again in 100ms
                setTimeout(checkComponents, 100);
            }
        };

        checkComponents();
    }

    setupComponentIntegration() {
        // Cross-component functionality
        this.setupDashboardGreeting();
        this.setupProductivityInsights();
        this.setupKeyboardShortcuts();
    }

    setupDashboardGreeting() {
        // Update page title with personalized greeting
        const updateGreeting = () => {
            if (this.components.clock) {
                const greeting = this.components.clock.getGreeting();
                const stats = this.getDashboardStats();
                
                // Update meta description or add subtle greeting
                const titleElement = document.querySelector('title');
                if (titleElement) {
                    titleElement.setAttribute('data-greeting', greeting);
                }
            }
        };

        updateGreeting();
        setInterval(updateGreeting, 60000); // Update every minute
    }

    setupProductivityInsights() {
        // Create insights based on all components
        setInterval(() => {
            this.generateProductivityInsights();
        }, 300000); // Every 5 minutes
    }

    generateProductivityInsights() {
        const insights = [];
        
        // Todo insights
        if (this.components.todo) {
            const todoStats = this.components.todo.getStatistics();
            if (todoStats.completionRate === 100 && todoStats.total > 0) {
                insights.push("🎉 All tasks completed! You're on fire today!");
            } else if (todoStats.completionRate > 75) {
                insights.push("💪 Great progress on your tasks!");
            }
        }

        // Timer insights
        if (this.components.timer) {
            const timerStats = this.components.timer.getStatistics();
            if (timerStats.isRunning && timerStats.currentMode === 'Work') {
                insights.push("🎯 Focus mode activated! Keep it up!");
            }
        }

        // Expense insights
        if (this.components.expense) {
            const expenseStats = this.components.expense.getStatistics();
            if (expenseStats.total > 0) {
                const avgExpense = expenseStats.averageExpense;
                if (avgExpense < 10) {
                    insights.push("💰 Keeping expenses low today - nice job!");
                }
            }
        }

        // Show random insight if any
        if (insights.length > 0) {
            const randomInsight = insights[Math.floor(Math.random() * insights.length)];
            this.showInsight(randomInsight);
        }
    }

    showInsight(message) {
        // Only show insights occasionally to avoid spam
        if (Math.random() > 0.3) return;

        const insight = document.createElement('div');
        insight.textContent = message;
        insight.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 500;
            z-index: 1500;
            max-width: 300px;
            animation: slideInLeft 0.4s ease;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        `;
        
        document.body.appendChild(insight);
        
        setTimeout(() => {
            insight.style.animation = 'slideOutLeft 0.4s ease forwards';
            setTimeout(() => {
                if (document.body.contains(insight)) {
                    document.body.removeChild(insight);
                }
            }, 400);
        }, 5000);
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only trigger when not typing in inputs
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 't':
                        e.preventDefault();
                        document.getElementById('todo-input')?.focus();
                        break;
                    case 'e':
                        e.preventDefault();
                        document.getElementById('expense-description')?.focus();
                        break;
                    case 'q':
                        e.preventDefault();
                        if (this.components.quote) {
                            this.components.quote.refreshQuote();
                        }
                        break;
                    case 'w':
                        e.preventDefault();
                        if (this.components.weather) {
                            this.components.weather.refreshWeather();
                        }
                        break;
                }
            }
        });

        // Show keyboard shortcuts on first visit
        this.showKeyboardShortcuts();
    }

    showKeyboardShortcuts() {
        const hasSeenShortcuts = Utils.loadFromStorage('has_seen_shortcuts', false);
        
        if (!hasSeenShortcuts) {
            setTimeout(() => {
                const shortcuts = document.createElement('div');
                shortcuts.innerHTML = `
                    <div style="font-weight: 600; margin-bottom: 12px;">⌨️ Keyboard Shortcuts</div>
                    <div style="font-size: 13px; line-height: 1.6;">
                        <div><kbd>Ctrl+T</kbd> - Focus todo input</div>
                        <div><kbd>Ctrl+E</kbd> - Focus expense input</div>
                        <div><kbd>Ctrl+Q</kbd> - New quote</div>
                        <div><kbd>Ctrl+W</kbd> - Refresh weather</div>
                        <div><kbd>Ctrl+Space</kbd> - Start/pause timer</div>
                        <div><kbd>Ctrl+R</kbd> - Reset timer</div>
                    </div>
                    <div style="margin-top: 12px; font-size: 12px; opacity: 0.8;">
                        Click anywhere to close
                    </div>
                `;
                shortcuts.style.cssText = `
                    position: fixed;
                    top: 50%;
                    right: 20px;
                    transform: translateY(-50%);
                    background: var(--glass-bg);
                    backdrop-filter: blur(20px);
                    border: 1px solid var(--glass-border);
                    color: var(--text-primary);
                    padding: 20px;
                    border-radius: 12px;
                    font-size: 14px;
                    z-index: 2000;
                    max-width: 250px;
                    animation: slideInRight 0.4s ease;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                `;

                shortcuts.style.setProperty('--kbd-bg', 'rgba(255, 255, 255, 0.1)');
                shortcuts.style.setProperty('--kbd-border', 'var(--glass-border)');
                
                // Style kbd elements
                const style = document.createElement('style');
                style.textContent = `
                    kbd {
                        background: var(--kbd-bg);
                        border: 1px solid var(--kbd-border);
                        border-radius: 4px;
                        padding: 2px 6px;
                        font-size: 11px;
                        font-family: monospace;
                        margin-right: 8px;
                    }
                `;
                document.head.appendChild(style);
                
                document.body.appendChild(shortcuts);
                
                // Close on click
                const closeShortcuts = () => {
                    shortcuts.style.animation = 'slideOutRight 0.4s ease forwards';
                    setTimeout(() => {
                        if (document.body.contains(shortcuts)) {
                            document.body.removeChild(shortcuts);
                        }
                    }, 400);
                    document.removeEventListener('click', closeShortcuts);
                    Utils.saveToStorage('has_seen_shortcuts', true);
                };
                
                setTimeout(() => {
                    document.addEventListener('click', closeShortcuts);
                }, 1000);
                
            }, 3000);
        }
    }

    setupGlobalEventListeners() {
        // Handle visibility change to pause/resume timers
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                // Page is hidden
                console.log('Dashboard hidden');
            } else {
                // Page is visible
                console.log('Dashboard visible');
                // Refresh weather and quotes when returning
                setTimeout(() => {
                    if (this.components.weather) {
                        this.components.weather.loadWeatherData();
                    }
                }, 1000);
            }
        });

        // Handle window resize for responsive adjustments
        window.addEventListener('resize', Utils.debounce(() => {
            this.handleResize();
        }, 250));

        // Handle connection changes
        window.addEventListener('online', () => {
            this.showConnectionStatus('Connected to internet', 'success');
        });

        window.addEventListener('offline', () => {
            this.showConnectionStatus('No internet connection', 'warning');
        });
    }

    handleResize() {
        // Responsive adjustments
        const width = window.innerWidth;
        
        if (width < 768) {
            document.body.classList.add('mobile');
        } else {
            document.body.classList.remove('mobile');
        }
    }

    showConnectionStatus(message, type) {
        const status = document.createElement('div');
        status.textContent = message;
        status.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--${type === 'success' ? 'success' : 'warning'}-color);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 2000;
            animation: slideDown 0.3s ease;
        `;
        
        document.body.appendChild(status);
        
        setTimeout(() => {
            status.style.animation = 'slideUp 0.3s ease forwards';
            setTimeout(() => {
                if (document.body.contains(status)) {
                    document.body.removeChild(status);
                }
            }, 300);
        }, 3000);
    }

    setupPerformanceMonitoring() {
        // Monitor performance and show tips
        setInterval(() => {
            this.checkPerformance();
        }, 60000); // Every minute
    }

    checkPerformance() {
        // Simple performance check
        const memoryInfo = performance.memory;
        if (memoryInfo && memoryInfo.usedJSHeapSize > 50000000) { // 50MB
            console.warn('High memory usage detected');
        }
    }

    showWelcomeMessage() {
        // Show welcome message on first visit
        const hasVisited = Utils.loadFromStorage('has_visited', false);
        
        if (!hasVisited) {
            setTimeout(() => {
                const welcome = document.createElement('div');
                welcome.innerHTML = `
                    <div style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">
                        Welcome to your Productivity Dashboard! 🚀
                    </div>
                    <div style="line-height: 1.6; margin-bottom: 16px;">
                        This is your personal command center for staying productive and organized. 
                        Add tasks, track expenses, set timers, and stay motivated with daily quotes.
                    </div>
                    <div style="font-size: 13px; opacity: 0.8;">
                        Tip: All your data is saved locally in your browser
                    </div>
                `;
                welcome.style.cssText = `
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: var(--glass-bg);
                    backdrop-filter: blur(20px);
                    border: 2px solid var(--primary-color);
                    color: var(--text-primary);
                    padding: 24px;
                    border-radius: 16px;
                    font-size: 14px;
                    z-index: 2500;
                    max-width: 400px;
                    text-align: center;
                    animation: scaleIn 0.5s ease;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
                `;
                
                document.body.appendChild(welcome);
                
                setTimeout(() => {
                    welcome.style.animation = 'scaleOut 0.5s ease forwards';
                    setTimeout(() => {
                        if (document.body.contains(welcome)) {
                            document.body.removeChild(welcome);
                        }
                    }, 500);
                    Utils.saveToStorage('has_visited', true);
                }, 5000);
                
            }, 2000);
        }
    }

    getDashboardStats() {
        const stats = {
            todos: this.components.todo ? this.components.todo.getStatistics() : null,
            expenses: this.components.expense ? this.components.expense.getStatistics() : null,
            timer: this.components.timer ? this.components.timer.getStatistics() : null,
            weather: this.components.weather ? this.components.weather.getCurrentWeather() : null,
            quote: this.components.quote ? this.components.quote.getCurrentQuote() : null
        };

        return stats;
    }

    // Public API for external access
    getComponent(name) {
        return this.components[name];
    }

    refreshAllData() {
        Object.values(this.components).forEach(component => {
            if (component && typeof component.refresh === 'function') {
                component.refresh();
            }
        });
    }
}

// Additional CSS for app-specific animations
const appStyles = `
    @keyframes slideInLeft {
        from {
            opacity: 0;
            transform: translateX(-100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutLeft {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(-100%);
        }
    }
    
    @keyframes slideDown {
        from {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
        to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
    }
    
    @keyframes slideUp {
        from {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
        }
        to {
            opacity: 0;
            transform: translateX(-50%) translateY(-20px);
        }
    }
    
    .mobile .dashboard {
        grid-template-columns: 1fr;
    }
    
    .mobile .widget {
        padding: calc(var(--spacing-unit) * 2);
    }
`;

// Inject styles
const appStyleSheet = document.createElement('style');
appStyleSheet.textContent = appStyles;
document.head.appendChild(appStyleSheet);

// Initialize the main dashboard when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.dashboardApp = new ProductivityDashboard();
});

// Handle any unhandled errors gracefully
window.addEventListener('error', (event) => {
    console.error('Dashboard error:', event.error);
    // Could show a user-friendly error message here
});

// Export for potential external use
window.ProductivityDashboard = ProductivityDashboard;