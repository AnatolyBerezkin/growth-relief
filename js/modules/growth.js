// growth.js - Growth System with enhanced attractor generation modes

// Branch class - represents a single growth segment
function Branch(x, y, parent = null, len = 3) {
    this.x = x;           // X coordinate
    this.y = y;           // Y coordinate
    this.parent = parent; // Parent branch (null for root branches)
    this.growDir = { x: 0, y: 0 }; // Accumulated growth direction
    this.count = 0;       // Number of attractors influencing this branch
    this.len = len;       // Branch segment length
}

// Create the next branch segment in the accumulated direction
Branch.prototype.next = function() {
    return new Branch(
        this.x + this.growDir.x * this.len,
        this.y + this.growDir.y * this.len,
        this,
        this.len
    );
};

// GrowthSystem class - main growth simulation controller
function GrowthSystem() {
    this.attractors = [];    // Array of attractor points
    this.branches = [];      // Array of branch segments
    this.canvas = null;      // Canvas element for 2D visualization
    this.ctx = null;         // Canvas 2D context
    this.params = {
        points: 5000,        // Number of attractors
        killDist: 5,         // Distance at which attractor is "killed"
        influenceDist: 10,   // Radius of attractor influence
        branchLen: 3,        // Length of each growth segment
        canvasW: 300,        // Canvas width
        canvasH: 200,        // Canvas height
        attrMode: 'uniform', // Attractor generation mode: 'uniform', 'rectmesh', 'hexmesh'
        roots: 5,            // Number of root branches
        rootMode: 'random0', // Root placement mode: 'random0', 'random1', 'line', 'circle'
        bgColor: 0x000000,   // Background color
        branchColor: 0xffffff, // Branch color
        attrColor: 0x00ff00, // Attractor color
        
        // Additional parameters for mesh-based attractor generation
        gridCellsX: 35,      // Number of grid cells horizontally (for mesh modes)
        gridCellsY: 35,      // Number of grid cells vertically (for mesh modes)
        gridProb: 1.0,       // Probability of placing attractor in each cell
        gridJitter: 0.2      // Random displacement factor (0-1)
    };
    this.isGrowing = false;  // Growth simulation state
}

// Initialize the growth system with a canvas
GrowthSystem.prototype.initialize = function(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) {
        console.error(`Canvas with id "${canvasId}" not found`);
        return false;
    }
    
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.params.canvasW;
    this.canvas.height = this.params.canvasH;
    
    return true;
};

// Update a parameter value
GrowthSystem.prototype.setParam = function(key, value) {
    this.params[key] = value;
    
    // Update canvas size immediately if width/height changes
    if (key === 'canvasW' || key === 'canvasH') {
        this.updateCanvasSize();
    }
};

// Update canvas dimensions based on parameters
GrowthSystem.prototype.updateCanvasSize = function() {
    if (this.canvas) {
        this.canvas.width = this.params.canvasW;
        this.canvas.height = this.params.canvasH;
    }
};

// =============================================
// ENHANCED ATTRACTOR GENERATION METHODS
// =============================================

// Main attractor generator - dispatches to specific generation method based on mode
GrowthSystem.prototype.generateAttractors = function() {
    this.attractors = [];
    const { points, canvasW, canvasH, attrMode } = this.params;

    console.log(`Generating attractors: mode=${attrMode}, count=${points}, canvas=${canvasW}x${canvasH}`);

    if (attrMode === 'uniform') {
        // Uniform random distribution - original mode
        this.generateUniformAttractors();
    } 
    else if (attrMode === 'rectmesh') {
        // Rectangular grid-based distribution
        this.generateRectMesh();
    }
    else if (attrMode === 'hexmesh') {
        // Hexagonal grid-based distribution
        this.generateHexMesh();
    }
    else if (attrMode === 'fromfile') {
        // Attractors from image file (handled separately in UI)
        console.log('Attractors from file mode - generation handled by UI');
        // In this mode, attractors array should be set externally
        if (this.attractors.length === 0) {
            console.warn('No attractors loaded from file, using uniform as fallback');
            this.generateUniformAttractors();
        }
    }
    else {
        console.error(`Unknown attractor mode: ${attrMode}, using uniform as fallback`);
        this.generateUniformAttractors();
    }
    
    console.log(`Generated ${this.attractors.length} attractors`);
};

