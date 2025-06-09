// Daily quotes functionality

class QuoteManager {
    constructor() {
        this.quoteText = document.getElementById('quote-text');
        this.quoteAuthor = document.getElementById('quote-author');
        this.refreshButton = document.getElementById('quote-refresh');
        this.favoriteButton = document.getElementById('quote-favorite');
        
        this.quotes = this.getQuoteDatabase();
        this.currentQuote = null;
        this.favoriteQuotes = this.loadFavoriteQuotes();
        
        this.init();
    }

    init() {
        this.loadQuote();
        this.setupEventListeners();
    }

    setupEventListeners() {
        if (this.refreshButton) {
            this.refreshButton.addEventListener('click', () => {
                this.refreshQuote();
            });
        }

        if (this.favoriteButton) {
            this.favoriteButton.addEventListener('click', () => {
                this.toggleFavorite();
            });
        }

        // Load new quote daily
        this.setupDailyRefresh();
    }

    loadQuote() {
        // Try to load today's quote from storage
        const today = new Date().toDateString();
        const savedQuote = Utils.loadFromStorage('daily_quote');
        
        if (savedQuote && savedQuote.date === today) {
            this.currentQuote = savedQuote.quote;
        } else {
            // Get new quote for today
            this.currentQuote = this.getRandomQuote();
            Utils.saveToStorage('daily_quote', {
                date: today,
                quote: this.currentQuote
            });
        }

        this.displayQuote();
        this.updateFavoriteButton();
    }

    refreshQuote() {
        // Get a new random quote (not daily quote)
        this.currentQuote = this.getRandomQuote();
        this.displayQuote();
        this.updateFavoriteButton();
        
        // Add refresh animation
        if (this.refreshButton) {
            this.refreshButton.style.transform = 'rotate(360deg)';
            setTimeout(() => {
                this.refreshButton.style.transform = '';
            }, 300);
        }
    }

    toggleFavorite() {
        if (!this.currentQuote) return;

        const quoteId = this.getQuoteId(this.currentQuote);
        const isFavorited = this.favoriteQuotes.some(fq => this.getQuoteId(fq) === quoteId);

        if (isFavorited) {
            this.favoriteQuotes = this.favoriteQuotes.filter(fq => this.getQuoteId(fq) !== quoteId);
            this.showFeedback('Removed from favorites', 'info');
        } else {
            this.favoriteQuotes.push({
                ...this.currentQuote,
                favoritedAt: new Date().toISOString()
            });
            this.showFeedback('Added to favorites! ❤️', 'success');
        }

        this.saveFavoriteQuotes();
        this.updateFavoriteButton();
    }

    getQuoteId(quote) {
        return `${quote.text}-${quote.author}`;
    }

    updateFavoriteButton() {
        if (!this.favoriteButton || !this.currentQuote) return;

        const quoteId = this.getQuoteId(this.currentQuote);
        const isFavorited = this.favoriteQuotes.some(fq => this.getQuoteId(fq) === quoteId);

        if (isFavorited) {
            this.favoriteButton.textContent = '♥';
            this.favoriteButton.classList.add('favorited');
        } else {
            this.favoriteButton.textContent = '♡';
            this.favoriteButton.classList.remove('favorited');
        }
    }

    displayQuote() {
        if (!this.currentQuote) return;

        // Add fade out animation
        const quoteWidget = document.querySelector('.quote-widget .quote-content');
        if (quoteWidget) {
            quoteWidget.style.animation = 'fadeOut 0.3s ease';
        }

        setTimeout(() => {
            if (this.quoteText) {
                this.quoteText.textContent = `"${this.currentQuote.text}"`;
            }
            
            if (this.quoteAuthor) {
                this.quoteAuthor.textContent = `— ${this.currentQuote.author}`;
            }

            // Fade back in
            if (quoteWidget) {
                quoteWidget.style.animation = 'fadeIn 0.3s ease';
            }
        }, 300);
    }

    getRandomQuote() {
        return this.quotes[Math.floor(Math.random() * this.quotes.length)];
    }

    setupDailyRefresh() {
        // Check every hour if we need to load a new daily quote
        setInterval(() => {
            const today = new Date().toDateString();
            const savedQuote = Utils.loadFromStorage('daily_quote');
            
            if (!savedQuote || savedQuote.date !== today) {
                this.loadQuote();
            }
        }, 60 * 60 * 1000); // Check every hour
    }

