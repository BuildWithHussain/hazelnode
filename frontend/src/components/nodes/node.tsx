// import { useCallback } from 'react';
import { Handle, NodeProps, Position } from 'reactflow';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PencilIcon } from 'lucide-react';
import { useSheet } from '@/hooks/node-sheet';

export default function WorkflowNode({ data, selected }: NodeProps<HazelNode>) {
  const { setOpen } = useSheet();

  return (
    <>
      <Card className={selected ? 'border-2 border-lime-400/80' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{data.type}</CardTitle>
            <Button onClick={() => setOpen(true)} plain>
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
