import { Handle, NodeProps, Position } from 'reactflow';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircleIcon } from 'lucide-react';
import {
  Dialog,
  DialogActions,
  DialogBody,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { useState } from 'react';

export default function AddNewNode({ selected }: NodeProps<HazelNode>) {
  const [showDialog, setShowDialog] = useState(false);
  return (
    <>
      <Card
        className={selected ? 'border-2 border-lime-400/80' : ''}
        style={{ minWidth: '24rem' }}
      >
        <div className="grid place-content-center py-2">
          <Button plain onClick={() => setShowDialog(true)}>
            <PlusCircleIcon />
          </Button>
        </div>
      </Card>
      <Handle type="target" position={Position.Top} />
      <Dialog open={showDialog} onClose={setShowDialog} size="3xl">
        <DialogTitle>Add Action</DialogTitle>
        <DialogDescription>
          Choose a node to add to your workflow
        </DialogDescription>
        <DialogBody></DialogBody>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)} outline>
            Cancel
          </Button>
          <Button color="lime">Add</Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
