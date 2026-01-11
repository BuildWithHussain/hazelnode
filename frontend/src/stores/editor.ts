import { create } from 'zustand';
import { MarkerType } from 'reactflow';

import type { NodeChange, EdgeChange, Node, Edge } from 'reactflow';
import { applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { EditorNodeData } from '@/components/nodes/node';
import {
  EDGE_HANDLES,
  createEdgeId,
  getNodeTypeForData,
} from '@/constants/editor';

interface WorkflowEditorState {
  flowNodes: Array<Node>;
  flowEdges: Array<Edge>;
  activeWorkflow: HazelWorkflow | null;
  selectedNode: Node | null;
  nodeCounter: number;
}

interface WorkflowEditorActions {
  setFlowNodes: (nodes: Array<Node>) => void;
  setFlowEdges: (
    edges: Array<Edge> | ((prevEdges: Array<Edge>) => Array<Edge>)
  ) => void;
  onFlowNodesChange: (changes: NodeChange[]) => void;
  onFlowEdgesChange: (changes: EdgeChange[]) => void;
  isFlowEmpty: () => boolean;
  setSelectedNode: (node: Node | null) => void;
  removeNode: (nodeId: string) => void;
  appendNode: (node: Partial<EditorNodeData>) => void;
  addNodeAtPosition: (
    node: Partial<EditorNodeData>,
    position: { x: number; y: number }
  ) => void;
  updateNodeData: (nodeId: string, data: Partial<EditorNodeData>) => void;
  resetFlows: () => void;
  generateNodeId: () => string;
}

const initialState: WorkflowEditorState = {
  flowNodes: [],
  flowEdges: [],
  activeWorkflow: null,
  selectedNode: null,
  nodeCounter: 0,
};

const DEFAULT_X = 300;
const NODE_SPACING_Y = 150;

/**
 * Create a new ReactFlow node from editor node data
 */
function createFlowNode(
  nodeId: string,
  nodeData: Partial<EditorNodeData>,
  position: { x: number; y: number }
): Node<EditorNodeData> {
  return {
    id: nodeId,
    position,
    data: {
      node_id: nodeId,
      name: nodeData.name || nodeData.type || '',
      type: nodeData.type || '',
      kind: nodeData.kind || 'Action',
      parameters: nodeData.parameters,
    },
    type: getNodeTypeForData(nodeData.type),
    draggable: true,
  };
}

export const useEditorStore = create<
  WorkflowEditorState & WorkflowEditorActions
>()((set, get) => ({
  ...initialState,

  generateNodeId() {
    const counter = get().nodeCounter + 1;
    set({ nodeCounter: counter });
    return `node_${counter}_${Date.now()}`;
  },

  resetFlows() {
    set({
      flowNodes: [],
      flowEdges: [],
      selectedNode: null,
      nodeCounter: 0,
    });
  },

  setFlowNodes(nodes) {
    set({ flowNodes: nodes });
  },

  setFlowEdges(edgesOrUpdater) {
    if (typeof edgesOrUpdater === 'function') {
      set({ flowEdges: edgesOrUpdater(get().flowEdges) });
    } else {
      set({ flowEdges: edgesOrUpdater });
    }
  },

  onFlowNodesChange(changes) {
    set({
      flowNodes: applyNodeChanges(changes, get().flowNodes),
    });
  },

  onFlowEdgesChange(changes) {
    set({
      flowEdges: applyEdgeChanges(changes, get().flowEdges),
    });
  },

  isFlowEmpty() {
    return get().flowNodes.length === 0;
  },

  setSelectedNode(node) {
    set({ selectedNode: node });
  },

  removeNode(nodeId) {
    const currentNodes = get().flowNodes.filter((n) => n.id !== nodeId);
    const currentEdges = get().flowEdges.filter(
      (e) => e.source !== nodeId && e.target !== nodeId
    );
    const selectedNode = get().selectedNode;
    set({
      flowNodes: currentNodes,
      flowEdges: currentEdges,
      // Clear selectedNode if it's the one being removed
      selectedNode: selectedNode?.id === nodeId ? null : selectedNode,
    });
  },

  appendNode(nodeData) {
    const { flowNodes: currentNodes, flowEdges: currentEdges } = get();
    const nodeId = get().generateNodeId();

    // Calculate position based on last node
    let posY = 100;
    if (currentNodes.length > 0) {
      const lastNode = currentNodes[currentNodes.length - 1];
      posY = lastNode.position.y + NODE_SPACING_Y;
    }

    const newNode = createFlowNode(nodeId, nodeData, { x: DEFAULT_X, y: posY });

    // Connect to the last node if not empty
    const newEdges = [...currentEdges];
    if (currentNodes.length > 0) {
      const lastNode = currentNodes[currentNodes.length - 1];
      newEdges.push({
        id: createEdgeId(lastNode.id, EDGE_HANDLES.DEFAULT, nodeId),
        source: lastNode.id,
        target: nodeId,
        sourceHandle: EDGE_HANDLES.DEFAULT,
        markerEnd: { type: MarkerType.ArrowClosed },
      });
    }

    set({
      flowNodes: [...currentNodes, newNode],
      flowEdges: newEdges,
    });
  },

  addNodeAtPosition(nodeData, position) {
    const currentNodes = get().flowNodes;
    const nodeId = get().generateNodeId();
    const newNode = createFlowNode(nodeId, nodeData, position);

    set({
      flowNodes: [...currentNodes, newNode],
    });
  },

  updateNodeData(nodeId, data) {
    const currentNodes = get().flowNodes;
    const updatedNodes = currentNodes.map((node) => {
      if (node.id === nodeId) {
        return {
          ...node,
          data: {
            ...node.data,
            ...data,
          },
        };
      }
      return node;
    });

    const selectedNode = get().selectedNode;
    const updatedSelectedNode =
      selectedNode?.id === nodeId
        ? { ...selectedNode, data: { ...selectedNode.data, ...data } }
        : selectedNode;

    set({
      flowNodes: updatedNodes,
      selectedNode: updatedSelectedNode,
    });
  },
}));
