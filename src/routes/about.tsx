import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/about")({
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] min-h-screen gap-16" />
  );
}
