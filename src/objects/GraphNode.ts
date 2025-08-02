import * as THREE from "three";

export class GraphNode {
  public mesh: THREE.Mesh;

  constructor(position: THREE.Vector3, color: number = 0x00ff00, radius: number = 0.3) {
    const geometry = new THREE.SphereGeometry(radius, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color });
    
    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.copy(position);
  }

  addToScene(scene: THREE.Scene): void {
    scene.add(this.mesh);
  }

  getPosition(): THREE.Vector3 {
    return this.mesh.position;
  }
}
