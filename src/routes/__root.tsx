import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <div>
      <h1>Fantasy Scoreboard</h1>
      <Outlet />
    </div>
  ),
});
