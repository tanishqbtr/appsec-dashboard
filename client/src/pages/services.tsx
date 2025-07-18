import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Navigation from "@/components/navigation";
import PageWrapper from "@/components/page-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ExternalLink, Shield } from "lucide-react";
import { Link } from "wouter";
import type { Application } from "@shared/schema";

export default function Services() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const filteredApplications = applications.filter((app) =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.scanEngine.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.labels?.some(label => label.toLowerCase().includes(searchTerm.toLowerCase())) ||
    app.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading) {
    return (
      <PageWrapper loadingMessage="Loading Services...">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper loadingMessage="Loading Services...">
      <div className="min-h-screen bg-gray-50">
        <Navigation onLogout={handleLogout} currentPage="services" />
        
        <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Services</h1>
                <p className="mt-2 text-sm text-gray-600">
                  Browse and manage all registered services
                </p>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search services by name, engine, labels, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full max-w-md"
              />
            </div>
          </div>

          {/* Services List */}
          <Card>
            <CardHeader>
              <CardTitle>All Services ({filteredApplications.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredApplications.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {searchTerm ? "No services found" : "No services available"}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm ? "Try adjusting your search terms." : "Services will appear here once configured."}
                    </p>
                  </div>
                ) : (
                  filteredApplications.map((app) => {
                    const findings = app.totalFindings && app.totalFindings !== "undefined" 
                      ? JSON.parse(app.totalFindings) 
                      : { total: 0, C: 0, H: 0, M: 0, L: 0 };

                    return (
                      <Link key={app.id} href={`/service/${app.id}`}>
                        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 hover:border-green-300 transition-all duration-200 cursor-pointer group">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                                  <Shield className="h-5 w-5 text-green-600" />
                                </div>
                                <div>
                                  <h3 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                                    {app.name}
                                  </h3>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="outline" className="text-xs">
                                      {app.scanEngine}
                                    </Badge>
                                    <span className="text-sm text-gray-500">
                                      Risk Score: {app.riskScore}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Labels and Tags */}
                              {(app.labels && app.labels.length > 0) || (app.tags && app.tags.length > 0) ? (
                                <div className="flex flex-wrap gap-1 mt-3">
                                  {app.labels?.map((label) => (
                                    <Badge key={label} variant="secondary" className="text-xs bg-blue-50 text-blue-700">
                                      {label}
                                    </Badge>
                                  ))}
                                  {app.tags?.map((tag) => (
                                    <Badge key={tag} variant="secondary" className="text-xs bg-green-50 text-green-700">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              ) : null}
                            </div>

                            {/* Findings Summary */}
                            <div className="flex items-center gap-4">
                              {findings.total > 0 && (
                                <div className="flex items-center gap-2">
                                  {findings.C > 0 && (
                                    <Badge variant="destructive" className="text-xs">
                                      {findings.C} Critical
                                    </Badge>
                                  )}
                                  {findings.H > 0 && (
                                    <Badge className="text-xs bg-orange-500">
                                      {findings.H} High
                                    </Badge>
                                  )}
                                  <span className="text-sm text-gray-500">
                                    {findings.total} total
                                  </span>
                                </div>
                              )}
                              <ExternalLink className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors" />
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </PageWrapper>
  );
}