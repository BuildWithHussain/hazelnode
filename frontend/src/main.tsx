import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";

import {
  Outlet,
  RouterProvider,
  Link,
  Router,
  Route,
  RootRoute,
  rootRouteWithContext,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { Button } from "./components/ui/button.tsx";

const queryClient = new QueryClient();

function sessionUser() {
  const cookies = new URLSearchParams(document.cookie.split("; ").join("&"));
  let _sessionUser = cookies.get("user_id");
  if (_sessionUser === "Guest") {
    _sessionUser = null;
  }
  return _sessionUser;
}

const rootRoute = rootRouteWithContext<{ queryClient: QueryClient }>()({
  beforeLoad: async ({ location }) => {
    if (!sessionUser()) {
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
      <TanStackRouterDevtools />
    </>
  ),
});

const indexRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/",
  component: function Index() {
    return (
      <div className="p-2">
        <App />
      </div>
    );
  },
});

async function getUserInfo() {
  const response = await fetch(
    "/api/method/hazelnode.api.get_current_user_info"
  );
  if (!response.ok) {
    throw new Error("Error occurred while fetching user info");
  }
  const data = await response.json();

  if (data.message) {
    return data.message;
  }

  return data;
}

const aboutRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: function About() {
    const { data, isLoading, isError, isFetching } = useQuery({
      queryKey: ["current_user"],
      queryFn: getUserInfo,
    });

    if (isLoading) return <p>Loading...</p>;

    if (isError) return <p>Error!</p>;

    return (
      <>
        <Avatar className="w-24 h-24">
          <AvatarImage src={data.user_image} alt={data.full_name} />
          {/* TODO */}
          <AvatarFallback>CN</AvatarFallback>
        </Avatar>

        <p>{data.full_name}</p>

        <Button
          onClick={async () => {
            const response = await fetch("/api/method/logout");
            if (!response.ok) {
              throw new Error("Error occurred while logging out");
            }
            window.location.href = "/login";
          }}
        >
          Log Out
        </Button>

        {isFetching && <p>Refreshing data...</p>}
      </>
    );
  },
});

const routeTree = rootRoute.addChildren([indexRoute, aboutRoute]);

const router = new Router({
  routeTree,
  defaultPreloadStaleTime: 0,
  context: {
    queryClient,
  },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
