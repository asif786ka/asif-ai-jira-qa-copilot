/**
 * @module App
 * @description Root application component. Configures the provider hierarchy:
 *
 * Provider Stack (outer → inner):
 * 1. QueryClientProvider — React Query for server state management
 * 2. TooltipProvider — Radix-based tooltip context
 * 3. WouterRouter — Client-side routing with BASE_URL awareness
 *
 * Routing:
 * - "/" → Home page (QA test case generation UI)
 * - "*" → 404 Not Found fallback
 *
 * The BASE_URL is injected by Vite from the environment, enabling
 * correct routing when deployed under a sub-path.
 *
 * @author Asif
 */

import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Home } from "@/pages/Home";
import NotFound from "@/pages/not-found";

/** Singleton React Query client — manages mutation cache for test case generation */
const queryClient = new QueryClient();

/**
 * Route definitions for the application.
 * Uses Wouter's Switch for exclusive matching.
 */
function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * Root App component that assembles the full provider tree
 * and renders the router.
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
