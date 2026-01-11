import { useFrappeGetDoc } from 'frappe-react-sdk';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

import WorkflowEditor from '@/components/workflows/editor';
import { Route as WorkflowDetailsRoute } from '@/routes/workflow.$id';
import { WorkflowConfigPanel } from '@/components/workflows/configPanel';
import { Skeleton } from '@/components/ui/skeleton';

export function WorkflowDetails() {
  const params = WorkflowDetailsRoute.useParams();

  const { data: workflow, isLoading, error } = useFrappeGetDoc<HazelWorkflow>(
    'Hazel Workflow',
    params.id
  );

  if (isLoading) {
    return (
      <div className="p-4">
        <Skeleton className="h-8 w-[30%]" />
        <Skeleton className="mt-2 h-[400px] w-full" />
      </div>
    );
  }

  if (error || !workflow) {
    return <p className="p-4">Error loading workflow...</p>;
  }

  return (
    <div className="h-full w-full">
      <ResizablePanelGroup direction="horizontal">
        <ResizablePanel defaultSize={70}>
          <WorkflowEditor hazelWorkflow={workflow} />
        </ResizablePanel>
        <ResizableHandle withHandle />
        <ResizablePanel defaultSize={30}>
          <WorkflowConfigPanel hazelWorkflow={workflow} />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}
