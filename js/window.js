class RioWindow {
    constructor(config) {
        this.id = config.id;
        this.title = config.title;
        this.x = config.x;
        this.y = config.y;
        this.width = config.width;
        this.height = config.height;
        this.content = config.content;
        this.active = false;
        
        this.createElement();
        this.setupEventListeners();
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.className = 'window';
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        this.element.style.width = `${this.width}px`;
        this.element.style.height = `${this.height}px`;
        
        this.element.innerHTML = `
            <div class="window-titlebar">
                <span class="window-title">${this.title} (${this.id})</span>
                <div class="window-controls">
                    <button class="window-button minimize">-</button>
                    <button class="window-button maximize">□</button>
                    <button class="window-button close">×</button>
                </div>
            </div>
            <div class="window-content">${this.content}</div>
        `;
        
        document.getElementById('window-manager').appendChild(this.element);
    }

    setupEventListeners() {
        // Window activation
        this.element.addEventListener('mousedown', () => {
            window.rio.setActiveWindow(this);
        });

        // Dragging
        const titlebar = this.element.querySelector('.window-titlebar');
        titlebar.addEventListener('mousedown', (e) => {
            if (e.target === titlebar) {
                this.startDragging(e);
            }
        });

        // Window controls
        this.element.querySelector('.close').addEventListener('click', () => {
            this.close();
        });

        this.element.querySelector('.maximize').addEventListener('click', () => {
            this.toggleMaximize();
        });

        this.element.querySelector('.minimize').addEventListener('click', () => {
            this.minimize();
        });
    }

    startDragging(e) {
        const initialX = e.clientX - this.x;
        const initialY = e.clientY - this.y;
        
        const moveHandler = (e) => {
            this.x = e.clientX - initialX;
            this.y = e.clientY - initialY;
            this.element.style.left = `${this.x}px`;
            this.element.style.top = `${this.y}px`;
        };
        
        const upHandler = () => {
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
        };
        
        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', upHandler);
    }

    activate() {
        this.active = true;
        this.element.classList.add('active');
    }

    deactivate() {
        this.active = false;
        this.element.classList.remove('active');
    }

    close() {
        this.element.remove();
        window.rio.removeWindow(this);
    }

    toggleMaximize() {
        if (this.maximized) {
            this.element.style.left = `${this.savedState.x}px`;
            this.element.style.top = `${this.savedState.y}px`;
            this.element.style.width = `${this.savedState.width}px`;
            this.element.style.height = `${this.savedState.height}px`;
            this.maximized = false;
        } else {
            this.savedState = {
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height
            };
            this.element.style.left = '0';
            this.element.style.top = '0';
            this.element.style.width = '100%';
            this.element.style.height = `calc(100% - 30px)`;
            this.maximized = true;
        }
    }

    minimize() {
        // For now, just toggle visibility
        this.element.style.display = this.element.style.display === 'none' ? 'flex' : 'none';
    }
}
