import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Navigation from "@/components/navigation";
import PageWrapper from "@/components/page-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, ExternalLink, Shield, ChevronUp, ChevronDown, Plus, Trash2, X } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Application } from "@shared/schema";

type SortField = "name" | "riskScore" | "percentile";
type SortDirection = "asc" | "desc";

export default function Services() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedServices, setSelectedServices] = useState<Set<number>>(new Set());
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newService, setNewService] = useState({
    name: "",
    description: "",
    serviceOwner: "",
    githubRepo: "",
    jiraProject: "",
    slackChannel: "",
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["/api/services-with-risk-scores"],
  });

  // Get total findings data for percentile calculation
  const { data: servicesWithFindings = [] } = useQuery({
    queryKey: ["/api/services-total-findings"],
  });

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };

  // Mutation for creating a new service
  const createServiceMutation = useMutation({
    mutationFn: async (serviceData: typeof newService) => {
      return apiRequest("POST", "/api/applications", {
        ...serviceData,
        riskScore: "0.0", // Default risk score as requested
        labels: [],
        tags: [],
        hasAlert: false,
      });
    },
    onSuccess: () => {
      toast({
        title: "Service Added",
        description: "New service has been successfully added.",
      });
      setIsAddServiceOpen(false);
      setNewService({
        name: "",
        description: "",
        serviceOwner: "",
        githubRepo: "",
        jiraProject: "",
        slackChannel: "",
      });
      // Invalidate and refetch services data
      queryClient.invalidateQueries({ queryKey: ["/api/services-with-risk-scores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services-total-findings"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add service. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleAddService = () => {
    if (!newService.name.trim()) {
      toast({
        title: "Service Name Required",
        description: "Please enter a service name.",
        variant: "destructive",
      });
      return;
    }
    createServiceMutation.mutate(newService);
  };

  // Mutation for deleting services
  const deleteServicesMutation = useMutation({
    mutationFn: async (serviceIds: number[]) => {
      const deletePromises = serviceIds.map(id => 
        apiRequest("DELETE", `/api/applications/${id}`)
      );
      return Promise.all(deletePromises);
    },
    onSuccess: () => {
      toast({
        title: "Services Deleted",
        description: `${selectedServices.size} service(s) have been successfully deleted.`,
      });
      setSelectedServices(new Set());
      setIsDeleteMode(false);
      setIsDeleteDialogOpen(false);
      // Invalidate and refetch services data
      queryClient.invalidateQueries({ queryKey: ["/api/services-with-risk-scores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services-total-findings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete services. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleDeleteMode = () => {
    setIsDeleteMode(!isDeleteMode);
    setSelectedServices(new Set());
  };

  const handleServiceSelect = (serviceId: number, isSelected: boolean) => {
    const newSelected = new Set(selectedServices);
    if (isSelected) {
      newSelected.add(serviceId);
    } else {
      newSelected.delete(serviceId);
    }
    setSelectedServices(newSelected);
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      const allIds = new Set(sortedApplications.map(app => app.id));
      setSelectedServices(allIds);
    } else {
      setSelectedServices(new Set());
    }
  };

  const handleDeleteSelected = () => {
    if (selectedServices.size === 0) {
      toast({
        title: "No Services Selected",
        description: "Please select at least one service to delete.",
        variant: "destructive",
      });
      return;
    }
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    deleteServicesMutation.mutate(Array.from(selectedServices));
  };

  const handleInputChange = (field: keyof typeof newService, value: string) => {
    setNewService(prev => ({ ...prev, [field]: value }));
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Calculate percentile rankings based on total findings (services with fewer findings get higher percentiles)
  const applicationsWithPercentiles = applications.map((app) => {
    // Find corresponding service in findings data
    const findingsData = servicesWithFindings.find(service => service.name === app.name);
    const currentTotalFindings = findingsData?.totalFindings || 0;
    
    // Count applications with higher total findings (worse security)
    const appsWithMoreFindings = servicesWithFindings.filter(service => {
      return service.totalFindings > currentTotalFindings;
    }).length;
    
    // Higher percentile = better security (fewer findings)
    const percentile = servicesWithFindings.length > 0 
      ? Math.round((appsWithMoreFindings / servicesWithFindings.length) * 100)
      : 0;
    
    return {
      ...app,
      percentile,
      totalFindings: currentTotalFindings,
      displayRiskScore: app.finalRiskScore?.toFixed(1) || "0.0"
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
            <div className="flex items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full"
                />
              </div>
              <div className="flex items-center gap-2">
                {isDeleteMode ? (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDeleteMode}
                      className="flex-shrink-0"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleDeleteSelected}
                      disabled={selectedServices.size === 0 || deleteServicesMutation.isPending}
                      className="bg-red-600 hover:bg-red-700 text-white flex-shrink-0"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete Selected ({selectedServices.size})
                    </Button>
                  </>
                ) : (
                  <>
                    <Dialog open={isAddServiceOpen} onOpenChange={setIsAddServiceOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 text-white flex-shrink-0 btn-smooth"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Service
                        </Button>
                      </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Add New Service</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Service Name *</Label>
                        <Input
                          id="name"
                          placeholder="Enter service name"
                          value={newService.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="owner">Service Owner</Label>
                        <Input
                          id="owner"
                          placeholder="Enter service owner"
                          value={newService.serviceOwner}
                          onChange={(e) => handleInputChange("serviceOwner", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Enter service description"
                        value={newService.description}
                        onChange={(e) => handleInputChange("description", e.target.value)}
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="github">GitHub Repository</Label>
                        <Input
                          id="github"
                          placeholder="https://github.com/..."
                          value={newService.githubRepo}
                          onChange={(e) => handleInputChange("githubRepo", e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="jira">Jira Project</Label>
                        <Input
                          id="jira"
                          placeholder="https://company.atlassian.net/..."
                          value={newService.jiraProject}
                          onChange={(e) => handleInputChange("jiraProject", e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="slack">Slack Channel</Label>
                      <Input
                        id="slack"
                        placeholder="#team-channel"
                        value={newService.slackChannel}
                        onChange={(e) => handleInputChange("slackChannel", e.target.value)}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddServiceOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddService}
                      disabled={createServiceMutation.isPending || !newService.name.trim()}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      {createServiceMutation.isPending ? "Adding..." : "Add Service"}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDeleteMode}
                      className="flex-shrink-0 btn-smooth"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove Services
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Delete Confirmation Dialog */}
          <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Deletion</DialogTitle>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm text-gray-600">
                  Are you sure you want to delete {selectedServices.size} service(s)? This action cannot be undone.
                </p>
                {selectedServices.size > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Services to be deleted:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      {sortedApplications
                        .filter(app => selectedServices.has(app.id))
                        .map(app => (
                          <li key={app.id} className="flex items-center gap-2">
                            <Shield className="h-4 w-4 text-red-500" />
                            {app.name}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  onClick={confirmDelete}
                  disabled={deleteServicesMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleteServicesMutation.isPending ? "Deleting..." : "Delete Services"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

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
                        {isDeleteMode && (
                          <th className="text-left py-3 px-4 w-12">
                            <Checkbox
                              checked={selectedServices.size === sortedApplications.length && sortedApplications.length > 0}
                              onCheckedChange={handleSelectAll}
                              aria-label="Select all services"
                            />
                          </th>
                        )}
                        <th className={`text-left py-3 px-4 ${isDeleteMode ? 'w-2/5' : 'w-1/2'}`}>
                          <Button
                            variant="ghost"
                            onClick={() => handleSort("name")}
                            className="flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900 justify-start btn-smooth"
                          >
                            Service Name
                            {sortField === "name" && (
                              sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </th>
                        <th className="text-center py-3 px-4 w-1/4">
                          <Button
                            variant="ghost"
                            onClick={() => handleSort("riskScore")}
                            className="flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900 justify-center w-full btn-smooth"
                          >
                            Risk Score
                            {sortField === "riskScore" && (
                              sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </th>
                        <th className="text-center py-3 px-4 w-1/4">
                          <Button
                            variant="ghost"
                            onClick={() => handleSort("percentile")}
                            className="flex items-center gap-1 font-medium text-gray-700 hover:text-gray-900 justify-center w-full btn-smooth"
                          >
                            Percentile Ranking
                            {sortField === "percentile" && (
                              sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                            )}
                          </Button>
                        </th>
                        <th className="text-right py-3 px-4 w-12"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedApplications.map((app) => {
                        return (
                          <tr key={app.id} className="stagger-item border-b border-gray-100 hover:bg-gray-50 card-hover transition-all duration-200">
                            {isDeleteMode && (
                              <td className="py-4 px-4">
                                <Checkbox
                                  checked={selectedServices.has(app.id)}
                                  onCheckedChange={(checked) => handleServiceSelect(app.id, checked as boolean)}
                                  aria-label={`Select ${app.name}`}
                                />
                              </td>
                            )}
                            <td className="py-4 px-4">
                              {isDeleteMode ? (
                                <div className="flex items-center gap-3">
                                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Shield className="h-5 w-5 text-green-600" />
                                  </div>
                                  <div>
                                    <h3 className="font-medium text-gray-900">
                                      {app.name}
                                    </h3>
                                  </div>
                                </div>
                              ) : (
                                <Link href={`/service/${app.id}`}>
                                  <div className="flex items-center gap-3 cursor-pointer group">
                                    <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                                      <Shield className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                      <h3 className="font-medium text-gray-900 group-hover:text-green-600 transition-colors">
                                        {app.name}
                                      </h3>
                                    </div>
                                  </div>
                                </Link>
                              )}
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className="text-lg font-semibold text-gray-900">
                                {app.displayRiskScore}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className={`text-lg font-semibold ${
                                app.percentile >= 75 ? 'text-green-600' :
                                app.percentile >= 50 ? 'text-yellow-600' :
                                app.percentile >= 25 ? 'text-orange-600' :
                                'text-red-600'
                              }`}>
                                {Math.round(app.percentile)}%
                              </span>
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