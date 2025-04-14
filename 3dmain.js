import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import cameraPositions from './cameraOrientation.js'; // Keep commented out
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import Hit from './modules/hit.js';

/**
 * Generates random path data for the Hit class.
 * @param {number} numPoints - The number of points in the path.
 * @param {number} maxX - The maximum X coordinate.
 * @param {number} maxY - The maximum Y coordinate.
 * @returns {Float32Array} - The path data as a flat Float32Array.
 */
// Removed generateRandomPath function

// Helper function to create text sprites
function makeTextSprite(message, parameters) {
    const fontface = parameters.fontface || 'Arial';
    const fontsize = parameters.fontsize || 18;
    const borderThickness = parameters.borderThickness || 4;
    const borderColor = parameters.borderColor || { r: 0, g: 0, b: 0, a: 1.0 };
    const backgroundColor = parameters.backgroundColor || { r: 255, g: 255, b: 255, a: 1.0 };
    const textColor = parameters.textColor || { r: 0, g: 0, b: 0, a: 1.0 };

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.font = "Bold " + fontsize + "px " + fontface;

    // get size data (height depends only on font size)
    const metrics = context.measureText(message);
    const textWidth = metrics.width;

    // background color
    context.fillStyle = `rgba(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b}, ${backgroundColor.a})`;
    // border color
    context.strokeStyle = `rgba(${borderColor.r}, ${borderColor.g}, ${borderColor.b}, ${borderColor.a})`;
    context.lineWidth = borderThickness;

    // Draw rounded rectangle
    const canvasWidth = textWidth + borderThickness * 2 + 20; // Add padding
    const canvasHeight = fontsize * 1.4 + borderThickness * 2; // Approx height + padding
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    context.font = "Bold " + fontsize + "px " + fontface; // Re-apply font after resizing

    // Re-draw background and border for the final canvas size
    context.fillStyle = `rgba(${backgroundColor.r}, ${backgroundColor.g}, ${backgroundColor.b}, ${backgroundColor.a})`;
    context.strokeStyle = `rgba(${borderColor.r}, ${borderColor.g}, ${borderColor.b}, ${borderColor.a})`;
    context.lineWidth = borderThickness;
    context.fillRect(borderThickness/2, borderThickness/2, canvasWidth - borderThickness, canvasHeight - borderThickness);
    context.strokeRect(borderThickness/2, borderThickness/2, canvasWidth - borderThickness, canvasHeight - borderThickness);

    // text color
    context.fillStyle = `rgba(${textColor.r}, ${textColor.g}, ${textColor.b}, 1.0)`;
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(message, canvasWidth / 2, canvasHeight / 2);

    // canvas contents will be used for a texture
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
    const sprite = new THREE.Sprite(spriteMaterial);

    // Scale sprite to reasonable size
    sprite.scale.set(canvasWidth * 0.05, canvasHeight * 0.05, 1.0);
    return sprite;
}

// Function to create coordinate grid with labels
function createCoordinateGrid(size = 500, divisions = 50, labelStep = 50, yOffset = 0.1) {
    const gridHelper = new THREE.GridHelper(size, divisions);
    gridHelper.position.y = yOffset; // Position slightly above ground
    scene.add(gridHelper);

    const labelsGroup = new THREE.Group();
    const halfSize = size / 2;
    const stepSize = size / divisions;

    const labelParameters = {
        fontsize: 24,
        borderColor: { r:0, g:0, b:0, a:1.0 }, // Black border
        backgroundColor: { r:200, g:200, b:200, a:0.7 } // Light grey background
    };

    for (let i = -halfSize; i <= halfSize; i += stepSize) {
        // Add labels only at major intervals defined by labelStep
        if (i % labelStep === 0) {
            // Labels along X axis (showing Z coordinate)
            if (i !== 0) { // Avoid label at origin if desired
                const xLabel = makeTextSprite(`Z: ${i}`, labelParameters);
                xLabel.position.set(halfSize + 5, yOffset, i); // Offset slightly outside grid
                labelsGroup.add(xLabel);
            }

            // Labels along Z axis (showing X coordinate)
            const zLabel = makeTextSprite(`X: ${i}`, labelParameters);
            zLabel.position.set(i, yOffset, -halfSize - 5); // Offset slightly outside grid
            labelsGroup.add(zLabel);
        }
    }
    scene.add(labelsGroup);
}

// Function to Create Hit from Points (Added)
function createHitFromPoints(pointsArray) {
    // Convert array of Vector3 to a flat Float32Array
    const pathData = new Float32Array(pointsArray.length * 3);
    for (let i = 0; i < pointsArray.length; i++) {
        pathData[i * 3] = pointsArray[i].x;
        pathData[i * 3 + 1] = pointsArray[i].y;
        pathData[i * 3 + 2] = pointsArray[i].z;
    }

    // Prepare data and options
    const hitData = { path: pathData };
    const hitOptions = {
        color: 0x00ffff,     // Cyan trail
        ballColor: 0xffffff, // White ball
        opacity: 0.9
    };

    // Create the Hit instance and store globally
    animatedHit = new Hit(hitData, hitOptions);
    animatedHit.name = "predefinedTrajectory";
    scene.add(animatedHit);
    console.log('Predefined Hit object created and added to scene.');
}

// Global variable for the animated hit object
let animatedHit = null;

// 1. Create Scene
const scene = new THREE.Scene();
//createCoordinateGrid(); // Add the grid and labels

// 2. Create Camera (Perspective Projection)
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    2000
);
camera.position.set(0, 7, -13);
camera.lookAt(0, 0, 0);
camera.updateProjectionMatrix();

