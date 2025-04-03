# Plan 9 Web Interface with Acme Editor

## Download zip, open, click index.html and run it. 

## OR... 

A modern web-based implementation of the Plan 9 desktop environment, featuring a faithful recreation of the Acme text editor.

## Quick Start

1. Install dependencies:

```bash
npm install
```

1. Start the development server:

```bash
npm start
```

1. Open your browser to the URL shown in the console (typically `http://localhost:9999`)

## Project Structure

```plaintext
plan9-web/
├── css/
│   ├── style.css      # Main styles
│   └── acme.css       # Acme editor styles
├── js/
│   ├── rio.js         # Window manager
│   ├── window.js      # Base window class
│   ├── main.js        # Main application
│   └── acme/          # Acme editor components
│       ├── acme.js    # Main Acme class
│       ├── column.js  # Column management
│       ├── window.js  # Acme window class
│       └── plumber.js # Plumbing system
└── index.html         # Main HTML file
```

## Basic Usage

1. Click "New Window" to create a regular window
1. Click "New Acme" to create an Acme editor instance
1. Use middle-click to execute commands in blue toolbars
1. Use mouse chords for text operations

## Development

- The project uses live-server for development
- Files are automatically reloaded on changes
- No build step required

## Browser Support

- Tested on modern browsers (Chrome, Firefox, Edge)
- Requires ES6+ support
- Best experienced with a three-button mouse

## Detailed Features

### 1. Window Management

- Create and manage multiple windows
- Drag windows by title bar
- Resize from corners
- Taskbar shows all open windows
- System clock in status area

### 2. Acme Editor Components

- Top toolbar (blue) for global commands
- Column toolbar for column operations
- Window toolbar for window-specific actions
- Text area with yellow background
- Integrated scrollbar
- Line number margin

### 3. Mouse Operations

Mouse Chords:

- Left+Middle: Cut text
- Left+Right: Paste text
- Left+Middle+Right: Copy (Snarf) text

Text Selection:

- Left click & drag: Select text
- Double-click: Select word
- Triple-click: Select line
- Right-click: Plumb text

### 4. Command System

Top Toolbar Commands:

- New: Create new window
- Newcol: Create new column
- Exit: Close Acme
- Dump: Save current state
- Load: Restore saved state
- Putall: Save all modified files
- Tile/Stack/Cascade: Window layouts

Window Commands:

- Del: Close window
- Get: Load file
- Put: Save file
- Look: Search
- Edit: Text manipulation
- Local: Shell commands

### 5. Text Manipulation

Selection Commands:

- indent: Add 4 spaces
- outdent: Remove 4 spaces
- comment: Add // to lines
- uncomment: Remove //
- sort: Sort selected lines
- rot13: Basic text encryption

### 6. Plumbing System

Automatic Detection:

- URLs: Opens in browser
- File paths: Opens in Acme
- Line numbers: Jumps to line
- Directories: Shows contents

### 7. Window Layouts

Layout Options:

- Tile: Grid arrangement
- Stack: Overlapped with offset
- Cascade: Diagonal arrangement
- Custom: Free-form positioning

### 8. Bookmarks

Features:

- Double-click text to bookmark
- Persistent across sessions
- Stores file, line, and position
- Quick navigation

### 9. Keyboard Shortcuts

Common Operations:

- Tab: Indent
- Shift+Tab: Outdent
- Ctrl+S: Save (Put)
- Ctrl+F: Search (Look)

Note: This implementation aims to be faithful to the original Plan 9 Acme editor while adding modern conveniences. Some features may work slightly differently than the original due to web browser limitations.
