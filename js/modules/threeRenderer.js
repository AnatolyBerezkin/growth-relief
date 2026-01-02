// threeRenderer.js - Simple non-module version

function ThreeRenderer(containerId) {
    this.containerId = containerId;
    this.container = null;
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.reliefMesh = null;
    
    // Camera control
    this.radius = 800;
    this.theta = 90;
    this.phi = 90;
    this.target = new THREE.Vector3(0, 0, 0);
    
    // Mouse state
    this.isDragging = false;
    this.isRightButton = false;
    this.prevX = 0;
    this.prevY = 0;
    this.isOverCanvas = false;
    
    this.animationFrameId = null;
}

ThreeRenderer.prototype.initialize = function() {
    this.container = document.getElementById(this.containerId);
    if (!this.container) {
        console.error(`Container with id "${this.containerId}" not found`);
        return false;
    }
    
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    
    // Create scene
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xf0f0f0);
    
    // Create camera
    this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 10000);
    this.camera.position.set(0, -500, 500);
    this.camera.up.set(0, 0, 1);
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        canvas: document.getElementById('threeCanvas')
    });
    this.renderer.setSize(width, height);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    this.scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(300, -300, 500);
    this.scene.add(directionalLight);
    
    // Setup camera controls
    this.setupCameraControls();
    
    // Start animation
    this.startAnimation();
    
    // Handle resize
    window.addEventListener('resize', () => this.onWindowResize());
    
    console.log('ThreeRenderer initialized');
    return true;
};

ThreeRenderer.prototype.setupCameraControls = function() {
    const canvas = this.renderer.domElement;
    
    canvas.addEventListener('mousedown', (e) => {
        this.isDragging = true;
        this.isRightButton = (e.button === 2);
        this.prevX = e.clientX;
        this.prevY = e.clientY;
    });
    
    window.addEventListener('mouseup', () => {
        this.isDragging = false;
    });
    
    canvas.addEventListener('mousemove', (e) => {
        if (!this.isDragging) return;
        
        const dx = e.clientX - this.prevX;
        const dy = e.clientY - this.prevY;
        this.prevX = e.clientX;
        this.prevY = e.clientY;
        
        if (!this.isRightButton) {
            // Rotate
            this.theta -= dx * 0.5;
            this.phi += dy * 0.5;
            this.phi = Math.max(-89.9, Math.min(89.9, this.phi));
        } else {
            // Pan
            this.panCamera(dx, dy);
        }
        
        this.updateCamera();
    });
    
    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        this.radius += e.deltaY * 0.5;
        this.radius = Math.max(50, Math.min(5000, this.radius));
        this.updateCamera();
    }, { passive: false });
    
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    
    this.updateCamera();
};

ThreeRenderer.prototype.panCamera = function(dx, dy) {
    const panSpeed = 1;
    const forward = new THREE.Vector3();
    const right = new THREE.Vector3();
    const up = new THREE.Vector3(0, 0, 1);
    
    this.camera.getWorldDirection(forward);
    right.crossVectors(up, forward).normalize();
    
    const pan = new THREE.Vector3();
    right.multiplyScalar(-dx * panSpeed);
    up.multiplyScalar(-dy * panSpeed);
    
    pan.addVectors(right, up);
    this.target.add(pan);
};

ThreeRenderer.prototype.updateCamera = function() {
    const rPhi = THREE.MathUtils.degToRad(this.phi);
    const rTheta = THREE.MathUtils.degToRad(this.theta);
    
    this.camera.position.set(
        this.radius * Math.cos(rPhi) * Math.cos(rTheta) + this.target.x,
        this.radius * Math.cos(rPhi) * Math.sin(rTheta) + this.target.y,
        this.radius * Math.sin(rPhi) + this.target.z
    );
    
    this.camera.lookAt(this.target);
};

ThreeRenderer.prototype.createReliefMesh = function(vertices, indices, width, height, panelThickness, reliefHeight) {
    // Remove existing mesh
    if (this.reliefMesh) {
        this.scene.remove(this.reliefMesh);
        if (this.reliefMesh.geometry) this.reliefMesh.geometry.dispose();
        if (this.reliefMesh.material) this.reliefMesh.material.dispose();
    }
    
    // Create geometry
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    
    // Create material
    const material = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        metalness: 0.1,
        roughness: 0.8,
        side: THREE.DoubleSide
    });
    
    // Create mesh
    this.reliefMesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.reliefMesh);
    
    // Update camera
    this.target.set(0, 0, panelThickness + reliefHeight * 0.5);
    this.radius = Math.max(width, height) * 2;
    this.updateCamera();
};

ThreeRenderer.prototype.clearReliefMesh = function() {
    if (this.reliefMesh) {
        this.scene.remove(this.reliefMesh);
        if (this.reliefMesh.geometry) this.reliefMesh.geometry.dispose();
        if (this.reliefMesh.material) this.reliefMesh.material.dispose();
        this.reliefMesh = null;
    }
};

ThreeRenderer.prototype.startAnimation = function() {
    const animate = () => {
        this.animationFrameId = requestAnimationFrame(animate);
        this.renderer.render(this.scene, this.camera);
    };
    animate();
};

ThreeRenderer.prototype.onWindowResize = function() {
    if (!this.container || !this.camera || !this.renderer) return;
    
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;
    
    if (width === 0 || height === 0) return;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
};

// Expose globally
window.ThreeRenderer = ThreeRenderer;
