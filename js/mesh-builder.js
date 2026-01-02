// mesh-builder.js - 3D mesh building from heightmap

function MeshBuilder() {
    this.vertices = [];
    this.indices = [];
}

MeshBuilder.prototype.buildFromHeightmap = function(heightFloat, width, height, panelThickness, reliefHeight, invert = false) {
    this.vertices = [];
    this.indices = [];
    
    // 1. Top surface (relief)
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            let hVal = heightFloat[y * width + x];
            if (invert) hVal = 1 - hVal;
            
            const z = panelThickness + hVal * reliefHeight;
            const X = -x + width / 2; // Center and flip X
            const Y = y - height / 2; // Center
            
            this.vertices.push(X, Y, z);
        }
    }
    
    // Helper for vertex indexing
    const vertIndex = (x, y) => y * width + x;
    
    // Triangulate top surface
    for (let y = 0; y < height - 1; y++) {
        for (let x = 0; x < width - 1; x++) {
            const i0 = vertIndex(x, y);
            const i1 = vertIndex(x + 1, y);
            const i2 = vertIndex(x, y + 1);
            const i3 = vertIndex(x + 1, y + 1);
            
            this.indices.push(i0, i2, i1);
            this.indices.push(i1, i2, i3);
        }
    }
    
    // 2. Bottom surface
    const baseOffset = this.vertices.length / 3;
    const baseZ = 0;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const X = -x + width / 2;
            const Y = y - height / 2;
            this.vertices.push(X, Y, baseZ);
        }
    }
    
    const baseIndex = (x, y) => baseOffset + y * width + x;
    
    // Triangulate bottom surface (reverse winding)
    for (let y = 0; y < height - 1; y++) {
        for (let x = 0; x < width - 1; x++) {
            const i0 = baseIndex(x, y);
            const i1 = baseIndex(x + 1, y);
            const i2 = baseIndex(x, y + 1);
            const i3 = baseIndex(x + 1, y + 1);
            
            this.indices.push(i0, i1, i2);
            this.indices.push(i1, i3, i2);
        }
    }
    
    // 3. Side walls (connect top and bottom)
    // Left and right walls
    for (let y = 0; y < height - 1; y++) {
        // Left side
        this.addSideQuad(
            vertIndex(0, y), vertIndex(0, y + 1),
            baseIndex(0, y), baseIndex(0, y + 1)
        );
        
        // Right side
        this.addSideQuad(
            vertIndex(width - 1, y), vertIndex(width - 1, y + 1),
            baseIndex(width - 1, y), baseIndex(width - 1, y + 1)
        );
    }
    
    // Top and bottom walls
    for (let x = 0; x < width - 1; x++) {
        // Bottom edge
        this.addSideQuad(
            vertIndex(x, 0), vertIndex(x + 1, 0),
            baseIndex(x, 0), baseIndex(x + 1, 0)
        );
        
        // Top edge
        this.addSideQuad(
            vertIndex(x, height - 1), vertIndex(x + 1, height - 1),
            baseIndex(x, height - 1), baseIndex(x + 1, height - 1)
        );
    }
    
    return {
        vertices: this.vertices,
        indices: this.indices
    };
};

MeshBuilder.prototype.addSideQuad = function(topA, topB, botA, botB) {
    this.indices.push(topA, botA, topB);
    this.indices.push(topB, botA, botB);
};

// Expose globally
window.MeshBuilder = MeshBuilder;