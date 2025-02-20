import * as THREE from 'three';

const cameraPositions = {
    P1: {
        name: 'P1',
        position: new THREE.Vector3(-6, 6, 6),
        rotation: new THREE.Vector3(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        material: new THREE.MeshBasicMaterial({ color: 0xffffff })
    },
    P2: {
        name: 'P2',
        position: new THREE.Vector3(-2, 6, 6),
        rotation: new THREE.Vector3(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        material: new THREE.MeshBasicMaterial({ color: 0xffffff })
    },
    P3: {
        name: 'P3',
        position: new THREE.Vector3(2, 6, 6),
        rotation: new THREE.Vector3(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        material: new THREE.MeshBasicMaterial({ color: 0xffffff })
    },
    P4: {
        name: 'P4',
        position: new THREE.Vector3(6, 6, 6),
        rotation: new THREE.Vector3(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        material: new THREE.MeshBasicMaterial({ color: 0xffffff })
    },
    P5: {
        name: 'P5',
        position: new THREE.Vector3(-6, 6, 0),
        rotation: new THREE.Vector3(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        material: new THREE.MeshBasicMaterial({ color: 0xffffff })
    },
    P6: {
        name: 'P6',
        position: new THREE.Vector3(6, 6, 0),
        rotation: new THREE.Vector3(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        material: new THREE.MeshBasicMaterial({ color: 0xffffff })
    },
    P7: {
        name: 'P7',
        position: new THREE.Vector3(-6, 6, -6),
        rotation: new THREE.Vector3(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        material: new THREE.MeshBasicMaterial({ color: 0xffffff })
    },
    P8: {
        name: 'P8',
        position: new THREE.Vector3(6, 6, -6),
        rotation: new THREE.Vector3(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        material: new THREE.MeshBasicMaterial({ color: 0xffffff })
    },
};

export default cameraPositions;