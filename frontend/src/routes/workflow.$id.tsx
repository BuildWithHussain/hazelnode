import { createFileRoute } from '@tanstack/react-router';
import { getDocQueryOptions } from '@/queries/frappe';
import { WorkflowDetails } from '@/components/workflows/details';

export const Route = createFileRoute('/workflow/$id')({
  component: WorkflowDetails,
  loader: ({ context, params }) => {
    return context.queryClient.ensureQueryData(
      getDocQueryOptions<HazelWorkflow>('Hazel Workflow', params.id),
    );
  },
});
