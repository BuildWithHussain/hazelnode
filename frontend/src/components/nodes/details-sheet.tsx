import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { createContext, useCallback, useState } from 'react';

export const SheetContext = createContext<{
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}>({
  isOpen: false,
  setOpen: () => {},
});

export function NodeDetailsSheetProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const setOpen = useCallback((open: boolean) => setIsOpen(open), []);

  return (
    <SheetContext.Provider value={{ isOpen, setOpen }}>
      {children}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Are you absolutely sure?</SheetTitle>
            <SheetDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </SheetContext.Provider>
  );
}