// Generate uniform random attractors
GrowthSystem.prototype.generateUniformAttractors = function() {
    const { points, canvasW, canvasH } = this.params;
    
    for (let i = 0; i < points; i++) {
        this.attractors.push({
            x: Math.random() * canvasW,
            y: Math.random() * canvasH,
            id: i  // Optional identifier
        });
    }
};

// Generate attractors in a rectangular grid pattern
// Creates evenly spaced points in a grid with optional randomness
GrowthSystem.prototype.generateRectMesh = function() {
    const { canvasW, canvasH, gridCellsX, gridCellsY, gridProb, gridJitter } = this.params;
    
    // Calculate cell dimensions
    const periodX = canvasW / gridCellsX;
    const periodY = canvasH / gridCellsY;
    
    // Jitter amplitude as fraction of half cell size
    const jitterAmpX = gridJitter * (periodX * 0.5);
    const jitterAmpY = gridJitter * (periodY * 0.5);
    
    this.attractors = [];
    
    // Generate attractors in each grid cell
    for (let iy = 0; iy < gridCellsY; iy++) {
        for (let ix = 0; ix < gridCellsX; ix++) {
            
            // Apply probability filter - skip some cells randomly
            if (Math.random() > gridProb) continue;
            
            // Calculate center of current cell
            const cx = ix * periodX + periodX * 0.5;
            const cy = iy * periodY + periodY * 0.5;
            
            // Apply random jitter (displacement)
            const jitterX = (Math.random() - 0.5) * 2 * jitterAmpX;
            const jitterY = (Math.random() - 0.5) * 2 * jitterAmpY;
            
            // Calculate final position
            let x = Math.round(cx + jitterX);
            let y = Math.round(cy + jitterY);
            
            // Apply toroidal wrapping if coordinates are out of bounds
            x = window.GrowthUtils.wrapX(x, canvasW);
            y = window.GrowthUtils.wrapY(y, canvasH);
            
            this.attractors.push({ 
                x, 
                y,
                cellX: ix,  // Grid coordinates for debugging
                cellY: iy
            });
        }
    }
    
    console.log(`Rectangular mesh: ${gridCellsX}x${gridCellsY} cells, ${this.attractors.length} attractors`);
};

// Generate attractors in a hexagonal (honeycomb) grid pattern
// Creates a staggered grid for more organic distribution
GrowthSystem.prototype.generateHexMesh = function() {
    const { canvasW, canvasH, gridCellsX, gridCellsY, gridProb, gridJitter } = this.params;
    
    // Base period along X axis
    const periodX = canvasW / gridCellsX;
    
    // Hexagonal vertical spacing (slightly more compact)
    const periodY = canvasH / gridCellsY;
    
    // Jitter amplitude
    const jitterAmpX = gridJitter * (periodX * 0.5);
    const jitterAmpY = gridJitter * (periodY * 0.5);
    
    this.attractors = [];
    
    for (let iy = 0; iy < gridCellsY; iy++) {
        for (let ix = 0; ix < gridCellsX; ix++) {
            
            // Apply probability filter
            if (Math.random() > gridProb) continue;
            
            // Hexagonal offset: odd rows shifted by half period for honeycomb pattern
            const offsetX = (iy % 2 === 1) ? periodX * 0.5 : 0;
            
            // Calculate center of hex cell
            const cx = ix * periodX + offsetX + periodX * 0.5;
            const cy = iy * periodY + periodY * 0.5;
            
            // Apply random jitter
            const jitterX = (Math.random() - 0.5) * 2 * jitterAmpX;
            const jitterY = (Math.random() - 0.5) * 2 * jitterAmpY;
            
            // Calculate final position
            let x = Math.round(cx + jitterX);
            let y = Math.round(cy + jitterY);
            
            // Apply toroidal wrapping
            x = window.GrowthUtils.wrapX(x, canvasW);
            y = window.GrowthUtils.wrapY(y, canvasH);
            
            this.attractors.push({ 
                x, 
                y,
                cellX: ix,
                cellY: iy,
                rowOffset: (iy % 2)  // 0 for even rows, 1 for odd rows
            });
        }
    }
    
    console.log(`Hexagonal mesh: ${gridCellsX}x${gridCellsY} cells, ${this.attractors.length} attractors`);
};

