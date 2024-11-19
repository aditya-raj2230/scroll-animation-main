import * as THREE from 'three';
import { OBJLoader } from 'jsm/loaders/OBJLoader.js';


// Scene and Camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(6, 2, 20);
camera.lookAt(0, 0, -6);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(new THREE.Color(0x447783), 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);
renderer.domElement.style.position = 'fixed'; // Make canvas fixed
renderer.domElement.style.top = '0';
renderer.domElement.style.left = '0';
renderer.domElement.style.zIndex = '1'; // Ensure canvas is below content

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
directionalLight.position.set(3, 8, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 2048;
directionalLight.shadow.mapSize.height = 2048;
scene.add(directionalLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 1.0);
fillLight.position.set(-5, 3, -5);
scene.add(fillLight);

// Variables
let mesh;

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

  const bagsGroup = new THREE.Group();

  // Create 4 coffee bags with larger scale and more spacing
  const bagRotations = [Math.PI*0.3, Math.PI*0.4, Math.PI*0.5, Math.PI*0.5]; // Array to control each bag's rotation

  for (let i = 0; i < 4; i++) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = -i * 6;
    // Set different scales for each bag
    if (i === 0) {
      mesh.scale.set(0.75, 0.75, 0.75);
      mesh.position.x = -3
    } else if (i === 1) {
      mesh.scale.set(0.88, 0.88, 0.88);
    } else if (i === 2) {
      mesh.scale.set(0.9, 0.9, 0.9);
    } else if (i === 3) {
      mesh.scale.set(0.90, 0.90, 0.90);
    }
    
    // Set rotation for each bag using the control array
    mesh.rotation.y = bagRotations[i];
    
    mesh.position.y = 2;
    mesh.position.z = -i * 12;
    
    // Adjust the x position to bring the first and second bags closer
   
    
    // Remove shadow for the second bag
    mesh.castShadow = i !== 1;
    mesh.receiveShadow = i !== 1;
    
    bagsGroup.add(mesh);
  }

  bagsGroup.rotation.y = Math.PI * 0.3;  // Reduced from 0.5 to 0.3 for less rotation
  bagsGroup.position.x = 15;  // Increased to shift the entire group further to the right
  
  scene.add(bagsGroup);

  // Add this new code to handle the content visibility
  const content = document.getElementById('content');
  if (content) {
    content.style.display = 'block'; // Show the content
    content.style.position = 'relative';
    content.style.marginTop = '100vh'; // Push content below the canvas
  }

  // Modify the render function to ensure continuous rendering
  function render() {
    requestAnimationFrame(render);
    renderer.render(scene, camera);
  }

  render();
}

// Resize handler
function handleWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener("resize", handleWindowResize, false);
