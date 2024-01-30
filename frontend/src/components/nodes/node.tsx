// import { useCallback } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function WorkflowNode({ data }: NodeProps<HazelNode>) {
  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{data.type}</CardTitle>
            <Button outline>Edit</Button>
          </div>
        </CardHeader>
        <CardContent>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </CardContent>
      </Card>
      <Handle type="target" position={Position.Bottom} />
    </>
  );
}
