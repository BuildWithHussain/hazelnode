import { createFileRoute } from '@tanstack/react-router';
import { WorkflowDetails } from '@/components/workflows/details';

export const Route = createFileRoute('/workflow/$id')({
  component: WorkflowDetails,
});
