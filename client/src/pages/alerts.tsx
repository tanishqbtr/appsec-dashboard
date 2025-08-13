import React from "react";
import Navigation from "@/components/navigation";
import PageWrapper from "@/components/page-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Alerts() {
  const { logout } = useAuth();

  return (
    <PageWrapper loadingMessage="Loading Alerts..." minLoadingTime={30}>
      <div className="min-h-screen bg-background">
        <Navigation onLogout={logout} currentPage="alerts" />
      
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter page-enter-active">
        <div className="mb-8 stagger-item">
          <h1 className="text-3xl font-bold text-foreground">Alerts</h1>
          <p className="mt-2 text-muted-foreground">
            Security alerts and notifications management
          </p>
        </div>

        <Card className="stagger-item card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Alerts content will be available soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
    </PageWrapper>
  );
}