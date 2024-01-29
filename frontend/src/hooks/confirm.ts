import { useContext } from 'react';
import { ConfirmContext } from '@/components/common/confirm-dialog';

export function useConfirm() {
  return useContext(ConfirmContext);
}
