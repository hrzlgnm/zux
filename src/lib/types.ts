export interface GraphNode {
  id: string;
  label: string;
  group: 'service-type' | 'instance' | 'host' | 'address';
  title?: string;
  shape?: string;
  size?: number;
  color?: string;
  serviceType?: string;
  hostname?: string;
  port?: number;
  addresses?: string[];
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
