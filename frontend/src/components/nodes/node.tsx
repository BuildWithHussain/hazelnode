// import { useCallback } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PencilIcon } from 'lucide-react';

export default function WorkflowNode({ data, selected }: NodeProps<HazelNode>) {
  return (
    <>
      <Card className={selected ? 'border-2 border-lime-400/80' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{data.type}</CardTitle>
            <Button plain>
              <PencilIcon size={16} />
            </Button>
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
