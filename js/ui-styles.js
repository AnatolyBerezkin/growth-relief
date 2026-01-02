// ui-styles.js - UI Styles and Layout Manager for Growth Relief Generator
// Handles visual appearance, themes, dragging, and collapsing of UI panel

function UIStyles() {
    // Style configuration object
    this.styles = {
        panel: {
            width: '320px',
            background: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            padding: '10px',
            position: 'absolute',
            top: '10px',
            left: '10px',
            zIndex: '1000',
            maxHeight: 'calc(100vh - 20px)',
            overflowY: 'auto'
        },
        section: {
            marginBottom: '15px',
            padding: '10px',
            background: '#f5f5f5',
            borderRadius: '5px'
        },
        sectionTitle: {
            margin: '0 0 10px 0',
            fontSize: '14px',
            color: '#333',
            fontFamily: "'Segoe UI', sans-serif"
        },
        table: {
            width: '100%',
            borderCollapse: 'collapse',
            fontFamily: "'Segoe UI', sans-serif",
            fontSize: '13px',
            color: '#333'
        },
        tableCell: {
            padding: '3px',
            verticalAlign: 'middle'
        },
        input: {
            padding: '6px 8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '13px',
            boxSizing: 'border-box',
            width: '100%'
        },
        select: {
            padding: '6px 8px',
            border: '1px solid #ccc',
            borderRadius: '4px',
            fontSize: '13px',
            boxSizing: 'border-box',
            width: '100%'
        },
        button: {
            padding: '8px',
            fontSize: '13px',
            fontWeight: '500',
            cursor: 'pointer',
            border: 'none',
            borderRadius: '4px',
            transition: 'opacity 0.2s',
            width: '100%'
        },
        primaryButton: {
            background: '#4a90e2',
            color: 'white'
        },
        secondaryButton: {
            background: '#95a5a6',
            color: 'white'
        },
        canvas: {
            display: 'block',
            background: '#000',
            borderRadius: '4px',
            width: '100%'
        }
    };
    
    // Current theme
    this.currentTheme = 'default';
    
    // Dragging state variables
    this.isDragging = false;
    this.isCollapsed = false;
    this.dragOffset = { x: 0, y: 0 };
}

// Apply all styles to the UI
UIStyles.prototype.applyStyles = function() {
    console.log('Applying UI styles...');
    
    // Create or update style element
    const styleElement = document.createElement('style');
    styleElement.id = 'growth-relief-styles';
    
    // Generate CSS from styles object
    const css = this.generateCSS();
    styleElement.textContent = css;
    
    // Remove existing styles if present
    const existingStyles = document.getElementById('growth-relief-styles');
    if (existingStyles) {
        existingStyles.remove();
    }
    
    // Add new styles to document
    document.head.appendChild(styleElement);
    
    // Apply inline styles to specific elements
    this.applyInlineStyles();
    
    // Enable dragging functionality
    this.enableDragging();
    
    console.log('UI styles and dragging enabled');
};

