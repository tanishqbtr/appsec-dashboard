import Navigation from "@/components/navigation";
import PageWrapper from "@/components/page-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function Alerts() {
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <PageWrapper loadingMessage="Loading Alerts...">
      <div className="min-h-screen bg-gray-50">
        <Navigation onLogout={handleLogout} currentPage="alerts" />
      
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Alerts</h1>
          <p className="mt-2 text-gray-600">
            Security alerts and notifications management
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Alerts content will be available soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
    </PageWrapper>
  );
}