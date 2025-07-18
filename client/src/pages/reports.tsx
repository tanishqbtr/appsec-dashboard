import Navigation from "@/components/navigation";
import PageWrapper from "@/components/page-wrapper";
import { FileText } from "lucide-react";

export default function Reports() {
  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <PageWrapper loadingMessage="Loading Reports...">
      <div className="min-h-screen bg-gray-50">
        <Navigation onLogout={handleLogout} />
        
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Security reporting and analytics
                </p>
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div className="text-center py-12">
            <div className="mx-auto h-24 w-24 text-gray-400">
              <FileText className="h-24 w-24" />
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No reports available</h3>
            <p className="mt-1 text-sm text-gray-500">Reports functionality will be available soon.</p>
          </div>
        </main>
      </div>
    </PageWrapper>
  );
}