import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import cameraPositions from './cameraOrientation.js';

// 1. Create Scene
const scene = new THREE.Scene();

// 2. Create Camera (Perspective Projection)
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 7, -13);  // Zoomed in by moving camera closer to origin
camera.lookAt(0, 0, 0);

// 3. Create WebGL Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// 4. Create Grid Helper
const size = 20;
const divisions = 20;
const gridHelper = new THREE.GridHelper(size, divisions);
scene.add(gridHelper);

// Add camera position cubes
const cubes = [];

Object.values(cameraPositions).forEach(camPos => {
    const geometry = new THREE.BoxGeometry();

    const cube = new THREE.Mesh(geometry, camPos.material);
    cube.position.copy(camPos.position);
    cube.scale.copy(camPos.scale);
    cube.rotation.copy(camPos.rotation);
    
    scene.add(cube);
    cubes.push(cube);
});

// 5. Add Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);

// Add raycaster for mouse interaction
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// // Add mouse move event listener
// window.addEventListener('mousemove', (event) => {
//     // Calculate mouse position in normalized device coordinates
//     mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
//     mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

//     // Update the raycaster
//     raycaster.setFromCamera(mouse, camera);

//     // Check for intersections with cubes
//     const intersects = raycaster.intersectObjects(cubes);

//     // Hide all info panels first
//     cubes.forEach(cube => {
//         if (cube.userData.infoPanel) {
//             cube.userData.infoPanel.visible = false;
//         }
//     });

//     // Show info panel for intersected cube
//     if (intersects.length > 0) {
//         const cube = intersects[0].object;
//         if (cube.userData.infoPanel) {
//             cube.userData.infoPanel.visible = true;
//         }
//     }
// });

// 6. Animation Loop
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// 7. Handle Resizing
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// 8. Start Animation
animate(); 