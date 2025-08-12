import React from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Services from "@/pages/services";
import ServiceDetail from "@/pages/service-detail";
import ManageApplications from "@/pages/manage-applications";
import Dashboards from "@/pages/dashboards";
import Reports from "@/pages/reports";
import Alerts from "@/pages/alerts";
import RiskScoring from "@/pages/risk-scoring";
import AdminPanel from "@/pages/admin";
import Profile from "@/pages/profile";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="relative w-12 h-12 mx-auto">
            <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
            <div className="absolute inset-0 border-4 border-green-600 rounded-full animate-spin border-t-transparent"></div>
          </div>
          <div className="text-foreground text-lg font-medium">Initializing...</div>
        </div>
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
      <Route path="/service/:slug" component={ServiceDetail} />
      <Route path="/manage-applications" component={ManageApplications} />
      <Route path="/dashboards" component={Dashboards} />
      <Route path="/reports" component={Reports} />
      <Route path="/alerts" component={Alerts} />
      <Route path="/risk-scoring" component={RiskScoring} />
      <Route path="/profile" component={Profile} />
      <Route path="/admin" component={AdminPanel} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
