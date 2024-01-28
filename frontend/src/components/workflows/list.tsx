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
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogTitle,
} from '@/components/ui/dialog';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export const WorkflowList = () => {
  const [showNewWorkflowDialog, setShowNewWorkflowDialog] = useState(false);
  const [workflowTitle, setWorkflowTitle] = useState('');

  const { useList, useSetValueMutation, useCreateDocMutation, getListOptions } =
    useDocType<HazelWorkflow>('Hazel Workflow');

  const queryClient = useQueryClient();

  const listOptions: DocTypeQueryParams<HazelWorkflow> = {
    fields: ['title', 'name', 'enabled'],
    order_by: 'creation desc',
  };

  const workflowsList = useList(listOptions);
  const queryOptions = getListOptions(listOptions);

  const workflowSetValueMutation = useSetValueMutation();

  const createWorkflowMutation = useCreateDocMutation();

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

  function handleCreateWorkflow() {
    if (!workflowTitle) {
      // TODO: Show error in form itself
      toast.warning('Title is required!');
    }
    createWorkflowMutation.mutate(
      {
        title: workflowTitle,
      },
      {
        onSuccess: () => {
          setWorkflowTitle('');
          toast.success('Workflow created successfully!');
          setShowNewWorkflowDialog(false);
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
          <div className="flex justify-between items-center">
            <CardTitle>Your Workflows</CardTitle>
            <Button color="lime" onClick={() => setShowNewWorkflowDialog(true)}>
              New Workflow
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table className="[--gutter:theme(spacing.6)] sm:[--gutter:theme(spacing.8)]">
            <TableHead>
              <TableRow>
                <TableHeader>Name</TableHeader>
                <TableHeader align="right">Enabled?</TableHeader>
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

      <Dialog open={showNewWorkflowDialog} onClose={setShowNewWorkflowDialog}>
        <DialogTitle>Create new workflow</DialogTitle>

        <DialogBody>
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              value={workflowTitle}
              onChange={(v) => setWorkflowTitle(v.target.value)}
              type="text"
              id="title"
              placeholder="Send an email on form submit"
            />
          </div>
        </DialogBody>

        <DialogActions>
          <Button outline onClick={() => setShowNewWorkflowDialog(false)}>
            Cancel
          </Button>
          <Button color="lime" onClick={handleCreateWorkflow}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
