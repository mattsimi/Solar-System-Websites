// ============================================
// SCENE SETUP
// ============================================

// Create the scene (container for all 3D objects)
const scene = new THREE.Scene();

// Create camera (how we view the scene)
const camera = new THREE.PerspectiveCamera(
    75, // Field of view
    window.innerWidth / window.innerHeight, // Aspect ratio
    0.1, // Near clipping plane
    1000 // Far clipping plane
);
camera.position.set(0, 50, 100); // Position camera above and away from center
camera.lookAt(0, 0, 0); // Look at the center (where the Sun will be)

// Create renderer (draws the scene)
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// ============================================
// STARFIELD BACKGROUND
// ============================================

// Create stars in the background
const starGeometry = new THREE.BufferGeometry();
const starVertices = [];

// Generate 10,000 random star positions
for (let i = 0; i < 10000; i++) {
    const x = (Math.random() - 0.5) * 2000;
    const y = (Math.random() - 0.5) * 2000;
    const z = (Math.random() - 0.5) * 2000;
    starVertices.push(x, y, z);
}

starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

// Create star material (white glowing points)
const starMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.7,
    transparent: true,
    opacity: 0.8
});

// Add stars to scene
const stars = new THREE.Points(starGeometry, starMaterial);
scene.add(stars);

// ============================================
// LIGHTING
// ============================================

// Add ambient light (soft light everywhere)
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

// Add point light at Sun position (bright light from center)
const sunLight = new THREE.PointLight(0xffffff, 2, 300);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);

// ============================================
// CREATE SUN
// ============================================

const sunGeometry = new THREE.SphereGeometry(5, 32, 32);
const sunMaterial = new THREE.MeshBasicMaterial({
    color: 0xfdb813,
    emissive: 0xfdb813,
    emissiveIntensity: 1
});
const sun = new THREE.Mesh(sunGeometry, sunMaterial);
sun.userData = { name: 'Sun', info: 'The center of our solar system' };
scene.add(sun);

// ============================================
// PLANET DATA
// ============================================

// Define planets with their properties (size, color, orbit distance, orbit speed)
const planetsData = [
    { name: 'Mercury', size: 0.8, color: 0x8c7853, distance: 15, speed: 0.0013, info: 'Closest planet to the Sun' },
    { name: 'Venus', size: 1.2, color: 0xffc649, distance: 22, speed: 0.001, info: 'Hottest planet in our solar system' },
    { name: 'Earth', size: 1.3, color: 0x4169e1, distance: 30, speed: 0.00067, info: 'Our home planet' },
    { name: 'Mars', size: 1, color: 0xcd5c5c, distance: 38, speed: 0.0006, info: 'The Red Planet' },
    { name: 'Jupiter', size: 3, color: 0xdaa520, distance: 52, speed: 0.00033, info: 'Largest planet in our solar system' },
    { name: 'Saturn', size: 2.5, color: 0xf4a460, distance: 68, speed: 0.00027, info: 'Famous for its rings' },
    { name: 'Uranus', size: 2, color: 0x4fd0e0, distance: 82, speed: 0.0002, info: 'Ice giant rotating on its side' },
    { name: 'Neptune', size: 2, color: 0x4169e1, distance: 95, speed: 0.00017, info: 'Farthest planet from the Sun' }
];

// ============================================
// CREATE PLANETS
// ============================================

const planets = [];
const textureLoader = new THREE.TextureLoader();

// Planet texture paths
const planetTextures = {
    'Mercury': '../static/textures/2k_mercury.jpg',
    'Venus': '../static/textures/2k_venus_surface.jpg',
    'Earth': '../static/textures/2k_earth_daymap.jpg',
    'Mars': '../static/textures/2k_mars.jpg',
    'Jupiter': '../static/textures/2k_jupiter.jpg',
    'Saturn': '../static/textures/2k_saturn.jpg',
    'Uranus': '../static/textures/2k_uranus.jpg',
    'Neptune': '../static/textures/2k_neptune.jpg'
};

planetsData.forEach(data => {
    // Create planet sphere
    const geometry = new THREE.SphereGeometry(data.size, 32, 32);

    // Load texture for this planet
    const texture = textureLoader.load(planetTextures[data.name]);
    const material = new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 0.7,
        metalness: 0.1
    });
    const planet = new THREE.Mesh(geometry, material);

    // Store planet data for later use
    planet.userData = {
        name: data.name,
        size: data.size,
        distance: data.distance,
        speed: data.speed,
        angle: Math.random() * Math.PI * 2, // Random starting position
        info: data.info
    };

    // Position planet at starting angle
    planet.position.x = Math.cos(planet.userData.angle) * data.distance;
    planet.position.z = Math.sin(planet.userData.angle) * data.distance;

    // Add ring to Saturn
    if (data.name === 'Saturn') {
        // Load Saturn ring texture
        const ringTexture = textureLoader.load('../static/textures/2k_saturn_ring_alpha.png');

        // Make rings bigger and more visible
        const ringGeometry = new THREE.RingGeometry(data.size * 1.5, data.size * 3, 64);
        const ringMaterial = new THREE.MeshBasicMaterial({
            map: ringTexture,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.8
        });
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);

        // Tilt the ring for a more realistic look
        ring.rotation.x = Math.PI / 2.5;
        ring.rotation.y = Math.PI / 6;

        // Add ring as a child of Saturn so it moves with the planet
        planet.add(ring);
        planet.userData.ring = ring;
    }

    scene.add(planet);
    planets.push(planet);

    // Create orbit line (circle showing planet's path)
    const orbitGeometry = new THREE.BufferGeometry();
    const orbitPoints = [];
    for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2;
        orbitPoints.push(
            Math.cos(angle) * data.distance,
            0,
            Math.sin(angle) * data.distance
        );
    }
    orbitGeometry.setAttribute('position', new THREE.Float32BufferAttribute(orbitPoints, 3));

    const orbitMaterial = new THREE.LineBasicMaterial({
        color: 0x444444,
        transparent: true,
        opacity: 0.3
    });
    const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    scene.add(orbitLine);
});

