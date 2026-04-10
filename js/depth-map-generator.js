// depth-map-generator.js - Depth map generation from branches

function DepthMapGenerator() {
    this.heightFloat = null;
    this.width = 0;
    this.height = 0;
}

// Helper function: distance from point to line segment with periodic boundary conditions
DepthMapGenerator.prototype.distToSegment = function(px, py, x1, y1, x2, y2, width, height) {
    // Calculate cyclic distance between two points considering toroidal topology
    const cyclicDist = (ax, ay, bx, by) => {
        let dx = Math.abs(ax - bx);
        let dy = Math.abs(ay - by);
        
        // Wrap around X axis if world is periodic
        if (width) {
            dx = Math.min(dx, width - dx);
        }
        
        // Wrap around Y axis if world is periodic
        if (height) {
            dy = Math.min(dy, height - dy);
        }
        
        return Math.sqrt(dx * dx + dy * dy);
    };
    
    // Segment vector with periodic wrapping
    let vx = x2 - x1;
    let vy = y2 - y1;
    
    // Adjust segment vector if it crosses the periodic boundary
    if (width && Math.abs(vx) > width / 2) {
        vx = vx > 0 ? vx - width : vx + width;
    }
    if (height && Math.abs(vy) > height / 2) {
        vy = vy > 0 ? vy - height : vy + height;
    }
    
    // Vector from segment start to point with periodic wrapping
    let wx = px - x1;
    let wy = py - y1;
    
    if (width && Math.abs(wx) > width / 2) {
        wx = wx > 0 ? wx - width : wx + width;
    }
    if (height && Math.abs(wy) > height / 2) {
        wy = wy > 0 ? wy - height : wy + height;
    }
    
    // Projection of w onto v
    const c1 = vx * wx + vy * wy;
    if (c1 <= 0) return cyclicDist(px, py, x1, y1);
    
    const c2 = vx * vx + vy * vy;
    if (c2 <= c1) return cyclicDist(px, py, x2, y2);
    
    const b = c1 / c2;
    const bx = x1 + b * vx;
    const by = y1 + b * vy;
    
    // Calculate distance to the projected point on the segment
    return cyclicDist(px, py, bx, by);
};

// Bilateral blur function for float arrays with periodic boundary conditions
DepthMapGenerator.prototype.bilateralBlur = function(img, width, height, radius, sigmaSpatial = 2, sigmaRange = 0.1) {
    if (radius < 1) return img;
    
    const out = new Float32Array(img.length);
    const spatialWeights = [];
    
    // Precompute spatial Gaussian weights
    for (let i = -radius; i <= radius; i++) {
        spatialWeights.push(Math.exp(-(i * i) / (2 * sigmaSpatial * sigmaSpatial)));
    }
    
    const twoSigmaRange2 = 2 * sigmaRange * sigmaRange;
    
    // Apply bilateral filter with periodic boundary conditions
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const center = img[y * width + x];
            let sum = 0;
            let wsum = 0;
            
            for (let dy = -radius; dy <= radius; dy++) {
                // Periodic wrapping for Y coordinate
                let yy = y + dy;
                yy = ((yy % height) + height) % height;
                
                for (let dx = -radius; dx <= radius; dx++) {
                    // Periodic wrapping for X coordinate
                    let xx = x + dx;
                    xx = ((xx % width) + width) % width;
                    
                    const val = img[yy * width + xx];
                    
                    // Spatial weight
                    const spatial = spatialWeights[dy + radius] * spatialWeights[dx + radius];
                    
                    // Range weight
                    const dr = val - center;
                    const range = Math.exp(-(dr * dr) / twoSigmaRange2);
                    
                    const w = spatial * range;
                    sum += val * w;
                    wsum += w;
                }
            }
            
            out[y * width + x] = wsum > 0 ? sum / wsum : center;
        }
    }
    
    return out;
};

