import * as THREE from "three";
import { GraphNode } from "./GraphNode.js";

export class GraphEdge {
  public line: THREE.Line;
  public node1: GraphNode;
  public node2: GraphNode;
  private startDirection?: THREE.Vector3;

  // Constants for curve calculation
  private static readonly CURVE_SEGMENTS = 50;
  private static readonly EXTEND_RATIO = 0.4;
  private static readonly PULL_BACK_RATIO = 0.3;

  constructor(node1: GraphNode, node2: GraphNode, color: number = 0xffffff, startDirection?: THREE.Vector3) {
    this.node1 = node1;
    this.node2 = node2;
    this.startDirection = startDirection;
    
    this.line = this.createCurvedLine(color);
  }

  private calculateControlPoints(): { controlPoint1: THREE.Vector3, controlPoint2: THREE.Vector3 } {
    const start = this.node1.getPosition();
    const end = this.node2.getPosition();
    
    const finalDirection = new THREE.Vector3().subVectors(end, start);
    const distance = finalDirection.length();
    finalDirection.normalize();
    
    const initialDirection = this.startDirection ? this.startDirection.clone().normalize() : finalDirection.clone();
    const extendDistance = distance * GraphEdge.EXTEND_RATIO;
    
    const controlPoint1 = new THREE.Vector3()
      .copy(start)
      .add(initialDirection.multiplyScalar(extendDistance));
    
    const controlPoint2 = new THREE.Vector3()
      .copy(end)
      .add(finalDirection.clone().multiplyScalar(-distance * GraphEdge.PULL_BACK_RATIO));
      
    return { controlPoint1, controlPoint2 };
  }

  private createCurvedLine(color: number): THREE.Line {
    const start = this.node1.getPosition();
    const end = this.node2.getPosition();
    const { controlPoint1, controlPoint2 } = this.calculateControlPoints();
    
    const curve = new THREE.CubicBezierCurve3(start, controlPoint1, controlPoint2, end);
    const points = curve.getPoints(GraphEdge.CURVE_SEGMENTS);
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color });
    
    return new THREE.Line(geometry, material);
  }

  updateCurve(): void {
    const start = this.node1.getPosition();
    const end = this.node2.getPosition();
    const { controlPoint1, controlPoint2 } = this.calculateControlPoints();
    
    const curve = new THREE.CubicBezierCurve3(start, controlPoint1, controlPoint2, end);
    const points = curve.getPoints(GraphEdge.CURVE_SEGMENTS);
    
    this.line.geometry.setFromPoints(points);
  }

  getControlPoint1(): THREE.Vector3 {
    return this.calculateControlPoints().controlPoint1;
  }

  addToScene(scene: THREE.Scene): void {
    scene.add(this.line);
  }
}
