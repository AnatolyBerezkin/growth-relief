// main.js - Main application with enhanced attractor and root mode support

function GrowthReliefApp() {
    console.log('Creating GrowthReliefApp...');
    
    // Core modules
    this.growthSystem = null;
    this.threeRenderer = null;
    this.uiManager = null;
    this.bezierEditor = null;
    this.depthMapGenerator = null;
    this.meshBuilder = null;
    this.exportManager = null;
    
    // Application state
    this.state = {
        isGrowing: false,
        heightFloat: null,
        currentBranches: []
    };
    
    // Store mesh data for export
    this.currentMeshData = null;
    
    // Initialize
    const self = this;
    setTimeout(function() {
        self.init();
    }, 100);
}

GrowthReliefApp.prototype.init = function() {
    console.log('Initializing GrowthReliefApp...');
    
    // Check dependencies
    if (typeof THREE === 'undefined') {
        alert('Error: Three.js library failed to load.');
        return;
    }
    
    // Initialize UI Manager first
    this.uiManager = new window.UIManager();
    if (!this.uiManager.initialize()) {
        console.error('Failed to initialize UI Manager');
        return;
    }
    
    // Wait for UI to create elements
    const self = this;
    setTimeout(function() {
        try {
            // Initialize new modules
            self.initializeModules();
            
            // Setup event handlers
            self.setupEventHandlers();
            
            console.log('GrowthReliefApp initialized successfully');
            
            // Show welcome message
            if (window.UIUtils && window.UIUtils.showNotification) {
                window.UIUtils.showNotification('Growth Relief Generator Ready!', 'success', 3000);
            }
            
        } catch (error) {
            console.error('Error during initialization:', error);
            alert('Error initializing application: ' + error.message);
        }
    }, 200);
};

GrowthReliefApp.prototype.initializeModules = function() {
    console.log('Initializing modules...');
    
    // Initialize Three.js renderer
    if (window.ThreeRenderer) {
        this.threeRenderer = new window.ThreeRenderer('threeCanvas');
        if (this.threeRenderer.initialize) {
            this.threeRenderer.initialize();
            console.log('ThreeRenderer initialized');
        }
    } else {
        console.warn('ThreeRenderer not available');
    }
    
    // Initialize Growth System
    if (window.GrowthSystem) {
        this.growthSystem = new window.GrowthSystem();
        if (this.growthSystem.initialize) {
            this.growthSystem.initialize('growthCanvas');
            console.log('GrowthSystem initialized');
        }
    } else {
        console.warn('GrowthSystem not available');
    }
    
    // Initialize Bezier Editor
    if (window.BezierEditor) {
        this.bezierEditor = new window.BezierEditor('bezierCanvas');
        if (this.bezierEditor.initialize) {
            this.bezierEditor.initialize();
            console.log('BezierEditor initialized');
            
            // Setup Bezier editor thickness from UI
            const thickness = this.getElementNumberValue('depthThickness', 25);
            if (this.bezierEditor.setMaxThickness) {
                this.bezierEditor.setMaxThickness(thickness);
            }
        }
    } else {
        console.warn('BezierEditor not available');
    }
    
    // Initialize DepthMapGenerator
    if (window.DepthMapGenerator) {
        this.depthMapGenerator = new window.DepthMapGenerator();
        console.log('DepthMapGenerator initialized');
    } else {
        console.warn('DepthMapGenerator not available');
    }
    
    // Initialize MeshBuilder
    if (window.MeshBuilder) {
        this.meshBuilder = new window.MeshBuilder();
        console.log('MeshBuilder initialized');
    } else {
        console.warn('MeshBuilder not available');
    }
    
    // Initialize ExportManager
    if (window.ExportManager) {
        this.exportManager = new window.ExportManager();
        console.log('ExportManager initialized');
    } else {
        console.warn('ExportManager not available');
    }
    
    console.log('All modules initialized');
};

