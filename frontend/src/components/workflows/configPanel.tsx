import {
  useFrappeGetDoc,
  useFrappeGetDocList,
  useFrappeUpdateDoc,
  useFrappeDeleteDoc,
} from 'frappe-react-sdk';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import SetTriggerDialog from '@/components/workflows/set-trigger-dialog';
import { useEffect, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useConfirm } from '@/hooks/confirm';
import { toast } from 'sonner';
import { useEditorStore } from '@/stores/editor';
import { EditorNodeData } from '../nodes/node';
import { DocTypeAutoComplete } from '../common/doctype-autocomplete';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


interface TriggerConfig {
  [index: string]: string;
}

export function WorkflowConfigPanel({
  hazelWorkflow,
}: {
  hazelWorkflow: HazelWorkflow;
}) {
  const editorStore = useEditorStore((state) => ({
    nodes: state.flowNodes,
    appendNode: state.appendNode,
    selectedNode: state.selectedNode,
  }));

  const { data: triggerDoc } = useFrappeGetDoc<HazelNodeType>(
    'Hazel Node Type',
    hazelWorkflow.trigger_type || '',
    {
      revalidateOnFocus: false,
    }
  );

  const { data: actionDoc } = useFrappeGetDoc<HazelNodeType>(
    'Hazel Node Type',
    editorStore.selectedNode?.data.type || '',
    {
      revalidateOnFocus: false,
    }
  );

  const { data: actions } = useFrappeGetDocList<HazelNodeType>(
    'Hazel Node Type',
    {
      fields: ['name', 'description'],
      filters: [['kind', '=', 'Action']],
    }
  );

  const { updateDoc } = useFrappeUpdateDoc<HazelWorkflow>();
  const { deleteDoc } = useFrappeDeleteDoc();

  const navigate = useNavigate();
  const confirm = useConfirm();

  const [triggerFormState, setTriggerFormState] = useState<TriggerConfig>({});
  const [updateTriggerDialogOpen, setUpdateTriggerDialogOpen] = useState(false);

  useEffect(() => {
    const initTriggerFormState: TriggerConfig = {};
    const initConfig = hazelWorkflow.trigger_config
      ? JSON.parse(hazelWorkflow.trigger_config)
      : {};

    if (triggerDoc) {
      for (const param of triggerDoc.params || []) {
        initTriggerFormState[param.fieldname] = initConfig[param.fieldname];
      }
    }
    setTriggerFormState(initTriggerFormState);
  }, [triggerDoc, hazelWorkflow]);

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

    try {
      await updateDoc('Hazel Workflow', hazelWorkflow.name.toString(), {
        trigger_config: triggerConfig,
      });
      toast.success('Workflow Saved!');
    } catch {
      toast.error('Failed to save workflow');
    }
  }

  async function addAction(node: EditorNodeData) {
    editorStore.appendNode(node);

    const serializedNodes = [];
    for (const flowNode of editorStore.nodes) {
      const nodeData = flowNode.data as EditorNodeData;
      serializedNodes.push({
        type: nodeData.type,
      });
    }

    serializedNodes.push({
      type: node.type,
    });
    // remove the first one, it is a trigger node
    serializedNodes.splice(0, 1);

    try {
      await updateDoc('Hazel Workflow', hazelWorkflow.name.toString(), {
        nodes: serializedNodes as unknown as HazelNode[],
      });
    } catch {
      toast.error('Failed to add action');
    }
  }

  return (
    <ScrollArea  className="h-full p-3">
      <strong>{hazelWorkflow.title}</strong>
      <ul>
        {hazelWorkflow.trigger_type && (
          <li>
            Trigger: {hazelWorkflow.trigger_type}
            <Button
              onClick={() => setUpdateTriggerDialogOpen(true)}
              outline={true}
            >
              Change
            </Button>
          </li>
        )}
      </ul>
      {(triggerDoc?.params || []).map((param) => {
        return (
          <div key={param.name}>
            <Label htmlFor={param.fieldname}>{param.label}</Label>

            {param.fieldtype === "Link" && <DocTypeAutoComplete
             onChange={(v) =>
              setTriggerFormState({
                ...triggerFormState,
                [param.fieldname]: v,
              })}
             doctype='DocType' />}

            {param.fieldtype === "Select" &&
              <Select
                value={triggerFormState[param.fieldname]}
                onValueChange={(v) =>
                  setTriggerFormState({
                    ...triggerFormState,
                    [param.fieldname]: v,
                  })
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Event" />
                </SelectTrigger>
                <SelectContent>
                  {param.options?.split("\n").map((option) => {
                    return <SelectItem value={option}>{ option }</SelectItem>
                  })}


                </SelectContent>
            </Select>
            }
            {param.fieldtype === "Data" &&
              <Input
              value={triggerFormState[param.fieldname]}
              onChange={(v) =>
                setTriggerFormState({
                  ...triggerFormState,
                  [param.fieldname]: v.target.value,
                })
              }
              type="text"
              name={param.fieldname}
            />
            }
          </div>
        );
      })}

      <SetTriggerDialog
        open={updateTriggerDialogOpen}
        onClose={setUpdateTriggerDialogOpen}
      />
      <Button color="white" onClick={handleSaveWorkflow}>
        Save
      </Button>
      <br />
      <Button color="rose" onClick={handleDeleteWorkflow}>
        Delete Workflow
      </Button>
      {hazelWorkflow.trigger_type && (
        <>
          <h2 className=" mt-4 text-xl font-bold text-gray-900">Actions</h2>
          <div className="mt-1 flex flex-col gap-2">
            {actions?.map((node) => (
              <Button
                key={node.name}
                color="yellow"
                onClick={() =>
                  addAction({
                    name: node.name,
                    type: node.name,
                    kind: 'Action',
                  })
                }
              >
                {node.name}
              </Button>
            ))}
          </div>
        </>
      )}
      <h2 className=" mt-4 text-xl font-bold text-gray-900">Action Settings</h2>
      {editorStore.selectedNode?.data.type}

      {actionDoc?.params?.map(param => {
         return (
          <div key={param.name}>
            <Label htmlFor={param.fieldname}>{param.label}</Label>

            {param.fieldtype === "Link" && <DocTypeAutoComplete
             onChange={(v) =>
              setTriggerFormState({
                ...triggerFormState,
                [param.fieldname]: v,
              })}
             doctype='DocType' />}

            {param.fieldtype === "Select" &&
              <Select
                value={triggerFormState[param.fieldname]}
                onValueChange={(v) =>
                  setTriggerFormState({
                    ...triggerFormState,
                    [param.fieldname]: v,
                  })
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Event" />
                </SelectTrigger>
                <SelectContent>
                  {param.options?.split("\n").map((option) => {
                    return <SelectItem value={option}>{ option }</SelectItem>
                  })}


                </SelectContent>
            </Select>
            }
            {param.fieldtype === "Data" &&
              <Input
              value={triggerFormState[param.fieldname]}
              onChange={() => { /* TODO: set this in backend */ }}
              type="text"
              name={param.fieldname}
            />
            }
          </div>
        );
      })}
    </ScrollArea>
  );
}
