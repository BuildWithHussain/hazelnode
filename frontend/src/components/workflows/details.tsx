import { useFrappeGetDoc } from 'frappe-react-sdk';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';

import WorkflowEditor from '@/components/workflows/editor';
import { Route as WorkflowDetailsRoute } from '@/routes/workflow.$id';
import { WorkflowConfigPanel } from '@/components/workflows/configPanel';
import { NodePalette } from '@/components/workflows/node-palette';
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
        <ResizablePanel defaultSize={15} minSize={10} maxSize={25}>
          <div className="h-full border-r bg-gray-50/50">
            <div className="p-3 border-b">
              <h2 className="font-semibold text-sm">Node Palette</h2>
            </div>
            <NodePalette />
          </div>
        </ResizablePanel>
        <ResizableHandle />
        <ResizablePanel defaultSize={55}>
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