    showFeedback(message, type) {
        const feedback = document.createElement('div');
        feedback.textContent = message;
        feedback.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--${type === 'success' ? 'success' : type === 'info' ? 'primary' : 'error'}-color);
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 14px;
            z-index: 1000;
            animation: slideUp 0.3s ease;
        `;
        
        document.body.appendChild(feedback);
        
        setTimeout(() => {
            feedback.style.animation = 'slideDown 0.3s ease forwards';
            setTimeout(() => {
                if (document.body.contains(feedback)) {
                    document.body.removeChild(feedback);
                }
            }, 300);
        }, 2000);
    }

    saveFavoriteQuotes() {
        Utils.saveToStorage('favorite_quotes', this.favoriteQuotes);
    }

    loadFavoriteQuotes() {
        return Utils.loadFromStorage('favorite_quotes', []);
    }

    getQuoteDatabase() {
        return [
            {
                text: "The only way to do great work is to love what you do.",
                author: "Steve Jobs"
            },
            {
                text: "Innovation distinguishes between a leader and a follower.",
                author: "Steve Jobs"
            },
            {
                text: "Life is what happens to you while you're busy making other plans.",
                author: "John Lennon"
            },
            {
                text: "The future belongs to those who believe in the beauty of their dreams.",
                author: "Eleanor Roosevelt"
            },
            {
                text: "It is during our darkest moments that we must focus to see the light.",
                author: "Aristotle"
            },
            {
                text: "The only impossible journey is the one you never begin.",
                author: "Tony Robbins"
            },
            {
                text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
                author: "Winston Churchill"
            },
            {
                text: "The way to get started is to quit talking and begin doing.",
                author: "Walt Disney"
            },
            {
                text: "Don't let yesterday take up too much of today.",
                author: "Will Rogers"
            },
            {
                text: "You learn more from failure than from success. Don't let it stop you. Failure builds character.",
                author: "Unknown"
            },
            {
                text: "If you are working on something that you really care about, you don't have to be pushed. The vision pulls you.",
                author: "Steve Jobs"
            },
            {
                text: "People who are crazy enough to think they can change the world, are the ones who do.",
                author: "Steve Jobs"
            },
            {
                text: "Failure will never overtake me if my determination to succeed is strong enough.",
                author: "Og Mandino"
            },
            {
                text: "Entrepreneurs are great at dealing with uncertainty and also very good at minimizing risk. That's the classic entrepreneur.",
                author: "Mohnish Pabrai"
            },
            {
                text: "We may encounter many defeats but we must not be defeated.",
                author: "Maya Angelou"
            },
            {
                text: "Knowing is not enough; we must apply. Wishing is not enough; we must do.",
                author: "Johann Wolfgang von Goethe"
            },
            {
                text: "Imagine your life is perfect in every respect; what would it look like?",
                author: "Brian Tracy"
            },
            {
                text: "We generate fears while we sit. We overcome them by action.",
                author: "Dr. Henry Link"
            },
            {
                text: "Whether you think you can or think you can't, you're right.",
                author: "Henry Ford"
            },
            {
                text: "The man who has confidence in himself gains the confidence of others.",
                author: "Hasidic Proverb"
            },
            {
                text: "The only limit to our realization of tomorrow will be our doubts of today.",
                author: "Franklin D. Roosevelt"
            },
            {
                text: "Creativity is intelligence having fun.",
                author: "Albert Einstein"
            },
            {
                text: "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
                author: "Ralph Waldo Emerson"
            },
            {
                text: "You are never too old to set another goal or to dream a new dream.",
                author: "C.S. Lewis"
            },
            {
                text: "The best time to plant a tree was 20 years ago. The second best time is now.",
                author: "Chinese Proverb"
            },
            {
                text: "Success is not how high you have climbed, but how you make a positive difference to the world.",
                author: "Roy T. Bennett"
            },
            {
                text: "Believe you can and you're halfway there.",
                author: "Theodore Roosevelt"
            },
            {
                text: "The only person you are destined to become is the person you decide to be.",
                author: "Ralph Waldo Emerson"
            },
            {
                text: "Your limitation—it's only your imagination.",
                author: "Unknown"
            },
            {
                text: "Push yourself, because no one else is going to do it for you.",
                author: "Unknown"
            }
        ];
    }

    // Get current quote for other components
    getCurrentQuote() {
        return this.currentQuote;
    }

    // Get quote by category (could be extended)
    getQuoteByCategory(category) {
        // This could be extended to filter quotes by category
        return this.getRandomQuote();
    }

    // Get favorite quotes
    getFavoriteQuotes() {
        return this.favoriteQuotes;
    }
}

// CSS for quote animations
const quoteStyles = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-10px);
        }
    }
`;

// Inject styles
const quoteStyleSheet = document.createElement('style');
quoteStyleSheet.textContent = quoteStyles;
document.head.appendChild(quoteStyleSheet);

// Initialize quote manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.quoteInstance = new QuoteManager();
});