// =============================================
// ENHANCED ROOT GENERATION METHODS
// =============================================

// Generate root branches based on selected mode
GrowthSystem.prototype.generateRoots = function() {
    this.branches = [];
    const { roots, rootMode, canvasW, canvasH, branchLen } = this.params;
    const attractors = this.attractors;

    console.log(`Generating roots: mode=${rootMode}, count=${roots}`);

    if (rootMode === 'random0') {
        // Original mode: randomly select attractors as root positions
        this.generateRandom0Roots();
    } 
    else if (rootMode === 'random1') {
        // Random positions along the bottom edge
        this.generateRandom1Roots();
    }
    else if (rootMode === 'line') {
        // Evenly spaced along the bottom edge
        this.generateLineRoots();
    }
    else if (rootMode === 'circle') {
        // Arranged in a circle around the center
        this.generateCircleRoots();
    }
    else {
        console.error(`Unknown root mode: ${rootMode}, using random0 as fallback`);
        this.generateRandom0Roots();
    }
    
    console.log(`Generated ${this.branches.length} root branches`);
};

// Random roots placed on randomly selected attractors
GrowthSystem.prototype.generateRandom0Roots = function() {
    const { roots, branchLen } = this.params;
    const attractors = this.attractors;
    
    for (let i = 0; i < roots; i++) {
        // Ensure we have attractors to select from
        if (attractors.length === 0) {
            console.warn('No attractors available for root placement');
            break;
        }
        
        const a = attractors[Math.floor(Math.random() * attractors.length)];
        this.branches.push(new Branch(a.x, a.y, null, branchLen));
    }
};

// Random roots placed along the bottom edge of canvas
GrowthSystem.prototype.generateRandom1Roots = function() {
    const { roots, canvasW, canvasH, branchLen } = this.params;
    
    for (let i = 0; i < roots; i++) {
        this.branches.push(new Branch(
            Math.random() * canvasW,
            canvasH - 1,  // At the very bottom
            null,
            branchLen
        ));
    }
};

// Roots evenly spaced along a line at the bottom
GrowthSystem.prototype.generateLineRoots = function() {
    const { roots, canvasW, canvasH, branchLen } = this.params;
    
    for (let i = 0; i < roots; i++) {
        this.branches.push(new Branch(
            (i + 0.5) * (canvasW / roots),  // Evenly spaced
            canvasH - 20,  // Slightly above the bottom
            null,
            branchLen
        ));
    }
};

// Roots arranged in a circle around the center
GrowthSystem.prototype.generateCircleRoots = function() {
    const { roots, canvasW, canvasH, branchLen } = this.params;
    
    const centerX = canvasW / 2;
    const centerY = canvasH / 2;
    const radius = Math.min(canvasW, canvasH) * 0.3;  // 30% of smaller dimension
    
    for (let i = 0; i < roots; i++) {
        const angle = (i / roots) * 2 * Math.PI;
        this.branches.push(new Branch(
            centerX + radius * Math.cos(angle),
            centerY + radius * Math.sin(angle),
            null,
            branchLen
        ));
    }
};

// =============================================
// GROWTH SIMULATION CORE (unchanged)
// =============================================

