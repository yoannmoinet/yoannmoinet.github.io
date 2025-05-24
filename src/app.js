// Ensure anime is imported if not already globally available via CDN.
// If Three.js is imported via modules, anime should ideally be too.
// For now, assuming anime is globally available from the CDN script tag in index.html.
// import anime from 'animejs'; // Example if you were to use npm package

import * as THREE from 'three';
import { CSS3DRenderer, CSS3DObject } from 'three/examples/jsm/renderers/CSS3DRenderer.js';
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'; // Commented out

let scene, camera, renderer, cssRenderer;
let cubeGroup; 
// let controls; // Commented out

const CUBE_SIDE_LENGTH = 400; 
const faceElementWidth = CUBE_SIDE_LENGTH;
const faceElementHeight = CUBE_SIDE_LENGTH; 

// Scroll and animation state
let currentFaceIndex = 0; 
const numFacesForScroll = 4; 
let isAnimating = false; 
const animationDuration = 1000; // ms
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


const facesContent = [
    { 
        title: 'Intro/Bio', 
        html: `<h1>👋 Bon matin!</h1><h2>I'm Yoann Moinet.</h2><p>I'm a JavaScript and NodeJS developer. Currently, I'm working at <a href='https://datadoghq.com' target='_blank' rel='noopener noreferrer'>Datadog</a> in the FrontEnd Platform team I created, as a Staff Software Engineer.</p>` 
    },
    { 
        title: 'Experience', 
        html: `<h2>Previously:</h2><ul><li><a href='https://zendesk.com' target='_blank' rel='noopener noreferrer'>Zendesk</a> as a Senior Software Engineer.</li><li><a href='https://autodesk.com' target='_blank' rel='noopener noreferrer'>Autodesk</a> as a Senior Software Engineer.</li><li><a href='http://www.cossette.com/en' target='_blank' rel='noopener noreferrer'>Cossette</a> as a Creative Technologist.</li></ul>` 
    },
    { 
        title: 'Projects', 
        html: `<h2>I've made:</h2><ul><li><a href='https://isitbig.org' target='_blank' rel='noopener noreferrer'>IsItBig.org</a></li><li><a href='https://zwout.fr' target='_blank' rel='noopener noreferrer'>Zwout</a></li><li><a href='https://getfenet.re' target='_blank' rel='noopener noreferrer'>Fenêtre</a></li><li><a href='https://github.com/yoannmoinet/nipplejs' target='_blank' rel='noopener noreferrer'>NippleJS</a></li><li><a href='https://github.com/damonjs/damon' target='_blank' rel='noopener noreferrer'>DamonJS</a></li></ul>` 
    },
    { 
        title: 'Writings', 
        html: `<h2>I've written:</h2><ul><li><strong>Electron on the AppStore :</strong><ol><li><a href='https://dev.to/yoannmoinet/electron-on-the-app-store-early-stages-27i0' target='_blank' rel='noopener noreferrer'>Early stage</a></li><li><a href='https://dev.to/yoannmoinet/electron-on-the-app-store-pain-tears-nce' target='_blank' rel='noopener noreferrer'>Pain & tears</a></li><li><a href='https://dev.to/yoannmoinet/electron-on-the-app-store-ship-it-4mf0' target='_blank' rel='noopener noreferrer'>Ship it</a></li><li><a href='https://dev.to/yoannmoinet/electron-on-the-app-store-go-to-market-3m1k' target='_blank' rel='noopener noreferrer'>Go to market</a></li><li><a href='https://dev.to/yoannmoinet/electron-on-the-app-store-post-release-4d2d' target='_blank' rel='noopener noreferrer'>Post release</a></li></ol></li><br /><li><strong><a href='https://www.indiehackers.com/interview/growing-a-window-management-app-for-mac-to-1-500-mo-d0a544052b' target='_blank' rel='noopener noreferrer'>Growing a Window-Management App for Mac to $1,500/mo</a></strong></li><br /><li><strong><a href='https://dev.to/yoannmoinet/platform-teams-best-practices-30l1' target='_blank' rel='noopener noreferrer'>🧑‍💻 Platform Teams best practices</a></strong></li><br /><li><strong><a href='https://www.datadoghq.com/blog/engineering/migrating-acceptance-tests-to-synthetic-monitoring/' target='_blank' rel='noopener noreferrer'>How We Migrated Our Acceptance Tests to Use Synthetic Monitoring</a></strong></li></ul>` 
    },
    { 
        title: 'Social', 
        html: `<h2>You can find me on:</h2><ul><li><a href='https://github.com/yoannmoinet' target='_blank' rel='noopener noreferrer'>GitHub</a></li><li><a href='https://twitter.com/yoannm' target='_blank' rel='noopener noreferrer'>Twitter</a></li><li><a href='https://www.linkedin.com/in/yoannmoinet/' target='_blank' rel='noopener noreferrer'>LinkedIn</a></li></ul>` 
    },
    { 
        title: 'Contact', 
        html: `<h2>Get in touch 📞</h2><p>You can contact me via <a href='https://forms.gle/E5JLobBKMZmLeh4HA' target='_blank' rel='noopener noreferrer'>this form</a>.</p><p><a href='./assets/resume.pdf' target='_blank' rel='noopener noreferrer'>My Resume</a></p>` 
    }
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
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1d22); // Updated to match CSS body background

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
    camera.position.set(0, 0, CUBE_SIDE_LENGTH * 1.5);
    camera.lookAt(0,0,0); // Ensure camera looks at the center initially

    // WebGL Renderer (placeholder)
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);

    // CSS3D Renderer
    cssRenderer = new CSS3DRenderer();
    cssRenderer.setSize(window.innerWidth, window.innerHeight);
    cssRenderer.domElement.style.position = 'absolute';
    cssRenderer.domElement.style.top = 0;
    document.getElementById('three-container').appendChild(cssRenderer.domElement);

    // Cube Group
    cubeGroup = new THREE.Group();
    scene.add(cubeGroup);
    // Ensure cubeGroup starts with no rotation
    cubeGroup.rotation.set(0, 0, 0);


    const positionOffset = CUBE_SIDE_LENGTH / 2;
    const facePositionsAndRotations = [
        { x: 0, y: 0, z: positionOffset, rotX: 0, rotY: 0, rotZ: 0 }, // Front
        { x: 0, y: 0, z: -positionOffset, rotX: 0, rotY: Math.PI, rotZ: 0 }, // Back
        { x: positionOffset, y: 0, z: 0, rotX: 0, rotY: Math.PI / 2, rotZ: 0 }, // Right
        { x: -positionOffset, y: 0, z: 0, rotX: 0, rotY: -Math.PI / 2, rotZ: 0 }, // Left
        { x: 0, y: positionOffset, z: 0, rotX: -Math.PI / 2, rotY: 0, rotZ: 0 }, // Top
        { x: 0, y: -positionOffset, z: 0, rotX: Math.PI / 2, rotY: 0, rotZ: 0 }  // Bottom
    ];

    for (let i = 0; i < 6; i++) {
        if (!facesContent[i]) {
            console.warn(`Missing content for face ${i}. Creating a blank face.`);
            facesContent[i] = { title: `Face ${i+1}`, html: `<p>Face ${i+1}</p>`};
        }
        const element = createFaceElement(facesContent[i]);
        const object = new CSS3DObject(element);
        object.position.set(facePositionsAndRotations[i].x, facePositionsAndRotations[i].y, facePositionsAndRotations[i].z);
        object.rotation.set(facePositionsAndRotations[i].rotX, facePositionsAndRotations[i].rotY, facePositionsAndRotations[i].rotZ);
        cubeGroup.add(object);
    }

    // OrbitControls (Commented out for scroll-driven rotation)
    // controls = new OrbitControls(camera, cssRenderer.domElement);
    // controls.enableDamping = true;
    // controls.dampingFactor = 0.05;

    // Handle window resize
    window.addEventListener('resize', onWindowResize, false);
    // Add wheel event listener for scroll-driven rotation
    window.addEventListener('wheel', onMouseWheel, { passive: false });


    animate();
}

