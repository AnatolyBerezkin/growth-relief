// bezier-editor.js - Bezier curve editor for depth profile

function BezierEditor(canvasId) {
    this.canvasId = canvasId;
    this.canvas = null;
    this.ctx = null;

    // NEW: Add padding property here
    this.padding = 10; // Padding for coordinate axes (5px on all sides)
    this.maxHeight = 1.0;
    
    // Initialize with default profile
    this.maxThickness = 25; // Default value
    this.profile = {
        P0: { x: 0, y: 1 },
        P1: { x: 0, y: 0.5 },    // 25% of maxThickness
        P2: { x: this.maxThickness * (0.6 - 0.25), y: 0 },   // 75% of maxThickness
        P3: { x: this.maxThickness * 0.6, y: 0 },          // max thickness
        table: new Float32Array(512)
    };
    
    this.draggingPoint = null;
}

BezierEditor.prototype.initialize = function() {
    this.canvas = document.getElementById(this.canvasId);
    if (!this.canvas) {
        console.error(`Bezier canvas with id "${this.canvasId}" not found`);
        return false;
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.setupEventListeners();
    this.buildBezierTable();
    this.draw();
    
    console.log('BezierEditor initialized');
    return true;
};

BezierEditor.prototype.setMaxThickness = function(newValue) {
    // Update max thickness
    this.maxThickness = newValue;
    
    // Only update P3 if it was at the previous maximum
    const wasAtMax = Math.abs(this.profile.P3.x - this.maxThickness) < 0.1;
    
    if (wasAtMax) {
        this.profile.P3.x = newValue;
    }
    
    // Always keep P3.y = 0
    this.profile.P3.y = 0;
    
    // Clamp P1 and P2 to new max
    this.profile.P1.x = Math.min(this.profile.P1.x, newValue);
    this.profile.P2.x = Math.min(this.profile.P2.x, newValue);
    
    this.buildBezierTable();
    this.draw();
};

BezierEditor.prototype.sampleBezier = function(P0, P1, P2, P3, t) {
    const u = 1 - t;
    return (
        u*u*u * P0.y +
        3*u*u*t * P1.y +
        3*u*t*t * P2.y +
        t*t*t * P3.y
    );
};

BezierEditor.prototype.buildBezierTable = function() {
    const N = this.profile.table.length;
    const { P0, P1, P2, P3 } = this.profile;
    
    for (let i = 0; i < N; i++) {
        const t = i / (N - 1);
        this.profile.table[i] = this.sampleBezier(P0, P1, P2, P3, t);
    }
};

BezierEditor.prototype.getHeightFromDistance = function(distance) {
    const maxDist = this.profile.P3.x; // Use P3.x as maximum distance
    const t = Math.min(1, distance / maxDist);
    const idx = Math.floor(t * (this.profile.table.length - 1));
    return this.profile.table[idx];
};

BezierEditor.prototype.draw = function() {
    if (!this.ctx || !this.canvas) return;
    
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const padding = this.padding || 5; // Use padding property, default to 5px
    const graphWidth = w - 2 * padding;
    const graphHeight = h - 2 * padding;
    
    // Clear canvas
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, w, h);
    
    const { P0, P1, P2, P3 } = this.profile;
    
    // Draw graph area background (darker)
    ctx.fillStyle = '#222';
    ctx.fillRect(padding, padding, graphWidth, graphHeight);
    
    // Draw coordinate axes with padding
    ctx.strokeStyle = '#666';
    ctx.lineWidth = 2;
    
    // X-axis (5px from bottom)
    ctx.beginPath();
    ctx.moveTo(padding, h - padding);
    ctx.lineTo(w - padding, h - padding);
    ctx.stroke();
    
    // Y-axis (5px from left)
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, h - padding);
    ctx.stroke();
    
    // Draw grid inside the graph area only
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    
    // Vertical lines (only inside graph area)
    for (let i = 0; i <= 10; i++) {
        const x = padding + (i / 10) * graphWidth;
        ctx.beginPath();
        ctx.moveTo(x, padding);
        ctx.lineTo(x, h - padding);
        ctx.stroke();
    }
    
    // Horizontal lines (only inside graph area)
    for (let i = 0; i <= 10; i++) {
        const y = padding + (i / 10) * graphHeight;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(w - padding, y);
        ctx.stroke();
    }
    
