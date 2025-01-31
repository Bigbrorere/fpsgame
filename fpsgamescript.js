// Basic Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Lighting
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7.5);
scene.add(light);

// Player Controls
const controls = new THREE.PointerLockControls(camera, document.body);
document.getElementById('instructions').addEventListener('click', () => {
  controls.lock();
});
controls.addEventListener('lock', () => {
  document.getElementById('instructions').classList.add('hidden');
});
controls.addEventListener('unlock', () => {
  document.getElementById('instructions').classList.remove('hidden');
});

// Floor
const floorGeometry = new THREE.PlaneGeometry(200, 200);
const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Walls and Obstacles
const createBox = (x, y, z, width, height, depth, color) => {
  const geometry = new THREE.BoxGeometry(width, height, depth);
  const material = new THREE.MeshStandardMaterial({ color });
  const box = new THREE.Mesh(geometry, material);
  box.position.set(x, y, z);
  scene.add(box);
  return box;
};

const obstacles = [
  createBox(0, 1, -10, 5, 2, 1, 0xff0000), // Small obstacle
  createBox(10, 2, -20, 10, 2, 2, 0x00ff00), // Larger wall
  createBox(-15, 3, -30, 15, 2, 1, 0x0000ff), // Parkour platform
];

// Player Movement Variables
const velocity = new THREE.Vector3();
const direction = new THREE.Vector3();
const keys = { w: false, a: false, s: false, d: false, shift: false, c: false, space: false };

// Mantling Variables
let isMantling = false;

// Ammo and Shooting Variables
let ammo = 30;
let reserveAmmo = 90;
let canShoot = true;
let ads = false;

document.addEventListener('keydown', (e) => {
  keys[e.key.toLowerCase()] = true;
});
document.addEventListener('keyup', (e) => {
  keys[e.key.toLowerCase()] = false;
});

// HUD Update
const ammoDisplay = document.getElementById('ammo');
function updateHUD() {
  ammoDisplay.textContent = `Ammo: ${ammo} / ${reserveAmmo}`;
}

// Shooting
window.addEventListener('mousedown', (e) => {
  if (e.button === 0 && canShoot && ammo > 0) {
    ammo--;
    updateHUD();
    // Simulate shooting logic (like raycasting to detect hits)
  }
});

// ADS (Aim Down Sights)
window.addEventListener('mousedown', (e) => {
  if (e.button === 2) {
    ads = true;
    document.getElementById('crosshair').classList.add('hidden');
    camera.fov = 50;
    camera.updateProjectionMatrix();
  }
});

window.addEventListener('mouseup', (e) => {
  if (e.button === 2) {
    ads = false;
    document.getElementById('crosshair').classList.remove('hidden');
    camera.fov = 75;
    camera.updateProjectionMatrix();
  }
});

// Sliding
function slide() {
  if (keys.shift && keys.c) {
    velocity.x *= 1.5;
    velocity.z *= 1.5;
  }
}

// Mantling
function mantle() {
  if (isMantling) return;
  const raycaster = new THREE.Raycaster(camera.position, new THREE.Vector3(0, -1, 0));
  const intersects = raycaster.intersectObjects(obstacles);
  if (intersects.length > 0 && intersects[0].distance < 1.5) {
    isMantling = true;
    velocity.y = 5; // Boost up
    setTimeout(() => (isMantling = false), 300); // Mantle duration
  }
}

// Animate Function
function animate() {
  requestAnimationFrame(animate);

  // Movement Logic
  direction.set(0, 0, 0);
  if (keys.w) direction.z -= 1;
  if (keys.s) direction.z += 1;
  if (keys.a) direction.x -= 1;
  if (keys.d) direction.x += 1;

  direction.normalize();
  velocity.x -= velocity.x * 10.0 * 0.1;
  velocity.z -= velocity.z * 10.0 * 0.1;
  velocity.x += direction.x * 0.1;
  velocity.z += direction.z * 0.1;

  slide(); // Call slide
  mantle(); // Call mantle
  controls.moveRight(-velocity.x);
  controls.moveForward(-velocity.z);

  renderer.render(scene, camera);
}

animate();
updateHUD();
