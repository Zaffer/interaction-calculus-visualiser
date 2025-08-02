import * as THREE from "three";
import WebGPURenderer from "three/src/renderers/webgpu/WebGPURenderer.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

// Initialize WebGPU
async function init() {
  // Scene setup
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000);

  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new WebGPURenderer({ 
    antialias: true,
    powerPreference: 'high-performance' 
  });
  
  // Initialize WebGPU backend before rendering
  await renderer.init();
  
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio);
  document.body.appendChild(renderer.domElement);

  // Add orbit controls for camera movement
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;

  // Create two nodes (spheres)
  const nodeGeometry = new THREE.SphereGeometry(0.3, 16, 16);
  const nodeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  
  const node1 = new THREE.Mesh(nodeGeometry, nodeMaterial);
  node1.position.set(-2, 0, 0);
  scene.add(node1);
  
  const node2 = new THREE.Mesh(nodeGeometry, nodeMaterial);
  node2.position.set(2, 0, 0);
  scene.add(node2);
  
  // Create edge (line) between nodes
  const edgeGeometry = new THREE.BufferGeometry().setFromPoints([
    node1.position,
    node2.position
  ]);
  const edgeMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
  const edge = new THREE.Line(edgeGeometry, edgeMaterial);
  scene.add(edge);

  // Handle resize
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.renderAsync(scene, camera);
  }

  animate();
}

init();
