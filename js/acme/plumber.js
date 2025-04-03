class Plumber {
    constructor() {
        this.rules = [];
        this.loadDefaultRules();
    }

    loadDefaultRules() {
        // Web URLs
        this.addRule({
            type: 'text',
            pattern: /https?:\/\/[^ ]+/,
            action: (url) => window.open(url, '_blank')
        });

        // Source code files with line numbers
        this.addRule({
            type: 'text',
            pattern: /([a-zA-Z0-9_\-./]+\.(js|css|html)):(\d+)/,
            action: (match) => {
                const [_, file, __, line] = match;
                this.openInAcmeAtLine(file, parseInt(line));
            }
        });

        // Directory navigation
        this.addRule({
            type: 'text',
            pattern: /^[a-zA-Z0-9_\-./]+\/$/,
            action: (dir) => this.openDirectory(dir)
        });

        // Text files
        this.addRule({
            type: 'text',
            pattern: /([a-zA-Z0-9_\-./]+\.(js|css|html|txt|md))$/,
            action: (file) => this.openInAcme(file)
        });
    }

    addRule(rule) {
        this.rules.push(rule);
    }

    async plumb(text) {
        for (const rule of this.rules) {
            if (rule.type === 'text') {
                const match = text.match(rule.pattern);
                if (match) {
                    await rule.action(match);
                    return true;
                }
            }
        }
        return false;
    }

    async openInAcme(file) {
        try {
            const response = await fetch(file);
            const content = await response.text();
            const win = window.activeAcme?.createWindow(file);
            if (win) {
                win.setContent(content);
            }
        } catch (error) {
            console.error('Failed to open file:', error);
        }
    }

    async openInAcmeAtLine(file, line) {
        try {
            const response = await fetch(file);
            const content = await response.text();
            const win = window.activeAcme?.createWindow(file);
            if (win) {
                win.setContent(content);
                win.scrollToLine(line);
            }
        } catch (error) {
            console.error('Failed to open file:', error);
        }
    }

    async openDirectory(dir) {
        try {
            // In a real implementation, this would make a server request
            // For now, we'll simulate directory listing
            const win = window.activeAcme?.createWindow(dir);
            if (win) {
                win.loadDirectory(dir);
            }
        } catch (error) {
            console.error('Failed to open directory:', error);
        }
    }
}
