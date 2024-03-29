import '@/index.css';

import { QueryClient } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import {
  ErrorComponent,
  Link,
  Outlet,
  rootRouteWithContext,
} from '@tanstack/react-router';
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
  loader: ({ context }) =>
    context.queryClient.ensureQueryData(userQueryOptions),
  pendingComponent: () => <p>User Data loading pending...</p>,
  errorComponent: ({ error }) => <ErrorComponent error={error} />,
  component: () => (
    <>
      <div className="flex gap-2 p-2">
        <Link to="/" className="text-gray-800 [&.active]:font-bold">
          Hazel✨Node
        </Link>
      </div>
      <hr />

      <div className="py-2">
        <Outlet />
      </div>
      <Toaster />
      <TanStackRouterDevtools position="bottom-left" />
      <ReactQueryDevtools buttonPosition="bottom-right" />
    </>
  ),
});