function onMouseWheel(event) {
    event.preventDefault(); 

    if (isAnimating) {
        return;
    }

    isAnimating = true;
    let targetRotationX = cubeGroup.rotation.x;

    if (event.deltaY > 0) { // Scrolling down
        currentFaceIndex = (currentFaceIndex + 1) % numFacesForScroll;
        targetRotationX -= Math.PI / 2; 
    } else if (event.deltaY < 0) { // Scrolling up
        currentFaceIndex = (currentFaceIndex - 1 + numFacesForScroll) % numFacesForScroll;
        targetRotationX += Math.PI / 2; 
    }

    if (prefersReducedMotion) {
        cubeGroup.rotation.x = targetRotationX;
        cubeGroup.rotation.x = cubeGroup.rotation.x % (Math.PI * 2); // Normalize
        isAnimating = false;
    } else {
        anime.remove(cubeGroup.rotation); 
        anime({
            targets: cubeGroup.rotation,
            x: targetRotationX,
            duration: animationDuration,
            easing: 'easeInOutQuint', 
            complete: function() {
                isAnimating = false;
                cubeGroup.rotation.x = cubeGroup.rotation.x % (Math.PI * 2);
            }
        });
    }
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    if (renderer) renderer.setSize(window.innerWidth, window.innerHeight);
    if (cssRenderer) cssRenderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    // OrbitControls update (Commented out)
    // if (controls) controls.update(); 
    cssRenderer.render(scene, camera);
}

// Check if DOM is ready before initializing
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
