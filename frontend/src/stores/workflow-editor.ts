import { create } from 'zustand';
import type { NodeChange, EdgeChange, Node, Edge } from 'reactflow';
import { applyNodeChanges, applyEdgeChanges } from 'reactflow';

interface WorkflowEditorState {
  nodes: Array<Node>;
  edges: Array<Edge>;
  setNodes: (nodes: Array<Node>) => void;
  setEdges: (edges: Array<Edge>) => void;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
}

export const useEditorStore = create<WorkflowEditorState>()((set, get) => ({
  nodes: [],
  edges: [],
  setNodes(nodes) {
    set({
      nodes,
    });
  },
  setEdges(edges) {
    set({
      edges,
    });
  },
  onNodesChange(changes: NodeChange[]) {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange(changes: EdgeChange[]) {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
}));
