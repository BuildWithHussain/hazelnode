import React from 'react';
import ReactDOM from 'react-dom/client';

import { routeTree } from './routeTree.gen';
import { RouterProvider, Router } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getSessionUserId } from '@/data/session';
const queryClient = new QueryClient();

const router = new Router({
  basepath: '/hazelnode',
  routeTree,
  defaultPreloadStaleTime: 0,
  context: {
    queryClient,
    sessionUser: getSessionUserId(),
  },
  defaultErrorComponent: () => <p>Something went wrong (from default error component)...</p>,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>,
);
