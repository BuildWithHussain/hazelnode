import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useConfirm } from '@/hooks/confirm';
import { useDocType } from '@/queries/frappe';
import { useNavigate } from '@tanstack/react-router';

import { Route as WorkflowDetailsRoute } from '@/routes/workflow.$id';

import WorkflowEditor from './editor';

export function WorkflowDetails() {
  const params = WorkflowDetailsRoute.useParams();
  const navigate = useNavigate();
  const confirm = useConfirm();

  const { useSuspenseDoc, useDeleteDocMutation } =
    useDocType<HazelWorkflow>('Hazel Workflow');
  const workflowDoc = useSuspenseDoc(params.id);
  const deleteWorkflowMutation = useDeleteDocMutation();

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
          <WorkflowEditor hazelNodes={hazelNodes} />
        </div>
      </div>
    </>
  );
}