// Generate CSS from styles object
UIStyles.prototype.generateCSS = function() {
    let css = `
    /* Growth Relief Generator UI Styles */
    
    #uiPanel {
        width: ${this.styles.panel.width};
        background: ${this.styles.panel.background};
        border-radius: ${this.styles.panel.borderRadius};
        box-shadow: ${this.styles.panel.boxShadow};
        padding: ${this.styles.panel.padding};
        position: ${this.styles.panel.position};
        top: ${this.styles.panel.top};
        left: ${this.styles.panel.left};
        z-index: ${this.styles.panel.zIndex};
        max-height: ${this.styles.panel.maxHeight};
        overflow-y: ${this.styles.panel.overflowY};
        transition: left 0.2s, top 0.2s; /* Smooth movement for dragging */
    }
    
    .ui-section {
        margin-bottom: ${this.styles.section.marginBottom};
        padding: ${this.styles.section.padding};
        background: ${this.styles.section.background};
        border-radius: ${this.styles.section.borderRadius};
    }
    
    .section-title {
        margin: ${this.styles.sectionTitle.margin};
        font-size: ${this.styles.sectionTitle.fontSize};
        color: ${this.styles.sectionTitle.color};
        font-family: ${this.styles.sectionTitle.fontFamily};
    }
    
    .ui-table {
        width: ${this.styles.table.width};
        border-collapse: ${this.styles.table.borderCollapse};
        font-family: ${this.styles.table.fontFamily};
        font-size: ${this.styles.table.fontSize};
        color: ${this.styles.table.color};
    }
    
    .ui-table td {
        padding: ${this.styles.tableCell.padding};
        vertical-align: ${this.styles.tableCell.verticalAlign};
    }
    
    input[type="number"], input[type="text"] {
        padding: ${this.styles.input.padding};
        border: ${this.styles.input.border};
        border-radius: ${this.styles.input.borderRadius};
        font-size: ${this.styles.input.fontSize};
        box-sizing: ${this.styles.input.boxSizing};
        width: ${this.styles.input.width};
    }
    
    select {
        padding: ${this.styles.select.padding};
        border: ${this.styles.select.border};
        border-radius: ${this.styles.select.borderRadius};
        font-size: ${this.styles.select.fontSize};
        box-sizing: ${this.styles.select.boxSizing};
        width: ${this.styles.select.width};
    }
    
    .ui-button {
        padding: ${this.styles.button.padding};
        font-size: ${this.styles.button.fontSize};
        font-weight: ${this.styles.button.fontWeight};
        cursor: ${this.styles.button.cursor};
        border: ${this.styles.button.border};
        border-radius: ${this.styles.button.borderRadius};
        transition: ${this.styles.button.transition};
        width: ${this.styles.button.width};
    }
    
    .ui-button:hover:not(:disabled) {
        opacity: 0.9;
    }
    
    .ui-button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    .ui-button-primary {
        background: ${this.styles.primaryButton.background};
        color: ${this.styles.primaryButton.color};
    }
    
    .ui-button-secondary {
        background: ${this.styles.secondaryButton.background};
        color: ${this.styles.secondaryButton.color};
    }
    
    canvas {
        display: ${this.styles.canvas.display};
        background: ${this.styles.canvas.background};
        border-radius: ${this.styles.canvas.borderRadius};
        width: ${this.styles.canvas.width};
    }
    
    input[type="range"] {
        vertical-align: middle;
        width: 70%;
    }
    
    input[type="checkbox"] {
        margin-right: 5px;
    }
    
    .range-value {
        font-size: 12px;
        margin-left: 5px;
        color: #666;
    }
    
    .image-info {
        font-size: 11px;
        color: #666;
        margin-top: 3px;
        font-style: italic;
    }
    
    /* Title bar for dragging */
    .ui-title-bar {
        cursor: move;
        padding: 8px 12px;
        background: #4a90e2;
        color: white;
        border-radius: 8px 8px 0 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        user-select: none;
        margin: -10px -10px 10px -10px; /* Negative margins to align with panel */
    }
    
    .ui-title-bar span {
        flex-grow: 1;
        font-weight: 500;
    }
    
    #collapseBtn {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 32px;
        padding: 0 5px;
        opacity: 0.8;
        transition: opacity 0.2s;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
    }
    
    #collapseBtn:hover {
        opacity: 1;
    }
    
    /* Dragging state */
    .ui-title-bar.dragging {
        cursor: grabbing;
        opacity: 0.9;
    }
    `;
    
    return css;
};

// Apply CSS classes to UI elements
UIStyles.prototype.applyInlineStyles = function() {
    // Apply classes to elements
    const sections = document.querySelectorAll('#uiPanel > div');
    sections.forEach(section => {
        section.classList.add('ui-section');
    });
    
    const tables = document.querySelectorAll('#uiPanel table');
    tables.forEach(table => {
        table.classList.add('ui-table');
    });
    
    const titles = document.querySelectorAll('#uiPanel h3');
    titles.forEach(title => {
        title.classList.add('section-title');
    });
    
    // Apply button classes
    const buttons = document.querySelectorAll('#uiPanel button');
    buttons.forEach(button => {
        button.classList.add('ui-button');
        
        if (button.id.includes('startGrowth') || 
            button.id.includes('generateDepth') || 
            button.id.includes('buildMesh')) {
            button.classList.add('ui-button-primary');
        } else {
            button.classList.add('ui-button-secondary');
        }
    });
};

