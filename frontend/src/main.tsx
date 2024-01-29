import React from 'react';
import ReactDOM from 'react-dom/client';

import { routeTree } from './routeTree.gen';
import { RouterProvider, createRouter } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getSessionUserId } from '@/data/session';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmDialogProvider } from './components/common/confirm-dialog';

const queryClient = new QueryClient();

const router = createRouter({
  basepath: '/hazelnode',
  routeTree,
  defaultPreloadStaleTime: 0,
  context: {
    queryClient,
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
    <QueryClientProvider client={queryClient}>
      <ConfirmDialogProvider>
        <RouterProvider router={router} />
      </ConfirmDialogProvider>
    </QueryClientProvider>
  </React.StrictMode>,
);
