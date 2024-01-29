import { createContext, useCallback, useRef, useState } from 'react';
import {
  Dialog,
  DialogActions,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ConfirmOptions {
  isOpen?: boolean;
  actionType?: 'danger' | 'warning' | 'primary';
  title?: string;
  description?: string;
}

export const ConfirmContext = createContext<
  (data: ConfirmOptions) => Promise<boolean>
>(() => Promise.resolve(false));

export function ConfirmDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, setState] = useState<ConfirmOptions>({
    isOpen: false,
    title: '',
  });

  const fn = useRef<(choice: boolean) => void>();

  const confirm = useCallback(
    (data: ConfirmOptions) => {
      return new Promise((resolve: (value: boolean) => void) => {
        setState({ ...data, isOpen: true });
        fn.current = (choice: boolean) => {
          resolve(choice);
          setState({ ...data, isOpen: false });
        };
      });
    },
    [setState],
  );

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <Dialog
        size="sm"
        open={state.isOpen}
        onClose={() => fn.current && fn.current(false)}
      >
        <DialogTitle>{state.title}</DialogTitle>

        {state.description && (
          <DialogDescription>{state.description}</DialogDescription>
        )}

        <DialogActions>
          <Button outline onClick={() => fn.current && fn.current(false)}>
            Cancel
          </Button>
          <Button
            color={
              state.actionType == 'danger'
                ? 'rose'
                : state.actionType == 'warning'
                  ? 'yellow'
                  : 'lime'
            }
            onClick={() => fn.current && fn.current(true)}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </ConfirmContext.Provider>
  );
}
