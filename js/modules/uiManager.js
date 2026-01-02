// uiManager.js - UI Manager with Dragging, Collapsing, and Enhanced Controls

function UIManager() {
    this.uiPanel = null;
    this.controls = null;
    this.uiStyles = null;
    this.imageAttractors = null;
    
    // Dragging state variables
    this.isDragging = false;
    this.isCollapsed = false;
    this.dragOffset = { x: 0, y: 0 };
}

UIManager.prototype.initialize = function() {
    console.log('UIManager initialized');
    
    try {
        this.uiPanel = document.getElementById('uiPanel');
        if (!this.uiPanel) {
            console.error('UI panel element not found');
            return false;
        }
        
        // Create UI elements first
        this.createUI();
        
        // Add title bar for dragging and collapsing
        this.addTitleBar();
        
        // Initialize styles manager
        if (window.UIStyles) {
            this.uiStyles = new UIStyles();
            this.uiStyles.applyStyles();
        } else {
            console.warn('UIStyles not available, using default styles');
            this.addFallbackStyles();
        }
        
        // Setup event handlers (including dragging)
        this.setupEventHandlers();
        
        // Setup dragging functionality
        this.setupDragging();
        
        // Make responsive
        if (this.uiStyles && this.uiStyles.makeResponsive) {
            this.uiStyles.makeResponsive();
        }
        
        return true;
    } catch (error) {
        console.error('Error initializing UI Manager:', error);
        return false;
    }
};

