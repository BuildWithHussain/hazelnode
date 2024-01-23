import React from 'react';
import { useDocType } from '@/queries/frappe';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function App() {
  const { useList } = useDocType<HazelWorkflow>('Hazel Workflow');

  const workflowsList = useList({
    fields: ['name', 'title', 'enabled'],
  });

  if (workflowsList.isLoading) {
    return <p>Loading workflows list...</p>;
  }

  if (workflowsList.isError) {
    return <p>Error loading workflows list...</p>;
  }

  const workflows = workflowsList.data;

  return (
    <Card className="max-w-[40%]">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Your Workflows</CardTitle>
          <Button color="lime">New Workflow</Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table className="[--gutter:theme(spacing.6)] sm:[--gutter:theme(spacing.8)]">
          <TableHead>
            <TableRow>
              <TableHeader>Name</TableHeader>
              <TableHeader>Enabled?</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody>
            {workflows.map((wf) => (
              <TableRow key={wf.name} href={'#'}>
                <TableCell className="font-medium">{wf.title}</TableCell>
                <TableCell>
                  <Switch color="lime" checked={!!wf.enabled} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
