import { useFrappeGetDocList } from 'frappe-react-sdk';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CONDITION_NODE_TYPE,
  DRAG_DATA_TYPE,
  type DragData,
} from '@/constants/editor';

export function NodePalette() {
  const { data: nodeTypes, isLoading } = useFrappeGetDocList<HazelNodeType>(
    'Hazel Node Type',
    {
      fields: ['name', 'description', 'kind'],
      filters: [['kind', '=', 'Action']],
    }
  );

  const onDragStart = (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string,
    kind: 'Action' | 'Trigger'
  ) => {
    const data: DragData = { nodeType, kind };
    event.dataTransfer.setData(DRAG_DATA_TYPE, JSON.stringify(data));
    event.dataTransfer.effectAllowed = 'move';
  };

  if (isLoading) {
    return (
      <div className="p-3 space-y-2">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  const conditionNodes =
    nodeTypes?.filter((n) => n.name === CONDITION_NODE_TYPE) || [];
  const actionNodes =
    nodeTypes?.filter((n) => n.name !== CONDITION_NODE_TYPE) || [];

  return (
    <ScrollArea className="h-full">
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">
          Drag nodes to canvas
        </h3>

        {conditionNodes.length > 0 && (
          <div className="mb-4">
            <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
              Logic
            </h4>
            <div className="space-y-2">
              {conditionNodes.map((node) => (
                <PaletteNode
                  key={node.name}
                  name={node.name}
                  description={node.description}
                  kind="Action"
                  color="amber"
                  onDragStart={onDragStart}
                />
              ))}
            </div>
          </div>
        )}

        {actionNodes.length > 0 && (
          <div>
            <h4 className="text-xs font-medium text-gray-500 uppercase mb-2">
              Actions
            </h4>
            <div className="space-y-2">
              {actionNodes.map((node) => (
                <PaletteNode
                  key={node.name}
                  name={node.name}
                  description={node.description}
                  kind="Action"
                  color="zinc"
                  onDragStart={onDragStart}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </ScrollArea>
  );
}

interface PaletteNodeProps {
  name: string;
  description?: string;
  kind: 'Action' | 'Trigger';
  color: 'amber' | 'zinc' | 'lime';
  onDragStart: (
    event: React.DragEvent<HTMLDivElement>,
    nodeType: string,
    kind: 'Action' | 'Trigger'
  ) => void;
}

function PaletteNode({
  name,
  description,
  kind,
  color,
  onDragStart,
}: PaletteNodeProps) {
  return (
    <Card
      className="p-3 cursor-grab hover:shadow-md transition-shadow active:cursor-grabbing"
      draggable
      onDragStart={(e) => onDragStart(e, name, kind)}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm">{name}</span>
        <Badge color={color} className="text-xs">
          {name === CONDITION_NODE_TYPE ? 'Logic' : kind}
        </Badge>
      </div>
      {description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{description}</p>
      )}
    </Card>
  );
}
