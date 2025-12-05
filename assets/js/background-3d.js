function init3DScene() {
    const canvas = document.getElementById('bg-canvas');
    if (!canvas) return;

    if (typeof THREE === 'undefined') {
        console.warn('THREE.js not loaded');
        return;
    }

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    camera.position.z = 50;

    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 1500;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const colorPalette = [
        new THREE.Color(0x8B5CF6), new THREE.Color(0x06B6D4),
        new THREE.Color(0xEC4899), new THREE.Color(0xF59E0B),
    ];

    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 200;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
        const color = colorPalette[Math.floor(Math.random() * colorPalette.length)];
        colors[i * 3] = color.r; colors[i * 3 + 1] = color.g; colors[i * 3 + 2] = color.b;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const particles = new THREE.Points(particlesGeometry, new THREE.PointsMaterial({
        size: 0.8, vertexColors: true, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending
    }));
    scene.add(particles);

    let mouseX = 0, mouseY = 0;
    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    function animate() {
        requestAnimationFrame(animate);
        particles.rotation.y += 0.0005;
        particles.rotation.x += 0.0002;
        camera.position.x += (mouseX * 5 - camera.position.x) * 0.05;
        camera.position.y += (mouseY * 5 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);
        renderer.render(scene, camera);
    }
    animate();
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

// Auto-initialize if canvas schema is ready
if (document.getElementById('bg-canvas')) {
    // Wait for window load to ensure THREE is loaded if it's a script tag
    if (document.readyState === 'complete') {
        init3DScene();
    } else {
        window.addEventListener('load', init3DScene);
    }
}
