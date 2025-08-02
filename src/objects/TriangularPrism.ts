import * as THREE from "three";
import { GraphNode } from "./GraphNode.js";

export class TriangularPrism {
  public mesh: THREE.Mesh;
  public port1: GraphNode;
  public port2: GraphNode;
  public port3: GraphNode; // New port at the tip

  constructor(position: THREE.Vector3, color: number = 0xff6600, depth: number = 0.5) {
    // Create right triangular shape (90-degree angle)
    const triangleShape = new THREE.Shape();
    triangleShape.moveTo(0, 0);    // Bottom left corner (right angle)
    triangleShape.lineTo(1, 0);    // Bottom right corner
    triangleShape.lineTo(0, 1);    // Top left corner
    triangleShape.lineTo(0, 0);    // Close the shape
    
    const extrudeSettings = { depth, bevelEnabled: false };
    const geometry = new THREE.ExtrudeGeometry(triangleShape, extrudeSettings);
    const material = new THREE.MeshBasicMaterial({ color });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);

    // Create connection ports on the hypotenuse (long side)
    // The hypotenuse goes from (1, 0) to (0, 1) in local coordinates
    // Adjust for world position
    const port1Position = new THREE.Vector3(
      position.x + 0.75,  // 1/3 along hypotenuse
      position.y + 0.25,
      position.z + 0.25
    );
    const port2Position = new THREE.Vector3(
      position.x + 0.25,  // 2/3 along hypotenuse
      position.y + 0.75,
      position.z + 0.25
    );
    
    // Create port at the tip (right-angled corner at origin)
    const port3Position = new THREE.Vector3(
      position.x + 0,     // At the tip (0,0)
      position.y + 0,
      position.z + 0.25   // Same z-offset as other ports
    );

    this.port1 = new GraphNode(port1Position, color, 0.1);
    this.port2 = new GraphNode(port2Position, color, 0.1);
    this.port3 = new GraphNode(port3Position, color, 0.1);
  }

  addToScene(scene: THREE.Scene): void {
    scene.add(this.mesh);
    this.port1.addToScene(scene);
    this.port2.addToScene(scene);
    this.port3.addToScene(scene);
  }

  // Get the outward normal direction for port1 (perpendicular to hypotenuse)
  getPort1Direction(): THREE.Vector3 {
    // Hypotenuse direction is from (1,0) to (0,1), so direction is (-1,1)
    // Perpendicular outward direction is (1,1) normalized
    return new THREE.Vector3(1, 1, 0).normalize();
  }

  // Get the outward normal direction for port2
  getPort2Direction(): THREE.Vector3 {
    // Same outward direction for both ports on the hypotenuse
    return new THREE.Vector3(1, 1, 0).normalize();
  }

  // Get the outward normal direction for port3 (at the tip/right angle)
  getPort3Direction(): THREE.Vector3 {
    // At the right angle, pointing outward from the corner
    return new THREE.Vector3(-1, -1, 0).normalize();
  }
}
