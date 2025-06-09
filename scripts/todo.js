// Todo list functionality with local storage

class TodoManager {
    constructor() {
        this.todoInput = document.getElementById('todo-input');
        this.addButton = document.getElementById('add-todo');
        this.todoList = document.getElementById('todo-list');
        this.taskCount = document.getElementById('task-count');
        this.todoFilter = document.getElementById('todo-filter');
        this.todoPriority = document.getElementById('todo-priority');
        
        this.todos = this.loadTodos();
        this.currentFilter = 'all';
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.renderTodos();
        this.updateTaskCount();
    }

    setupEventListeners() {
        // Add todo button
        if (this.addButton) {
            this.addButton.addEventListener('click', () => {
                this.addTodo();
            });
        }

        // Enter key in input
        if (this.todoInput) {
            this.todoInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.addTodo();
                }
            });

            // Input validation
            this.todoInput.addEventListener('input', () => {
                this.validateInput();
            });
        }

        // Filter change
        if (this.todoFilter) {
            this.todoFilter.addEventListener('change', (e) => {
                this.currentFilter = e.target.value;
                this.renderTodos();
            });
        }
    }

    validateInput() {
        const value = this.todoInput.value.trim();
        const validation = Utils.validateInput(value, 'text', { min: 1, max: 100 });
        
        if (this.addButton) {
            this.addButton.disabled = !validation.valid || value === '';
            this.addButton.style.opacity = validation.valid && value !== '' ? '1' : '0.5';
        }
    }

    addTodo() {
        const text = this.todoInput.value.trim();
        const priority = this.todoPriority?.value || 'medium';
        
        if (!text) return;

        const validation = Utils.validateInput(text, 'text', { min: 1, max: 100, required: true });
        
        if (!validation.valid) {
            this.showError(validation.error);
            return;
        }

        const todo = {
            id: Utils.generateId(),
            text: text,
            priority: priority,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        this.todos.unshift(todo); // Add to beginning
        this.saveTodos();
        this.renderTodos();
        this.updateTaskCount();
        
        // Clear input
        this.todoInput.value = '';
        if (this.todoPriority) this.todoPriority.value = 'medium';
        this.validateInput();
        
        // Show success feedback
        this.showSuccess('Task added successfully!');
    }

    toggleTodo(id) {
        const todo = this.todos.find(t => t.id === id);
        if (todo) {
            todo.completed = !todo.completed;
            todo.completedAt = todo.completed ? new Date().toISOString() : null;
            
            this.saveTodos();
            this.renderTodos();
            this.updateTaskCount();
            
            // Show completion feedback
            if (todo.completed) {
                this.showSuccess('Task completed! 🎉');
            }
        }
    }

    deleteTodo(id) {
        const todoElement = document.querySelector(`[data-todo-id="${id}"]`);
        if (todoElement) {
            // Add exit animation
            todoElement.style.animation = 'slideOut 0.3s ease forwards';
            
            setTimeout(() => {
                this.todos = this.todos.filter(t => t.id !== id);
                this.saveTodos();
                this.renderTodos();
                this.updateTaskCount();
            }, 300);
        }
    }

    getFilteredTodos() {
        switch (this.currentFilter) {
            case 'pending':
                return this.todos.filter(t => !t.completed);
            case 'completed':
                return this.todos.filter(t => t.completed);
            case 'priority':
                return this.todos.filter(t => t.priority === 'high' && !t.completed);
            default:
                return this.todos;
        }
    }

    renderTodos() {
        if (!this.todoList) return;

        this.todoList.innerHTML = '';
        const filteredTodos = this.getFilteredTodos();

        if (filteredTodos.length === 0) {
            this.showEmptyState();
            return;
        }

        filteredTodos.forEach(todo => {
            const todoElement = this.createTodoElement(todo);
            this.todoList.appendChild(todoElement);
        });
    }

    createTodoElement(todo) {
        const li = document.createElement('li');
        li.className = `todo-item ${todo.completed ? 'completed' : ''} priority-${todo.priority}`;
        li.setAttribute('data-todo-id', todo.id);
        
        const priorityIcon = {
            high: '🔴',
            medium: '🟡',
            low: '🟢'
        };
        
        li.innerHTML = `
            <div class="todo-checkbox ${todo.completed ? 'checked' : ''}" 
                 data-action="toggle" data-id="${todo.id}">
                ${todo.completed ? '✓' : ''}
            </div>
            <div style="flex: 1;">
                <span class="todo-text">${this.escapeHtml(todo.text)}</span>
                <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">
                    ${priorityIcon[todo.priority]} ${todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)} priority
                </div>
            </div>
            <button class="todo-delete" data-action="delete" data-id="${todo.id}">
                ×
            </button>
        `;

        // Add event listeners
        li.addEventListener('click', (e) => {
            const action = e.target.getAttribute('data-action');
            const id = e.target.getAttribute('data-id');
            
            if (action === 'toggle') {
                this.toggleTodo(id);
            } else if (action === 'delete') {
                this.deleteTodo(id);
            }
        });

        return li;
    }

    showEmptyState() {
        let message = 'No tasks yet. Add one above to get started! 📝';
        
        switch (this.currentFilter) {
            case 'pending':
                message = 'No pending tasks! You\'re all caught up! 🎉';
                break;
            case 'completed':
                message = 'No completed tasks yet. Get started! 💪';
                break;
            case 'priority':
                message = 'No high priority tasks. Great job! ⭐';
                break;
        }
        
        this.todoList.innerHTML = `
            <li class="empty-state">
                ${message}
            </li>
        `;
    }

    updateTaskCount() {
        if (!this.taskCount) return;

        const completedCount = this.todos.filter(t => t.completed).length;
        const totalCount = this.todos.length;
        
        if (totalCount === 0) {
            this.taskCount.textContent = '0 tasks';
        } else {
            this.taskCount.textContent = `${completedCount}/${totalCount} completed`;
        }

        // Update color based on completion
        if (completedCount === totalCount && totalCount > 0) {
            this.taskCount.style.color = 'var(--success-color)';
        } else {
            this.taskCount.style.color = 'var(--text-muted)';
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
            left: 50%;
            transform: translateX(-50%);
            background: var(--${type === 'success' ? 'success' : 'error'}-color);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 1000;
            animation: slideDown 0.3s ease;
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.style.animation = 'slideUp 0.3s ease forwards';
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

    saveTodos() {
        Utils.saveToStorage('todos', this.todos);
    }

    loadTodos() {
        return Utils.loadFromStorage('todos', []);
    }

    // Get statistics for other components
    getStatistics() {
        const total = this.todos.length;
        const completed = this.todos.filter(t => t.completed).length;
        const pending = total - completed;
        const highPriority = this.todos.filter(t => t.priority === 'high' && !t.completed).length;
        
        return {
            total,
            completed,
            pending,
            highPriority,
            completionRate: total > 0 ? (completed / total) * 100 : 0
        };
    }

    // Clear completed tasks
    clearCompleted() {
        const completedCount = this.todos.filter(t => t.completed).length;
        if (completedCount === 0) return;

        if (confirm(`Are you sure you want to delete ${completedCount} completed task(s)?`)) {
            this.todos = this.todos.filter(t => !t.completed);
            this.saveTodos();
            this.renderTodos();
            this.updateTaskCount();
            this.showSuccess(`${completedCount} completed task(s) deleted`);
        }
    }
}

// CSS for todo animations
const todoStyles = `
    @keyframes slideOut {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(-100%);
            height: 0;
            padding: 0;
            margin: 0;
        }
    }
`;

// Inject styles
const todoStyleSheet = document.createElement('style');
todoStyleSheet.textContent = todoStyles;
document.head.appendChild(todoStyleSheet);

// Initialize todo manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.todoInstance = new TodoManager();
});