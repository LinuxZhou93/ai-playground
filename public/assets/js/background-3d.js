/**
 * 3D Particle Background Effect using Three.js
 * Creates a connected particle network with mouse interaction
 */

window.init3DScene = function () {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) {
        console.warn('Three.js Background: Canvas #bg-canvas not found');
        return;
    }

    // Ensure Three.js is loaded
    if (typeof THREE === 'undefined') {
        console.error('Three.js not loaded');
        return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 100; // Adjustable density
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        posArray[i] = (Math.random() - 0.5) * 20; // Spread
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Material
    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.05,
        color: 0x6366f1, // Indigo-500
        transparent: true,
        opacity: 0.8,
    });

    // Mesh
    const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particlesMesh);

    // Lines connecting particles (optional, computationally expensive for many particles, simplified here)
    // For better performance, we'll stick to points or use a custom shader for lines. 
    // Let's keep it simple and elegant with floating particles for now to match the "Space" theme.
    // If we want lines, we'd need a Loop to check distances.

    // Better Visuals: Add some floating blobs or gradient sprites if needed.
    // For now, let's just make the particles move nicely.

    camera.position.z = 5;

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;

    // Target position for smoothing
    let targetX = 0;
    let targetY = 0;

    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX - windowHalfX);
        mouseY = (event.clientY - windowHalfY);
    });

    // Animate
    const animate = () => {
        requestAnimationFrame(animate);

        targetX = mouseX * 0.001;
        targetY = mouseY * 0.001;

        particlesMesh.rotation.y += 0.001;
        particlesMesh.rotation.x += 0.001;

        // Smooth camera follow
        particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);
        particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);

        renderer.render(scene, camera);
    };

    animate();

    // Resize handle
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    console.log("3D Scene Initialized");
};