// Enable dragging functionality for the UI panel
UIStyles.prototype.enableDragging = function() {
    const uiPanel = document.getElementById('uiPanel');
    if (!uiPanel) {
        console.warn('UI panel not found for dragging');
        return;
    }
    
    // Create title bar if it doesn't exist
    const existingTitleBar = uiPanel.querySelector('.ui-title-bar');
    if (!existingTitleBar) {
        const titleBar = this.createTitleBar();
        uiPanel.insertBefore(titleBar, uiPanel.firstChild);
    }
    
    // Setup drag event handlers
    this.setupDragHandlers();
    console.log('Dragging functionality enabled');
};

// Create title bar element for dragging
UIStyles.prototype.createTitleBar = function() {
    const titleBar = document.createElement('div');
    titleBar.className = 'ui-title-bar';
    titleBar.innerHTML = `
        <span style="flex-grow: 1; font-weight: 500;">Growth Relief Generator</span>
        <button id="collapseBtn" style="
            background: none;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 16px;
            padding: 0 5px;
            opacity: 0.8;
            transition: opacity 0.2s;
        ">−</button>
    `;
    
    return titleBar;
};

// Setup drag event handlers
UIStyles.prototype.setupDragHandlers = function() {
    const uiPanel = document.getElementById('uiPanel');
    const titleBar = uiPanel.querySelector('.ui-title-bar');
    const collapseBtn = document.getElementById('collapseBtn');
    
    if (!uiPanel || !titleBar) return;
    
    // Mouse down on title bar - start dragging
    titleBar.addEventListener('mousedown', (e) => {
        // Don't start drag if clicking the collapse button
        if (e.target === collapseBtn || e.target.closest('#collapseBtn')) {
            return;
        }
        
        this.isDragging = true;
        const rect = uiPanel.getBoundingClientRect();
        
        // Calculate offset from mouse to panel corner
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;
        
        // Visual feedback
        titleBar.classList.add('dragging');
        uiPanel.style.transition = 'none'; // Disable transitions during drag
        
        // Prevent text selection during drag
        e.preventDefault();
    });
    
    // Mouse move - update panel position
    document.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return;
        
        // Calculate new position
        const newLeft = e.clientX - this.dragOffset.x;
        const newTop = e.clientY - this.dragOffset.y;
        
        // Apply boundaries (keep panel within viewport)
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const panelWidth = uiPanel.offsetWidth;
        const panelHeight = uiPanel.offsetHeight;
        
        const boundedLeft = Math.max(0, Math.min(newLeft, viewportWidth - panelWidth));
        const boundedTop = Math.max(0, Math.min(newTop, viewportHeight - panelHeight));
        
        uiPanel.style.left = boundedLeft + 'px';
        uiPanel.style.top = boundedTop + 'px';
    });
    
    // Mouse up - stop dragging
    document.addEventListener('mouseup', () => {
        if (this.isDragging) {
            this.isDragging = false;
            titleBar.classList.remove('dragging');
            uiPanel.style.transition = 'left 0.2s, top 0.2s'; // Re-enable smooth transitions
        }
    });
    
    // Collapse button click handler
    if (collapseBtn) {
        collapseBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering drag
            this.toggleCollapse();
        });
    }
    
    // Prevent default drag behavior for images and other elements
    titleBar.addEventListener('dragstart', (e) => {
        e.preventDefault();
    });
};

