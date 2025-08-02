import * as THREE from "three";
import { GraphNode } from "../objects/GraphNode.js";
import { GraphEdge } from "../objects/GraphEdge.js";

export class PhysicsEngine {
  private nodes: GraphNode[] = [];
  private edges: GraphEdge[] = [];
  private velocities = new Map<GraphNode, THREE.Vector3>();
  private fixedNodes = new Set<GraphNode>();
  
  // Physics parameters
  private repulsionStrength = 50;
  private springStrength = 0.1;
  private controlPointAttraction = 5; // New parameter for control point attraction
  private damping = 0.9;
  private timeStep = 0.016; // ~60fps

  addNode(node: GraphNode, isFixed: boolean = false): void {
    this.nodes.push(node);
    this.velocities.set(node, new THREE.Vector3(0, 0, 0));
    if (isFixed) {
      this.fixedNodes.add(node);
    }
  }

  addEdge(edge: GraphEdge): void {
    this.edges.push(edge);
  }

  update(): void {
    // Calculate forces for each node
    const forces = new Map<GraphNode, THREE.Vector3>();
    
    // Initialize forces
    this.nodes.forEach(node => {
      forces.set(node, new THREE.Vector3(0, 0, 0));
    });

    // Repulsive forces between all nodes (electric force)
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = i + 1; j < this.nodes.length; j++) {
        const node1 = this.nodes[i];
        const node2 = this.nodes[j];
        
        const direction = new THREE.Vector3()
          .subVectors(node1.getPosition(), node2.getPosition());
        
        const distance = Math.max(direction.length(), 0.1); // Prevent division by zero
        direction.normalize();
        
        // Coulomb-like repulsion: F = k / r²
        const repulsionForce = this.repulsionStrength / (distance * distance);
        const force1 = direction.clone().multiplyScalar(repulsionForce);
        const force2 = direction.clone().multiplyScalar(-repulsionForce);
        
        forces.get(node1)!.add(force1);
        forces.get(node2)!.add(force2);
      }
    }

    // Attractive spring forces along edges
    this.edges.forEach(edge => {
      const node1 = edge.node1;
      const node2 = edge.node2;
      
      // Only apply forces to nodes that are in the physics simulation
      if (!forces.has(node1) || !forces.has(node2)) {
        return; // Skip this edge if either node is not in physics
      }
      
      const direction = new THREE.Vector3()
        .subVectors(node2.getPosition(), node1.getPosition());
      
      const distance = direction.length();
      const restLength = 2.0; // Desired spring length
      
      direction.normalize();
      
      // Hooke's law: F = k * (distance - restLength)
      const springForce = this.springStrength * (distance - restLength);
      const force = direction.clone().multiplyScalar(springForce);
      
      forces.get(node1)!.add(force);
      forces.get(node2)!.sub(force);
    });

    // Control point attraction forces
    this.edges.forEach(edge => {
      const node2 = edge.node2;
      
      // Only apply to nodes in the physics simulation
      if (!forces.has(node2)) {
        return;
      }
      
      const controlPoint1 = edge.getControlPoint1();
      const nodePosition = node2.getPosition();
      
      // Attract node2 toward controlPoint1
      const attractionDirection = new THREE.Vector3()
        .subVectors(controlPoint1, nodePosition);
      
      const attractionForce = attractionDirection.multiplyScalar(this.controlPointAttraction);
      
      forces.get(node2)!.add(attractionForce);
    });

    // Apply forces and update positions
    this.nodes.forEach(node => {
      // Skip fixed nodes
      if (this.fixedNodes.has(node)) {
        return;
      }
      
      const force = forces.get(node)!;
      const velocity = this.velocities.get(node)!;
      
      // Apply force to velocity: v += F * dt
      velocity.add(force.clone().multiplyScalar(this.timeStep));
      
      // Apply damping
      velocity.multiplyScalar(this.damping);
      
      // Update position: pos += v * dt
      const newPosition = node.getPosition().clone()
        .add(velocity.clone().multiplyScalar(this.timeStep));
      
      node.mesh.position.copy(newPosition);
    });

    // Update all edge curves after nodes have moved
    this.edges.forEach(edge => {
      edge.updateCurve();
    });
  }
}
