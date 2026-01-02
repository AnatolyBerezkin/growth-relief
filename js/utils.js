// utils.js - Simple non-module version

// Make utilities available globally
window.GrowthUtils = {
    wrapX: function(x, w) {
        if (x < 0) return x + w;
        if (x >= w) return x - w;
        return x;
    },
    
    wrapY: function(y, h) {
        if (y < 0) return y + h;
        if (y >= h) return y - h;
        return y;
    },
    
    dist: function(ax, ay, bx, by, w, h) {
        let dx = ax - bx;
        if (dx > w / 2) dx -= w;
        if (dx < -w / 2) dx += w;

        let dy = ay - by;
        if (dy > h / 2) dy -= h;
        if (dy < -h / 2) dy += h;

        return Math.sqrt(dx * dx + dy * dy);
    },
    
    clamp: function(value, min, max) {
        return Math.min(Math.max(value, min), max);
    },
    
    loadImageFile: function(file) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = URL.createObjectURL(file);
        });
    }
};