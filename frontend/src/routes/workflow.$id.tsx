import { createFileRoute } from '@tanstack/react-router';
import { getDocQueryOptions, useDocType } from '@/queries/frappe';

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
  const { useSuspenseDoc } = useDocType<HazelWorkflow>('Hazel Workflow');
  const workflowDoc = useSuspenseDoc(params.id);

  return (
    <>
      <div>
        <pre>{JSON.stringify(workflowDoc.data, null, 2)}</pre>
      </div>
    </>
  );
}
