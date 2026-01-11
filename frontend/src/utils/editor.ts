import { type EditorNodeData } from '@/components/nodes/node';
import type { Edge, Node } from 'reactflow';
import {
  SPECIAL_NODE_IDS,
  NODE_TYPES,
  EDGE_HANDLES,
  getEdgeStyleForHandle,
  createEdgeId,
  getNodeTypeForData,
} from '@/constants/editor';

const DEFAULT_X = 300;
const STEP_Y = 150;

export function getProcessedNodes(hazelWorkflow: HazelWorkflow): Array<Node> {
  const processedNodes: Array<Node<EditorNodeData | null>> = [];
  let currentY = 100;

  // To allow user to set a trigger if not already done
  if (!hazelWorkflow.trigger_type) {
    processedNodes.push({
      id: SPECIAL_NODE_IDS.SET_TRIGGER,
      position: { x: DEFAULT_X, y: currentY },
      data: null,
      type: NODE_TYPES.SET_TRIGGER,
      draggable: false,
      focusable: true,
    });
    return processedNodes;
  }

  // Add trigger node
  processedNodes.push({
    id: SPECIAL_NODE_IDS.TRIGGER,
    position: { x: DEFAULT_X, y: currentY },
    data: {
      node_id: SPECIAL_NODE_IDS.TRIGGER,
      name: hazelWorkflow.trigger_type,
      type: hazelWorkflow.trigger_type,
      kind: 'Trigger',
    },
    type: NODE_TYPES.WORKFLOW,
    draggable: false,
    focusable: false,
  });

  currentY += STEP_Y;

  // Add action nodes
  for (const node of hazelWorkflow.nodes || []) {
    const nodeId = node.node_id || node.name;
    const posX = node.position_x || DEFAULT_X;
    const posY = node.position_y || currentY;

    processedNodes.push({
      id: nodeId,
      position: { x: posX, y: posY },
      data: {
        node_id: nodeId,
        name: node.name,
        type: node.type,
        kind: node.kind || 'Action',
        parameters: node.parameters,
      },
      type: getNodeTypeForData(node.type),
      focusable: true,
      draggable: true,
    });

    currentY = posY + STEP_Y;
  }

  return processedNodes;
}

export function getProcessedEdges(
  hazelWorkflow: HazelWorkflow,
  processedNodes: Array<Node>
): Array<Edge> {
  const processedEdges: Array<Edge> = [];

  // If we have connections from backend, use them
  if (hazelWorkflow.connections && hazelWorkflow.connections.length > 0) {
    for (const conn of hazelWorkflow.connections) {
      const handle = conn.source_handle || EDGE_HANDLES.DEFAULT;
      const styleProps = getEdgeStyleForHandle(handle);

      processedEdges.push({
        id: createEdgeId(conn.source_node_id, handle, conn.target_node_id),
        source: conn.source_node_id,
        target: conn.target_node_id,
        sourceHandle: handle,
        label: styleProps.label,
        labelStyle: styleProps.labelStyle,
        style: { stroke: styleProps.stroke },
      });
    }
    return processedEdges;
  }

  // Fallback: connect nodes linearly for backward compatibility
  for (let i = 0; i < processedNodes.length - 1; i++) {
    const sourceNode = processedNodes[i];
    const targetNode = processedNodes[i + 1];

    // Skip set-trigger button
    if (
      sourceNode.id === SPECIAL_NODE_IDS.SET_TRIGGER ||
      targetNode.id === SPECIAL_NODE_IDS.SET_TRIGGER
    ) {
      continue;
    }

    processedEdges.push({
      id: createEdgeId(sourceNode.id, EDGE_HANDLES.DEFAULT, targetNode.id),
      source: sourceNode.id,
      target: targetNode.id,
      sourceHandle: EDGE_HANDLES.DEFAULT,
    });
  }

  return processedEdges;
}

export function nodesToHazelNodes(
  nodes: Array<Node>
): Array<Partial<HazelNode>> {
  return nodes
    .filter((node) => node.data?.kind === 'Action')
    .map((node) => ({
      node_id: node.id,
      type: node.data?.type,
      position_x: Math.round(node.position.x),
      position_y: Math.round(node.position.y),
      parameters: node.data?.parameters || [],
    }));
}

export function edgesToHazelConnections(
  edges: Array<Edge>
): Array<Partial<HazelNodeConnection>> {
  return edges.map((edge) => ({
    source_node_id: edge.source,
    source_handle:
      (edge.sourceHandle as 'default' | 'true' | 'false') || 'default',
    target_node_id: edge.target,
  }));
}
