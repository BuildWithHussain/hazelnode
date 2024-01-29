import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { getDocQueryOptions, useDocType } from '@/queries/frappe';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export const Route = createFileRoute('/workflow/$id')({
  component: WorkflowDetails,
  loader: ({ context, params }) => {
    return context.queryClient.ensureQueryData(
      getDocQueryOptions<HazelWorkflow>('Hazel Workflow', params.id),
    );
  },
});

function WorkflowDetails() {
  const params = Route.useParams();
  const navigate = useNavigate();

  const { useSuspenseDoc, useDeleteDocMutation } =
    useDocType<HazelWorkflow>('Hazel Workflow');
  const workflowDoc = useSuspenseDoc(params.id);
  const deleteWorkflowMutation = useDeleteDocMutation();

  function handleDeleteWorkflow() {
    // todo: ask for confirmation
    deleteWorkflowMutation.mutate(
      {
        name: params.id,
      },
      {
        onSuccess: () => {
          navigate({
            to: '/',
          });
          toast.success('Workflow deleted successfully!');
        },
      },
    );
  }

  return (
    <>
      <div className="p-2">
        <pre>{JSON.stringify(workflowDoc.data, null, 2)}</pre>
        <Button color="rose" onClick={handleDeleteWorkflow}>
          Delete Workflow
        </Button>
      </div>
    </>
  );
}
