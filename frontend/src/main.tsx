import React from 'react';
import ReactDOM from 'react-dom/client';
import { FrappeProvider } from 'frappe-react-sdk';

import { routeTree } from './routeTree.gen';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { getSessionUserId } from '@/data/session';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialogProvider } from './components/common/confirm-dialog';

const router = createRouter({
  basepath: '/hazelnode',
  routeTree,
  defaultPreloadStaleTime: 0,
  context: {
    sessionUser: getSessionUserId(),
  },
  defaultErrorComponent: () => (
    <p>Something went wrong (from default error component)...</p>
  ),
  defaultPendingComponent: () => (
    <div className="p-1">
      <Skeleton className="h-8 w-[30%]" />
      <Skeleton className="mt-2 h-8 w-[50%]" />
    </div>
  ),
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <FrappeProvider>
      <ConfirmDialogProvider>
        <RouterProvider router={router} />
      </ConfirmDialogProvider>
    </FrappeProvider>
  </React.StrictMode>,
);
