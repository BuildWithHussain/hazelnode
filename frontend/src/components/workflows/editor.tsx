import 'reactflow/dist/style.css';

import { useCallback, useEffect, useMemo } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Connection,
  addEdge,
  MarkerType,
} from 'reactflow';

import WorkflowNode from '@/components/nodes/node';
import ConditionNode from '@/components/nodes/condition-node';
import { useEditorStore } from '@/stores/editor';
import { AddTriggerNode } from '@/components/nodes/add-trigger-node';
import { getProcessedNodes, getProcessedEdges } from '@/utils/editor';

export default function WorkflowEditor({
  hazelWorkflow,
}: {
  hazelWorkflow: HazelWorkflow;
}) {
  // Registering custom node types
  const nodeTypes = useMemo(
    () => ({
      workflowNode: WorkflowNode,
      conditionNode: ConditionNode,
      setTriggerButton: AddTriggerNode,
    }),
    [],
  );

  const editorStore = useEditorStore((state) => ({
    nodes: state.flowNodes,
    edges: state.flowEdges,
    onNodesChange: state.onFlowNodesChange,
    onEdgesChange: state.onFlowEdgesChange,
    setNodes: state.setFlowNodes,
    setEdges: state.setFlowEdges,
  }));

  useEffect(() => {
    const processedNodes = getProcessedNodes(hazelWorkflow);
    editorStore.setNodes(processedNodes);
    editorStore.setEdges(getProcessedEdges(hazelWorkflow, processedNodes));
  }, [hazelWorkflow.nodes, hazelWorkflow.connections]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdge = {
        ...connection,
        id: `${connection.source}-${connection.sourceHandle || 'default'}-${connection.target}`,
        markerEnd: { type: MarkerType.ArrowClosed },
        label: connection.sourceHandle === 'true' ? 'Yes' : connection.sourceHandle === 'false' ? 'No' : undefined,
        labelStyle: { fill: '#666', fontWeight: 500 },
        style: {
          stroke: connection.sourceHandle === 'true' ? '#22c55e' : connection.sourceHandle === 'false' ? '#ef4444' : '#888',
        },
      };
      editorStore.setEdges(addEdge(newEdge, editorStore.edges));
    },
    [editorStore.edges],
  );

  return (
    <ReactFlow
      className="h-full w-full"
      nodes={editorStore.nodes}
      edges={editorStore.edges}
      onNodesChange={editorStore.onNodesChange}
      onEdgesChange={editorStore.onEdgesChange}
      onConnect={onConnect}
      nodeTypes={nodeTypes}
      defaultEdgeOptions={{
        markerEnd: { type: MarkerType.ArrowClosed },
      }}
      fitView
      fitViewOptions={{ padding: 0.2 }}
    >
      <Controls position={'top-right'} />
      <Background
        className="bg-zinc-50"
        variant={BackgroundVariant.Dots}
        gap={18}
        size={1}
      />
    </ReactFlow>
  );
}
