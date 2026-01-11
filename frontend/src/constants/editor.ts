import type { Edge, MarkerType } from 'reactflow';

// Edge handle identifiers
export const EDGE_HANDLES = {
  DEFAULT: 'default',
  TRUE: 'true',
  FALSE: 'false',
} as const;

export type EdgeHandle = (typeof EDGE_HANDLES)[keyof typeof EDGE_HANDLES];

// Edge styling colors
export const EDGE_COLORS = {
  DEFAULT: '#888',
  TRUE: '#22c55e',
  FALSE: '#ef4444',
} as const;

// Edge labels
export const EDGE_LABELS = {
  TRUE: 'Yes',
  FALSE: 'No',
} as const;

// Node type identifiers
export const NODE_TYPES = {
  WORKFLOW: 'workflowNode',
  CONDITION: 'conditionNode',
  SET_TRIGGER: 'setTriggerButton',
} as const;

// Special node IDs
export const SPECIAL_NODE_IDS = {
  TRIGGER: 'trigger',
  SET_TRIGGER: 'set-trigger',
} as const;

// Condition node type name
export const CONDITION_NODE_TYPE = 'Condition';

/**
 * Get edge style properties based on the source handle type
 */
export function getEdgeStyleForHandle(sourceHandle: string | null | undefined): {
  stroke: string;
  label?: string;
  labelStyle?: { fill: string; fontWeight: number };
} {
  switch (sourceHandle) {
    case EDGE_HANDLES.TRUE:
      return {
        stroke: EDGE_COLORS.TRUE,
        label: EDGE_LABELS.TRUE,
        labelStyle: { fill: '#666', fontWeight: 500 },
      };
    case EDGE_HANDLES.FALSE:
      return {
        stroke: EDGE_COLORS.FALSE,
        label: EDGE_LABELS.FALSE,
        labelStyle: { fill: '#666', fontWeight: 500 },
      };
    default:
      return {
        stroke: EDGE_COLORS.DEFAULT,
      };
  }
}

/**
 * Create edge ID from source, handle, and target
 */
export function createEdgeId(
  source: string,
  sourceHandle: string | null | undefined,
  target: string
): string {
  return `${source}-${sourceHandle || EDGE_HANDLES.DEFAULT}-${target}`;
}

/**
 * Determine the ReactFlow node type based on node data
 */
export function getNodeTypeForData(nodeType: string | undefined): string {
  return nodeType === CONDITION_NODE_TYPE
    ? NODE_TYPES.CONDITION
    : NODE_TYPES.WORKFLOW;
}

/**
 * Drag data interface for node palette
 */
export interface DragData {
  nodeType: string;
  kind: 'Action' | 'Trigger';
}

export const DRAG_DATA_TYPE = 'application/reactflow';
