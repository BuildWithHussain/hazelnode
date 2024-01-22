import '@/index.css';

import { Link, Outlet, rootRouteWithContext } from '@tanstack/react-router';
import { QueryClient } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';

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
  component: () => (
    <>
      <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>{' '}
        <Link to="/about" className="[&.active]:font-bold">
          About
        </Link>
      </div>
      <hr />
      <Outlet />
      <Toaster />
      <TanStackRouterDevtools position="bottom-right" />
      <ReactQueryDevtools buttonPosition="top-right" />
    </>
  ),
});
