// depth-map-generator.js - Depth map generation from branches

function DepthMapGenerator() {
    this.heightFloat = null;
    this.width = 0;
    this.height = 0;
}

// Helper function: distance from point to line segment
DepthMapGenerator.prototype.distToSegment = function(px, py, x1, y1, x2, y2) {
    const vx = x2 - x1;
    const vy = y2 - y1;
    const wx = px - x1;
    const wy = py - y1;
    
    // Projection of w onto v
    const c1 = vx * wx + vy * wy;
    if (c1 <= 0) return Math.hypot(px - x1, py - y1);
    
    const c2 = vx * vx + vy * vy;
    if (c2 <= c1) return Math.hypot(px - x2, py - y2);
    
    const b = c1 / c2;
    const bx = x1 + b * vx;
    const by = y1 + b * vy;
    
    return Math.hypot(px - bx, py - by);
};

// Bilateral blur function for float arrays
DepthMapGenerator.prototype.bilateralBlur = function(img, width, height, radius, sigmaSpatial = 2, sigmaRange = 0.1) {
    if (radius < 1) return img;
    
    const out = new Float32Array(img.length);
    const spatialWeights = [];
    
    // Precompute spatial Gaussian weights
    for (let i = -radius; i <= radius; i++) {
        spatialWeights.push(Math.exp(-(i * i) / (2 * sigmaSpatial * sigmaSpatial)));
    }
    
    const twoSigmaRange2 = 2 * sigmaRange * sigmaRange;
    
    // Apply bilateral filter
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const center = img[y * width + x];
            let sum = 0;
            let wsum = 0;
            
            for (let dy = -radius; dy <= radius; dy++) {
                const yy = Math.min(height - 1, Math.max(0, y + dy));
                
                for (let dx = -radius; dx <= radius; dx++) {
                    const xx = Math.min(width - 1, Math.max(0, x + dx));
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
    
    // Build segments from branches with wrapping
    const segments = [];
    for (let b of branches) {
        if (!b.parent) continue;
        
        let x1 = b.x, y1 = b.y;
        let x2 = b.parent.x, y2 = b.parent.y;
        
        // Wrap coordinates
        let dx = x1 - x2;
        if (dx > width / 2) x2 += width;
        else if (dx < -width / 2) x2 -= width;
        
        let dy = y1 - y2;
        if (dy > height / 2) y2 += height;
        else if (dy < -height / 2) y2 -= height;
        
        segments.push({ x1, y1, x2, y2 });
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
    
    // Compute SDF to segments
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const gx = Math.floor(x / cell);
            const gy = Math.floor(y / cell);
            
            let minD = Infinity;
            
            // Check neighboring grid cells (3x3 neighborhood)
            for (let oy = -1; oy <= 1; oy++) {
                for (let ox = -1; ox <= 1; ox++) {
                    const cx = gx + ox, cy = gy + oy;
                    if (cx < 0 || cy < 0 || cx >= cols || cy >= rows) continue;
                    
                    for (let s of grid[cy][cx]) {
                        const d = this.distToSegment(x, y, s.x1, s.y1, s.x2, s.y2);
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