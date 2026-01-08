// ============================================
// 3D SATURN RENDER
// ============================================

// Get container
const container = document.getElementById('planet-3d-container');

// Create the scene
const scene = new THREE.Scene();

// Create camera
const camera = new THREE.PerspectiveCamera(
    75,
    container.offsetWidth / container.offsetHeight,
    0.1,
    1000
);
camera.position.z = 4; // Move camera back a bit to see the rings

// Create renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
});
renderer.setSize(container.offsetWidth, container.offsetHeight, false);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.domElement.style.display = 'block';
container.appendChild(renderer.domElement);

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(5, 5, 5);
scene.add(pointLight);

// Create Saturn planet with texture
const geometry = new THREE.SphereGeometry(1, 64, 64);
const textureLoader = new THREE.TextureLoader();
const saturnTexture = textureLoader.load('../static/textures/2k_saturn.jpg');

const material = new THREE.MeshStandardMaterial({
    map: saturnTexture,
    roughness: 0.7,
    metalness: 0.1
});
const saturn = new THREE.Mesh(geometry, material);
scene.add(saturn);

// Create Saturn's rings
const ringTexture = textureLoader.load('../static/textures/2k_saturn_ring_alpha.png');
const ringGeometry = new THREE.RingGeometry(1.5, 2.5, 64);
const ringMaterial = new THREE.MeshBasicMaterial({
    map: ringTexture,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8
});
const ring = new THREE.Mesh(ringGeometry, ringMaterial);

// Tilt the rings
ring.rotation.x = Math.PI / 2.5;

// Add rings as child of Saturn
saturn.add(ring);

// Add starfield background
const starGeometry = new THREE.BufferGeometry();
const starVertices = [];

for (let i = 0; i < 3000; i++) {
    const x = (Math.random() - 0.5) * 100;
    const y = (Math.random() - 0.5) * 100;
    const z = (Math.random() - 0.5) * 100;
    starVertices.push(x, y, z);
}

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.1,
    transparent: true,
    opacity: 0.8
});

const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate Saturn slowly (rings rotate with it as child)
    saturn.rotation.y += 0.002;

    // Rotate stars very slowly
    stars.rotation.y += 0.0001;

    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});