GrowthReliefApp.prototype.setupEventHandlers = function() {
    const self = this;
    
    // Growth controls
    this.bindEvent('startGrowthBtn', 'click', function() {
        self.startGrowth();
    });
    
    this.bindEvent('stopGrowthBtn', 'click', function() {
        self.stopGrowth();
    });
    
    this.bindEvent('resetGrowthBtn', 'click', function() {
        self.resetGrowth();
    });
    
    // Depth map controls
    this.bindEvent('generateDepthBtn', 'click', function() {
        self.generateDepthMap();
    });
    
    // 3D mesh controls
    this.bindEvent('buildMeshBtn', 'click', function() {
        self.build3DMesh();
    });
    
    // Export controls
    this.bindEvent('exportSTLBtn', 'click', function() {
        self.exportSTL();
    });
    
    this.bindEvent('exportPNGBtn', 'click', function() {
        self.exportDepthMap();
    });
    
    // =============================================
    // ENHANCED PARAMETER HANDLERS FOR ATTRACTORS AND ROOTS
    // =============================================
    
    // Growth system parameters
    this.bindEvent('points', 'input', function(e) {
        if (self.growthSystem && self.growthSystem.setParam) {
            self.growthSystem.setParam('points', Number(e.target.value));
        }
    });
    
    this.bindEvent('killDist', 'input', function(e) {
        if (self.growthSystem && self.growthSystem.setParam) {
            self.growthSystem.setParam('killDist', Number(e.target.value));
        }
    });
    
    this.bindEvent('influenceDist', 'input', function(e) {
        if (self.growthSystem && self.growthSystem.setParam) {
            self.growthSystem.setParam('influenceDist', Number(e.target.value));
        }
    });
    
    this.bindEvent('branchLen', 'input', function(e) {
        if (self.growthSystem && self.growthSystem.setParam) {
            self.growthSystem.setParam('branchLen', Number(e.target.value));
        }
    });
    
    // NEW: Attractor mode parameter
    this.bindEvent('attrMode', 'change', function(e) {
        if (self.growthSystem && self.growthSystem.setParam) {
            self.growthSystem.setParam('attrMode', e.target.value);
            console.log('Attractor mode changed to:', e.target.value);
        }
    });
    
    // NEW: Root mode parameter
    this.bindEvent('rootMode', 'change', function(e) {
        if (self.growthSystem && self.growthSystem.setParam) {
            self.growthSystem.setParam('rootMode', e.target.value);
            console.log('Root mode changed to:', e.target.value);
        }
    });
    
    this.bindEvent('roots', 'input', function(e) {
        if (self.growthSystem && self.growthSystem.setParam) {
            self.growthSystem.setParam('roots', Number(e.target.value));
        }
    });
    
    this.bindEvent('canvasW', 'input', function(e) {
        if (self.growthSystem && self.growthSystem.setParam) {
            self.growthSystem.setParam('canvasW', Number(e.target.value));
        }
    });
    
    this.bindEvent('canvasH', 'input', function(e) {
        if (self.growthSystem && self.growthSystem.setParam) {
            self.growthSystem.setParam('canvasH', Number(e.target.value));
        }
    });
    
    // NEW: Grid parameters for mesh attractor modes
    this.bindEvent('gridCellsX', 'input', function(e) {
        if (self.growthSystem && self.growthSystem.setParam) {
            self.growthSystem.setParam('gridCellsX', Number(e.target.value));
        }
    });
    
    this.bindEvent('gridCellsY', 'input', function(e) {
        if (self.growthSystem && self.growthSystem.setParam) {
            self.growthSystem.setParam('gridCellsY', Number(e.target.value));
        }
    });
    
    this.bindEvent('gridProb', 'input', function(e) {
        if (self.growthSystem && self.growthSystem.setParam) {
            self.growthSystem.setParam('gridProb', Number(e.target.value));
        }
    });
    
    this.bindEvent('gridJitter', 'input', function(e) {
        if (self.growthSystem && self.growthSystem.setParam) {
            self.growthSystem.setParam('gridJitter', Number(e.target.value));
        }
    });
    
    // Depth map thickness parameter
    this.bindEvent('depthThickness', 'input', function(e) {
        if (self.bezierEditor && self.bezierEditor.setMaxThickness) {
            const value = Number(e.target.value);
            self.bezierEditor.setMaxThickness(value);
        }
    });
    
    this.bindEvent('bilateralRadius', 'input', function(e) {
        // Parameter is read when generating depth map
        console.log('Bilateral radius updated:', e.target.value);
    });
    
    this.bindEvent('invertToggle', 'change', function(e) {
        // Parameter is read when building mesh
        console.log('Invert toggle:', e.target.checked);
    });
    
    // Parameter change handlers for 3D mesh
    this.bindEvent('panelThickness', 'input', function(e) {
        console.log('Panel thickness updated:', e.target.value);
    });
    
    this.bindEvent('reliefHeight', 'input', function(e) {
        console.log('Relief height updated:', e.target.value);
    });
    
    console.log('Event handlers setup complete');
};