UIManager.prototype.createUI = function() {
    const uiHTML = `
    <div style="padding: 10px;">
        <!-- GROWTH CONTROLS SECTION -->
        <div class="ui-section">
            <h3 class="section-title">Growth</h3>
            
            <table class="ui-table">
                <tr>
                    <td style="padding: 3px; vertical-align: middle;">Attractors:</td>
                    <td style="padding: 3px;">
                        <input type="number" id="points" value="5000" style="width: 100%;">
                    </td>
                </tr>
                
                <tr>
                    <td style="padding: 3px;">Kill distance:</td>
                    <td style="padding: 3px;">
                        <input type="number" id="killDist" value="5" style="width: 100%;">
                    </td>
                </tr>
                
                <tr>
                    <td style="padding: 3px;">Influence distance:</td>
                    <td style="padding: 3px;">
                        <input type="number" id="influenceDist" value="10" style="width: 100%;">
                    </td>
                </tr>
                
                <tr>
                    <td style="padding: 3px;">Branch length:</td>
                    <td style="padding: 3px;">
                        <input type="number" id="branchLen" value="3" style="width: 100%;">
                    </td>
                </tr>
                
                <tr>
                    <td style="padding: 3px;">Canvas width:</td>
                    <td style="padding: 3px;">
                        <input type="number" id="canvasW" value="300" style="width: 100%;">
                    </td>
                </tr>
                
                <tr>
                    <td style="padding: 3px;">Canvas height:</td>
                    <td style="padding: 3px;">
                        <input type="number" id="canvasH" value="200" style="width: 100%;">
                    </td>
                </tr>
                
                <!-- NEW: Attractor Mode -->
                <tr>
                    <td style="padding: 3px;">Attractor mode:</td>
                    <td style="padding: 3px;">
                        <select id="attrMode" style="width: 100%;">
                            <option value="uniform">Uniform Random</option>
                            <option value="rectmesh">Rectangular Mesh</option>
                            <option value="hexmesh">Hexagonal Mesh</option>
                            <option value="fromfile">From Image File</option>
                        </select>
                    </td>
                </tr>
                
                <!-- Grid Parameters (hidden by default) -->
                <tr id="gridCellsXRow" style="display: none;">
                    <td style="padding: 3px;">Grid cells X:</td>
                    <td style="padding: 3px;">
                        <input type="number" id="gridCellsX" value="35" style="width: 100%;">
                    </td>
                </tr>
                
                <tr id="gridCellsYRow" style="display: none;">
                    <td style="padding: 3px;">Grid cells Y:</td>
                    <td style="padding: 3px;">
                        <input type="number" id="gridCellsY" value="35" style="width: 100%;">
                    </td>
                </tr>
                
                <tr id="gridProbRow" style="display: none;">
                    <td style="padding: 3px;">Grid probability:</td>
                    <td style="padding: 3px;">
                        <input type="range" id="gridProb" min="0" max="1" step="0.01" value="1.0" style="width: 70%;">
                        <span id="gridProbValue" style="font-size: 12px; margin-left: 5px;">1.00</span>
                    </td>
                </tr>
                
                <tr id="gridJitterRow" style="display: none;">
                    <td style="padding: 3px;">Grid jitter:</td>
                    <td style="padding: 3px;">
                        <input type="range" id="gridJitter" min="0" max="1" step="0.01" value="0.2" style="width: 70%;">
                        <span id="gridJitterValue" style="font-size: 12px; margin-left: 5px;">0.20</span>
                    </td>
                </tr>
                
                <!-- Image Upload (hidden by default) -->
                <tr id="imageUploadRow" style="display: none;">
                    <td colspan="2" style="padding: 3px;">
                        <input type="file" id="attractorImage" accept="image/*" style="width: 100%; font-size: 12px;">
                        <div id="imageInfo" style="font-size: 11px; color: #666; margin-top: 3px;"></div>
                    </td>
                </tr>
                
                <!-- NEW: Root Mode -->
                <tr>
                    <td style="padding: 3px;">Root mode:</td>
                    <td style="padding: 3px;">
                        <select id="rootMode" style="width: 100%;">
                            <option value="random0">Random from Attractors</option>
                            <option value="random1">Random along Bottom</option>
                            <option value="line">Line along Bottom</option>
                            <option value="circle">Circle in Center</option>
                        </select>
                    </td>
                </tr>
                
                <tr>
                    <td style="padding: 3px;">Roots:</td>
                    <td style="padding: 3px;">
                        <input type="number" id="roots" value="5" style="width: 100%;">
                    </td>
                </tr>
                
                <tr>
                    <td colspan="2" style="padding: 8px 3px;">
                        <button id="startGrowthBtn" style="width: 100%; padding: 8px; background: #4a90e2; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Start Growth
                        </button>
                    </td>
                </tr>
                
                <tr>
                    <td colspan="2" style="padding: 3px;">
                        <button id="stopGrowthBtn" style="width: 48%; padding: 8px; background: #95a5a6; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 4%;" disabled>
                            Stop
                        </button>
                        <button id="resetGrowthBtn" style="width: 48%; padding: 8px; background: #95a5a6; color: white; border: none; border-radius: 4px; cursor: pointer;">
                            Reset
                        </button>
                    </td>
                </tr>
                
                <tr>
                    <td colspan="2" style="padding: 8px 3px;">
                        <canvas id="growthCanvas" width="300" height="200" style="width: 100%; background: #000; border-radius: 4px;"></canvas>
                    </td>
                </tr>
            </table>
        </div>
        
        <!-- DEPTH PROFILE SECTION -->
        <div class="ui-section">
            <h3 class="section-title">Depth Profile</h3>
            
            <table class="ui-table">
                <tr>
                    <td colspan="2" style="padding: 8px 3px;">
                        <canvas id="bezierCanvas" width="300" height="150" style="width: 100%; background: #333; border-radius: 4px;"></canvas>
                    </td>
                </tr>
                
                <tr>
                    <td style="padding: 3px;">Max thickness (px):</td>
                    <td style="padding: 3px;">
                        <input type="number" id="depthThickness" value="25" style="width: 100%;">
                    </td>
                </tr>
                
                <tr>
                    <td style="padding: 3px;">Bilateral radius:</td>
                    <td style="padding: 3px;">
                        <input type="number" id="bilateralRadius" value="2" style="width: 100%;">
                    </td>
                </tr>
                
                <tr>
                    <td style="padding: 3px;">Invert:</td>
                    <td style="padding: 3px;">
                        <input type="checkbox" id="invertToggle">
                    </td>
                </tr>
                
                <tr>
                    <td colspan="2" style="padding: 8px 3px;">
                        <button id="generateDepthBtn" style="width: 100%; padding: 8px; background: #4a90e2; color: white; border: none; border-radius: 4px; cursor: pointer;" disabled>
                            Generate Depth Map
                        </button>
                    </td>
                </tr>
                
                <tr>
                    <td colspan="2" style="padding: 3px;">
                        <button id="exportPNGBtn" style="width: 100%; padding: 8px; background: #95a5a6; color: white; border: none; border-radius: 4px; cursor: pointer;" disabled>
                            Export PNG
                        </button>
                    </td>
                </tr>
                
                <tr>
                    <td colspan="2" style="padding: 8px 3px;">
                        <canvas id="depthCanvas" width="300" height="200" style="width: 100%; background: #000; border-radius: 4px;"></canvas>
                    </td>
                </tr>
            </table>
        </div>
        
        <!-- 3D MESH SECTION -->
        <div class="ui-section">
            <h3 class="section-title">Panel & STL</h3>
            
            <table class="ui-table">
                <tr>
                    <td style="padding: 3px;">Panel thickness (mm):</td>
                    <td style="padding: 3px;">
                        <input type="number" id="panelThickness" value="50" style="width: 100%;">
                    </td>
                </tr>
                
                <tr>
                    <td style="padding: 3px;">Relief height (mm):</td>
                    <td style="padding: 3px;">
                        <input type="number" id="reliefHeight" value="20" style="width: 100%;">
                    </td>
                </tr>
                
                <tr>
                    <td colspan="2" style="padding: 8px 3px;">
                        <button id="buildMeshBtn" style="width: 100%; padding: 8px; background: #4a90e2; color: white; border: none; border-radius: 4px; cursor: pointer;" disabled>
                            Build 3D Mesh
                        </button>
                    </td>
                </tr>
                
                <tr>
                    <td colspan="2" style="padding: 3px;">
                        <button id="exportSTLBtn" style="width: 100%; padding: 8px; background: #95a5a6; color: white; border: none; border-radius: 4px; cursor: pointer;" disabled>
                            Export STL
                        </button>
                    </td>
                </tr>
            </table>
        </div>
    </div>
    `;
    
    this.uiPanel.innerHTML = uiHTML;
    console.log('UI created successfully');
};