// ============================================
// MOUSE CONTROLS
// ============================================

let mouseDown = false;
let mouseX = 0;
let mouseY = 0;

// Track mouse down
renderer.domElement.addEventListener('mousedown', (e) => {
    if (isAnimating) return;
    mouseDown = true;
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Track mouse up
renderer.domElement.addEventListener('mouseup', () => {
    mouseDown = false;
});

// Rotate camera when mouse is dragged
renderer.domElement.addEventListener('mousemove', (e) => {
    if (isAnimating) return;
    if (mouseDown) {
        const deltaX = e.clientX - mouseX;
        const deltaY = e.clientY - mouseY;

        // Rotate camera around the scene
        const rotationSpeed = 0.005;
        camera.position.x += deltaX * rotationSpeed * 2;
        camera.position.y -= deltaY * rotationSpeed * 2;
        camera.lookAt(0, 0, 0);

        mouseX = e.clientX;
        mouseY = e.clientY;
    }
});

// Zoom in/out with mouse wheel
renderer.domElement.addEventListener('wheel', (e) => {
    if (isAnimating) return;
    e.preventDefault();
    const zoomSpeed = 0.1;
    const direction = e.deltaY > 0 ? 1 : -1;

    // Move camera closer or further from center
    const distance = Math.sqrt(
        camera.position.x ** 2 +
        camera.position.y ** 2 +
        camera.position.z ** 2
    );

    const newDistance = distance + direction * zoomSpeed * 10;
    if (newDistance > 20 && newDistance < 200) {
        const ratio = newDistance / distance;
        camera.position.multiplyScalar(ratio);
    }
});

// ============================================
// CLICK DETECTION & ZOOM ANIMATION
// ============================================

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Animation state
let isAnimating = false;
let animationProgress = 0;
let targetPlanet = null;
let startCameraPosition = new THREE.Vector3();
let targetCameraPosition = new THREE.Vector3();

renderer.domElement.addEventListener('click', (e) => {
    // Don't allow clicks during animation
    if (isAnimating) return;

    // Convert mouse position to normalized device coordinates
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    // Cast ray from camera through mouse position
    raycaster.setFromCamera(mouse, camera);

    // Check if ray intersects with any planets (not the sun)
    const intersects = raycaster.intersectObjects(planets);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        const data = clickedObject.userData;

        // Start zoom animation
        isAnimating = true;
        animationProgress = 0;
        targetPlanet = clickedObject;

        // Save starting camera position
        startCameraPosition.copy(camera.position);

        // Calculate target position (close to the planet)
        const direction = new THREE.Vector3();
        direction.subVectors(clickedObject.position, camera.position).normalize();
        targetCameraPosition.copy(clickedObject.position).sub(direction.multiplyScalar(data.size * 5));
    }
});

// ============================================
// ANIMATION LOOP
// ============================================

function animate() {
    requestAnimationFrame(animate);

    // Handle zoom animation
    if (isAnimating) {
        // Increment animation progress (2 seconds zoom + 0.5 second pause = 150 frames at 60fps)
        animationProgress += 1 / 150;

        if (animationProgress >= 1) {
            // Animation complete - redirect to planet page after brief pause
            const planetName = targetPlanet.userData.name.toLowerCase();
            window.location.href = `earth.html`;
        } else {
            // Zoom phase is 80% of total time (first 2 seconds)
            const zoomPhase = Math.min(animationProgress / 0.8, 1);

            // Smooth easing function (ease-in-out)
            const easeProgress = zoomPhase < 0.5
                ? 2 * zoomPhase * zoomPhase
                : 1 - Math.pow(-2 * zoomPhase + 2, 2) / 2;

            // Interpolate camera position
            camera.position.lerpVectors(startCameraPosition, targetCameraPosition, easeProgress);
            camera.lookAt(targetPlanet.position);

            // Hold position for last 20% (0.5 second pause at closest point)
        }
    } else {
        // Normal animation when not zooming
        // Rotate the Sun
        sun.rotation.y += 0.001;

        // Update each planet's position along its orbit
        planets.forEach(planet => {
            // Increment angle based on planet's speed
            planet.userData.angle += planet.userData.speed;

            // Calculate new position using orbit radius and angle
            planet.position.x = Math.cos(planet.userData.angle) * planet.userData.distance;
            planet.position.z = Math.sin(planet.userData.angle) * planet.userData.distance;

            // Rotate planet on its axis (very subtle rotation)
            planet.rotation.y += 0.000003;
        });

        // Slowly rotate stars for visual effect
        stars.rotation.y += 0.0001;
    }

    // Render the scene
    renderer.render(scene, camera);
}

// Start animation
animate();

// ============================================
// HANDLE WINDOW RESIZE
// ============================================

window.addEventListener('resize', () => {
    // Update camera aspect ratio
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    // Update renderer size
    renderer.setSize(window.innerWidth, window.innerHeight);
});
