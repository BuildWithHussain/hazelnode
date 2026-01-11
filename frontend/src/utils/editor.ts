import { type EditorNodeData } from '@/components/nodes/node';
import type { Edge, Node } from 'reactflow';

const TRIGGER_NODE_ID = 'trigger';

export function getProcessedNodes(hazelWorkflow: HazelWorkflow): Array<Node> {
  const processedNodes: Array<Node<EditorNodeData | null>> = [];

  const defaultX = 300;
  let currentY = 100;
  const stepY = 150;

  // To allow user to set a trigger if not already done
  if (!hazelWorkflow.trigger_type) {
    processedNodes.push({
      id: 'set-trigger',
      position: { x: defaultX, y: currentY },
      data: null,
      type: 'setTriggerButton',
      draggable: false,
      focusable: true,
    });
    return processedNodes;
  }

  // Add trigger node
  processedNodes.push({
    id: TRIGGER_NODE_ID,
    position: { x: defaultX, y: currentY },
    data: {
      node_id: TRIGGER_NODE_ID,
      name: hazelWorkflow.trigger_type,
      type: hazelWorkflow.trigger_type,
      kind: 'Trigger',
    },
    type: 'workflowNode',
    draggable: false,
    focusable: false,
  });

  currentY += stepY;

  // Add action nodes
  for (const node of hazelWorkflow.nodes || []) {
    const nodeId = node.node_id || node.name;
    const posX = node.position_x || defaultX;
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
      type: node.type === 'Condition' ? 'conditionNode' : 'workflowNode',
      focusable: true,
      draggable: true,
    });

    currentY = posY + stepY;
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
      processedEdges.push({
        id: `${conn.source_node_id}-${conn.source_handle || 'default'}-${conn.target_node_id}`,
        source: conn.source_node_id,
        target: conn.target_node_id,
        sourceHandle: conn.source_handle || 'default',
        label: conn.source_handle === 'true' ? 'Yes' : conn.source_handle === 'false' ? 'No' : undefined,
        labelStyle: { fill: '#666', fontWeight: 500 },
        style: {
          stroke: conn.source_handle === 'true' ? '#22c55e' : conn.source_handle === 'false' ? '#ef4444' : '#888',
        },
      });
    }
    return processedEdges;
  }

  // Fallback: connect nodes linearly for backward compatibility
  for (let i = 0; i < processedNodes.length - 1; i++) {
    const sourceNode = processedNodes[i];
    const targetNode = processedNodes[i + 1];

    // Skip set-trigger button
    if (sourceNode.id === 'set-trigger' || targetNode.id === 'set-trigger') {
      continue;
    }

    processedEdges.push({
      id: `${sourceNode.id}-default-${targetNode.id}`,
      source: sourceNode.id,
      target: targetNode.id,
      sourceHandle: 'default',
    });
  }

  return processedEdges;
}

export function nodesToHazelNodes(nodes: Array<Node>): Array<Partial<HazelNode>> {
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

export function edgesToHazelConnections(edges: Array<Edge>): Array<Partial<HazelNodeConnection>> {
  return edges.map((edge) => ({
    source_node_id: edge.source,
    source_handle: (edge.sourceHandle as 'default' | 'true' | 'false') || 'default',
    target_node_id: edge.target,
  }));
}
