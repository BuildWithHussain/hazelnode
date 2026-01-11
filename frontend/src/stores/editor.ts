import { create } from 'zustand';
import { MarkerType } from 'reactflow';

import type { NodeChange, EdgeChange, Node, Edge } from 'reactflow';
import { applyNodeChanges, applyEdgeChanges } from 'reactflow';
import { EditorNodeData } from '@/components/nodes/node';

interface WorkflowEditorState {
  flowNodes: Array<Node>;
  flowEdges: Array<Edge>;
  activeWorkflow: HazelWorkflow | null;
  selectedNode: Node | null;
  nodeCounter: number;
}

interface WorkflowEditorActions {
  setFlowNodes: (nodes: Array<Node>) => void;
  setFlowEdges: (edges: Array<Edge>) => void;
  onFlowNodesChange: (changes: NodeChange[]) => void;
  onFlowEdgesChange: (changes: EdgeChange[]) => void;
  isFlowEmpty: () => boolean;
  setSelectedNode: (node: Node | null) => void;
  removeNode: (nodeId: string) => void;
  appendNode: (node: Partial<EditorNodeData>) => void;
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

  setFlowEdges(edges) {
    set({ flowEdges: edges });
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
    set({
      flowNodes: currentNodes,
      flowEdges: currentEdges,
    });
  },

  appendNode(nodeData) {
    const currentState = get();
    const currentNodes = currentState.flowNodes;
    const currentEdges = currentState.flowEdges;

    const nodeId = get().generateNodeId();
    const isCondition = nodeData.type === 'Condition';

    // Calculate position based on last node
    let posY = 100;
    if (currentNodes.length > 0) {
      const lastNode = currentNodes[currentNodes.length - 1];
      posY = lastNode.position.y + 150;
    }

    const newNode: Node<EditorNodeData> = {
      id: nodeId,
      position: { x: 300, y: posY },
      data: {
        node_id: nodeId,
        name: nodeData.name || nodeData.type || '',
        type: nodeData.type || '',
        kind: nodeData.kind || 'Action',
        parameters: nodeData.parameters,
      },
      type: isCondition ? 'conditionNode' : 'workflowNode',
      draggable: true,
    };

    // Connect to the last node if not empty
    const newEdges = [...currentEdges];
    if (currentNodes.length > 0) {
      const lastNode = currentNodes[currentNodes.length - 1];
      newEdges.push({
        id: `${lastNode.id}-default-${nodeId}`,
        source: lastNode.id,
        target: nodeId,
        sourceHandle: 'default',
        markerEnd: { type: MarkerType.ArrowClosed },
      });
    }

    set({
      flowNodes: [...currentNodes, newNode],
      flowEdges: newEdges,
    });
  },
}));
