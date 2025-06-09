// Quick notes functionality

class NotesManager {
    constructor() {
        this.notesTextarea = document.getElementById('quick-notes');
        this.wordCount = document.getElementById('word-count');
        this.autoSaveStatus = document.getElementById('auto-save-status');
        this.clearButton = document.getElementById('clear-notes');
        
        this.autoSaveTimeout = null;
        
        this.init();
    }

    init() {
        this.loadNotes();
        this.setupEventListeners();
        this.updateWordCount();
    }

    setupEventListeners() {
        if (this.notesTextarea) {
            this.notesTextarea.addEventListener('input', () => {
                this.updateWordCount();
                this.scheduleAutoSave();
            });

            this.notesTextarea.addEventListener('paste', () => {
                setTimeout(() => {
                    this.updateWordCount();
                    this.scheduleAutoSave();
                }, 10);
            });
        }

        if (this.clearButton) {
            this.clearButton.addEventListener('click', () => {
                this.clearNotes();
            });
        }

        // Auto-save on page unload
        window.addEventListener('beforeunload', () => {
            this.saveNotes();
        });
    }

    scheduleAutoSave() {
        if (this.autoSaveTimeout) {
            clearTimeout(this.autoSaveTimeout);
        }

        this.showSaveStatus('Saving...');

        this.autoSaveTimeout = setTimeout(() => {
            this.saveNotes();
            this.showSaveStatus('Auto-saved');
        }, 1000);
    }

    updateWordCount() {
        if (!this.wordCount || !this.notesTextarea) return;

        const text = this.notesTextarea.value.trim();
        const words = text ? text.split(/\s+/).length : 0;
        const chars = text.length;

        this.wordCount.textContent = `${words} words, ${chars} chars`;
    }

    showSaveStatus(status) {
        if (this.autoSaveStatus) {
            this.autoSaveStatus.textContent = status;
            
            if (status === 'Auto-saved') {
                this.autoSaveStatus.style.color = 'var(--success-color)';
            } else {
                this.autoSaveStatus.style.color = 'var(--text-muted)';
            }
        }
    }

    clearNotes() {
        if (!this.notesTextarea) return;

        const hasContent = this.notesTextarea.value.trim().length > 0;
        
        if (hasContent && !confirm('Are you sure you want to clear all notes?')) {
            return;
        }

        this.notesTextarea.value = '';
        this.updateWordCount();
        this.saveNotes();
        this.showSaveStatus('Cleared');
    }

    saveNotes() {
        if (!this.notesTextarea) return;

        const notes = {
            content: this.notesTextarea.value,
            lastModified: new Date().toISOString()
        };

        Utils.saveToStorage('quick_notes', notes);
    }

    loadNotes() {
        const savedNotes = Utils.loadFromStorage('quick_notes', null);
        
        if (savedNotes && this.notesTextarea) {
            this.notesTextarea.value = savedNotes.content || '';
        }
    }

    // Export notes as text file
    exportNotes() {
        if (!this.notesTextarea) return;

        const content = this.notesTextarea.value;
        if (!content.trim()) {
            alert('No notes to export');
            return;
        }

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `notes-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    getStatistics() {
        const content = this.notesTextarea?.value || '';
        const words = content.trim() ? content.trim().split(/\s+/).length : 0;
        const chars = content.length;
        const lines = content.split('\n').length;

        return {
            words,
            characters: chars,
            lines,
            hasContent: content.trim().length > 0
        };
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.notesInstance = new NotesManager();
});