import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import SetTriggerDialog from '@/components/workflows/set-trigger-dialog';
import { useDocType } from '@/queries/frappe';
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

  const { useDeleteDocMutation, useSetValueMutation } =
    useDocType<HazelWorkflow>('Hazel Workflow');

  const { useDoc } = useDocType<HazelNodeType>('Hazel Node Type');
  const triggerDoc = useDoc(hazelWorkflow.trigger_type || '');
  const actionDoc = useDoc(editorStore.selectedNode?.data.type || '')

  const navigate = useNavigate();
  const confirm = useConfirm();

  const [triggerFormState, setTriggerFormState] = useState<TriggerConfig>({});

  useEffect(() => {
    const initTriggerFormState: TriggerConfig = {};

    const initConfig = JSON.parse(hazelWorkflow.trigger_config);

    if (triggerDoc.data) {
      for (const param of triggerDoc.data?.params || []) {
        initTriggerFormState[param.fieldname] = initConfig[param.fieldname];
      }
    }
    setTriggerFormState(initTriggerFormState);
  }, [triggerDoc.data, hazelWorkflow]);

  const deleteWorkflowMutation = useDeleteDocMutation();
  const setValueWorkflowMutation = useSetValueMutation();
  const { useList } = useDocType<HazelNodeType>('Hazel Node Type');
  const [updateTriggerDialogOpen, setUpdateTriggerDialogOpen] = useState(false);

  const actionsList = useList({
    fields: ['name', 'description'],
    filters: {
      kind: 'Action',
    },
  });

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
        name: hazelWorkflow.name,
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

  async function handleSaveWorkflow() {
    const triggerConfig = JSON.stringify(triggerFormState);

    setValueWorkflowMutation.mutate(
      {
        name: hazelWorkflow.name,
        values: {
          trigger_config: triggerConfig,
        },
      },
      {
        onSuccess() {
          toast.success('Workflow Saved!');
        },
      },
    );
  }

  function addAction(node: EditorNodeData) {
    editorStore.appendNode(node);

    const serializedNodes = [];
    for (const node of editorStore.nodes) {
      const nodeData = node.data as EditorNodeData;

      serializedNodes.push({
        type: nodeData.type,
      });
    }

    serializedNodes.push({
      type: node.type,
    });
    // remove the first one, it is a trigger node
    serializedNodes.splice(0, 1);

    setValueWorkflowMutation.mutate({
      name: hazelWorkflow.name,
      values: {
        nodes: serializedNodes as HazelNode[],
      },
    });
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
      {(triggerDoc.data?.params || []).map((param) => {
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
            {actionsList.data?.map((node) => {
              return (
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
              );
            })}
          </div>
        </>
      )}
      <h2 className=" mt-4 text-xl font-bold text-gray-900">Action Settings</h2>
      {editorStore.selectedNode?.data.type}

      {actionDoc.data?.params?.map(param => {
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
              onChange={(v) => false /** TODO: set this in backend */
              }
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
