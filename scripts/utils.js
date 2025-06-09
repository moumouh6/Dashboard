// Utility functions for the productivity dashboard

class Utils {
    // Format time with leading zeros
    static formatTime(value) {
        return value.toString().padStart(2, '0');
    }

    // Format date to readable string
    static formatDate(date) {
        const options = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        };
        return date.toLocaleDateString('en-US', options);
    }

    // Get timezone abbreviation
    static getTimezone() {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }

    // Format currency
    static formatCurrency(amount) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    }

    // Generate unique ID
    static generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Animate element
    static animateElement(element, animation) {
        element.style.animation = animation;
        element.addEventListener('animationend', () => {
            element.style.animation = '';
        }, { once: true });
    }

    // Debounce function
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Local storage helpers
    static saveToStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    }

    static loadFromStorage(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error loading from localStorage:', error);
            return defaultValue;
        }
    }

    // Show notification (if supported)
    static showNotification(title, options = {}) {
        if ('Notification' in window && Notification.permission === 'granted') {
            return new Notification(title, {
                icon: '/favicon.ico',
                badge: '/favicon.ico',
                ...options
            });
        }
        return null;
    }

    // Request notification permission
    static async requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            return await Notification.requestPermission();
        }
        return Notification.permission;
    }

    // Validate input
    static validateInput(value, type = 'text', options = {}) {
        const { min, max, required = false } = options;
        
        if (required && (!value || value.trim() === '')) {
            return { valid: false, error: 'This field is required' };
        }
        
        if (!value) return { valid: true };
        
        switch (type) {
            case 'number':
                const num = parseFloat(value);
                if (isNaN(num)) {
                    return { valid: false, error: 'Please enter a valid number' };
                }
                if (min !== undefined && num < min) {
                    return { valid: false, error: `Minimum value is ${min}` };
                }
                if (max !== undefined && num > max) {
                    return { valid: false, error: `Maximum value is ${max}` };
                }
                break;
            case 'text':
                if (min !== undefined && value.length < min) {
                    return { valid: false, error: `Minimum length is ${min} characters` };
                }
                if (max !== undefined && value.length > max) {
                    return { valid: false, error: `Maximum length is ${max} characters` };
                }
                break;
        }
        
        return { valid: true };
    }

    // Add loading state to element
    static setLoading(element, isLoading) {
        if (isLoading) {
            element.classList.add('loading');
        } else {
            element.classList.remove('loading');
        }
    }

    // Smooth scroll to element
    static scrollToElement(element, offset = 0) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    // Check if element is in viewport
    static isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
}

// Export for use in other modules
window.Utils = Utils;