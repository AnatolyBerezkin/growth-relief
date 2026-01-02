// bezier-editor.js - Bezier curve editor for depth profile

function BezierEditor(canvasId) {
    this.canvasId = canvasId;
    this.canvas = null;
    this.ctx = null;
    
    // Initialize with default profile
    this.maxThickness = 25; // Default value
    this.profile = {
        P0: { x: 0, y: 1 },
        P1: { x: this.maxThickness * 0.25, y: 1 },    // 25% of maxThickness
        P2: { x: this.maxThickness * 0.75, y: 0 },   // 75% of maxThickness
        P3: { x: this.maxThickness, y: 0 },          // max thickness
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
    
    // Clear canvas
    ctx.fillStyle = '#333';
    ctx.fillRect(0, 0, w, h);
    
    const { P0, P1, P2, P3 } = this.profile;
    
    // Draw grid
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let i = 0; i <= 10; i++) {
        const x = (i / 10) * w;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let i = 0; i <= 10; i++) {
        const y = (i / 10) * h;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
    }
    
    // Draw Bezier curve
    ctx.beginPath();
    
    const x0 = P0.x;
    const x3 = P3.x;
    
    // Start at P1
    let screenX = (P1.x / this.maxThickness) * w;
    let screenY = h - P1.y * h;
    ctx.moveTo(screenX, screenY);
    
    // Draw curve
    for (let i = 0; i <= 200; i++) {
        const t = i / 200;
        const x = x0 + (x3 - x0) * t;
        const y = this.sampleBezier(P0, P1, P2, P3, t);
        
        screenX = (x / this.maxThickness) * w;
        screenY = h - y * h;
        ctx.lineTo(screenX, screenY);
    }
    
    // End at P2
    screenX = (P2.x / this.maxThickness) * w;
    screenY = h - P2.y * h;
    ctx.lineTo(screenX, screenY);
    
    ctx.strokeStyle = '#4a90e2';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Draw control points
    this.drawPoint(P0, '#888888'); // P0 - non-draggable (gray)
    this.drawPoint(P1, '#222222'); // P1 - draggable
    this.drawPoint(P2, '#222222'); // P2 - draggable
    this.drawPoint(P3, '#ffffff'); // P3 - draggable (white)
    
    // Draw P3 label with its x coordinate
    screenX = (P3.x / this.maxThickness) * w;
    screenY = h - P3.y * h;
    
    ctx.fillStyle = '#fff';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`x = ${P3.x.toFixed(1)}`, screenX, screenY - 10);
};

BezierEditor.prototype.drawPoint = function(point, color) {
    const w = this.canvas.width;
    const h = this.canvas.height;
    
    const x = (point.x / this.maxThickness) * w;
    const y = h - point.y * h;
    
    this.ctx.beginPath();
    this.ctx.arc(x, y, 5, 0, Math.PI * 2);
    this.ctx.fillStyle = color;
    this.ctx.fill();
    
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.stroke();
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
    const x = ((event.clientX - rect.left) / rect.width) * this.maxThickness;
    const y = 1 - (event.clientY - rect.top) / rect.height;
    
    // User can only drag P1, P2, and P3 (not P0)
    const points = ['P1', 'P2', 'P3'];
    
    for (let p of points) {
        const dx = x - this.profile[p].x;
        const dy = y - this.profile[p].y;
        
        // Hit radius in physical units
        if (dx * dx + dy * dy < (this.maxThickness * 0.03) ** 2) {
            this.draggingPoint = p;
            return;
        }
    }
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