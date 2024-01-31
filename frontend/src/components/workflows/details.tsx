import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/confirm';
import { useDocType } from '@/queries/frappe';
import { useNavigate } from '@tanstack/react-router';

import { Route as WorkflowDetailsRoute } from '@/routes/workflow.$id';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
} from 'reactflow';

import type { Node } from 'reactflow';

import { useCallback, useMemo } from 'react';

import 'reactflow/dist/style.css';
import WorkflowNode from '@/components/nodes/node';
import { NodeDetailsSheetProvider } from '../nodes/details-sheet';

export function WorkflowDetails() {
  const params = WorkflowDetailsRoute.useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const { useSuspenseDoc, useDeleteDocMutation } =
    useDocType<HazelWorkflow>('Hazel Workflow');
  const workflowDoc = useSuspenseDoc(params.id);
  const deleteWorkflowMutation = useDeleteDocMutation();

  // Registering custom node types
  const nodeTypes = useMemo(
    () => ({
      workflowNode: WorkflowNode,
    }),
    [],
  );

  async function handleDeleteWorkflow() {
    const deleteConfirmed = await confirm({
      title: 'Delete Workflow',
      description: 'Are you sure?',
      actionType: 'danger',
    });

    if (!deleteConfirmed) {
      return;
    }

    deleteWorkflowMutation.mutate(
      {
        name: params.id,
      },
      {
        onSuccess: () => {
          navigate({
            to: '/',
          });
          toast.success('🗑️ Workflow deleted!');
        },
      },
    );
  }

  const hazelNodes = workflowDoc.data.nodes || [];
  const processedNodes: Array<Node<HazelNode>> = [];

  let currentY = 100;
  const stepY = 120;
  const centerX = 300;

  for (const node of hazelNodes) {
    processedNodes.push({
      id: node.name,
      position: { x: centerX, y: currentY },
      data: { ...node },
      type: 'workflowNode',
      draggable: false,
      focusable: true,
    });

    // layout vertically
    currentY += stepY;
  }

  const [nodes, setNodes, onNodesChange] = useNodesState(processedNodes || []);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  return (
    <>
      <div className="grid h-full w-full grid-cols-5 p-2">
        <div className="col-span-2 border-r-2 border-r-zinc-200">
          <pre>{JSON.stringify(workflowDoc.data, null, 2)}</pre>
          <Button color="rose" onClick={handleDeleteWorkflow}>
            Delete Workflow
          </Button>
        </div>

        <div className="col-span-3">
          <NodeDetailsSheetProvider>
            <ReactFlow
              className="h-full w-full"
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
            >
              <Controls position={'top-right'} />
              <MiniMap />
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
          </NodeDetailsSheetProvider>
        </div>
      </div>
    </>
  );
}
