import { PencilIcon } from 'lucide-react';
import { Handle, NodeProps, Position, useOnSelectionChange } from 'reactflow';
import { Button } from '@/components/ui/button';
import { useSheet } from '@/hooks/node-sheet';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default function WorkflowNode({ data, selected }: NodeProps<HazelNode>) {
  const { setOpen } = useSheet();
  useOnSelectionChange({
    onChange: ({ nodes }) => {
      for (const node of nodes) {
        if (node.id === data.name) {
          setOpen(true, data);
        }
      }
    },
  });

  return (
    <>
      <Card
        className={selected ? 'border-2 border-lime-400/80' : ''}
        style={{ minWidth: '24rem' }}
      >
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {data.type}
              <Badge
                className="ml-2"
                color={data.kind == 'Trigger' ? 'lime' : 'zinc'}
              >
                {data.kind}
              </Badge>
            </CardTitle>
            <Button onClick={() => setOpen(true, data)} plain>
              <PencilIcon size={16} />
            </Button>
          </div>
        </CardHeader>
        {/* {selected && (
          <CardContent>
          </CardContent>
        )} */}
      </Card>
      <Handle type="source" position={Position.Bottom} />
      <Handle type="target" position={Position.Top} />
    </>
  );
}
