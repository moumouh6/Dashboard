// Expense tracker functionality

class ExpenseTracker {
    constructor() {
        this.descriptionInput = document.getElementById('expense-description');
        this.amountInput = document.getElementById('expense-amount');
        this.categorySelect = document.getElementById('expense-category');
        this.addButton = document.getElementById('add-expense');
        this.expenseList = document.getElementById('expense-list');
        this.totalAmount = document.getElementById('total-amount');
        this.expenseChart = document.getElementById('expense-chart');
        
        this.expenses = this.loadExpenses();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderExpenses();
        this.updateTotal();
        this.renderChart();
    }

    setupEventListeners() {
        // Add expense button
        if (this.addButton) {
            this.addButton.addEventListener('click', () => {
                this.addExpense();
            });
        }

        // Enter key in inputs
        [this.descriptionInput, this.amountInput].forEach(input => {
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        this.addExpense();
                    }
                });

                input.addEventListener('input', () => {
                    this.validateInputs();
                });
            }
        });

        // Auto-focus next input
        if (this.descriptionInput) {
            this.descriptionInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && this.amountInput) {
                    this.amountInput.focus();
                }
            });
        }
    }

    validateInputs() {
        const description = this.descriptionInput?.value.trim() || '';
        const amount = this.amountInput?.value || '';
        
        const descriptionValid = description.length > 0;
        const amountValid = amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;
        
        if (this.addButton) {
            this.addButton.disabled = !descriptionValid || !amountValid;
            this.addButton.style.opacity = (descriptionValid && amountValid) ? '1' : '0.5';
        }
    }

    addExpense() {
        const description = this.descriptionInput?.value.trim();
        const amount = parseFloat(this.amountInput?.value || 0);
        const category = this.categorySelect?.value || 'other';
        
        if (!description) {
            this.showError('Please enter a description');
            this.descriptionInput?.focus();
            return;
        }

        const descriptionValidation = Utils.validateInput(description, 'text', { min: 1, max: 50, required: true });
        if (!descriptionValidation.valid) {
            this.showError(descriptionValidation.error);
            return;
        }

        const amountValidation = Utils.validateInput(amount.toString(), 'number', { min: 0.01, required: true });
        if (!amountValidation.valid || isNaN(amount) || amount <= 0) {
            this.showError('Please enter a valid amount greater than 0');
            this.amountInput?.focus();
            return;
        }

        const expense = {
            id: Utils.generateId(),
            description: description,
            amount: amount,
            category: category,
            date: new Date().toISOString(),
            displayDate: new Date().toLocaleDateString()
        };

        this.expenses.unshift(expense); // Add to beginning
        this.saveExpenses();
        this.renderExpenses();
        this.updateTotal();
        this.renderChart();
        
        // Clear inputs
        if (this.descriptionInput) this.descriptionInput.value = '';
        if (this.amountInput) this.amountInput.value = '';
        if (this.categorySelect) this.categorySelect.value = 'food';
        this.validateInputs();
        
        // Focus back to description input
        if (this.descriptionInput) this.descriptionInput.focus();
        
        // Show success feedback
        this.showSuccess(`Added ${Utils.formatCurrency(amount)} expense`);
    }

    deleteExpense(id) {
        const expenseElement = document.querySelector(`[data-expense-id="${id}"]`);
        if (expenseElement) {
            // Add exit animation
            expenseElement.style.animation = 'slideOut 0.3s ease forwards';
            
            setTimeout(() => {
                this.expenses = this.expenses.filter(e => e.id !== id);
                this.saveExpenses();
                this.renderExpenses();
                this.updateTotal();
                this.renderChart();
                this.showSuccess('Expense deleted');
            }, 300);
        }
    }

    renderExpenses() {
        if (!this.expenseList) return;

        this.expenseList.innerHTML = '';

        if (this.expenses.length === 0) {
            this.showEmptyState();
            return;
        }

        // Group expenses by date
        const groupedExpenses = this.groupExpensesByDate();
        
        Object.keys(groupedExpenses).forEach(date => {
            const dateGroup = groupedExpenses[date];
            const dateTotal = dateGroup.reduce((sum, expense) => sum + expense.amount, 0);
            
            // Add date header if there are multiple days
            if (Object.keys(groupedExpenses).length > 1) {
                const dateHeader = document.createElement('div');
                dateHeader.className = 'expense-date-header';
                dateHeader.innerHTML = `
                    <span>${date}</span>
                    <span>${Utils.formatCurrency(dateTotal)}</span>
                `;
                dateHeader.style.cssText = `
                    display: flex;
                    justify-content: space-between;
                    padding: 8px 0;
                    margin: 16px 0 8px 0;
                    border-bottom: 1px solid var(--glass-border);
                    font-weight: 500;
                    color: var(--text-secondary);
                    font-size: 0.9rem;
                `;
                this.expenseList.appendChild(dateHeader);
            }
            
            dateGroup.forEach(expense => {
                const expenseElement = this.createExpenseElement(expense);
                this.expenseList.appendChild(expenseElement);
            });
        });
    }

    groupExpensesByDate() {
        const grouped = {};
        
        this.expenses.forEach(expense => {
            const date = expense.displayDate;
            if (!grouped[date]) {
                grouped[date] = [];
            }
            grouped[date].push(expense);
        });
        
        return grouped;
    }

    createExpenseElement(expense) {
        const li = document.createElement('li');
        li.className = 'expense-item';
        li.setAttribute('data-expense-id', expense.id);
        
        const categoryEmojis = {
            food: '🍔',
            transport: '🚗',
            shopping: '🛍️',
            entertainment: '🎬',
            bills: '📄',
            other: '📦'
        };
        
        li.innerHTML = `
            <div style="flex: 1;">
                <div class="expense-description">${this.escapeHtml(expense.description)}</div>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                    ${categoryEmojis[expense.category]} ${expense.category.charAt(0).toUpperCase() + expense.category.slice(1)}
                </div>
            </div>
            <span class="expense-amount">${Utils.formatCurrency(expense.amount)}</span>
            <button class="todo-delete" data-action="delete" data-id="${expense.id}">
                ×
            </button>
        `;

        // Add event listeners
        li.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action');
            const id = e.target.getAttribute('data-id');
            
            if (action === 'delete') {
                this.deleteExpense(id);
            }
        });

        return li;
    }

    renderChart() {
        if (!this.expenseChart) return;

        const categoryTotals = this.getCategoryTotals();
        const maxAmount = Math.max(...Object.values(categoryTotals));
        
        if (maxAmount === 0) {
            this.expenseChart.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 20px;">No expenses to chart</div>';
            return;
        }

        const categoryColors = {
            food: 'var(--warning-color)',
            transport: 'var(--primary-color)',
            shopping: 'var(--secondary-color)',
            entertainment: 'var(--accent-color)',
            bills: 'var(--error-color)',
            other: 'var(--text-muted)'
        };

        this.expenseChart.innerHTML = Object.entries(categoryTotals)
            .filter(([_, amount]) => amount > 0)
            .map(([category, amount]) => {
                const height = (amount / maxAmount) * 100;
                return `
                    <div style="
                        flex: 1;
                        background: ${categoryColors[category]};
                        height: ${height}%;
                        border-radius: 2px 2px 0 0;
                        min-height: 4px;
                        position: relative;
                        transition: all 0.3s ease;
                    " title="${category}: ${Utils.formatCurrency(amount)}"></div>
                `;
            }).join('');
    }

    getCategoryTotals() {
        const totals = {
            food: 0,
            transport: 0,
            shopping: 0,
            entertainment: 0,
            bills: 0,
            other: 0
        };

        this.expenses.forEach(expense => {
            totals[expense.category] += expense.amount;
        });

        return totals;
    }

    showEmptyState() {
        this.expenseList.innerHTML = `
            <li class="empty-state">
                No expenses tracked today. Add one above! 💰
            </li>
        `;
    }

    updateTotal() {
        if (!this.totalAmount) return;

        const total = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        this.totalAmount.textContent = Utils.formatCurrency(total);
        
        // Update color based on amount
        if (total > 100) {
            this.totalAmount.style.color = 'var(--warning-color)';
        } else if (total > 50) {
            this.totalAmount.style.color = 'var(--accent-color)';
        } else {
            this.totalAmount.style.color = 'var(--success-color)';
        }
    }

    showSuccess(message) {
        this.showFeedback(message, 'success');
    }

    showError(message) {
        this.showFeedback(message, 'error');
    }

    showFeedback(message, type) {
        const feedback = document.createElement('div');
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--${type === 'success' ? 'success' : 'error'}-color);
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
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    saveExpenses() {
        // Only save today's expenses
        const today = new Date().toLocaleDateString();
        const todayExpenses = this.expenses.filter(expense => expense.displayDate === today);
        Utils.saveToStorage(`expenses_${today}`, todayExpenses);
    }

    loadExpenses() {
        // Load today's expenses
        const today = new Date().toLocaleDateString();
        return Utils.loadFromStorage(`expenses_${today}`, []);
    }

    // Get statistics for other components
    getStatistics() {
        const total = this.expenses.reduce((sum, expense) => sum + expense.amount, 0);
        const categoryTotals = this.getCategoryTotals();
        
        const mostExpensiveCategory = Object.keys(categoryTotals).reduce((a, b) => 
            categoryTotals[a] > categoryTotals[b] ? a : b, Object.keys(categoryTotals)[0]
        );
        
        return {
            total,
            count: this.expenses.length,
            categories: categoryTotals,
            mostExpensiveCategory,
            averageExpense: this.expenses.length > 0 ? total / this.expenses.length : 0
        };
    }

    // Clear all expenses (with confirmation)
    clearAllExpenses() {
        if (this.expenses.length === 0) return;

        if (confirm(`Are you sure you want to delete all ${this.expenses.length} expense(s)?`)) {
            this.expenses = [];
            this.saveExpenses();
            this.renderExpenses();
            this.updateTotal();
            this.renderChart();
            this.showSuccess('All expenses cleared');
        }
    }
}

// CSS for expense animations
const expenseStyles = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
`;

// Inject styles
const expenseStyleSheet = document.createElement('style');
expenseStyleSheet.textContent = expenseStyles;
document.head.appendChild(expenseStyleSheet);

// Initialize expense tracker when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.expenseInstance = new ExpenseTracker();
});