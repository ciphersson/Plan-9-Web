class Acme {
    constructor() {
        this.columns = [];
        this.bookmarks = {
            load() {
                return JSON.parse(localStorage.getItem('acme.bookmarks') || '{}');
            },
            save(marks) {
                localStorage.setItem('acme.bookmarks', JSON.stringify(marks));
            },
            add(path, position) {
                const marks = this.load();
                marks[path] = position;
                this.save(marks);
            },
            get(path) {
                const marks = this.load();
                return marks[path];
            }
        };
        this.createUI();
        this.setupEventListeners();
        this.setupLayoutCommands();
        
        // Make this instance globally accessible for plumbing
        window.activeAcme = this;
    }

    createUI() {
        this.element = document.createElement('div');
        this.element.className = 'acme';
        
        // Main toolbar
        this.toolbar = document.createElement('div');
        this.toolbar.className = 'acme-toolbar';
        this.toolbar.innerHTML = `
            <span class="command" data-cmd="New">New</span>
            <span class="command" data-cmd="Newcol">Newcol</span>
            <span class="command" data-cmd="Exit">Exit</span>
            <span class="command" data-cmd="Dump">Dump</span>
            <span class="command" data-cmd="Load">Load</span>
            <span class="command" data-cmd="Putall">Putall</span>
            <span class="command" data-cmd="Tile">Tile</span>
            <span class="command" data-cmd="Stack">Stack</span>
            <span class="command" data-cmd="Cascade">Cascade</span>
        `;
        this.element.appendChild(this.toolbar);
        
        // Columns container
        this.columnsContainer = document.createElement('div');
        this.columnsContainer.className = 'acme-columns';
        this.element.appendChild(this.columnsContainer);
        
        // Create initial column
        this.createColumn();
        
        document.getElementById('window-manager').appendChild(this.element);
    }

    setupEventListeners() {
        this.toolbar.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('command')) {
                const cmd = e.target.dataset.cmd;
                if (e.button === 1) { // Middle click
                    this.executeCommand(cmd);
                }
            }
        });

        // Prevent text selection on middle click
        this.element.addEventListener('mousedown', (e) => {
            if (e.button === 1) {
                e.preventDefault();
            }
        });
    }

    setupLayoutCommands() {
        this.layoutCommands = {
            'Tile': () => this.tileWindows(),
            'Stack': () => this.stackWindows(),
            'Cascade': () => this.cascadeWindows()
        };
    }

    executeCommand(cmd) {
        if (this.layoutCommands[cmd]) {
            this.layoutCommands[cmd]();
            return;
        }

        switch (cmd) {
            case 'New':
                this.activeColumn?.createWindow();
                break;
            case 'Newcol':
                this.createColumn();
                break;
            case 'Exit':
                this.element.remove();
                window.activeAcme = null;
                break;
            case 'Dump':
                this.dumpState();
                break;
            case 'Load':
                this.loadState();
                break;
            case 'Putall':
                this.saveAllFiles();
                break;
        }
    }

    getAllWindows() {
        return this.columns.flatMap(col => col.windows);
    }

    tileWindows() {
        const windows = this.getAllWindows();
        const cols = Math.ceil(Math.sqrt(windows.length));
        const rows = Math.ceil(windows.length / cols);
        const width = 100 / cols;
        const height = 100 / rows;
        
        windows.forEach((win, i) => {
            const col = i % cols;
            const row = Math.floor(i / cols);
            win.element.style.width = `${width}%`;
            win.element.style.height = `${height}%`;
            win.element.style.left = `${col * width}%`;
            win.element.style.top = `${row * height}%`;
        });
    }

    stackWindows() {
        const windows = this.getAllWindows();
        const offset = 20; // pixels
        
        windows.forEach((win, i) => {
            win.element.style.width = '80%';
            win.element.style.height = '80%';
            win.element.style.left = `${offset * i}px`;
            win.element.style.top = `${offset * i}px`;
            win.element.style.zIndex = i;
        });
    }

    cascadeWindows() {
        const windows = this.getAllWindows();
        const maxWidth = this.element.clientWidth;
        const maxHeight = this.element.clientHeight;
        const minWidth = maxWidth * 0.4;
        const minHeight = maxHeight * 0.4;
        const xStep = (maxWidth - minWidth) / (windows.length || 1);
        const yStep = (maxHeight - minHeight) / (windows.length || 1);
        
        windows.forEach((win, i) => {
            win.element.style.width = `${minWidth}px`;
            win.element.style.height = `${minHeight}px`;
            win.element.style.left = `${i * xStep}px`;
            win.element.style.top = `${i * yStep}px`;
            win.element.style.zIndex = i;
        });
    }

    createColumn() {
        const column = new AcmeColumn(this);
        this.columns.push(column);
        this.columnsContainer.appendChild(column.element);
        this.activeColumn = column;
        return column;
    }

    removeColumn(column) {
        const index = this.columns.indexOf(column);
        if (index > -1) {
            this.columns.splice(index, 1);
            if (this.activeColumn === column) {
                this.activeColumn = this.columns[this.columns.length - 1];
            }
        }
    }

    dumpState() {
        const state = {
            columns: this.columns.map(col => col.getState()),
            bookmarks: this.bookmarks.load()
        };
        localStorage.setItem('acme.dump', JSON.stringify(state));
    }

    loadState() {
        try {
            const state = JSON.parse(localStorage.getItem('acme.dump'));
            if (state) {
                // Clear existing columns
                this.columns.forEach(col => col.element.remove());
                this.columns = [];
                
                // Restore columns
                state.columns.forEach(colState => {
                    const col = this.createColumn();
                    col.restoreState(colState);
                });

                // Restore bookmarks
                if (state.bookmarks) {
                    this.bookmarks.save(state.bookmarks);
                }
            }
        } catch (e) {
            console.error('Failed to load Acme state:', e);
        }
    }

    saveAllFiles() {
        this.columns.forEach(col => {
            col.windows.forEach(win => {
                if (win.hasUnsavedChanges) {
                    win.save();
                }
            });
        });
    }
}
