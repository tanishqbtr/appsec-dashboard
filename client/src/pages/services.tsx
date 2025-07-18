import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Navigation from "@/components/navigation";
import PageWrapper from "@/components/page-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, ExternalLink, Shield, ChevronUp, ChevronDown } from "lucide-react";
import { Link } from "wouter";
import type { Application } from "@shared/schema";

type SortField = "name" | "riskScore" | "percentile";
type SortDirection = "asc" | "desc";

export default function Services() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications-with-risk-assessments"],
  });

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Calculate percentile rankings based on risk scores (services with lower risk scores get higher percentiles)
  const applicationsWithPercentiles = applications.map((app) => {
    const currentRiskScore = parseFloat(app.finalRiskScore || app.riskScore || "0");
    
    // Count applications with higher risk scores (worse security)
    const appsWithHigherRisk = applications.filter(otherApp => {
      const otherRiskScore = parseFloat(otherApp.finalRiskScore || otherApp.riskScore || "0");
      return otherRiskScore > currentRiskScore;
    }).length;
    
    // Higher percentile = better security (fewer findings/lower risk)
    const percentile = Math.round((appsWithHigherRisk / applications.length) * 100);
    
    return {
      ...app,
      percentile,
      displayRiskScore: app.finalRiskScore || app.riskScore
    };
  });

  const filteredApplications = applicationsWithPercentiles.filter((app) =>
    app.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.scanEngine?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sort applications
  const sortedApplications = [...filteredApplications].sort((a, b) => {
    let comparison = 0;
    
    switch (sortField) {
      case "name":
        comparison = a.name.localeCompare(b.name);
        break;
      case "riskScore":
        comparison = parseFloat(a.displayRiskScore) - parseFloat(b.displayRiskScore);
        break;
      case "percentile":
        comparison = a.percentile - b.percentile;
        break;
    }
    
    return sortDirection === "asc" ? comparison : -comparison;
  });

  const getPercentileBadge = (percentile: number) => {
    if (percentile >= 90) return { color: "bg-green-100 text-green-800", label: "Top 10%" };
    if (percentile >= 75) return { color: "bg-blue-100 text-blue-800", label: "Top 25%" };
    if (percentile >= 50) return { color: "bg-yellow-100 text-yellow-800", label: "Top 50%" };
    if (percentile >= 25) return { color: "bg-orange-100 text-orange-800", label: "Bottom 50%" };
    return { color: "bg-red-100 text-red-800", label: "Bottom 25%" };
  };

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

          {/* Services Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Services ({sortedApplications.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {sortedApplications.length === 0 ? (
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
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4">
                          <Button
                            variant="ghost"
                            onClick={() => handleSort("name")}
                            className="flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900"
                          >
                            Service Name
                            {sortField === "name" && (
                              sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </th>
                        <th className="text-left py-3 px-4">
                          <Button
                            variant="ghost"
                            onClick={() => handleSort("riskScore")}
                            className="flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900"
                          >
                            Risk Score
                            {sortField === "riskScore" && (
                              sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </th>
                        <th className="text-left py-3 px-4">
                          <Button
                            variant="ghost"
                            onClick={() => handleSort("percentile")}
                            className="flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900"
                          >
                            Percentile Ranking
                            {sortField === "percentile" && (
                              sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </th>
                        <th className="text-right py-3 px-4"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedApplications.map((app) => {
                        const percentileBadge = getPercentileBadge(app.percentile);
                        
                        return (
                          <tr key={app.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4">
                              <Link href={`/service/${app.id}`}>
                                <div className="flex items-center gap-3 cursor-pointer group">
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
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            </td>
                            <td className="py-4 px-4">
                              <span className="text-lg font-semibold text-gray-900">
                                {app.displayRiskScore}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <Badge className={`${percentileBadge.color} font-medium`}>
                                {percentileBadge.label}
                              </Badge>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <Link href={`/service/${app.id}`}>
                                <ExternalLink className="h-4 w-4 text-gray-400 hover:text-green-600 transition-colors cursor-pointer" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </PageWrapper>
  );
}