DepthMapGenerator.prototype.generateFromBranches = function(branches, width, height, bezierEditor) {
    this.width = width;
    this.height = height;
    
    // Create float array for heightmap
    this.heightFloat = new Float32Array(width * height);
    
    // If no branches, create demo heightmap
    if (!branches || branches.length === 0) {
        console.log('No branches provided, creating demo heightmap');
        for (let i = 0; i < width * height; i++) {
            this.heightFloat[i] = Math.random() * 0.5 + 0.3;
        }
        this.normalize();
        this.updateDepthCanvas();
        return this.heightFloat;
    }
    
    // Build segments from branches (no wrapping needed)
const segments = [];
for (let b of branches) {
    if (!b.parent) continue;
    segments.push({ 
        x1: b.x, y1: b.y, 
        x2: b.parent.x, y2: b.parent.y 
        });
    }

    console.log(`Generating depth map from ${segments.length} segments`);
    
    // Get bilateral radius from UI - UPDATED to handle multiple cases
    let blurRadius = 0;
    
    // Try to get value from UIUtils first
    if (window.UIUtils && window.UIUtils.getElementNumberValue) {
        blurRadius = window.UIUtils.getElementNumberValue('bilateralRadius', 2);
    } 
    // Fallback: try to get directly from DOM element
    else {
        const bilateralRadiusInput = document.getElementById('bilateralRadius');
        if (bilateralRadiusInput) {
            blurRadius = Number(bilateralRadiusInput.value) || 2;
        }
    }
    
    console.log(`Using bilateral radius: ${blurRadius}`);
    
    // Spatial grid optimization for faster SDF computation
    const cell = 20;
    const cols = Math.ceil(width / cell);
    const rows = Math.ceil(height / cell);
    const grid = Array.from({ length: rows }, () => 
        Array.from({ length: cols }, () => [])
    );
    
    // Insert segments into grid cells
    for (let s of segments) {
        const minx = Math.floor(Math.min(s.x1, s.x2) / cell);
        const maxx = Math.floor(Math.max(s.x1, s.x2) / cell);
        const miny = Math.floor(Math.min(s.y1, s.y2) / cell);
        const maxy = Math.floor(Math.max(s.y1, s.y2) / cell);
        
        for (let gy = miny; gy <= maxy; gy++) {
            for (let gx = minx; gx <= maxx; gx++) {
                if (gx >= 0 && gx < cols && gy >= 0 && gy < rows) {
                    grid[gy][gx].push(s);
                }
            }
        }
    }
    
    // Use P3.x from bezier editor as maximum distance
    const maxDist = bezierEditor.profile.P3.x;
    
// Compute SDF to segments with periodic boundary conditions
for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
        const gx = Math.floor(x / cell);
        const gy = Math.floor(y / cell);
        
        let minD = Infinity;
        
        // Check 3x3 neighborhood with PERIODIC WRAPPING
        for (let oy = -1; oy <= 1; oy++) {
            for (let ox = -1; ox <= 1; ox++) {
                // Periodic wrapping for grid coordinates
                let cx = (gx + ox + cols) % cols;
                let cy = (gy + oy + rows) % rows;
                
                for (let s of grid[cy][cx]) {
                    // Use periodic distance function
                    const d = this.distToSegment(x, y, s.x1, s.y1, s.x2, s.y2, width, height);
                    if (d < minD) minD = d;
                }
            }
        }
        
        // Convert distance to height using Bezier profile
        const hVal = bezierEditor.getHeightFromDistance(minD);
        this.heightFloat[y * width + x] = hVal;
    }
}
    
    // Apply bilateral blur if needed
    if (blurRadius > 0) {
        console.log(`Applying bilateral blur with radius ${blurRadius}`);
        this.heightFloat = this.bilateralBlur(this.heightFloat, width, height, blurRadius);
    } else {
        console.log('Bilateral blur disabled (radius = 0)');
    }
    
    // Normalize to 0-1 range
    this.normalize();
    
    // Update depth canvas
    this.updateDepthCanvas();
    
    return this.heightFloat;
};

DepthMapGenerator.prototype.applyBilateralBlur = function(radius) {
    if (radius < 1) return;
    
    console.log(`Applying bilateral blur with radius ${radius}`);
    this.heightFloat = this.bilateralBlur(
        this.heightFloat, 
        this.width, 
        this.height, 
        radius,
        2,      // sigmaSpatial
        0.1     // sigmaRange
    );
};

DepthMapGenerator.prototype.normalize = function() {
    if (!this.heightFloat || this.heightFloat.length === 0) return;
    
    // Find min and max values
    let minV = Infinity;
    let maxV = -Infinity;
    
    for (let i = 0; i < this.heightFloat.length; i++) {
        const v = this.heightFloat[i];
        if (v < minV) minV = v;
        if (v > maxV) maxV = v;
    }
    
    console.log(`Heightmap range before normalization: ${minV.toFixed(4)} to ${maxV.toFixed(4)}`);
    
    // Normalize to 0-1 range
    const range = Math.max(1e-6, maxV - minV);
    
    for (let i = 0; i < this.heightFloat.length; i++) {
        this.heightFloat[i] = (this.heightFloat[i] - minV) / range;
    }
    
    // Check after normalization
    minV = Infinity;
    maxV = -Infinity;
    for (let i = 0; i < this.heightFloat.length; i++) {
        const v = this.heightFloat[i];
        if (v < minV) minV = v;
        if (v > maxV) maxV = v;
    }
    console.log(`Heightmap range after normalization: ${minV.toFixed(4)} to ${maxV.toFixed(4)}`);
};

DepthMapGenerator.prototype.createImageData = function() {
    if (!this.heightFloat) return null;
    
    const canvas = document.createElement('canvas');
    canvas.width = this.width;
    canvas.height = this.height;
    const ctx = canvas.getContext('2d');
    
    const imgData = ctx.createImageData(this.width, this.height);
    const data = imgData.data;
    
    // Convert float heightmap to grayscale image
    for (let i = 0; i < this.heightFloat.length; i++) {
        const v = Math.floor(this.heightFloat[i] * 255);
        const p = i * 4;
        data[p] = data[p + 1] = data[p + 2] = v;
        data[p + 3] = 255;
    }
    
    ctx.putImageData(imgData, 0, 0);
    return imgData;
};

DepthMapGenerator.prototype.updateDepthCanvas = function() {
    const depthCanvas = document.getElementById('depthCanvas');
    if (!depthCanvas || !this.heightFloat) {
        console.warn('Depth canvas not found or no height data');
        return;
    }
    
    // Ensure canvas size matches
    depthCanvas.width = this.width;
    depthCanvas.height = this.height;
    
    const ctx = depthCanvas.getContext('2d');
    const imgData = this.createImageData();
    
    if (imgData) {
        ctx.putImageData(imgData, 0, 0);
        console.log(`Depth canvas updated: ${this.width}x${this.height}`);
    }
};

// Expose globally
window.DepthMapGenerator = DepthMapGenerator;
console.log('DepthMapGenerator loaded and exposed');