// Add title bar for dragging and collapsing
UIManager.prototype.addTitleBar = function() {
    // Create title bar element
    const titleBar = document.createElement('div');
    titleBar.className = 'ui-title-bar';
    titleBar.style.cssText = `
        cursor: move;
        padding: 8px 12px;
        background: #4a90e2;
        color: white;
        border-radius: 8px 8px 0 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        user-select: none;
        margin: -10px -10px 10px -10px;
        font-family: 'Segoe UI', sans-serif;
    `;
    
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
    
    // Insert title bar at the top of the panel
    this.uiPanel.insertBefore(titleBar, this.uiPanel.firstChild);
    console.log('Title bar added');
};

// Setup event handlers for UI elements
UIManager.prototype.setupEventHandlers = function() {
    console.log('Setting up event handlers...');
    
    // Attractor mode change handler
    const attrModeSelect = document.getElementById('attrMode');
    if (attrModeSelect) {
        attrModeSelect.addEventListener('change', (e) => {
            this.onAttractorModeChange(e.target.value);
        });
        // Initial update
        this.onAttractorModeChange(attrModeSelect.value);
    }
    
    // Grid parameter real-time updates
    const gridProbSlider = document.getElementById('gridProb');
    const gridProbValue = document.getElementById('gridProbValue');
    if (gridProbSlider && gridProbValue) {
        gridProbSlider.addEventListener('input', (e) => {
            gridProbValue.textContent = parseFloat(e.target.value).toFixed(2);
        });
    }
    
    const gridJitterSlider = document.getElementById('gridJitter');
    const gridJitterValue = document.getElementById('gridJitterValue');
    if (gridJitterSlider && gridJitterValue) {
        gridJitterSlider.addEventListener('input', (e) => {
            gridJitterValue.textContent = parseFloat(e.target.value).toFixed(2);
        });
    }
    
    // Image upload handler
    const imageInput = document.getElementById('attractorImage');
    if (imageInput) {
        imageInput.addEventListener('change', (e) => {
            this.handleImageUpload(e.target.files[0]);
        });
    }
    
    console.log('Event handlers setup complete');
};

