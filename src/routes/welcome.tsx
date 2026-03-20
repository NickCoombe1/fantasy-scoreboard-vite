import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/welcome")({
  component: WelcomePage,
});

function WelcomePage() {
  return (
    <div>
      <h2>Welcome</h2>
      <p>Fantasy Scoreboard is up and running.</p>
    </div>
  );
}
