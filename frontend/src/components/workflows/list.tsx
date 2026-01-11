import { toast } from 'sonner';
import { useFrappeGetDocList, useFrappeUpdateDoc } from 'frappe-react-sdk';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useState } from 'react';
import CreateWorkflowDialog from './create-dialog';

export const WorkflowList = () => {
  const [showNewWorkflowDialog, setShowNewWorkflowDialog] = useState(false);

  const { data: workflows, isLoading, error, mutate } = useFrappeGetDocList<HazelWorkflow>(
    'Hazel Workflow',
    {
      fields: ['title', 'name', 'enabled'],
      orderBy: { field: 'creation', order: 'desc' },
    }
  );

  const { updateDoc } = useFrappeUpdateDoc<HazelWorkflow>();

  async function toggleEnabled(wf: HazelWorkflow) {
    const newEnabled = wf.enabled ? 0 : 1;

    // Optimistic update
    mutate(
      workflows?.map((workflow) =>
        workflow.name === wf.name ? { ...workflow, enabled: newEnabled } : workflow
      ),
      false
    );

    try {
      await updateDoc('Hazel Workflow', wf.name.toString(), {
        enabled: newEnabled,
      });
      toast.success(`Workflow ${wf.enabled ? 'disabled' : 'enabled'} successfully!`);
      mutate();
    } catch {
      mutate();
      toast.error('Failed to update workflow');
    }
  }

  if (isLoading) {
    return (
      <>
        <Skeleton className="h-8 w-[30%]" />
        <Skeleton className="mt-2 h-8 w-[50%]" />
      </>
    );
  }

  if (error) {
    return <p>Error loading workflows list...</p>;
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between align-baseline">
            <CardTitle>Your Workflows</CardTitle>
            <Button color="lime" onClick={() => setShowNewWorkflowDialog(true)}>
              New Workflow
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table
            dense
            className="[--gutter:theme(spacing.4)] sm:[--gutter:theme(spacing.2)]"
          >
            <TableHead>
              <TableRow>
                <TableHeader>Name</TableHeader>
                <TableHeader align="right">On/Off</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              {workflows?.map((wf) => (
                <TableRow
                  key={wf.name}
                  to="/workflow/$id"
                  params={{ id: wf.name }}
                >
                  <TableCell className="font-medium">{wf.title}</TableCell>
                  <TableCell align="right">
                    <Switch
                      color="lime"
                      onChange={() => toggleEnabled(wf)}
                      checked={!!wf.enabled}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <CreateWorkflowDialog
        open={showNewWorkflowDialog}
        onClose={setShowNewWorkflowDialog}
      />
    </>
  );
};
