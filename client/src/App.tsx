import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Services from "@/pages/services";
import Dashboards from "@/pages/dashboards";
import Reports from "@/pages/reports";
import Alerts from "@/pages/alerts";
import RiskScoring from "@/pages/risk-scoring";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Login} />
      <Route path="/login" component={Login} />
      <Route path="/dashboard" component={Services} />
      <Route path="/services" component={Services} />
      <Route path="/dashboards" component={Dashboards} />
      <Route path="/reports" component={Reports} />
      <Route path="/alerts" component={Alerts} />
      <Route path="/risk-scoring" component={RiskScoring} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
