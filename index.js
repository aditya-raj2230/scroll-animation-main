import * as THREE from "three";
import { OBJLoader } from "jsm/loaders/OBJLoader.js";
import { OrbitControls } from "jsm/controls/OrbitControls.js";

const w = window.innerWidth / 2;
const h = window.innerHeight;

// Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.set(0, 1, 10); // Slightly adjusted for better perspective

// Renderer
const canvas = document.getElementById("three-canvas");
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
renderer.setSize(w, h);
renderer.setClearColor(new THREE.Color(0x447783), 1); // Changed to muted blue-green
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Softer ambient light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.7); // Key light
directionalLight.position.set(5, 10, 7);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048; // Higher resolution shadows
directionalLight.shadow.mapSize.height = 2048;
directionalLight.intensity = 1.5; // Increased light intensity
scene.add(directionalLight);

// Add a background texture
const loader = new THREE.TextureLoader();
loader.load("./assets/The Answer Logo.png", (texture) => {
  scene.background = texture; // Set the scene's background to the image
});

// Variables
let mesh; // To store the 3D model reference

// Load and initialize the 3D model
const manager = new THREE.LoadingManager();
const objLoader = new OBJLoader(manager);
let sceneData = {};

manager.onLoad = () => initScene(sceneData);

objLoader.load("./assets/Coffee OBJ.obj", (obj) => {
  let geometry;
  obj.traverse((child) => {
    if (child.isMesh) {
      geometry = child.geometry;
    }
  });
  sceneData.geo = geometry;
});

// Initialize the scene with the loaded geometry
function initScene({ geo }) {
  const geometry = geo;
  geometry.center();

  const texLoader = new THREE.TextureLoader();
  const material = new THREE.MeshStandardMaterial({
    map: texLoader.load("./assets/Pack2.png"),
    side: THREE.DoubleSide,
    metalness: 0,
    roughness: 0.1,
  });

  mesh = new THREE.Mesh(geometry, material);
  mesh.scale.set(0.35, 0.35, 0.35);
  mesh.rotation.y = Math.PI / 2;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);

  // Adjust lighting
  directionalLight.intensity = 2.5;
  directionalLight.position.set(3, 8, 5);
  ambientLight.intensity = 1.2;

  // Brighter fill light
  const fillLight = new THREE.DirectionalLight(0xffffff, 1.0);
  fillLight.position.set(-5, 3, -5);
  scene.add(fillLight);

  // Add controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableZoom = false;
  controls.enablePan = false;
  controls.minPolarAngle = Math.PI / 2;
  controls.maxPolarAngle = Math.PI / 2;
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.rotateSpeed = 1.5;

  // Add stars to the scene
  function addStars() {
    const geometry = new THREE.BufferGeometry();
    const starCount = 1000;
    const positions = new Float32Array(starCount * 3);
    
    for(let i = 0; i < starCount * 3; i += 3) {
        positions[i] = (Math.random() - 0.5) * 100;      // x
        positions[i + 1] = (Math.random() - 0.5) * 100;  // y
        positions[i + 2] = (Math.random() - 0.5) * 50;   // z
    }
    
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const material = new THREE.PointsMaterial({
        color: 0xFFFFFF,
        size: 0.05,
        transparent: true,
        opacity: 0.8,
    });
    
    const stars = new THREE.Points(geometry, material);
    scene.add(stars);
    return stars;
  }

  const stars = addStars();

  // Animate function
  function animate() {
    requestAnimationFrame(animate);

    // Interactive rotation for coffee model
    if (mesh) {
      mesh.rotation.y += 0.005;
    }

    // Make stars twinkle
    if (stars.material) {
      stars.material.opacity = 0.6 + Math.sin(Date.now() * 0.001) * 0.2;
    }

    controls.update();
    renderer.render(scene, camera);
  }

  animate();
}

// Resize handler
function handleWindowResize() {
  camera.aspect = (window.innerWidth / 2) / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth / 2, window.innerHeight);
}

window.addEventListener("resize", handleWindowResize, false);
