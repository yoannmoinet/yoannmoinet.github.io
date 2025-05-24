// src/app.js

import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
// OrbitControls is not used in the final scroll version
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

let scene, camera, renderer, cssRenderer;
let cubeGroup;
const faceObjects = []; // Stores CSS3DObject faces

const CUBE_SIDE_LENGTH = 400;
const faceElementWidth = CUBE_SIDE_LENGTH;
const faceElementHeight = CUBE_SIDE_LENGTH;

// Scroll and animation state
let rotationalStateIndex = 0; // 0: Front, 1: Bottom, 2: Back, 3: Top view state
const numFacesForScroll = 4; // Number of states in X-axis rotation
let isAnimating = false;
const animationDuration = 1000; // ms
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Maps rotationalStateIndex (0-3 for X-axis states) to the actual index in faceObjects
// This order determines which face is considered "front" at each rotational state.
// State 0 (0 deg X): Front face (faceObjects[0])
// State 1 (-90 deg X): Bottom face (faceObjects[5])
// State 2 (-180 deg X): Back face (faceObjects[1])
// State 3 (-270 deg X or +90 deg X): Top face (faceObjects[4])
const rotationalStateToFaceObjectIndex = [0, 5, 1, 4];

const facesContent = [
    { title: 'Intro/Bio', html: `<h1>👋 Bon matin!</h1><h2>I'm Yoann Moinet.</h2><p>I'm a JavaScript and NodeJS developer. Currently, I'm working at <a href='https://datadoghq.com' target='_blank' rel='noopener noreferrer'>Datadog</a> in the FrontEnd Platform team I created, as a Staff Software Engineer.</p>` },
    { title: 'Back Face Content (Experience)', html: `<h2>Previously:</h2><ul><li><a href='https://zendesk.com' target='_blank' rel='noopener noreferrer'>Zendesk</a>...</li><li><a href='https://autodesk.com' target='_blank' rel='noopener noreferrer'>Autodesk</a>...</li><li><a href='http://www.cossette.com/en' target='_blank' rel='noopener noreferrer'>Cossette</a>...</li></ul><p>This is the back.</p>` },
    { title: 'Right Face Content (Projects)', html: `<h2>I've made:</h2><ul><li><a href='https://isitbig.org' target='_blank' rel='noopener noreferrer'>IsItBig.org</a></li><li><a href='https://zwout.fr' target='_blank' rel='noopener noreferrer'>Zwout</a></li><li><a href='https://getfenet.re' target='_blank' rel='noopener noreferrer'>Fenêtre</a></li><li><a href='https://github.com/yoannmoinet/nipplejs' target='_blank' rel='noopener noreferrer'>NippleJS</a></li><li><a href='https://github.com/damonjs/damon' target='_blank' rel='noopener noreferrer'>DamonJS</a></li></ul>` },
    { title: 'Left Face Content (Writings)', html: `<h2>I've written:</h2><ul><li><strong>Electron on the AppStore :</strong><ol><li><a href='https://dev.to/yoannmoinet/electron-on-the-app-store-early-stages-27i0' target='_blank' rel='noopener noreferrer'>Early stage</a></li><li>...</li></ol></li><li>...</li></ul>` },
    { title: 'Top Face Content (Social)', html: `<h2>You can find me on:</h2><ul><li><a href='https://github.com/yoannmoinet' target='_blank' rel='noopener noreferrer'>GitHub</a></li><li><a href='https://twitter.com/yoannm' target='_blank' rel='noopener noreferrer'>Twitter</a></li><li><a href='https://www.linkedin.com/in/yoannmoinet/' target='_blank' rel='noopener noreferrer'>LinkedIn</a></li></ul>` },
    { title: 'Bottom Face Content (Contact)', html: `<h2>Get in touch 📞</h2><p>You can contact me via <a href='https://forms.gle/E5JLobBKMZmLeh4HA' target='_blank' rel='noopener noreferrer'>this form</a>.</p><p><a href='./assets/resume.pdf' target='_blank' rel='noopener noreferrer'>My Resume</a></p>` }
];

