import { Outlet, createRootRouteWithContext } from "@tanstack/react-router";
import { type AuthStore } from "@/lib/auth-store";

export interface RouterContext {
  auth: AuthStore;
}

function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      <Outlet />
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  component: RootLayout,
});
