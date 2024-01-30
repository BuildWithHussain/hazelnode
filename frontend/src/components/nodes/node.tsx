// import { useCallback } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function WorkflowNode({ data }: NodeProps<HazelNode>) {
  return (
    <>
      <Card>
        <CardTitle className="flex items-center justify-between p-3">
          <p>{data.type}</p>
          <Button outline>Edit</Button>
        </CardTitle>
        <CardContent>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </CardContent>
      </Card>
      <Handle type="target" position={Position.Bottom} />
    </>
  );
}
