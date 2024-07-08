import { toast } from 'sonner';

import {
  Dialog,
  DialogDescription,
  DialogBody,
  DialogTitle,
} from '@/components/ui/catalyst-dialog';
import { type DialogProps as HeadlessDialogProps } from '@headlessui/react';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { DocTypeQueryParams, useDocType } from '@/queries/frappe';
import { useLoaderData } from '@tanstack/react-router';
import { useEditorStore } from '@/stores/editor';

export default function SetTriggerDialog({
  open,
  onClose,
}: {
  open: boolean | undefined;
  onClose: (isOpen: boolean) => void;
} & HeadlessDialogProps) {
  const { useList } = useDocType<HazelNodeType>('Hazel Node Type');
  const editorStore = useEditorStore((state) => ({
    appendNode: state.appendNode,
    removeNode: state.removeNode,
    resetFlows: state.resetFlows
  }));

  const { name: workflowName } = useLoaderData({
    from: '/workflow/$id',
  });

  const triggerListParams: DocTypeQueryParams<HazelNodeType> = {
    filters: {
      kind: 'Trigger',
    },
    fields: ['name', 'description', 'preview_image'],
  };

  const triggerNodesList = useList(triggerListParams);

  const { useSetValueMutation } = useDocType<HazelWorkflow>('Hazel Workflow');

  const setValue = useSetValueMutation();

  function setTrigger(trigger: HazelNodeType) {
    setValue.mutate(
      {
        name: workflowName.toString(),
        values: {
          trigger_type: trigger.name,
        },
      },
      {
        onSuccess() {
          editorStore.resetFlows();
          editorStore.appendNode({
            "name": trigger.name,
            "type": trigger.name,
            "kind": "Trigger"
          });
          onClose(false);
          toast.success('Trigger set successfully!');
        },
      },
    );
  }

  return (
    <Dialog open={open} onClose={onClose} size="3xl">
      <DialogTitle>Select a trigger</DialogTitle>
      <DialogDescription>
        The event that will trigger a run of this workflow
      </DialogDescription>

      <DialogBody>
        {triggerNodesList.isLoading && (
          <Skeleton className="h-12 w-full"></Skeleton>
        )}
        {triggerNodesList.isError && (
          <span>Error fetching list of triggers...</span>
        )}

        {!triggerNodesList.isError && triggerNodesList.data && (
          <ol className="flex flex-col gap-2">
            {triggerNodesList.data?.map((trigger) => {
              return (
                <li key={trigger.name}>
                  <Button onClick={() => setTrigger(trigger)} color="fuchsia">
                    {trigger.name}
                  </Button>
                </li>
              );
            })}
          </ol>
        )}
      </DialogBody>
    </Dialog>
  );
}
