// CrysGarage Security Script
// Prevents dev tools access and source code exposure

(function() {
    'use strict';
    
    // Disable right-click context menu
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Disable F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S
    document.addEventListener('keydown', function(e) {
        // F12
        if (e.keyCode === 123) {
            e.preventDefault();
            return false;
        }
        // Ctrl+Shift+I (Dev Tools)
        if (e.ctrlKey && e.shiftKey && e.keyCode === 73) {
            e.preventDefault();
            return false;
        }
        // Ctrl+U (View Source)
        if (e.ctrlKey && e.keyCode === 85) {
            e.preventDefault();
            return false;
        }
        // Ctrl+S (Save Page)
        if (e.ctrlKey && e.keyCode === 83) {
            e.preventDefault();
            return false;
        }
        // Ctrl+A (Select All)
        if (e.ctrlKey && e.keyCode === 65) {
            e.preventDefault();
            return false;
        }
        // Ctrl+P (Print)
        if (e.ctrlKey && e.keyCode === 80) {
            e.preventDefault();
            return false;
        }
    });
    
    // Disable text selection
    document.addEventListener('selectstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Disable drag and drop
    document.addEventListener('dragstart', function(e) {
        e.preventDefault();
        return false;
    });
    
    // Detect and block dev tools
    let devtools = {
        open: false,
        orientation: null
    };
    
    const threshold = 160;
    
    setInterval(function() {
        if (window.outerHeight - window.innerHeight > threshold || 
            window.outerWidth - window.innerWidth > threshold) {
            if (!devtools.open) {
                devtools.open = true;
                // Redirect to a warning page or close the tab
                window.location.href = 'about:blank';
            }
        }
    }, 500);
    
    // Clear console
    console.clear();
    
    // Override console methods
    const noop = function() {};
    console.log = noop;
    console.warn = noop;
    console.error = noop;
    console.info = noop;
    console.debug = noop;
    console.trace = noop;
    console.table = noop;
    console.group = noop;
    console.groupEnd = noop;
    console.time = noop;
    console.timeEnd = noop;
    console.count = noop;
    console.assert = noop;
    
    // Disable common debugging methods
    window.alert = noop;
    window.confirm = noop;
    window.prompt = noop;
    
    // Obfuscate source code
    const originalToString = Function.prototype.toString;
    Function.prototype.toString = function() {
        return 'function() { [native code] }';
    };
    
    // Disable common debugging tools
    Object.defineProperty(window, 'console', {
        value: {},
        writable: false,
        configurable: false
    });
    
    // Block common debugging techniques
    Object.defineProperty(window, 'eval', {
        value: function() {
            throw new Error('eval is disabled');
        },
        writable: false,
        configurable: false
    });
    
    // Disable source maps
    if (window.sourceMap) {
        delete window.sourceMap;
    }
    
    // Anti-debugging techniques
    let startTime = Date.now();
    setInterval(function() {
        if (Date.now() - startTime > 100) {
            // Debugger detected, redirect
            window.location.href = 'about:blank';
        }
        startTime = Date.now();
    }, 100);
    
    // Disable common developer shortcuts
    document.addEventListener('keydown', function(e) {
        // Alt+Tab, Alt+F4, etc.
        if (e.altKey) {
            e.preventDefault();
            return false;
        }
    });
    
    // Block iframe embedding
    if (window.top !== window.self) {
        window.top.location = window.self.location;
    }
    
    // Disable common debugging APIs
    if (window.chrome && window.chrome.runtime) {
        delete window.chrome.runtime;
    }
    
    // Block common debugging tools
    const blockedProperties = [
        'debugger',
        'console',
        'alert',
        'confirm',
        'prompt',
        'eval',
        'Function',
        'setTimeout',
        'setInterval',
        'requestAnimationFrame'
    ];
    
    blockedProperties.forEach(function(prop) {
        try {
            delete window[prop];
        } catch (e) {
            // Ignore errors
        }
    });
    
    // Anti-tampering measures
    Object.freeze(window);
    Object.freeze(document);
    Object.freeze(document.body);
    
    // Disable common debugging techniques
    window.addEventListener('beforeunload', function(e) {
        e.preventDefault();
        e.returnValue = '';
        return '';
    });
    
    // Block common debugging tools
    const originalOpen = window.open;
    window.open = function() {
        return null;
    };
    
    // Disable common debugging techniques
    const originalAddEventListener = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function(type, listener, options) {
        if (type === 'keydown' || type === 'keyup' || type === 'keypress') {
            return;
        }
        return originalAddEventListener.call(this, type, listener, options);
    };
    
    // Anti-debugging: Detect debugger statements
    const originalEval = window.eval;
    window.eval = function(code) {
        if (code.includes('debugger') || code.includes('console')) {
            throw new Error('Debugging is not allowed');
        }
        return originalEval.call(this, code);
    };
    
    // Disable common debugging techniques
    Object.defineProperty(window, 'innerHeight', {
        get: function() { return window.outerHeight; },
        configurable: false
    });
    
    Object.defineProperty(window, 'innerWidth', {
        get: function() { return window.outerWidth; },
        configurable: false
    });
    
    // Block common debugging tools
    const blockedMethods = [
        'debugger',
        'console',
        'alert',
        'confirm',
        'prompt',
        'eval',
        'Function',
        'setTimeout',
        'setInterval'
    ];
    
    blockedMethods.forEach(function(method) {
        try {
            delete window[method];
        } catch (e) {
            // Ignore errors
        }
    });
    
    // Final security measure
    Object.seal(window);
    Object.seal(document);
    Object.seal(document.body);
    
})();