function createFaceElement(faceContentItem) {
    const element = document.createElement('div');
    element.className = 'cube-face';
    element.style.width = faceElementWidth + 'px';
    element.style.height = faceElementHeight + 'px';
    element.innerHTML = faceContentItem.html;
    return element;
}

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1d22);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 0, CUBE_SIDE_LENGTH * 1.5); // Adjusted Z for visibility
    camera.lookAt(0, 0, 0);

    cssRenderer = new CSS3DRenderer();
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.top = 0;
    document.getElementById('three-container').appendChild(cssRenderer.domElement);

    cubeGroup = new THREE.Group();
    scene.add(cubeGroup);
    cubeGroup.rotation.set(0, 0, 0); // Explicitly set initial rotation

    const positionOffset = CUBE_SIDE_LENGTH / 2;
    // These rotations should orient the "front" of the HTML content correctly when the face is brought to view.
    // CSS3DRenderer makes the plane face the camera. The task is to orient the content within that plane.
    // For a simple X-axis rotation of cubeGroup, these initial rotations are key.
    const facePositionsAndRotations = [
        { x: 0, y: 0, z: positionOffset, rotX: 0, rotY: 0, rotZ: 0 },           // Front (faceObjects[0])
        { x: 0, y: 0, z: -positionOffset, rotX: 0, rotY: Math.PI, rotZ: 0 },      // Back (faceObjects[1]) - text will be readable
        { x: positionOffset, y: 0, z: 0, rotX: 0, rotY: Math.PI / 2, rotZ: 0 }, // Right (faceObjects[2])
        { x: -positionOffset, y: 0, z: 0, rotX: 0, rotY: -Math.PI / 2, rotZ: 0 },// Left (faceObjects[3])
        { x: 0, y: positionOffset, z: 0, rotX: -Math.PI / 2, rotY: 0, rotZ: 0 }, // Top (faceObjects[4])
        { x: 0, y: -positionOffset, z: 0, rotX: Math.PI / 2, rotY: 0, rotZ: 0 }  // Bottom (faceObjects[5])
    ];

    for (let i = 0; i < 6; i++) {
        if (!facesContent[i]) { // Should always be content due to above definition
             facesContent[i] = { title: `Face ${i+1}`, html: `<p>Face ${i+1} content missing</p>`};
        }
        const element = createFaceElement(facesContent[i]);
        const object = new CSS3DObject(element);
        const initialRot = facePositionsAndRotations[i];
        object.position.set(initialRot.x, initialRot.y, initialRot.z);
        object.rotation.set(initialRot.rotX, initialRot.rotY, initialRot.rotZ);
        
        // No dynamic userData storage needed for this simplified orientation approach
        cubeGroup.add(object);
        faceObjects.push(object);
    }

    window.addEventListener('resize', onWindowResize, false);
    window.addEventListener('wheel', onMouseWheel, { passive: false });

    updateFaceVisibility(rotationalStateIndex); // Set initial face visibilities
    animate();
}

function updateFaceVisibility(activeRotState) {
    if (typeof faceObjects === 'undefined' || faceObjects.length === 0) return;
    const activeFaceActualIndex = rotationalStateToFaceObjectIndex[activeRotState];

    faceObjects.forEach((face, index) => {
        const isFaceActive = (index === activeFaceActualIndex);
        // anime.remove(face.element); // Important: remove existing opacity animations
        anime({
            targets: face.element,
            opacity: isFaceActive ? 1 : 0.15, // Active face visible, others dim
            duration: prefersReducedMotion ? 0 : 400,
            easing: 'easeOutQuad',
            // delay: isFaceActive ? (prefersReducedMotion ? 0 : 200) : 0 // Optional delay for active face to fade in after others fade out
        });
    });
}

function onMouseWheel(event) {
    event.preventDefault();
    if (isAnimating) return;
    
    let newRotationalStateIndex = rotationalStateIndex;
    let targetRotationX = cubeGroup.rotation.x;

    if (event.deltaY > 0) {
        newRotationalStateIndex = (rotationalStateIndex + 1) % numFacesForScroll;
        targetRotationX -= Math.PI / 2;
    } else if (event.deltaY < 0) {
        newRotationalStateIndex = (rotationalStateIndex - 1 + numFacesForScroll) % numFacesForScroll;
        targetRotationX += Math.PI / 2;
    } else {
        return; // No scroll delta Y
    }

    isAnimating = true; // Set before potential early exit if state doesn't change
    // No need to check if newRotationalStateIndex !== rotationalStateIndex,
    // as any scroll delta implies a desire to animate. The targetRotationX will change.
    rotationalStateIndex = newRotationalStateIndex;


    // Make all faces fully opaque for the transition (or nearly so)
    // This helps if they were significantly faded out.
    faceObjects.forEach(face => {
        // anime.remove(face.element); // Ensure this doesn't fight the main visibility update
        anime({ targets: face.element, opacity: 1, duration: 150, easing: 'linear' });
    });

    if (prefersReducedMotion) {
        cubeGroup.rotation.x = targetRotationX % (Math.PI * 2);
        isAnimating = false;
        updateFaceVisibility(rotationalStateIndex);
    } else {
        anime({
            targets: cubeGroup.rotation,
            x: targetRotationX,
            // y: 0, // Assuming Y and Z are not part of scroll-driven rotation for now
            // z: 0, 
            duration: animationDuration,
            easing: 'easeInOutQuint',
            complete: function() {
                cubeGroup.rotation.x %= (Math.PI * 2);
                isAnimating = false;
                updateFaceVisibility(rotationalStateIndex);
            }
        });
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    if (cssRenderer) cssRenderer.setSize(window.innerWidth, window.innerHeight);
    // renderer.setSize also if WebGL renderer was used
}

function animate() {
    requestAnimationFrame(animate);
    // No OrbitControls, no continuous cubeGroup rotation here.
    // No dynamic face counter-rotations needed for this simplified approach.
    if (cssRenderer && scene && camera) { // Check all are defined
        cssRenderer.render(scene, camera);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
