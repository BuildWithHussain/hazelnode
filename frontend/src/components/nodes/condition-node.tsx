import { Handle, NodeProps, Position, useOnSelectionChange } from 'reactflow';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { useEditorStore } from '@/stores/editor';
import { EditorNodeData } from './node';

export default function ConditionNode({
  id,
  data,
  selected,
}: NodeProps<EditorNodeData>) {
  const editorStore = useEditorStore((state) => ({
    setSelectedNode: state.setSelectedNode,
  }));

  useOnSelectionChange({
    onChange: ({ nodes }) => {
      for (const node of nodes) {
        if (node.id === id) {
          editorStore.setSelectedNode(node);
          break;
        }
      }
    },
  });

  return (
    <>
      <Card
        className={`${selected ? 'border-2 border-amber-400/80' : ''} rotate-0`}
        style={{ minWidth: '16rem' }}
      >
        <CardHeader className="py-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {data.type}
              <Badge className="ml-2" color="amber">
                Condition
              </Badge>
            </CardTitle>
          </div>
        </CardHeader>
      </Card>

      {/* Input handle */}
      <Handle
        type="target"
        position={Position.Top}
        className="!bg-gray-400 !w-3 !h-3"
      />

      {/* True output (left) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="true"
        className="!bg-green-500 !w-3 !h-3 !-translate-x-8"
        style={{ left: '30%' }}
      />

      {/* False output (right) */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="false"
        className="!bg-red-500 !w-3 !h-3 !translate-x-8"
        style={{ left: '70%' }}
      />

      {/* Labels for handles */}
      <div className="absolute -bottom-5 left-0 right-0 flex justify-between px-8 text-xs text-gray-500">
        <span className="text-green-600 font-medium">Yes</span>
        <span className="text-red-600 font-medium">No</span>
      </div>
    </>
  );
}
