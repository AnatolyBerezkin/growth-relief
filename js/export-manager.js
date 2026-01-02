// export-manager.js - Export manager for PNG and STL with debugging

function ExportManager() {}

ExportManager.prototype.exportDepthMapPNG = function(heightFloat, width, height) {
    if (!heightFloat) {
        UIUtils.showNotification('No depth map to export', 'error');
        return false;
    }
    
    UIUtils.showLoading('Exporting PNG...');
    
    setTimeout(() => {
        try {
            // Create canvas
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            const imgData = ctx.createImageData(width, height);
            const data = imgData.data;
            
            // Convert float (0-1) to 8-bit (0-255)
            for (let i = 0; i < heightFloat.length; i++) {
                const v = Math.floor(heightFloat[i] * 255);
                const p = i * 4;
                data[p] = data[p + 1] = data[p + 2] = v;
                data[p + 3] = 255;
            }
            
            ctx.putImageData(imgData, 0, 0);
            
            // Create download
            const link = document.createElement('a');
            link.href = canvas.toDataURL('image/png');
            link.download = `depth_map_${width}x${height}_${Date.now()}.png`;
            link.click();
            
            UIUtils.hideLoading();
            UIUtils.showNotification('Depth map exported as PNG', 'success');
            
        } catch (error) {
            UIUtils.hideLoading();
            UIUtils.showNotification(`PNG export error: ${error.message}`, 'error');
            console.error('PNG export error:', error);
        }
    }, 100);
    
    return true;
};

