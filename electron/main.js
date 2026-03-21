/**
 * LATENCY - Electron Main Process
 * Creates the game window, handles Steam overlay, and manages app lifecycle.
 */

const { app, BrowserWindow, Menu, globalShortcut, dialog } = require('electron');
const path = require('path');

// Disable hardware acceleration issues on some systems
app.commandLine.appendSwitch('disable-renderer-backgrounding');

let mainWindow = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        title: 'LATENCY',
        icon: path.join(__dirname, '..', 'build-resources', 'icon.ico'),
        backgroundColor: '#0a0e14',
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            sandbox: true,
            devTools: false // Disable DevTools in production
        }
    });

    // Remove the default menu bar (no File/Edit/View menus)
    Menu.setApplicationMenu(null);

    // Load the game
    const gamePath = path.join(__dirname, '..', 'build', 'index.html');
    mainWindow.loadFile(gamePath);

    // Show window when ready (prevents white flash)
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        mainWindow.focus();
    });

    // Fullscreen toggle with F11
    mainWindow.on('enter-full-screen', () => {
        mainWindow.setMenuBarVisibility(false);
    });

    mainWindow.on('leave-full-screen', () => {
        mainWindow.setMenuBarVisibility(false);
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Register keyboard shortcuts
function registerShortcuts() {
    // F11 = toggle fullscreen
    globalShortcut.register('F11', () => {
        if (mainWindow) {
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
        }
    });

    // Alt+F4 = quit (Windows default, but ensure it works)
    globalShortcut.register('Alt+F4', () => {
        app.quit();
    });

    // Block Ctrl+Shift+I (DevTools) in production
    globalShortcut.register('CommandOrControl+Shift+I', () => {
        // Blocked
    });

    // Block F12 (DevTools)
    globalShortcut.register('F12', () => {
        // Blocked
    });
}

// App lifecycle
app.whenReady().then(() => {
    createWindow();
    registerShortcuts();
});

app.on('window-all-closed', () => {
    globalShortcut.unregisterAll();
    app.quit();
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

// Prevent new windows from opening (blocks window.open, target="_blank", etc.)
app.on('web-contents-created', (event, contents) => {
    contents.setWindowOpenHandler(() => {
        return { action: 'deny' };
    });
});
