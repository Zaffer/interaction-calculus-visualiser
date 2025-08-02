import * as THREE from "three";
import { GraphNode } from "./GraphNode.js";

export class GraphEdge {
  public line: THREE.Line;
  public node1: GraphNode;
  public node2: GraphNode;
  private startDirection?: THREE.Vector3;

  constructor(node1: GraphNode, node2: GraphNode, color: number = 0xffffff, startDirection?: THREE.Vector3) {
    this.node1 = node1;
    this.node2 = node2;
    this.startDirection = startDirection;
    
    this.line = this.createCurvedLine(color);
  }

  private createCurvedLine(color: number): THREE.Line {
    const start = this.node1.getPosition();
    const end = this.node2.getPosition();
    
    // Calculate direction vector from start to end
    const finalDirection = new THREE.Vector3().subVectors(end, start);
    const distance = finalDirection.length();
    finalDirection.normalize();
    
    // Use provided start direction or default to final direction
    const initialDirection = this.startDirection ? this.startDirection.clone().normalize() : finalDirection.clone();
    
    // Create control points for a curved path
    const extendDistance = distance * 0.4; // How far to extend in initial direction
    
    // First control point: extend out from start in the initial direction
    const controlPoint1 = new THREE.Vector3()
      .copy(start)
      .add(initialDirection.multiplyScalar(extendDistance));
    
    // Second control point: approach the end point
    const controlPoint2 = new THREE.Vector3()
      .copy(end)
      .add(finalDirection.clone().multiplyScalar(-distance * 0.3));
    
    // Create a cubic bezier curve
    const curve = new THREE.CubicBezierCurve3(start, controlPoint1, controlPoint2, end);
    
    // Generate points along the curve
    const points = curve.getPoints(50); // 50 segments for smooth curve
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color });
    
    return new THREE.Line(geometry, material);
  }

  // Update the curve when nodes move
  updateCurve(): void {
    const start = this.node1.getPosition();
    const end = this.node2.getPosition();
    
    // Calculate direction vector from start to end
    const finalDirection = new THREE.Vector3().subVectors(end, start);
    const distance = finalDirection.length();
    finalDirection.normalize();
    
    // Use provided start direction or default to final direction
    const initialDirection = this.startDirection ? this.startDirection.clone().normalize() : finalDirection.clone();
    
    // Create control points for a curved path
    const extendDistance = distance * 0.4; // How far to extend in initial direction
    
    // First control point: extend out from start in the initial direction
    const controlPoint1 = new THREE.Vector3()
      .copy(start)
      .add(initialDirection.multiplyScalar(extendDistance));
    
    // Second control point: approach the end point
    const controlPoint2 = new THREE.Vector3()
      .copy(end)
      .add(finalDirection.clone().multiplyScalar(-distance * 0.3));
    
    // Create a cubic bezier curve
    const curve = new THREE.CubicBezierCurve3(start, controlPoint1, controlPoint2, end);
    
    // Generate points along the curve
    const points = curve.getPoints(50); // 50 segments for smooth curve
    
    // Update the geometry with new points
    this.line.geometry.setFromPoints(points);
  }

  addToScene(scene: THREE.Scene): void {
    scene.add(this.line);
  }

  // Get the first control point for physics forces
  getControlPoint1(): THREE.Vector3 {
    const start = this.node1.getPosition();
    const end = this.node2.getPosition();
    
    const finalDirection = new THREE.Vector3().subVectors(end, start);
    const distance = finalDirection.length();
    finalDirection.normalize();
    
    const initialDirection = this.startDirection ? this.startDirection.clone().normalize() : finalDirection.clone();
    const extendDistance = distance * 0.4;
    
    return new THREE.Vector3()
      .copy(start)
      .add(initialDirection.multiplyScalar(extendDistance));
  }
}
