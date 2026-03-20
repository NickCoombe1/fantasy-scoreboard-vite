import { createRootRoute, Outlet } from "@tanstack/react-router";
import Header from "@/components/common/Header";

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="relative min-h-screen">
      <div
        className="absolute inset-0 z-0 pointer-events-none mix-blend-difference"
        style={{
          backgroundImage: 'url("/Lights.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="relative z-10 w-full h-full">
        <Header />
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
