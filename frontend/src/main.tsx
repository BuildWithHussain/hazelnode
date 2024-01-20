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
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";

function sessionUser() {
  const cookies = new URLSearchParams(document.cookie.split("; ").join("&"));
  let _sessionUser = cookies.get("user_id");
  if (_sessionUser === "Guest") {
    _sessionUser = null;
  }
  return _sessionUser;
}

const rootRoute = new RootRoute({
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

const aboutRoute = new Route({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: function About() {
    return sessionUser() ? (
      <div className="p-2">{sessionUser()}</div>
    ) : (
      <p>Not logged in!</p>
    );
  },
});

const routeTree = rootRoute.addChildren([indexRoute, aboutRoute]);

const router = new Router({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