// Toggle panel collapse/expand
UIStyles.prototype.toggleCollapse = function() {
    const uiPanel = document.getElementById('uiPanel');
    const collapseBtn = document.getElementById('collapseBtn');
    const titleBar = uiPanel.querySelector('.ui-title-bar');
    
    if (!uiPanel || !collapseBtn || !titleBar) return;
    
    this.isCollapsed = !this.isCollapsed;
    
    // Get all children except the title bar
    const children = Array.from(uiPanel.children);
    const contentElements = children.filter(child => child !== titleBar);
    
    if (this.isCollapsed) {
        // COLLAPSE: Hide all content except title bar
        contentElements.forEach(element => {
            element.style.display = 'none';
        });
        
        // Change button to "+" (expand)
        collapseBtn.textContent = '+';
        
        // Shrink panel height
        uiPanel.style.height = 'auto';
        uiPanel.style.paddingBottom = '5px'; // Small padding at bottom
        
        console.log('UI panel collapsed - showing only title bar');
    } else {
        // EXPAND: Show all content
        contentElements.forEach(element => {
            element.style.display = '';
        });
        
        // Change button to "−" (collapse)
        collapseBtn.textContent = '−';
        
        // Restore panel height and padding
        uiPanel.style.height = '';
        uiPanel.style.paddingBottom = '';
        
        console.log('UI panel expanded - showing all content');
    }
};

// Update specific style property
UIStyles.prototype.updateStyle = function(element, property, value) {
    if (!this.styles[element]) {
        console.warn(`Style element "${element}" not found`);
        return false;
    }
    
    this.styles[element][property] = value;
    this.applyStyles(); // Reapply styles with new value
    return true;
};

// Change UI theme
UIStyles.prototype.setTheme = function(themeName) {
    const themes = {
        default: {
            panel: { background: 'white' },
            section: { background: '#f5f5f5' },
            primaryButton: { background: '#4a90e2' },
            secondaryButton: { background: '#95a5a6' }
        },
        dark: {
            panel: { background: '#2c3e50' },
            section: { background: '#34495e' },
            sectionTitle: { color: '#ecf0f1' },
            table: { color: '#ecf0f1' },
            primaryButton: { background: '#3498db' },
            secondaryButton: { background: '#7f8c8d' }
        },
        light: {
            panel: { background: '#f8f9fa' },
            section: { background: '#e9ecef' },
            primaryButton: { background: '#007bff' },
            secondaryButton: { background: '#6c757d' }
        }
    };
    
    if (themes[themeName]) {
        this.currentTheme = themeName;
        
        // Merge theme styles with base styles
        Object.keys(themes[themeName]).forEach(key => {
            if (this.styles[key]) {
                Object.assign(this.styles[key], themes[themeName][key]);
            }
        });
        
        this.applyStyles();
        console.log(`Theme changed to: ${themeName}`);
        return true;
    }
    
    console.warn(`Theme "${themeName}" not found`);
    return false;
};

// Toggle UI visibility
UIStyles.prototype.toggleUIVisibility = function() {
    const uiPanel = document.getElementById('uiPanel');
    if (uiPanel) {
        const isVisible = uiPanel.style.display !== 'none';
        uiPanel.style.display = isVisible ? 'none' : 'block';
        return !isVisible;
    }
    return false;
};

// Adjust UI panel width
UIStyles.prototype.setPanelWidth = function(width) {
    this.styles.panel.width = width;
    this.applyStyles();
    console.log(`Panel width set to: ${width}`);
};

// Add responsive behavior for different screen sizes
UIStyles.prototype.makeResponsive = function() {
    const responsiveCSS = `
    @media (max-width: 768px) {
        #uiPanel {
            width: 280px !important;
            left: 5px !important;
            top: 5px !important;
        }
        
        .ui-button {
            font-size: 12px !important;
            padding: 6px !important;
        }
        
        input[type="number"], select {
            font-size: 12px !important;
            padding: 4px 6px !important;
        }
    }
    
    @media (max-height: 600px) {
        #uiPanel {
            max-height: calc(100vh - 10px) !important;
        }
        
        .ui-section {
            margin-bottom: 10px !important;
            padding: 8px !important;
        }
    }
    `;
    
    // Add responsive styles
    const styleElement = document.createElement('style');
    styleElement.id = 'growth-relief-responsive';
    styleElement.textContent = responsiveCSS;
    
    // Remove existing responsive styles if present
    const existing = document.getElementById('growth-relief-responsive');
    if (existing) {
        existing.remove();
    }
    
    document.head.appendChild(styleElement);
    console.log('Responsive styles applied');
};

// Expose globally
window.UIStyles = UIStyles;