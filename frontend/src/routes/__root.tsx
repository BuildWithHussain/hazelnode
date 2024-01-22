import "@/index.css";

import { Link, Outlet, rootRouteWithContext } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { getSessionUserId } from "@/data/session";
import { QueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";

export const Route = rootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: async ({ location }) => {
    if (!getSessionUserId()) {
      window.location.href = "/login?redirect-to=" + location.pathname;
    }
  },
  component: () => (
    <>
      <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>{" "}
        <Link to="/about" className="[&.active]:font-bold">
          About
        </Link>
      </div>
      <hr />
      <Outlet />
      <Toaster />
      <TanStackRouterDevtools />
    </>
  ),
});