// 1. FIRST: Draw the Bezier curve from P1 to P2 (WHITE)
    ctx.beginPath(); // Start NEW path for Bezier curve
    
    const x0 = P0.x;
    const x3 = P3.x;
    
    // Start at P1
    screenX = padding + (P1.x / this.maxThickness) * graphWidth;
    screenY = padding + (1 - P1.y) * graphHeight;
    ctx.moveTo(screenX, screenY);
    
    // Draw the actual Bezier curve
    for (let i = 1; i <= 200; i++) {
        const t = i / 200;
        const x = x0 + (x3 - x0) * t;
        const y = this.sampleBezier(P0, P1, P2, P3, t);
        
        screenX = padding + (x / this.maxThickness) * graphWidth;
        screenY = padding + (1 - y) * graphHeight;
        ctx.lineTo(screenX, screenY);
    }
    
    // End at P2
    screenX = padding + (P2.x / this.maxThickness) * graphWidth;
    screenY = padding + (1 - P2.y) * graphHeight;
    ctx.lineTo(screenX, screenY);
    
    // Apply WHITE color to Bezier curve
    ctx.strokeStyle = '#ffffff';  // White color for Bezier curve
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 2. SECOND: Draw connection lines separately (BLUE)
    // Draw connection lines between P0-P1 and P2-P3
    ctx.strokeStyle = '#4a90e2';
    ctx.lineCap = 'butt';    // Flat line ends (no rounding)
    ctx.lineJoin = 'miter';  // Sharp corners
    ctx.lineWidth = 3;
    ctx.beginPath(); // Start NEW path for connection lines
    
    // Line from P0 to P1
    screenX = padding + (P0.x / this.maxThickness) * graphWidth;
    screenY = padding + (1 - P0.y) * graphHeight;
    ctx.moveTo(screenX, screenY);
    
    screenX = padding + (P1.x / this.maxThickness) * graphWidth;
    screenY = padding + (1 - P1.y) * graphHeight;
    ctx.lineTo(screenX, screenY);
    
    // Line from P2 to P3
    screenX = padding + (P2.x / this.maxThickness) * graphWidth;
    screenY = padding + (1 - P2.y) * graphHeight;
    ctx.moveTo(screenX, screenY);
    
    screenX = padding + (P3.x / this.maxThickness) * graphWidth;
    screenY = padding + (1 - P3.y) * graphHeight;
    ctx.lineTo(screenX, screenY);
    
    ctx.stroke();
    
    // Draw control points (adjusted for padding)
    this.drawPoint(P0, '#888888', padding, graphWidth, graphHeight); // P0 - non-draggable (gray)
    this.drawPoint(P1, '#222222', padding, graphWidth, graphHeight); // P1 - draggable
    this.drawPoint(P2, '#222222', padding, graphWidth, graphHeight); // P2 - draggable
    this.drawPoint(P3, '#ffffff', padding, graphWidth, graphHeight); // P3 - draggable (white)
    
    // Draw P3 label with its x coordinate (adjusted for padding)
    screenX = padding + (P3.x / this.maxThickness) * graphWidth;
    screenY = padding + (1 - P3.y) * graphHeight; // Invert Y coordinate
    
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`x = ${P3.x.toFixed(1)}`, screenX, screenY - 10);
};

BezierEditor.prototype.drawPoint = function(point, color, padding, graphWidth, graphHeight) {
    if (!this.ctx || !this.canvas) return;
    
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    // Use default padding if not provided
    padding = padding || this.padding || 5;
    graphWidth = graphWidth || w - 2 * padding;
    graphHeight = graphHeight || h - 2 * padding;
    
    // Calculate screen coordinates with padding
    const screenX = padding + (point.x / this.maxThickness) * graphWidth;
    const screenY = padding + (1 - point.y) * graphHeight; // Invert Y coordinate
    
    // Draw point
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(screenX, screenY, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw point border
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(screenX, screenY, 6, 0, Math.PI * 2);
    ctx.stroke();
};

BezierEditor.prototype.setupEventListeners = function() {
    const self = this;
    
    this.canvas.addEventListener('mousedown', function(e) {
        self.onMouseDown(e);
    });
    
    this.canvas.addEventListener('mousemove', function(e) {
        self.onMouseMove(e);
    });
    
    this.canvas.addEventListener('mouseup', function() {
        self.onMouseUp();
    });
    
    this.canvas.addEventListener('mouseleave', function() {
        self.onMouseUp();
    });
};

BezierEditor.prototype.onMouseDown = function(event) {
    const rect = this.canvas.getBoundingClientRect();
    const padding = this.padding || 5;
    const graphWidth = rect.width - 2 * padding;
    const graphHeight = rect.height - 2 * padding;
    
    // Mouse coordinates in pixels
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;
    
    // User can only drag P1, P2, and P3 (not P0)
    const points = ['P1', 'P2', 'P3'];
    
    for (let p of points) {
        const point = this.profile[p];
        
        // Convert point coordinates to PIXELS
        const pointX = padding + (point.x / this.maxThickness) * graphWidth;
        const pointY = padding + (1 - point.y) * graphHeight;
        
        // Calculate distance in PIXELS
        const dx = mouseX - pointX;
        const dy = mouseY - pointY;
        
        // Hit radius in PIXELS (10px = comfortable click area)
        if (dx * dx + dy * dy < 100) { // 10px * 10px = 100
            this.draggingPoint = p;
            return;
        }
    }
    
    // If no point was clicked
    this.draggingPoint = null;
};

BezierEditor.prototype.onMouseMove = function(event) {
    if (!this.draggingPoint) return;
    
    const rect = this.canvas.getBoundingClientRect();
    let x = ((event.clientX - rect.left) / rect.width) * this.maxThickness;
    
    // Clamp X to [0..maxThickness]
    x = Math.max(0, Math.min(this.maxThickness, x));
    
    if (this.draggingPoint === 'P3') {
        // Save the distance between P3 and P2
        const oldDx = this.profile.P3.x - this.profile.P2.x;
        
        // Update P3 position (only X, Y is always 0)
        this.profile.P3.x = x;
        this.profile.P3.y = 0;
        
        // Move P2 along with P3 to maintain relative position
        this.profile.P2.x = this.profile.P3.x - oldDx;
    } 
    else if (this.draggingPoint === 'P2') {
        const y = 1 - (event.clientY - rect.top) / rect.height;
        this.profile.P2.x = x;
        this.profile.P2.y = Math.max(0, Math.min(1, y));
    } 
    else if (this.draggingPoint === 'P1') {
        const y = 1 - (event.clientY - rect.top) / rect.height;
        this.profile.P1.x = x;
        this.profile.P1.y = Math.max(0, Math.min(1, y));
    }
    
    this.buildBezierTable();
    this.draw();
};

BezierEditor.prototype.onMouseUp = function() {
    this.draggingPoint = null;
};

// Expose globally
window.BezierEditor = BezierEditor;