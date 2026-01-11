import {
  useFrappeGetDoc,
  useFrappeUpdateDoc,
  useFrappeDeleteDoc,
} from 'frappe-react-sdk';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import SetTriggerDialog from '@/components/workflows/set-trigger-dialog';
import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useConfirm } from '@/hooks/confirm';
import { toast } from 'sonner';
import { useEditorStore } from '@/stores/editor';
import { nodesToHazelNodes, edgesToHazelConnections } from '@/utils/editor';
import { ParamForm } from '@/components/common/param-field';

type FormState = Record<string, string>;

export function WorkflowConfigPanel({
  hazelWorkflow,
}: {
  hazelWorkflow: HazelWorkflow;
}) {
  const editorStore = useEditorStore((state) => ({
    nodes: state.flowNodes,
    edges: state.flowEdges,
    selectedNode: state.selectedNode,
    updateNodeData: state.updateNodeData,
  }));

  const { data: triggerDoc } = useFrappeGetDoc<HazelNodeType>(
    'Hazel Node Type',
    hazelWorkflow.trigger_type || undefined,
    {
      revalidateOnFocus: false,
    }
  );

  const { data: actionDoc } = useFrappeGetDoc<HazelNodeType>(
    'Hazel Node Type',
    editorStore.selectedNode?.data.type || undefined,
    {
      revalidateOnFocus: false,
    }
  );

  const { updateDoc } = useFrappeUpdateDoc<HazelWorkflow>();
  const { deleteDoc } = useFrappeDeleteDoc();

  const navigate = useNavigate();
  const confirm = useConfirm();

  const [triggerFormState, setTriggerFormState] = useState<FormState>({});
  const [actionFormState, setActionFormState] = useState<FormState>({});
  const [updateTriggerDialogOpen, setUpdateTriggerDialogOpen] = useState(false);

  // Initialize trigger form state
  useEffect(() => {
    const initState: FormState = {};
    let savedConfig: Record<string, string> = {};

    if (hazelWorkflow.trigger_config) {
      try {
        savedConfig = JSON.parse(hazelWorkflow.trigger_config);
      } catch {
        console.error('Failed to parse trigger_config JSON');
      }
    }

    if (triggerDoc) {
      for (const param of triggerDoc.params || []) {
        initState[param.fieldname] = savedConfig[param.fieldname] || '';
      }
    }
    setTriggerFormState(initState);
  }, [triggerDoc, hazelWorkflow]);

  // Initialize action form state when selected node changes
  useEffect(() => {
    const initState: FormState = {};
    const savedParams = editorStore.selectedNode?.data?.parameters;

    if (actionDoc) {
      for (const param of actionDoc.params || []) {
        const savedParam = Array.isArray(savedParams)
          ? savedParams.find(
              (p: { fieldname: string }) => p.fieldname === param.fieldname
            )
          : null;
        initState[param.fieldname] = savedParam?.value || '';
      }
    }
    setActionFormState(initState);
  }, [actionDoc, editorStore.selectedNode]);

  const handleTriggerFieldChange = (fieldname: string, value: string) => {
    setTriggerFormState((prev) => ({ ...prev, [fieldname]: value }));
  };

  const handleActionFieldChange = (fieldname: string, value: string) => {
    setActionFormState((prev) => {
      const newState = { ...prev, [fieldname]: value };

      // Persist to editor store immediately
      if (editorStore.selectedNode) {
        const parameters = Object.entries(newState).map(([fn, val]) => ({
          fieldname: fn,
          value: val,
        }));
        editorStore.updateNodeData(editorStore.selectedNode.id, { parameters });
      }

      return newState;
    });
  };

  async function handleDeleteWorkflow() {
    const deleteConfirmed = await confirm({
      title: 'Delete Workflow',
      description: 'Are you sure?',
      actionType: 'danger',
    });

    if (!deleteConfirmed) {
      return;
    }

    try {
      await deleteDoc('Hazel Workflow', hazelWorkflow.name.toString());
      navigate({ to: '/' });
      toast.success('Workflow deleted!');
    } catch {
      toast.error('Failed to delete workflow');
    }
  }

  async function handleSaveWorkflow() {
    const triggerConfig = JSON.stringify(triggerFormState);
    const nodes = nodesToHazelNodes(editorStore.nodes);
    const connections = edgesToHazelConnections(editorStore.edges);

    try {
      await updateDoc('Hazel Workflow', hazelWorkflow.name.toString(), {
        trigger_config: triggerConfig,
        nodes: nodes as unknown as HazelNode[],
        connections: connections as unknown as HazelNodeConnection[],
      });
      toast.success('Workflow Saved!');
    } catch {
      toast.error('Failed to save workflow');
    }
  }

  return (
    <ScrollArea className="h-full p-3">
      <h2 className="text-lg font-semibold mb-3">{hazelWorkflow.title}</h2>

      {/* Trigger Section */}
      {hazelWorkflow.trigger_type && (
        <section className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">
              Trigger: <strong>{hazelWorkflow.trigger_type}</strong>
            </span>
            <Button
              onClick={() => setUpdateTriggerDialogOpen(true)}
              outline={true}
              className="text-xs"
            >
              Change
            </Button>
          </div>

          {triggerDoc?.params && triggerDoc.params.length > 0 && (
            <ParamForm
              params={triggerDoc.params}
              values={triggerFormState}
              onChange={handleTriggerFieldChange}
            />
          )}
        </section>
      )}

      <SetTriggerDialog
        open={updateTriggerDialogOpen}
        onClose={setUpdateTriggerDialogOpen}
      />

      {/* Action Buttons */}
      <div className="flex gap-2 mb-4">
        <Button color="white" onClick={handleSaveWorkflow}>
          Save
        </Button>
        <Button color="rose" onClick={handleDeleteWorkflow}>
          Delete
        </Button>
      </div>

      {/* Action Settings Section */}
      {editorStore.selectedNode && (
        <section className="border-t pt-4">
          <h3 className="text-md font-semibold text-gray-900 mb-2">
            Action Settings
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {editorStore.selectedNode.data.type}
          </p>

          {actionDoc?.params && actionDoc.params.length > 0 && (
            <ParamForm
              params={actionDoc.params}
              values={actionFormState}
              onChange={handleActionFieldChange}
            />
          )}
        </section>
      )}
    </ScrollArea>
  );
}
