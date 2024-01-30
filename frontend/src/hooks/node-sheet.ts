import { SheetContext } from '@/components/nodes/details-sheet';
import { useContext } from 'react';

export function useSheet() {
  return useContext(SheetContext);
}
