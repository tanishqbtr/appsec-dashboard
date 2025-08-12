import React from "react";
import Navigation from "@/components/navigation";
import PageWrapper from "@/components/page-wrapper";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Clock } from "lucide-react";

export default function ServiceInventory() {
  const { logout } = useAuth();

  return (
    <PageWrapper loadingMessage="Loading Service Inventory..." minLoadingTime={30}>
      <div className="min-h-screen bg-background">
        <Navigation onLogout={logout} currentPage="service-inventory" />
        
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <Package className="h-8 w-8 text-blue-600" />
                  Service Inventory
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Comprehensive catalog of all services and applications in your environment
                </p>
              </div>
            </div>
          </div>

          {/* Coming Soon Card */}
          <Card className="max-w-2xl mx-auto">
            <CardContent className="py-16 text-center">
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <Package className="h-16 w-16 text-blue-600/20" />
                  <Clock className="h-8 w-8 text-blue-600 absolute -top-1 -right-1" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-4">Coming Soon</h2>
              <p className="text-muted-foreground text-lg mb-6">
                The Service Inventory feature is currently under development and will be available soon.
              </p>
              <p className="text-sm text-muted-foreground">
                This page will provide a comprehensive catalog of all services and applications 
                with advanced filtering and management capabilities.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}