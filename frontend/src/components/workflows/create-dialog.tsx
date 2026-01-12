import { toast } from 'sonner';
import { useState } from 'react';
import { useFrappeCreateDoc } from 'frappe-react-sdk';

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useNavigate } from '@tanstack/react-router';

export default function CreateWorkflowDialog({
  open,
  onClose,
}: {
  open: boolean | undefined;
  onClose: (isOpen: boolean) => void;
}) {
  const [workflowTitle, setWorkflowTitle] = useState('');
  const navigate = useNavigate();

  const { createDoc, loading } = useFrappeCreateDoc();

  async function handleCreateWorkflow() {
    if (!workflowTitle) {
      toast.warning('Title is required!');
      return;
    }

    try {
      const doc = await createDoc('Hazel Workflow', {
        title: workflowTitle,
      });
      setWorkflowTitle('');
      toast.success('New workflow created!');
      onClose(false);
      navigate({
        to: '/workflow/$id',
        params: {
          id: String(doc.name),
        },
      });
    } catch {
      toast.error('Failed to create workflow');
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-lg"
        data-testid="create-workflow-dialog"
      >
        <DialogHeader>
          <DialogTitle>Create new workflow</DialogTitle>
        </DialogHeader>

        <div className="mt-4">
          <Label htmlFor="title">Title</Label>
          <Input
            value={workflowTitle}
            onChange={(v) => setWorkflowTitle(v.target.value)}
            type="text"
            id="title"
            placeholder="Send an email on form submit"
          />
        </div>

        <DialogFooter className="mt-6">
          <Button outline onClick={() => onClose(false)}>
            Cancel
          </Button>
          <Button color="lime" onClick={handleCreateWorkflow} disabled={loading}>
            {loading ? 'Creating...' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