GrowthSystem.prototype.step = function() {
    // Reset growth directions
    for (let b of this.branches) {
        b.growDir.x = 0;
        b.growDir.y = 0;
        b.count = 0;
    }

    // Process attractors
    for (let i = this.attractors.length - 1; i >= 0; i--) {
        const a = this.attractors[i];
        let closest = null;
        let dmin = Infinity;

        // Find closest branch
        for (let b of this.branches) {
            const d = window.GrowthUtils.dist(a.x, a.y, b.x, b.y, this.canvas.width, this.canvas.height);

            if (d < this.params.killDist) {
                this.attractors.splice(i, 1);
                closest = null;
                break;
            }

            if (d < this.params.influenceDist && d < dmin) {
                closest = b;
                dmin = d;
            }
        }

        // Accumulate growth direction
        if (closest) {
            let dx = a.x - closest.x;
            if (dx > this.canvas.width / 2) dx -= this.canvas.width;
            if (dx < -this.canvas.width / 2) dx += this.canvas.width;
            
            let dy = a.y - closest.y;
            if (dy > this.canvas.height / 2) dy -= this.canvas.height;
            if (dy < -this.canvas.height / 2) dy += this.canvas.height;
            
            const mag = Math.sqrt(dx * dx + dy * dy);

            closest.growDir.x += dx / mag;
            closest.growDir.y += dy / mag;
            closest.count++;
        }
    }

    // Create new branches
    const newBranches = [];
    for (let b of this.branches) {
        if (b.count > 0) {
            b.growDir.x /= b.count;
            b.growDir.y /= b.count;
            let nb = b.next();
            nb.x = window.GrowthUtils.wrapX(nb.x, this.canvas.width);
            nb.y = window.GrowthUtils.wrapY(nb.y, this.canvas.height);
            newBranches.push(nb);
        }
    }

    // Check if growth should stop
    if (newBranches.length === 0) {
        return false;
    }

    this.branches.push(...newBranches);
    return true;
};

GrowthSystem.prototype.draw = function() {
    if (!this.ctx || !this.canvas) return;

    // Clear canvas
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw attractors as green dots
    this.ctx.fillStyle = '#00ff00';
    for (let a of this.attractors) {
        this.ctx.beginPath();
        this.ctx.arc(a.x, a.y, 1, 0, Math.PI * 2);
        this.ctx.fill();
    }

    // Draw branches as white lines
    this.ctx.strokeStyle = '#ffffff';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    
    for (let b of this.branches) {
        if (!b.parent) continue;

        let x1 = b.x, y1 = b.y;
        let x2 = b.parent.x, y2 = b.parent.y;

        // Wrap correction for drawing
        let dx = x1 - x2;
        if (dx > this.canvas.width / 2) x2 += this.canvas.width;
        else if (dx < -this.canvas.width / 2) x2 -= this.canvas.width;

        let dy = y1 - y2;
        if (dy > this.canvas.height / 2) y2 += this.canvas.height;
        else if (dy < -this.canvas.height / 2) y2 -= this.canvas.height;

        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x2, y2);
    }
    
    this.ctx.stroke();
};

GrowthSystem.prototype.startGrowth = function(onComplete) {
    this.isGrowing = true;
    
    // Initial generation
    this.generateAttractors();
    this.generateRoots();
    this.draw();
    
    const growLoop = () => {
        if (!this.isGrowing) return;
        
        const alive = this.step();
        this.draw();
        
        if (alive) {
            requestAnimationFrame(growLoop);
        } else {
            this.isGrowing = false;
            if (onComplete) onComplete();
            console.log('Growth finished');
        }
    };
    
    growLoop();
};

GrowthSystem.prototype.stopGrowth = function() {
    this.isGrowing = false;
};

GrowthSystem.prototype.reset = function() {
    this.attractors = [];
    this.branches = [];
    this.isGrowing = false;
    if (this.ctx && this.canvas) {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
};

GrowthSystem.prototype.getBranches = function() {
    return this.branches;
};

GrowthSystem.prototype.getAttractors = function() {
    return this.attractors;
};

// Expose globally
window.Branch = Branch;
window.GrowthSystem = GrowthSystem;