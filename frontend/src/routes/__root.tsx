import '@/index.css';

import { QueryClient } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { Link, Outlet, rootRouteWithContext } from '@tanstack/react-router';
import { options as userQueryOptions } from '@/queries/user';

// Dev Tools (does not get bundled in production)
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

export const Route = rootRouteWithContext<{
  queryClient: QueryClient;
  sessionUser: string | null;
}>()({
  beforeLoad: async ({ location, context }) => {
    if (!context.sessionUser) {
      window.location.href = '/login?redirect-to=' + location.pathname;
    }
  },
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(userQueryOptions);
  },
  pendingComponent: () => <p>User Data loading pending...</p>,
  errorComponent: () => <p>User Data loading failed...</p>,
  component: () => (
    <>
      <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>
      </div>
      <hr />

      <div className="p-2">
        <Outlet />
      </div>
      <Toaster />
      <TanStackRouterDevtools position="bottom-right" />
      <ReactQueryDevtools buttonPosition="top-right" />
    </>
  ),
});
