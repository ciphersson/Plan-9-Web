class AcmeWindow {
    constructor(column, title) {
        this.column = column;
        this.title = title;
        this.hasUnsavedChanges = false;
        this.lastSearchIndex = -1;
        this.searchMatches = [];
        this.currentMatchIndex = -1;
        this.createUI();
        this.setupEventListeners();
        this.setupTextCommands();
        this.setupScrollbar();
    }

    createUI() {
        this.element = document.createElement('div');
        this.element.className = 'acme-window';
        
        // Window toolbar
        this.toolbar = document.createElement('div');
        this.toolbar.className = 'window-toolbar';
        this.toolbar.innerHTML = `
            <div class="grip"></div>
            <input type="text" class="filename" value="${this.title}">
            <span class="command" data-cmd="Del">Del</span>
            <span class="command" data-cmd="Get">Get</span>
            <span class="command" data-cmd="Put">Put</span>
            <span class="command" data-cmd="Look">Look</span>
            <span class="command" data-cmd="Edit">Edit</span>
            <span class="command" data-cmd="Local">Local</span>
            <span class="command" data-cmd="indent">indent</span>
            <span class="command" data-cmd="outdent">outdent</span>
            <span class="command" data-cmd="comment">comment</span>
            <span class="command" data-cmd="uncomment">uncomment</span>
            <span class="command" data-cmd="sort">sort</span>
            <span class="command" data-cmd="rot13">rot13</span>
        `;
        this.element.appendChild(this.toolbar);
        
        // Text area
        this.content = document.createElement('div');
        this.content.className = 'window-content';
        this.content.contentEditable = true;
        this.element.appendChild(this.content);
        
        // Create scrollbar
        this.scrollbar = document.createElement('div');
        this.scrollbar.className = 'acme-scrollbar';
        this.element.appendChild(this.scrollbar);

        // Create line numbers
        this.lineNumbers = document.createElement('div');
        this.lineNumbers.className = 'line-numbers';
        this.element.insertBefore(this.lineNumbers, this.content);
    }

    setupEventListeners() {
        // Window activation
        this.element.addEventListener('mousedown', () => {
            this.column.setActiveWindow(this);
        });

        // Toolbar commands
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

        // Content changes
        this.content.addEventListener('input', () => {
            this.hasUnsavedChanges = true;
            this.updateTitle();
            this.updateLineNumbers();
        });

        // Mouse chord gestures
        let mouseChord = '';
        let selection = '';
        
        this.content.addEventListener('mousedown', (e) => {
            if (e.button === 0) mouseChord = 'L';
            else if (e.button === 1) mouseChord += 'M';
            else if (e.button === 2) mouseChord += 'R';
            
            if (mouseChord === 'LM') {
                this.cut();
            } else if (mouseChord === 'LR') {
                this.paste();
            } else if (mouseChord === 'LMR') {
                this.snarf();
            }
            
            // Reset chord after a delay
            setTimeout(() => mouseChord = '', 500);
        });

        // Prevent context menu on right click
        this.content.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Add plumbing support
        this.content.addEventListener('click', async (e) => {
            if (e.button === 2) { // Right click
                e.preventDefault();
                const selection = window.getSelection().toString();
                if (selection) {
                    await window.plumber.plumb(selection);
                }
            }
        });

        // Add bookmark support
        this.content.addEventListener('dblclick', (e) => {
            const line = this.getCurrentLine();
            const position = this.getCurrentPosition();
            this.column.acme.bookmarks.add(this.title, {
                line,
                position,
                content: line.trim()
            });
        });
    }

    setupTextCommands() {
        this.textCommands = {
            'indent': text => text.replace(/^/gm, '    '),
            'outdent': text => text.replace(/^    /gm, ''),
            'comment': text => text.replace(/^/gm, '// '),
            'uncomment': text => text.replace(/^\/\/ /gm, ''),
            'sort': text => text.split('\n').sort().join('\n'),
            'rot13': text => text.replace(/[a-zA-Z]/g, c => 
                String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) 
                    ? c : c - 26))
        };
    }

    setupScrollbar() {
        this.scrollbar.addEventListener('mousedown', (e) => {
            const rect = this.scrollbar.getBoundingClientRect();
            const percentage = (e.clientY - rect.top) / rect.height;
            
            if (e.button === 0) { // Left click - scroll up
                const amount = (1 - percentage) * this.content.clientHeight;
                this.content.scrollBy({
                    top: -amount,
                    behavior: 'smooth'
                });
            } else if (e.button === 2) { // Right click - scroll down
                const amount = percentage * this.content.clientHeight;
                this.content.scrollBy({
                    top: amount,
                    behavior: 'smooth'
                });
            } else if (e.button === 1) { // Middle click - goto position
                const scrollHeight = this.content.scrollHeight - this.content.clientHeight;
                this.content.scrollTo({
                    top: scrollHeight * percentage,
                    behavior: 'smooth'
                });
            }
        });

        // Prevent context menu on right click
        this.scrollbar.addEventListener('contextmenu', e => e.preventDefault());
    }

    executeCommand(cmd) {
        const selection = window.getSelection();
        const range = selection.getRangeAt(0);
        const selectedText = selection.toString();

        if (this.textCommands[cmd] && selectedText) {
            const newText = this.textCommands[cmd](selectedText);
            const span = document.createElement('span');
            span.textContent = newText;
            range.deleteContents();
            range.insertNode(span);
            this.hasUnsavedChanges = true;
            this.updateTitle();
        } else {
            switch (cmd) {
                case 'Del':
                    this.delete();
                    break;
                case 'Get':
                    this.get();
                    break;
                case 'Put':
                    this.save();
                    break;
                case 'Look':
                    this.search();
                    break;
                case 'Edit':
                    this.edit();
                    break;
                case 'Local':
                    this.executeLocalCommand(selectedText);
                    break;
            }
        }
    }

    async executeLocalCommand(cmd) {
        if (cmd) {
            try {
                // In a real implementation, this would execute in shell namespace
                console.log('Executing local command:', cmd);
            } catch (error) {
                console.error('Failed to execute command:', error);
            }
        }
    }

    async loadDirectory(path) {
        try {
            // In a real implementation, this would fetch from server
            const files = ['file1.js', 'file2.css', 'dir1/', 'dir2/'];
            this.setContent(files.join('\n'));
            this.updateLineNumbers();
        } catch (error) {
            console.error('Failed to load directory:', error);
        }
    }

    updateLineNumbers() {
        const lines = this.content.innerText.split('\n');
        this.lineNumbers.innerHTML = lines
            .map((_, i) => `<div class="line-number">${i + 1}</div>`)
            .join('');
    }

    getCurrentLine() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return '';
        
        const range = selection.getRangeAt(0);
        const node = range.startContainer;
        const content = node.textContent;
        const position = range.startOffset;
        
        const lastNewline = content.lastIndexOf('\n', position - 1) + 1;
        const nextNewline = content.indexOf('\n', position);
        
        return content.substring(
            lastNewline,
            nextNewline === -1 ? content.length : nextNewline
        );
    }

    getCurrentPosition() {
        const selection = window.getSelection();
        if (!selection.rangeCount) return 0;
        
        const range = selection.getRangeAt(0);
        return range.startOffset;
    }

    scrollToLine(lineNumber) {
        const lines = this.content.innerText.split('\n');
        if (lineNumber > 0 && lineNumber <= lines.length) {
            const lineHeight = this.content.scrollHeight / lines.length;
            this.content.scrollTo({
                top: (lineNumber - 1) * lineHeight,
                behavior: 'smooth'
            });
        }
    }

    updateTitle() {
        const filename = this.toolbar.querySelector('.filename').value;
        this.title = filename + (this.hasUnsavedChanges ? ' (modified)' : '');
    }

    activate() {
        this.element.classList.add('active');
    }

    deactivate() {
        this.element.classList.remove('active');
    }

    delete() {
        this.element.remove();
        this.column.removeWindow(this);
    }

    cut() {
        document.execCommand('cut');
    }

    paste() {
        document.execCommand('paste');
    }

    snarf() {
        document.execCommand('copy');
    }

    getContent() {
        return this.content.innerText;
    }

    setContent(text) {
        this.content.innerText = text;
    }

    get() {
        const filename = this.toolbar.querySelector('.filename').value;
        // In a real implementation, this would load the file content
        console.log('Loading file:', filename);
    }

    save() {
        const filename = this.toolbar.querySelector('.filename').value;
        // In a real implementation, this would save the file content
        console.log('Saving file:', filename);
        this.hasUnsavedChanges = false;
        this.updateTitle();
    }

    search() {
        const selection = window.getSelection().toString();
        if (selection) {
            const content = this.content.innerText;
            const index = content.indexOf(selection, this.lastSearchIndex + 1);
            if (index !== -1) {
                this.lastSearchIndex = index;
                // Create a range and select the text
                const range = document.createRange();
                const textNode = this.content.firstChild;
                range.setStart(textNode, index);
                range.setEnd(textNode, index + selection.length);
                
                const sel = window.getSelection();
                sel.removeAllRanges();
                sel.addRange(range);
                
                // Scroll the selection into view
                const rect = range.getBoundingClientRect();
                this.content.scrollTop = rect.top - this.content.offsetTop - 50;
            } else {
                this.lastSearchIndex = -1;
            }
        }
    }

    edit() {
        const selection = window.getSelection().toString();
        if (selection) {
            const cmd = prompt('Edit command:', '');
            if (cmd) {
                if (cmd.startsWith('s/')) {
                    // Simple substitution
                    const [_, from, to] = cmd.match(/s\/(.*?)\/(.*?)\/?$/);
                    const content = this.content.innerText;
                    this.content.innerText = content.replace(new RegExp(from, 'g'), to);
                }
            }
        }
    }

    getState() {
        return {
            title: this.title,
            content: this.getContent(),
            height: this.element.style.height
        };
    }

    restoreState(state) {
        this.title = state.title;
        this.toolbar.querySelector('.filename').value = state.title;
        this.setContent(state.content);
        if (state.height) {
            this.element.style.height = state.height;
        }
    }

    startDragging(e) {
        const startY = e.clientY;
        const startHeight = this.element.offsetHeight;
        
        const moveHandler = (e) => {
            const delta = e.clientY - startY;
            this.element.style.height = `${startHeight + delta}px`;
        };
        
        const upHandler = () => {
            document.removeEventListener('mousemove', moveHandler);
            document.removeEventListener('mouseup', upHandler);
        };
        
        document.addEventListener('mousemove', moveHandler);
        document.addEventListener('mouseup', upHandler);
    }
}
