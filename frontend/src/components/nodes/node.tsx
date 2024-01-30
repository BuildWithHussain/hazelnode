// import { useCallback } from 'react';
import { Handle, Position } from 'reactflow';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from '../ui/button';

export default function WorkflowNode({ data }: { data: HazelNode }) {
  return (
    <>
      <Card>
        <CardTitle className="p-3 flex justify-between items-center">
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