GrowthReliefApp.prototype.bindEvent = function(elementId, eventType, handler) {
    const element = document.getElementById(elementId);
    if (element) {
        element.addEventListener(eventType, handler);
        console.log(`Bound ${eventType} to ${elementId}`);
        return true;
    }
    console.warn(`Element ${elementId} not found for event binding`);
    return false;
};

// Core methods
GrowthReliefApp.prototype.startGrowth = function() {
    if (this.state.isGrowing) {
        this.showNotification('Growth already in progress', 'info');
        return;
    }
    
    if (!this.growthSystem || !this.growthSystem.startGrowth) {
        this.showNotification('Growth system not available', 'error');
        return;
    }
    
    // CRITICAL: Read ALL parameters from UI before starting growth
    const growthParams = {
        points: this.getElementNumberValue('points', 1000),
        killDist: this.getElementNumberValue('killDist', 5),
        influenceDist: this.getElementNumberValue('influenceDist', 30),
        branchLen: this.getElementNumberValue('branchLen', 3),
        canvasW: this.getElementNumberValue('canvasW', 300),
        canvasH: this.getElementNumberValue('canvasH', 300),
        roots: this.getElementNumberValue('roots', 5)
    };
    
    // Get attractor and root modes from UI Manager
    if (this.uiManager) {
        growthParams.attrMode = this.uiManager.getAttractorMode();
        growthParams.rootMode = this.uiManager.getRootMode();
    } else {
        // Fallback to direct element values
        growthParams.attrMode = document.getElementById('attrMode')?.value || 'uniform';
        growthParams.rootMode = document.getElementById('rootMode')?.value || 'random0';
    }
    
    // Add grid parameters if using mesh modes
    if (growthParams.attrMode === 'rectmesh' || growthParams.attrMode === 'hexmesh') {
        if (this.uiManager && this.uiManager.getGridParams) {
            const gridParams = this.uiManager.getGridParams();
            Object.assign(growthParams, gridParams);
        }
    }
    
    console.log('Starting growth with parameters:', growthParams);
    
    // Set all parameters in the growth system
    if (this.growthSystem && this.growthSystem.setParam) {
        for (const [key, value] of Object.entries(growthParams)) {
            this.growthSystem.setParam(key, value);
        }
        
        // Also update the canvas size immediately
        this.growthSystem.updateCanvasSize();
    }
    
    this.state.isGrowing = true;
    this.showLoading('Starting growth simulation...');
    
    // Update UI
    this.updateButtonState('startGrowthBtn', false, 'Growing...');
    this.updateButtonState('stopGrowthBtn', true);
    
    const self = this;
    this.growthSystem.startGrowth(function() {
        self.onGrowthComplete();
    });
    
    setTimeout(function() {
        self.hideLoading();
        self.showNotification('Growth simulation started', 'success');
    }, 500);
};

GrowthReliefApp.prototype.stopGrowth = function() {
    if (!this.state.isGrowing) return;
    
    if (this.growthSystem && this.growthSystem.stopGrowth) {
        this.growthSystem.stopGrowth();
    }
    
    this.state.isGrowing = false;
    
    this.updateButtonState('startGrowthBtn', true, 'Start Growth');
    this.updateButtonState('stopGrowthBtn', false);
    
    this.showNotification('Growth simulation stopped', 'info');
};