// Setup dragging functionality for the UI panel
UIManager.prototype.setupDragging = function() {
    const uiPanel = this.uiPanel;
    const titleBar = uiPanel.querySelector('.ui-title-bar');
    const collapseBtn = document.getElementById('collapseBtn');
    
    if (!titleBar) {
        console.error('Title bar not found for dragging setup');
        return;
    }
    
    // Mouse down event - start dragging
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
        titleBar.style.cursor = 'grabbing';
        uiPanel.style.transition = 'none'; // Disable transition during drag
        
        // Prevent default behavior
        e.preventDefault();
    });
    
    // Mouse move event - update panel position
    document.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return;
        
        // Calculate new position
        const newLeft = e.clientX - this.dragOffset.x;
        const newTop = e.clientY - this.dragOffset.y;
        
        // Apply boundaries to keep panel within viewport
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const panelWidth = uiPanel.offsetWidth;
        const panelHeight = uiPanel.offsetHeight;
        
        const boundedLeft = Math.max(0, Math.min(newLeft, viewportWidth - panelWidth));
        const boundedTop = Math.max(0, Math.min(newTop, viewportHeight - panelHeight));
        
        uiPanel.style.left = boundedLeft + 'px';
        uiPanel.style.top = boundedTop + 'px';
    });
    
    // Mouse up event - stop dragging
    document.addEventListener('mouseup', () => {
        if (this.isDragging) {
            this.isDragging = false;
            const titleBar = uiPanel.querySelector('.ui-title-bar');
            if (titleBar) {
                titleBar.style.cursor = 'move';
            }
            uiPanel.style.transition = 'left 0.2s, top 0.2s'; // Re-enable smooth movement
        }
    });
    
    // Collapse button click handler
    if (collapseBtn) {
        collapseBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent triggering drag
            this.toggleCollapse();
        });
    }
    
    // Prevent text selection during drag
    titleBar.addEventListener('selectstart', (e) => {
        if (this.isDragging) e.preventDefault();
    });
    
    console.log('Dragging functionality setup complete');
};

// Toggle panel collapse/expand
UIManager.prototype.toggleCollapse = function() {
    const uiPanel = this.uiPanel;
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
        
        // Change button to "+" (expand symbol)
        collapseBtn.textContent = '+';
        
        // Adjust panel size
        uiPanel.style.height = 'auto';
        uiPanel.style.paddingBottom = '5px';
        
        console.log('UI panel collapsed');
    } else {
        // EXPAND: Show all content
        contentElements.forEach(element => {
            element.style.display = '';
        });
        
        // Change button to "−" (collapse symbol)
        collapseBtn.textContent = '−';
        
        // Restore panel size
        uiPanel.style.height = '';
        uiPanel.style.paddingBottom = '';
        
        console.log('UI panel expanded');
    }
};

// Handle attractor mode changes
UIManager.prototype.onAttractorModeChange = function(mode) {
    // Show/hide grid parameters
    const gridRows = ['gridCellsXRow', 'gridCellsYRow', 'gridProbRow', 'gridJitterRow'];
    const imageUploadRow = document.getElementById('imageUploadRow');
    
    // Hide all first
    gridRows.forEach(rowId => {
        const row = document.getElementById(rowId);
        if (row) row.style.display = 'none';
    });
    if (imageUploadRow) imageUploadRow.style.display = 'none';
    
    // Show relevant rows based on mode
    switch(mode) {
        case 'rectmesh':
        case 'hexmesh':
            gridRows.forEach(rowId => {
                const row = document.getElementById(rowId);
                if (row) row.style.display = 'table-row';
            });
            break;
        case 'fromfile':
            if (imageUploadRow) imageUploadRow.style.display = 'table-row';
            break;
    }
    
    console.log('Attractor mode changed to:', mode);
};

