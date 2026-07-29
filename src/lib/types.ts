export interface AddressInfo {
  ip: string;
  interfaces: string[];
}

export interface GraphNode {
  id: string;
  label: string;
  group: 'service-type' | 'instance' | 'host' | 'address';
  title?: string;
  shape?: string;
  size?: number;
  color?: string;
  serviceType?: string;
  subType?: string;
  hostname?: string;
  port?: number;
  addresses?: AddressInfo[];
  txt?: Record<string, string>;
}

export interface GraphEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
  dashes?: boolean;
  color?: string;
}

export type Solver = 'forceAtlas2Based' | 'barnesHut' | 'repulsion' | 'hierarchicalRepulsion';

export interface PhysicsConfig {
  solver: Solver;
  gravitationalConstant: number;
  centralGravity: number;
  springLength: number;
  springConstant: number;
  damping: number;
}
