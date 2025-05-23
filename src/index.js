import * as THREE from "https://cdn.skypack.dev/three";

// Constants
let h = window.innerHeight;
let w = window.innerWidth;
let ratio = w / h;

let CUBE_W = w * 0.075;
let CUBE_H = CUBE_W / ratio;
let CUBE_Z = CUBE_H;

const CUBE_SPLIT = 10;
const FACE_NUMBER = 4;

// Init dom
document.body.style = `height: ${FACE_NUMBER * 100}vh; overscroll-behavior: none;`;
document.body.classList.add("render");
document.querySelectorAll("header,main").forEach((el) => {
    el.style = "display: none;";
});

// 3D construction
const scene = new THREE.Scene();
const geometry = new THREE.BoxGeometry(CUBE_W, CUBE_H, CUBE_Z, CUBE_SPLIT, CUBE_SPLIT, CUBE_SPLIT);
const material = new THREE.MeshLambertMaterial({ color: "#fff" });
const camera = new THREE.PerspectiveCamera(75, ratio, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true,
    canvas: document.querySelector("#renderer"),
    powerPreference: "high-performance",
});
const cube = new THREE.Mesh(geometry, material);
const light = new THREE.HemisphereLight(0xffffff, 0x000000, 1.13);

scene.add(light);
scene.add(cube);
light.position.z = 10;
light.position.y = 10;
camera.position.z = 100;
renderer.setSize(w, h);

const updateSizes = () => {
    w = window.innerWidth;
    h = window.innerHeight;
    ratio = w / h;
    CUBE_W = w * 0.075;
    CUBE_H = CUBE_W / ratio;
    CUBE_Z = CUBE_H;

    geometry.width = CUBE_W;
    geometry.height = CUBE_H;
    geometry.depth = CUBE_Z;
    camera.aspect = ratio;
    renderer.setSize(w, h);
};

// Events
const getScroll = () => {
    const doc = document.documentElement;
    const left = (window.pageXOffset || doc.scrollLeft) - (doc.clientLeft || 0);
    const top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);
    return {
        y: top,
        x: left,
    };
};

document.body.onscroll = () => {
    const scroll = getScroll();
    const maxScroll = h * (FACE_NUMBER - 1);
    const fullRotation = (Math.PI / 2) * (FACE_NUMBER - 1);
    const ratioScrolled = scroll.y / maxScroll;
    cube.rotation.x = -ratioScrolled * fullRotation;
};

window.onresize = () => {
    updateSizes();
};

// Animate
const animate = function () {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
};

updateSizes();
animate();
