import React from 'react';
// import ReactFlow, {
//   MiniMap,
//   Controls,
//   Background,
//   useNodesState,
//   useEdgesState,
//   addEdge,
// } from "reactflow";

import { toast } from 'sonner';

import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';

// import '../app/globals.css';
// import "reactflow/dist/style.css";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useUserInfo } from './queries/user';
// import { Text } from "./components/ui/text";

// const initialNodes = [
//   { id: "1", position: { x: 0, y: 0 }, data: { label: "1" } },
//   { id: "2", position: { x: 0, y: 100 }, data: { label: "2" } },
// ];
// const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

// export default function App() {
//   const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
//   const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

//   const onConnect = useCallback(
//     (params) => setEdges((eds) => addEdge(params, eds)),
//     [setEdges],
//   );

//   return (
//     <div style={{ width: '90vw', height: '90vh' }}>
//       <ReactFlow
//         nodes={nodes}
//         edges={edges}
//         onNodesChange={onNodesChange}
//         onEdgesChange={onEdgesChange}
//         onConnect={onConnect}
//       >
//         <Controls />
//         <MiniMap />
//         <Background variant="dots" gap={12} size={1} />
//       </ReactFlow>
//     </div>
//   );
// }

export default function App() {
  const [isOpen, setIsOpen] = React.useState(false);
  const userQuery = useUserInfo();

  return (
    <>
      <div className="flex gap-4 items-center">
        <Button
          color="white"
          onClick={() =>
            toast('Workflow run successful', {
              description: 'Sunday, December 03, 2023 at 9:00 AM',
              action: {
                label: 'Details',
                onClick: () => console.log('Undo'),
              },
            })
          }
        >
          Show toast
        </Button>
        <Button color="lime" type="button" onClick={() => setIsOpen(true)}>
          Show Dialog
        </Button>

        <Checkbox color="lime" />
      </div>
      <Dialog open={isOpen} onClose={setIsOpen}>
        <DialogTitle>Refund payment</DialogTitle>
        <DialogDescription>
          The refund will be reflected in the customer’s bank account 2 to 3
          business days after processing.
        </DialogDescription>
        <DialogBody></DialogBody>
        <DialogActions>
          <Button plain onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button color="lime" onClick={() => setIsOpen(false)}>
            Refund
          </Button>
        </DialogActions>
      </Dialog>

      <div className="mt-5 flex gap-3">
        <Badge color="lime">documentation</Badge>
        <Badge color="purple">help wanted</Badge>
        <Badge color="rose">bug</Badge>
      </div>

      <div>
        <pre>{JSON.stringify(userQuery.data)}</pre>
      </div>
    </>
  );
}