// Add Lighting
// const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Soft white light, half intensity
const ambientLight = new THREE.AmbientLight(0xffffff, 2.0); // Increased intensity
scene.add(ambientLight);

// const directionalLight = new THREE.DirectionalLight(0xffffff, 1); // White light, full intensity
const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = false;
scene.add(directionalLight);

// Optional: Add a helper to visualize the directional light's position
// const directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 2);
// scene.add(directionalLightHelper);

// --- Physics-based Path Calculation ---
const launchAngleDegrees = 25;
// const initialSpeed = 114.08; // Old: Calculated for ~350 ft range (too large for model)
const initialSpeed = 75;     // New: Scaled down significantly to fit visual model size
const gravity = 32.2;     // Keep realistic gravity for shape, speed controls range
const initialY = 1.5;       // Initial height (scene units)

const launchAngleRad = launchAngleDegrees * Math.PI / 180;
const v0y = initialSpeed * Math.sin(launchAngleRad);
const v0z = initialSpeed * Math.cos(launchAngleRad);

// Time to peak height
const timeToPeak = v0y / gravity;

// Coordinates at peak
const yPeak = initialY + v0y * timeToPeak - 0.5 * gravity * timeToPeak * timeToPeak;
const zPeak = v0z * timeToPeak;

// Time to return to initial height (total flight time)
const timeTotal = 2 * timeToPeak;

// Z coordinate at landing
const zEnd = v0z * timeTotal;

// Calculate intermediate points for smoother curve definition
const zQuarter = zPeak / 2;
const zThreeQuarter = zPeak + (zEnd - zPeak) / 2;
const yQuarter = initialY + v0y * (timeToPeak / 2) - 0.5 * gravity * Math.pow(timeToPeak / 2, 2);
const yThreeQuarter = initialY + v0y * (timeToPeak * 1.5) - 0.5 * gravity * Math.pow(timeToPeak * 1.5, 2);

console.log(`Calculated Path: Start(0, ${initialY}, 0), Peak(0, ${yPeak.toFixed(2)}, ${zPeak.toFixed(2)}), End(0, ${initialY}, ${zEnd.toFixed(2)})`);

// Create the predefined path using calculated points
const predefinedPathPoints = [
    new THREE.Vector3(0, initialY, 0),      // Start point
    new THREE.Vector3(0, yQuarter, zQuarter), // Added intermediate point 1
    new THREE.Vector3(0, yPeak, zPeak),    // Calculated peak
    new THREE.Vector3(0, yThreeQuarter, zThreeQuarter), // Added intermediate point 2
    new THREE.Vector3(0, initialY, zEnd)    // Calculated end point
];

// Create the Hit object from the predefined path
createHitFromPoints(predefinedPathPoints);

const loader = new GLTFLoader();
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.6/');
loader.setDRACOLoader(dracoLoader);

loader.load(
    'Stadium_DET.glb',
    function(gltf) {
        console.log('Model loaded successfully:', gltf);

        const colliderNode = gltf.scene.getObjectByName('CameraCollider');
        if (colliderNode) {
            colliderNode.visible = false;
        }

        scene.add(gltf.scene);
        gltf.scene.position.set(0, 0, 0);
        gltf.scene.scale.set(1, 1, 1);
        gltf.scene.rotation.y = Math.PI; // Rotate 180 degrees around Y-axis

        const boundingBox = new THREE.Box3().setFromObject(gltf.scene);
        const size = new THREE.Vector3();
        boundingBox.getSize(size);
        console.log('Stadium Model Dimensions:');
        console.log(`  Min Point: (${boundingBox.min.x.toFixed(2)}, ${boundingBox.min.y.toFixed(2)}, ${boundingBox.min.z.toFixed(2)})`);
        console.log(`  Max Point: (${boundingBox.max.x.toFixed(2)}, ${boundingBox.max.y.toFixed(2)}, ${boundingBox.max.z.toFixed(2)})`);
        console.log(`  Size (X, Y, Z): (${size.x.toFixed(2)}, ${size.y.toFixed(2)}, ${size.z.toFixed(2)})`);
        // ---

        // Add after loading the model
        const axesHelper = new THREE.AxesHelper(5);
        scene.add(axesHelper);
    },
    function (progress) {
        console.log('Loading progress: ', (progress.loaded / progress.total * 100) + '%');
    },
    function (error) {
        console.error('Error loading model:', error);
        console.error('Error details:', error.message);
    }
);

// Removed random path generation and associated Hit creation

// 3. Create WebGL Renderer
const renderer = new THREE.WebGLRenderer({
    antialias: true,
    //logarithmicDepthBuffer: true // Keep this disabled for now
});

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

// 4. Create Grid Helper (commented out, as createCoordinateGrid adds one)
// const gridHelper = new THREE.GridHelper(size, divisions);
// scene.add(gridHelper);

// Removed camera position cubes code

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
const clock = new THREE.Clock();
let hitAnimationProgress = 0;
const animationDuration = 15; // Increased duration for smoother animation

// 6. Animation Loop
function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();

    // Calculate progress (loops the animation)
    hitAnimationProgress = (elapsedTime / animationDuration) % 1;

    // --- Animate the Hit (if it exists) ---
    if (animatedHit) { // Check if the predefined hit exists
         // Ensure progress doesn't quite reach 1
         const progress = Math.min(hitAnimationProgress, 0.999);
         animatedHit.show(0, progress); // Use animatedHit
    }
    // --- End Hit Animation ---
    
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