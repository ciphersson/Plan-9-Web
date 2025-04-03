class Rio {
    constructor() {
        this.windows = [];
        this.activeWindow = null;
        this.windowCounter = 0;
        
        // Initialize event listeners
        document.getElementById('new-window').addEventListener('click', () => this.createWindow());
        
        // Initialize clock
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);
    }

    createWindow(title = 'rc') {
        const id = ++this.windowCounter;
        const win = new RioWindow({
            id,
            title,
            x: 50 + (this.windows.length * 30),
            y: 50 + (this.windows.length * 30),
            width: 400,
            height: 300,
            content: `Welcome to window ${id}`
        });
        
        this.windows.push(win);
        this.setActiveWindow(win);
        this.updateTaskbar();
        return win;
    }

    removeWindow(window) {
        const index = this.windows.indexOf(window);
        if (index > -1) {
            this.windows.splice(index, 1);
            if (this.activeWindow === window) {
                this.activeWindow = this.windows[this.windows.length - 1] || null;
            }
            this.updateTaskbar();
        }
    }

    setActiveWindow(window) {
        if (this.activeWindow) {
            this.activeWindow.deactivate();
        }
        this.activeWindow = window;
        if (window) {
            window.activate();
            window.element.style.zIndex = this.getTopZIndex() + 1;
        }
        this.updateTaskbar();
    }

    getTopZIndex() {
        return Math.max(0, ...this.windows.map(w => parseInt(w.element.style.zIndex) || 0));
    }

    updateTaskbar() {
        const taskbar = document.getElementById('active-windows');
        taskbar.innerHTML = '';
        
        this.windows.forEach(window => {
            const tab = document.createElement('div');
            tab.className = `window-tab${window === this.activeWindow ? ' active' : ''}`;
            tab.textContent = `${window.title} (${window.id})`;
            tab.addEventListener('click', () => this.setActiveWindow(window));
            taskbar.appendChild(tab);
        });
    }

    updateClock() {
        const clock = document.getElementById('clock');
        const now = new Date();
        clock.textContent = now.toLocaleTimeString();
    }
}

// Initialize Rio window manager
window.rio = new Rio();
