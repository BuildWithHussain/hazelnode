import { toast } from 'sonner';
import { useFrappeGetDocList, useFrappeUpdateDoc } from 'frappe-react-sdk';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useParams } from '@tanstack/react-router';
import { useEditorStore } from '@/stores/editor';

export default function SetTriggerDialog({
  open,
  onClose,
}: {
  open: boolean | undefined;
  onClose: (isOpen: boolean) => void;
}) {
  const editorStore = useEditorStore((state) => ({
    appendNode: state.appendNode,
    removeNode: state.removeNode,
    resetFlows: state.resetFlows
  }));

  const { id: workflowName } = useParams({ from: '/workflow/$id' });

  const { data: triggers, isLoading, error } = useFrappeGetDocList<HazelNodeType>(
    'Hazel Node Type',
    {
      filters: [['kind', '=', 'Trigger']],
      fields: ['name', 'description', 'preview_image'],
    }
  );

  const { updateDoc } = useFrappeUpdateDoc<HazelWorkflow>();

  async function setTrigger(trigger: HazelNodeType) {
    try {
      await updateDoc('Hazel Workflow', workflowName, {
        trigger_type: trigger.name,
      });
      editorStore.resetFlows();
      editorStore.appendNode({
        name: trigger.name,
        type: trigger.name,
        kind: 'Trigger'
      });
      onClose(false);
      toast.success('Trigger set successfully!');
    } catch {
      toast.error('Failed to set trigger');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-3xl"
        data-testid="set-trigger-dialog"
      >
        <DialogHeader>
          <DialogTitle>Select a trigger</DialogTitle>
          <DialogDescription>
            The event that will trigger a run of this workflow
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {isLoading && (
            <Skeleton className="h-12 w-full"></Skeleton>
          )}
          {error && (
            <span>Error fetching list of triggers...</span>
          )}

          {!error && triggers && (
            <ol className="flex flex-col gap-2">
              {triggers.map((trigger) => (
                <li key={trigger.name}>
                  <Button onClick={() => setTrigger(trigger)} color="fuchsia">
                    {trigger.name}
                  </Button>
                </li>
              ))}
            </ol>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
