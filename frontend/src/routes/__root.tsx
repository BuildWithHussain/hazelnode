import '@/index.css';

import { Toaster } from '@/components/ui/sonner';
import {
  ErrorComponent,
  Link,
  Outlet,
  rootRouteWithContext,
} from '@tanstack/react-router';

// Dev Tools (does not get bundled in production)
import { TanStackRouterDevtools } from '@tanstack/router-devtools';

export const Route = rootRouteWithContext<{
  sessionUser: string | null;
}>()({
  beforeLoad: async ({ location, context }) => {
    if (!context.sessionUser) {
      window.location.href = '/login?redirect-to=' + location.pathname;
    }
  },
  errorComponent: ({ error }) => <ErrorComponent error={error} />,
  component: () => (
    <>
      <div className="flex gap-2 p-2">
        <Link to="/" className="text-gray-800 [&.active]:font-bold">
          Hazel✨Node
        </Link>
      </div>
      <hr />

      <Outlet />

      <Toaster />
      <TanStackRouterDevtools position="bottom-left" />
    </>
  ),
});
