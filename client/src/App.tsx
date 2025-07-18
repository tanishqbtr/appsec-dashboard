import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Services from "@/pages/services";
import ServiceDetail from "@/pages/service-detail";
import ManageApplications from "@/pages/manage-applications";
import Dashboards from "@/pages/dashboards";
import Reports from "@/pages/reports";
import Alerts from "@/pages/alerts";
import RiskScoring from "@/pages/risk-scoring";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary">
        <div className="text-white text-lg">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Switch>
      <Route path="/" component={Dashboards} />
      <Route path="/dashboard" component={Dashboards} />
      <Route path="/services" component={Services} />
      <Route path="/service/:id" component={ServiceDetail} />
      <Route path="/manage-applications" component={ManageApplications} />
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
