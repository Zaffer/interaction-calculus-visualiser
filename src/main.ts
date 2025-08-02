import * as THREE from "three";
import WebGPURenderer from "three/src/renderers/webgpu/WebGPURenderer.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GraphNode } from "./objects/GraphNode.js";
import { GraphEdge } from "./objects/GraphEdge.js";
import { TriangularPrism } from "./objects/TriangularPrism.js";
import { PhysicsEngine } from "./physics/PhysicsEngine.js";

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

  // Create graph nodes
  const node1 = new GraphNode(new THREE.Vector3(-2, 0, 0));
  const node2 = new GraphNode(new THREE.Vector3(2, 0, 0));
  
  node1.addToScene(scene);
  node2.addToScene(scene);
  
  // Create edge between nodes
  const edge = new GraphEdge(node1, node2);
  edge.addToScene(scene);

  // Create triangular prism
  const prism = new TriangularPrism(new THREE.Vector3(0, 2, 0));
  prism.addToScene(scene);

  // Create two additional nodes below the prism
  const node3 = new GraphNode(new THREE.Vector3(-1, -1, 0));
  const node4 = new GraphNode(new THREE.Vector3(1, -1, 0));
  
  node3.addToScene(scene);
  node4.addToScene(scene);

  // Create edges from prism ports to the nodes below
  const edge2 = new GraphEdge(prism.port1, node3, 0xffffff, prism.getPort1Direction());
  const edge3 = new GraphEdge(prism.port2, node4, 0xffffff, prism.getPort2Direction());
  
  edge2.addToScene(scene);
  edge3.addToScene(scene);

  // Create physics engine
  const physics = new PhysicsEngine();
  
  // Add all nodes to physics
  physics.addNode(node1);
  physics.addNode(node2);
  physics.addNode(node3);
  physics.addNode(node4);
  // Add prism ports as fixed nodes (they participate in forces but don't move)
  physics.addNode(prism.port1, true);
  physics.addNode(prism.port2, true);
  
  // Add edges to physics
  physics.addEdge(edge);
  physics.addEdge(edge2);
  physics.addEdge(edge3);

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
    physics.update(); // Update physics simulation
    renderer.renderAsync(scene, camera);
  }

  animate();
}

init();