GrowthReliefApp.prototype.resetGrowth = function() {
    this.stopGrowth();
    
    if (this.growthSystem && this.growthSystem.reset) {
        this.growthSystem.reset();
    }
    
    this.state.heightFloat = null;
    this.state.currentBranches = [];
    this.currentMeshData = null; // Clear mesh data on reset
    
    if (this.threeRenderer && this.threeRenderer.clearReliefMesh) {
        this.threeRenderer.clearReliefMesh();
    }
    
    // Clear canvases
    const canvasIds = ['depthCanvas', 'growthCanvas'];
    for (const canvasId of canvasIds) {
        const canvas = document.getElementById(canvasId);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#000';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    // Update export button states
    this.updateButtonState('exportSTLBtn', false);
    this.updateButtonState('exportPNGBtn', false);
    
    this.showNotification('Growth system reset', 'info');
};

GrowthReliefApp.prototype.onGrowthComplete = function() {
    this.state.isGrowing = false;
    
    if (this.growthSystem && this.growthSystem.getBranches) {
        this.state.currentBranches = this.growthSystem.getBranches();
        console.log('Growth completed with', this.state.currentBranches.length, 'branches');
    }
    
    this.updateButtonState('startGrowthBtn', true, 'Start Growth');
    this.updateButtonState('stopGrowthBtn', false);
    
    this.showNotification('Growth simulation completed!', 'success');
    this.updateButtonState('generateDepthBtn', true);
};

GrowthReliefApp.prototype.generateDepthMap = function() {
    if (!this.state.currentBranches || this.state.currentBranches.length === 0) {
        this.showNotification('Generate a growth pattern first!', 'error');
        return;
    }
    
    if (!this.depthMapGenerator) {
        this.showNotification('Depth map generator not available', 'error');
        return;
    }
    
    this.showLoading('Generating depth map...');
    
    const self = this;
    setTimeout(function() {
        try {
            const width = self.growthSystem ? (self.growthSystem.params.canvasW || 300) : 300;
            const height = self.growthSystem ? (self.growthSystem.params.canvasH || 200) : 200;
            const depthThickness = self.getElementNumberValue('depthThickness', 25);
            const bilateralRadius = self.getElementNumberValue('bilateralRadius', 2);
            
            console.log('Generating depth map with params:', {
                width, height, depthThickness, bilateralRadius
            });
            
            // Update bezier editor with current thickness
            if (self.bezierEditor && self.bezierEditor.setMaxThickness) {
                self.bezierEditor.setMaxThickness(depthThickness);
            }
            
            // Generate depth map
            self.state.heightFloat = self.depthMapGenerator.generateFromBranches(
                self.state.currentBranches,
                width,
                height,
                self.bezierEditor
            );
            
            self.hideLoading();
            self.showNotification('Depth map generated!', 'success');
            self.updateButtonState('buildMeshBtn', true);
            self.updateButtonState('exportPNGBtn', true);
            
        } catch (error) {
            self.hideLoading();
            self.showNotification('Error generating depth map: ' + error.message, 'error');
            console.error('Depth map error:', error);
        }
    }, 500);
};

GrowthReliefApp.prototype.build3DMesh = function() {
    if (!this.state.heightFloat) {
        this.showNotification('Generate a depth map first!', 'error');
        return;
    }
    
    if (!this.meshBuilder) {
        this.showNotification('Mesh builder not available', 'error');
        return;
    }
    
    this.showLoading('Building 3D mesh...');
    
    const self = this;
    setTimeout(function() {
        try {
            const width = self.growthSystem ? (self.growthSystem.params.canvasW || 300) : 300;
            const height = self.growthSystem ? (self.growthSystem.params.canvasH || 200) : 200;
            const panelThickness = self.getElementNumberValue('panelThickness', 50);
            const reliefHeight = self.getElementNumberValue('reliefHeight', 20);
            const invert = self.getElementValue('invertToggle', 'checked', false);
            
            console.log('Building mesh with params:', {
                width, height, panelThickness, reliefHeight, invert
            });
            
            // Build mesh from heightmap data
            const meshData = self.meshBuilder.buildFromHeightmap(
                self.state.heightFloat,
                width,
                height,
                panelThickness,
                reliefHeight,
                invert
            );
            
            // Debug: verify mesh data was created
            console.log('Mesh built successfully:', {
                vertices: meshData.vertices ? `Array with ${meshData.vertices.length} elements` : 'null',
                indices: meshData.indices ? `Array with ${meshData.indices.length} elements` : 'null'
            });
            
            // CRITICAL: Save mesh data for later export
            self.currentMeshData = meshData;
            console.log('Mesh data saved to currentMeshData');
            
            // Create and display mesh in Three.js renderer
            if (self.threeRenderer && self.threeRenderer.createReliefMesh) {
                self.threeRenderer.createReliefMesh(
                    meshData.vertices,
                    meshData.indices,
                    width,
                    height,
                    panelThickness,
                    reliefHeight
                );
            }
            
            self.hideLoading();
            self.showNotification('3D mesh built successfully!', 'success');
            self.updateButtonState('exportSTLBtn', true, 'Export STL');
            
        } catch (error) {
            self.hideLoading();
            self.showNotification('Error building mesh: ' + error.message, 'error');
            console.error('Mesh build error:', error);
            console.error('Error stack:', error.stack);
        }
    }, 500);
};

GrowthReliefApp.prototype.exportSTL = function() {
    // Check 1: Is there a mesh visible in the Three.js renderer?
    if (!this.threeRenderer || !this.threeRenderer.reliefMesh) {
        this.showNotification('Build a 3D mesh first!', 'error');
        console.error('No relief mesh found in ThreeRenderer');
        return;
    }
    
    // Check 2: Do we have saved mesh data for export?
    if (!this.currentMeshData) {
        this.showNotification('No mesh data found. Please build the mesh again.', 'error');
        console.error('currentMeshData is null or undefined');
        return;
    }
    
    if (!this.currentMeshData.vertices || this.currentMeshData.vertices.length === 0) {
        this.showNotification('Mesh vertex data is empty. Please rebuild the mesh.', 'error');
        console.error('Empty vertices array in currentMeshData');
        return;
    }
    
    if (!this.currentMeshData.indices || this.currentMeshData.indices.length === 0) {
        this.showNotification('Mesh index data is empty. Please rebuild the mesh.', 'error');
        console.error('Empty indices array in currentMeshData');
        return;
    }
    
    // Check 3: Is the export manager available?
    if (!this.exportManager || !this.exportManager.exportSTL) {
        this.showNotification('Export manager not available', 'error');
        console.error('ExportManager not available');
        return;
    }
    
    console.log('Starting STL export with saved mesh data:', {
        vertices: this.currentMeshData.vertices.length,
        indices: this.currentMeshData.indices.length
    });
    
    // Pass the actual mesh data to the export manager
    this.exportManager.exportSTL(
        this.currentMeshData.vertices,
        this.currentMeshData.indices,
        'growth_relief_' + Date.now()
    );
};

GrowthReliefApp.prototype.exportDepthMap = function() {
    if (!this.state.heightFloat) {
        this.showNotification('Generate a depth map first!', 'error');
        return;
    }
    
    if (!this.exportManager || !this.exportManager.exportDepthMapPNG) {
        this.showNotification('Export manager not available', 'error');
        return;
    }
    
    const width = this.growthSystem ? (this.growthSystem.params.canvasW || 300) : 300;
    const height = this.growthSystem ? (this.growthSystem.params.canvasH || 200) : 200;
    
    this.exportManager.exportDepthMapPNG(this.state.heightFloat, width, height);
};

// =============================================
// SIMPLIFIED HELPER METHODS (using existing UIUtils when available)
// =============================================

GrowthReliefApp.prototype.showNotification = function(message, type = 'info', duration = 3000) {
    // Always use UIUtils if available
    if (window.UIUtils && window.UIUtils.showNotification) {
        window.UIUtils.showNotification(message, type, duration);
        return;
    }
    
    // Fallback only if UIUtils not available
    console.log(`${type.toUpperCase()}: ${message}`);
    alert(message);
};

GrowthReliefApp.prototype.showLoading = function(message) {
    if (window.UIUtils && window.UIUtils.showLoading) {
        window.UIUtils.showLoading(message);
        return;
    }
    console.log(`LOADING: ${message}`);
};

GrowthReliefApp.prototype.hideLoading = function() {
    if (window.UIUtils && window.UIUtils.hideLoading) {
        window.UIUtils.hideLoading();
        return;
    }
};

GrowthReliefApp.prototype.getElementNumberValue = function(elementId, defaultValue = 0) {
    // Use UIUtils if available
    if (window.UIUtils && window.UIUtils.getElementNumberValue) {
        return window.UIUtils.getElementNumberValue(elementId, defaultValue);
    }
    
    // Fallback implementation
    const element = document.getElementById(elementId);
    if (!element) return defaultValue;
    
    const value = parseFloat(element.value);
    return isNaN(value) ? defaultValue : value;
};

GrowthReliefApp.prototype.getElementValue = function(elementId, property = 'value', defaultValue = '') {
    const element = document.getElementById(elementId);
    if (!element) return defaultValue;
    
    return element[property] !== undefined ? element[property] : defaultValue;
};

GrowthReliefApp.prototype.updateButtonState = function(buttonId, enabled, text = null) {
    // Use UIUtils if available
    if (window.UIUtils && window.UIUtils.updateButtonState) {
        window.UIUtils.updateButtonState(buttonId, enabled, text);
        return;
    }
    
    // Fallback implementation
    const button = document.getElementById(buttonId);
    if (button) {
        button.disabled = !enabled;
        if (text !== null) {
            button.textContent = text;
        }
    }
};

// Initialize application
window.addEventListener('load', function() {
    console.log('Window loaded, starting GrowthReliefApp...');
    try {
        window.app = new GrowthReliefApp();
    } catch (error) {
        console.error('Failed to create GrowthReliefApp:', error);
        alert('Failed to initialize application: ' + error.message);
    }
});
