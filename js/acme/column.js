class AcmeColumn {
    constructor(acme) {
        this.acme = acme;
        this.windows = [];
        this.createUI();
        this.setupEventListeners();
    }

    createUI() {
        this.element = document.createElement('div');
        this.element.className = 'acme-column';
        
        // Column toolbar
        this.toolbar = document.createElement('div');
        this.toolbar.className = 'column-toolbar';
        this.toolbar.innerHTML = `
            <div class="grip"></div>
            <span class="command" data-cmd="New">New</span>
            <span class="command" data-cmd="Delcol">Delcol</span>
            <span class="command" data-cmd="Cut">Cut</span>
            <span class="command" data-cmd="Paste">Paste</span>
            <span class="command" data-cmd="Snarf">Snarf</span>
            <span class="command" data-cmd="Sort">Sort</span>
            <span class="command" data-cmd="Zerox">Zerox</span>
        `;
        this.element.appendChild(this.toolbar);
        
        // Windows container
        this.windowsContainer = document.createElement('div');
        this.windowsContainer.className = 'column-windows';
        this.element.appendChild(this.windowsContainer);
        
        // Create initial window
        this.createWindow();
    }

    setupEventListeners() {
        this.toolbar.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('command')) {
                const cmd = e.target.dataset.cmd;
                if (e.button === 1) { // Middle click
                    this.executeCommand(cmd);
                }
            } else if (e.target.classList.contains('grip')) {
                this.startDragging(e);
            }
        });
    }

    executeCommand(cmd) {
        switch (cmd) {
            case 'New':
                this.createWindow();
                break;
            case 'Delcol':
                this.delete();
                break;
            case 'Cut':
                this.activeWindow?.cut();
                break;
            case 'Paste':
                this.activeWindow?.paste();
                break;
            case 'Snarf':
                this.activeWindow?.snarf();
                break;
            case 'Sort':
                this.sortWindows();
                break;
            case 'Zerox':
                this.duplicateActiveWindow();
                break;
        }
    }

    startDragging(e) {
        const startX = e.clientX;
        const startWidth = this.element.offsetWidth;
        
        const moveHandler = (e) => {
            const delta = e.clientX - startX;
            this.element.style.width = `${startWidth + delta}px`;
        };
        
        const upHandler = () => {
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
        };
        
        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', upHandler);
    }

    createWindow(title = 'New') {
        const win = new AcmeWindow(this, title);
        this.windows.push(win);
        this.windowsContainer.appendChild(win.element);
        this.setActiveWindow(win);
        return win;
    }

    removeWindow(window) {
        const index = this.windows.indexOf(window);
        if (index > -1) {
            this.windows.splice(index, 1);
            if (this.activeWindow === window) {
                this.activeWindow = this.windows[this.windows.length - 1];
            }
        }
        if (this.windows.length === 0) {
            this.delete();
        }
    }

    setActiveWindow(window) {
        if (this.activeWindow) {
            this.activeWindow.deactivate();
        }
        this.activeWindow = window;
        if (window) {
            window.activate();
        }
    }

    delete() {
        this.windows.forEach(win => win.element.remove());
        this.element.remove();
        this.acme.removeColumn(this);
    }

    sortWindows() {
        this.windows.sort((a, b) => a.title.localeCompare(b.title));
        this.windows.forEach(win => {
            this.windowsContainer.appendChild(win.element);
        });
    }

    duplicateActiveWindow() {
        if (this.activeWindow) {
            const newWin = this.createWindow(this.activeWindow.title);
            newWin.setContent(this.activeWindow.getContent());
        }
    }

    getState() {
        return {
            width: this.element.style.width,
            windows: this.windows.map(win => win.getState())
        };
    }

    restoreState(state) {
        if (state.width) {
            this.element.style.width = state.width;
        }
        
        // Remove default window
        this.windows[0]?.element.remove();
        this.windows = [];
        
        // Restore windows
        state.windows.forEach(winState => {
            const win = this.createWindow(winState.title);
            win.restoreState(winState);
        });
    }
}
