import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { createContext, useCallback, useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '../ui/badge';

export const SheetContext = createContext<{
  isOpen: boolean;
  setOpen: (open: boolean, node: HazelNode) => void;
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
  const [node, setNode] = useState<HazelNode | null>(null);

  const setOpen = useCallback((open: boolean, node: HazelNode) => {
    setIsOpen(open);
    setNode(node);
  }, []);

  return (
    <SheetContext.Provider value={{ isOpen, setOpen }}>
      {children}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="min-w-[40rem]">
          <SheetHeader>
            <SheetTitle>
              <div className="flex items-center">
                {node?.type}
                <Badge
                  color={node?.kind == 'Trigger' ? 'lime' : 'zinc'}
                  className="ml-2"
                >
                  {node?.kind}
                </Badge>
              </div>
            </SheetTitle>
            <Separator className="my-4" />
            <SheetDescription>
              <pre>{JSON.stringify(node, null, 2)}</pre>
            </SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>
    </SheetContext.Provider>
  );
}
