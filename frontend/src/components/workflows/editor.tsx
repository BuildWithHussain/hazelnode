import 'reactflow/dist/style.css';

import { useCallback, useEffect, useMemo, useRef } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Connection,
  addEdge,
  MarkerType,
  ReactFlowInstance,
} from 'reactflow';

import WorkflowNode from '@/components/nodes/node';
import ConditionNode from '@/components/nodes/condition-node';
import { useEditorStore } from '@/stores/editor';
import { AddTriggerNode } from '@/components/nodes/add-trigger-node';
import { getProcessedNodes, getProcessedEdges } from '@/utils/editor';
import {
  NODE_TYPES,
  DRAG_DATA_TYPE,
  getEdgeStyleForHandle,
  createEdgeId,
  type DragData,
} from '@/constants/editor';

export default function WorkflowEditor({
  hazelWorkflow,
}: {
  hazelWorkflow: HazelWorkflow;
}) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  // Registering custom node types
  const nodeTypes = useMemo(
    () => ({
      [NODE_TYPES.WORKFLOW]: WorkflowNode,
      [NODE_TYPES.CONDITION]: ConditionNode,
      [NODE_TYPES.SET_TRIGGER]: AddTriggerNode,
    }),
    []
  );

  const editorStore = useEditorStore((state) => ({
    nodes: state.flowNodes,
    edges: state.flowEdges,
    onNodesChange: state.onFlowNodesChange,
    onEdgesChange: state.onFlowEdgesChange,
    setNodes: state.setFlowNodes,
    setEdges: state.setFlowEdges,
    addNodeAtPosition: state.addNodeAtPosition,
  }));

  useEffect(() => {
    const processedNodes = getProcessedNodes(hazelWorkflow);
    editorStore.setNodes(processedNodes);
    editorStore.setEdges(getProcessedEdges(hazelWorkflow, processedNodes));
  }, [hazelWorkflow.nodes, hazelWorkflow.connections]);

  const onConnect = useCallback(
    (connection: Connection) => {
      const styleProps = getEdgeStyleForHandle(connection.sourceHandle);
      const newEdge = {
        ...connection,
        id: createEdgeId(
          connection.source!,
          connection.sourceHandle,
          connection.target!
        ),
        markerEnd: { type: MarkerType.ArrowClosed },
        label: styleProps.label,
        labelStyle: styleProps.labelStyle,
        style: { stroke: styleProps.stroke },
      };
      // Use functional updater to avoid stale closure
      editorStore.setEdges((prevEdges) => addEdge(newEdge, prevEdges));
    },
    [editorStore.setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      const dataStr = event.dataTransfer.getData(DRAG_DATA_TYPE);

      if (!dataStr || !reactFlowBounds || !reactFlowInstance.current) {
        return;
      }

      try {
        const data: DragData = JSON.parse(dataStr);

        const position = reactFlowInstance.current.screenToFlowPosition({
          x: event.clientX - reactFlowBounds.left,
          y: event.clientY - reactFlowBounds.top,
        });

        editorStore.addNodeAtPosition(
          {
            type: data.nodeType,
            kind: data.kind,
          },
          position
        );
      } catch {
        console.error('Failed to parse drag data');
      }
    },
    [editorStore.addNodeAtPosition]
  );

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
  }, []);

  return (
    <div ref={reactFlowWrapper} className="h-full w-full">
      <ReactFlow
        className="h-full w-full"
        nodes={editorStore.nodes}
        edges={editorStore.edges}
        onNodesChange={editorStore.onNodesChange}
        onEdgesChange={editorStore.onEdgesChange}
        onConnect={onConnect}
        onInit={onInit}
        onDragOver={onDragOver}
        onDrop={onDrop}
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
    </div>
  );
}