// Handle image upload for attractor generation
UIManager.prototype.handleImageUpload = function(file) {
    if (!file) return;
    
    const imageInfo = document.getElementById('imageInfo');
    if (imageInfo) {
        imageInfo.textContent = `Loading: ${file.name}...`;
    }
    
    // Create image preview and extract attractors
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            console.log('Image loaded:', img.width, 'x', img.height);
            
            // Update canvas dimensions to match image
            const canvasW = document.getElementById('canvasW');
            const canvasH = document.getElementById('canvasH');
            if (canvasW && canvasH) {
                canvasW.value = img.width;
                canvasH.value = img.height;
            }
            
            if (imageInfo) {
                imageInfo.textContent = `Loaded: ${img.width}x${img.height}`;
            }
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
};

// Fallback styles if UIStyles is not available
UIManager.prototype.addFallbackStyles = function() {
    const style = document.createElement('style');
    style.textContent = `
    #uiPanel {
        position: absolute;
        top: 10px;
        left: 10px;
        width: 320px;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.2);
        padding: 0; /* Title bar handles its own margin */
        z-index: 1000;
        max-height: calc(100vh - 20px);
        overflow-y: auto;
        transition: left 0.2s, top 0.2s;
    }
    
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
        margin: -10px -10px 10px -10px;
        font-family: 'Segoe UI', sans-serif;
    }
    
    .ui-title-bar:hover {
        opacity: 0.95;
    }
    
    #collapseBtn {
        background: none;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 16px;
        padding: 0 5px;
        opacity: 0.8;
        transition: opacity 0.2s;
    }
    
    #collapseBtn:hover {
        opacity: 1;
    }
    
    .ui-section {
        margin-bottom: 15px;
        padding: 10px;
        background: #f5f5f5;
        border-radius: 5px;
    }
    
    .section-title {
        margin: 0 0 10px 0;
        font-size: 14px;
        color: #333;
        font-family: 'Segoe UI', sans-serif;
    }
    
    .ui-table {
        width: 100%;
        border-collapse: collapse;
        font-family: 'Segoe UI', sans-serif;
        font-size: 13px;
        color: #333;
    }
    
    .ui-table td {
        padding: 3px;
        vertical-align: middle;
    }
    
    input[type="number"], select {
        padding: 6px 8px;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 13px;
        box-sizing: border-box;
        width: 100%;
    }
    
    input[type="range"] {
        vertical-align: middle;
        width: 70%;
    }
    
    input[type="checkbox"] {
        margin-right: 5px;
    }
    
    button {
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: opacity 0.2s;
    }
    
    button:hover:not(:disabled) {
        opacity: 0.9;
    }
    
    button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    canvas {
        display: block;
        background: #000;
        border-radius: 4px;
        width: 100%;
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
    `;
    
    document.head.appendChild(style);
    console.log('Fallback styles applied');
};

// Get current attractor mode
UIManager.prototype.getAttractorMode = function() {
    const select = document.getElementById('attrMode');
    return select ? select.value : 'uniform';
};

// Get current root mode
UIManager.prototype.getRootMode = function() {
    const select = document.getElementById('rootMode');
    return select ? select.value : 'random0';
};

// Get grid parameters
UIManager.prototype.getGridParams = function() {
    return {
        gridCellsX: this.getElementNumberValue('gridCellsX', 35),
        gridCellsY: this.getElementNumberValue('gridCellsY', 35),
        gridProb: this.getElementNumberValue('gridProb', 1.0),
        gridJitter: this.getElementNumberValue('gridJitter', 0.2)
    };
};

// Helper method to get numeric value from element
UIManager.prototype.getElementNumberValue = function(elementId, defaultValue = 0) {
    const element = document.getElementById(elementId);
    if (!element) return defaultValue;
    
    const value = parseFloat(element.value);
    return isNaN(value) ? defaultValue : value;
};

// Helper method to get checkbox state
UIManager.prototype.isChecked = function(checkboxId) {
    const checkbox = document.getElementById(checkboxId);
    return checkbox ? checkbox.checked : false;
};

// Helper method to update button state
UIManager.prototype.updateButtonState = function(buttonId, enabled, text = null) {
    const button = document.getElementById(buttonId);
    if (button) {
        button.disabled = !enabled;
        if (text !== null) {
            button.textContent = text;
        }
    }
};

// Expose globally
window.UIManager = UIManager;