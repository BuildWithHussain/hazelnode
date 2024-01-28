import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/workflow/$id')({
  component: WorkflowDetails,
});

function WorkflowDetails() {
  const params = Route.useParams();
  return (
    <>
      <h1>Workflow {params.id}</h1>
    </>
  );
}