ExportManager.prototype.exportSTL = function(vertices, indices, meshName = 'growth_relief') {
    // Enhanced debugging
    console.log('=== STL Export Debug Info ===');
    console.log('Vertices:', vertices ? `Array with ${vertices.length} elements` : 'null');
    console.log('Indices:', indices ? `Array with ${indices.length} elements` : 'null');
    
    if (vertices && vertices.length > 0) {
        console.log('First 6 vertex values:', vertices.slice(0, 6));
        console.log('Vertex count (vertices.length/3):', vertices.length / 3);
    }
    
    if (indices && indices.length > 0) {
        console.log('First 6 index values:', indices.slice(0, 6));
        console.log('Triangle count (indices.length/3):', indices.length / 3);
    }
    
    // Enhanced validation with better error messages
    if (!vertices || !Array.isArray(vertices)) {
        UIUtils.showNotification('Vertex data is missing or invalid', 'error');
        console.error('Vertex data validation failed:', vertices);
        return false;
    }
    
    if (vertices.length === 0) {
        UIUtils.showNotification('Vertex array is empty', 'error');
        console.error('Vertex array is empty');
        return false;
    }
    
    if (!indices || !Array.isArray(indices)) {
        UIUtils.showNotification('Index data is missing or invalid', 'error');
        console.error('Index data validation failed:', indices);
        return false;
    }
    
    if (indices.length === 0) {
        UIUtils.showNotification('Index array is empty', 'error');
        console.error('Index array is empty');
        return false;
    }
    
    if (vertices.length % 3 !== 0) {
        UIUtils.showNotification(`Invalid vertex count: ${vertices.length}. Must be divisible by 3.`, 'error');
        console.error(`Vertex count not divisible by 3: ${vertices.length}`);
        return false;
    }
    
    if (indices.length % 3 !== 0) {
        UIUtils.showNotification(`Invalid index count: ${indices.length}. Must be divisible by 3.`, 'error');
        console.error(`Index count not divisible by 3: ${indices.length}`);
        return false;
    }
    
    // Check if indices reference valid vertices
    const maxVertexIndex = vertices.length / 3 - 1;
    const invalidIndices = [];
    
    for (let i = 0; i < indices.length; i++) {
        if (indices[i] > maxVertexIndex) {
            invalidIndices.push({ index: i, value: indices[i], maxAllowed: maxVertexIndex });
        }
    }
    
    if (invalidIndices.length > 0) {
        console.error(`Found ${invalidIndices.length} invalid indices:`, invalidIndices.slice(0, 10));
        if (invalidIndices.length > 10) {
            console.error(`... and ${invalidIndices.length - 10} more`);
        }
    }
    
    UIUtils.showLoading('Exporting STL...');
    
    setTimeout(() => {
        try {
            const triangleCount = indices.length / 3;
            const vertexCount = vertices.length / 3;
            
            console.log(`Exporting: ${triangleCount} triangles, ${vertexCount} vertices`);
            
            // STL binary structure
            const headerSize = 80;
            const triangleEntrySize = 50; // 12 + 36 + 2 bytes
            const bufferSize = headerSize + 4 + (triangleCount * triangleEntrySize);
            
            console.log(`STL buffer size: ${bufferSize} bytes`);
            
            const buffer = new ArrayBuffer(bufferSize);
            const view = new DataView(buffer);
            
            let offset = 0;
            
            // Write 80-byte header
            const headerString = `3D Relief Mesh - ${meshName} - Triangles: ${triangleCount} - Vertices: ${vertexCount}`;
            for (let i = 0; i < 80; i++) {
                view.setUint8(offset + i, i < headerString.length ? headerString.charCodeAt(i) : 0);
            }
            offset += 80;
            
            // Write triangle count
            view.setUint32(offset, triangleCount, true);
            offset += 4;
            
            // Process each triangle
            for (let i = 0; i < triangleCount; i++) {
                const idx0 = indices[i * 3];
                const idx1 = indices[i * 3 + 1];
                const idx2 = indices[i * 3 + 2];
                
                // Validate indices before using them
                if (idx0 >= vertexCount || idx1 >= vertexCount || idx2 >= vertexCount) {
                    console.error(`Invalid index in triangle ${i}: ${idx0}, ${idx1}, ${idx2} (max: ${vertexCount-1})`);
                    throw new Error(`Invalid vertex index in triangle ${i}`);
                }
                
                // Get vertices
                const v0x = vertices[idx0 * 3];
                const v0y = vertices[idx0 * 3 + 1];
                const v0z = vertices[idx0 * 3 + 2];
                
                const v1x = vertices[idx1 * 3];
                const v1y = vertices[idx1 * 3 + 1];
                const v1z = vertices[idx1 * 3 + 2];
                
                const v2x = vertices[idx2 * 3];
                const v2y = vertices[idx2 * 3 + 1];
                const v2z = vertices[idx2 * 3 + 2];
                
                // Calculate face normal
                const ux = v1x - v0x;
                const uy = v1y - v0y;
                const uz = v1z - v0z;
                
                const vx = v2x - v0x;
                const vy = v2y - v0y;
                const vz = v2z - v0z;
                
                let nx = uy * vz - uz * vy;
                let ny = uz * vx - ux * vz;
                let nz = ux * vy - uy * vx;
                
                // Normalize
                const length = Math.sqrt(nx * nx + ny * ny + nz * nz);
                if (length > 0) {
                    nx /= length;
                    ny /= length;
                    nz /= length;
                }
                
                // Write normal
                view.setFloat32(offset, nx, true); offset += 4;
                view.setFloat32(offset, ny, true); offset += 4;
                view.setFloat32(offset, nz, true); offset += 4;
                
                // Write vertices
                view.setFloat32(offset, v0x, true); offset += 4;
                view.setFloat32(offset, v0y, true); offset += 4;
                view.setFloat32(offset, v0z, true); offset += 4;
                
                view.setFloat32(offset, v1x, true); offset += 4;
                view.setFloat32(offset, v1y, true); offset += 4;
                view.setFloat32(offset, v1z, true); offset += 4;
                
                view.setFloat32(offset, v2x, true); offset += 4;
                view.setFloat32(offset, v2y, true); offset += 4;
                view.setFloat32(offset, v2z, true); offset += 4;
                
                // Attribute byte count
                view.setUint16(offset, 0, true); offset += 2;
            }
            
            // Create and trigger download
            const blob = new Blob([buffer], { type: 'application/octet-stream' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${meshName}_${Date.now()}.stl`;
            
            // Add to DOM and click
            document.body.appendChild(link);
            link.click();
            
            // Cleanup
            setTimeout(() => {
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
            }, 100);
            
            UIUtils.hideLoading();
            UIUtils.showNotification(`STL exported successfully! (${triangleCount} triangles)`, 'success');
            console.log('STL export completed successfully');
            
        } catch (error) {
            UIUtils.hideLoading();
            UIUtils.showNotification(`STL export error: ${error.message}`, 'error');
            console.error('STL export error:', error);
            console.error('Error stack:', error.stack);
        }
    }, 100);
    
    return true;
};

// Helper function to test mesh data
ExportManager.prototype.testMeshData = function(vertices, indices) {
    console.log('=== Testing Mesh Data ===');
    
    if (!vertices || !indices) {
        console.error('Missing vertices or indices');
        return false;
    }
    
    console.log(`Vertices: ${vertices.length} elements (${vertices.length / 3} vertices)`);
    console.log(`Indices: ${indices.length} elements (${indices.length / 3} triangles)`);
    
    if (vertices.length < 9) {
        console.error('Too few vertices for a triangle (need at least 9 values)');
        return false;
    }
    
    if (indices.length < 3) {
        console.error('Too few indices for a triangle (need at least 3)');
        return false;
    }
    
    // Check first triangle
    if (indices.length >= 3) {
        const idx0 = indices[0];
        const idx1 = indices[1];
        const idx2 = indices[2];
        
        console.log(`First triangle indices: ${idx0}, ${idx1}, ${idx2}`);
        
        if (idx0 * 3 + 2 < vertices.length) {
            console.log(`Vertex ${idx0}: [${vertices[idx0*3]}, ${vertices[idx0*3+1]}, ${vertices[idx0*3+2]}]`);
        } else {
            console.error(`Vertex index ${idx0} out of bounds`);
        }
    }
    
    return true;
};

// Expose globally
window.ExportManager = ExportManager;