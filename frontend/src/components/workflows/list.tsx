import { toast } from 'sonner';
import { DocTypeQueryParams, useDocType } from '@/queries/frappe';
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

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import CreateWorkflowDialog from './create-dialog';

export const WorkflowList = () => {
  const [showNewWorkflowDialog, setShowNewWorkflowDialog] = useState(false);

  const queryClient = useQueryClient();

  const { useList, useSetValueMutation, getListOptions } =
    useDocType<HazelWorkflow>('Hazel Workflow');

  const listOptions: DocTypeQueryParams<HazelWorkflow> = {
    fields: ['title', 'name', 'enabled'],
    order_by: 'creation desc',
  };

  const workflowsList = useList(listOptions);
  const queryOptions = getListOptions(listOptions);

  const workflowSetValueMutation = useSetValueMutation();

  function toggleEnabled(wf: HazelWorkflow) {
    const currentWorkflows = queryClient.getQueryData(queryOptions.queryKey);

    if (!currentWorkflows) {
      return;
    }

    const updatedWorkflows = [];
    for (const workflow of currentWorkflows) {
      const newWorkflow = { ...workflow };
      if (workflow.name === wf.name) {
        newWorkflow.enabled = wf.enabled ? 0 : 1;
      }
      updatedWorkflows.push(newWorkflow);
    }
    queryClient.setQueryData(queryOptions.queryKey, updatedWorkflows);

    workflowSetValueMutation.mutate(
      {
        name: wf.name,
        values: {
          enabled: wf.enabled ? 0 : 1,
        },
      },
      {
        onSuccess: () => {
          toast.success(
            `Workflow ${wf.enabled ? 'disabled' : 'enabled'} successfully!`,
          );
        },
        onSettled: () => {
          queryClient.invalidateQueries({
            queryKey: queryOptions.queryKey,
          });
        },
      },
    );
  }

  if (workflowsList.isLoading) {
    return (
      <>
        <Skeleton className="w-[30%] h-8" />
        <Skeleton className="w-[50%] h-8 mt-2" />
      </>
    );
  }

  if (workflowsList.isError) {
    return <p>Error loading workflows list...</p>;
  }

  const workflows = workflowsList.data;

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center align-baseline">
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
