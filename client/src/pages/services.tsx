import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Navigation from "@/components/navigation";
import ApplicationsTable from "@/components/applications-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, Filter } from "lucide-react";
import type { Application } from "@shared/schema";

export default function Services() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEngine, setSelectedEngine] = useState<string>("");
  const [selectedEnvironment, setSelectedEnvironment] = useState<string>("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const getEngineLabels = (engine: string) => {
    switch (engine) {
      case "Mend":
        return ["SCA", "SAST", "Containers"];
      case "Escape":
        return ["Web Applications", "APIs"];
      case "Crowdstrike":
        return ["Images", "Containers"];
      default:
        return [];
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEngine = !selectedEngine || selectedEngine === "all" || app.scanEngine === selectedEngine;
    const matchesEnvironment = !selectedEnvironment || selectedEnvironment === "all" || 
      app.name.toLowerCase().includes(selectedEnvironment.toLowerCase());
    const matchesLabels = selectedLabels.length === 0 || selectedLabels.includes("all") ||
      selectedLabels.some(label => app.labels?.includes(label));
    
    return matchesSearch && matchesEngine && matchesEnvironment && matchesLabels;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation onLogout={handleLogout} />
      
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Security Services</h1>
          <p className="mt-2 text-gray-600">
            Manage and monitor your security scanning services across different environments
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Scan Engine */}
              <Select value={selectedEngine} onValueChange={setSelectedEngine}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Engine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Engines</SelectItem>
                  <SelectItem value="Mend">Mend</SelectItem>
                  <SelectItem value="Escape">Escape</SelectItem>
                  <SelectItem value="Crowdstrike">Crowdstrike</SelectItem>
                </SelectContent>
              </Select>

              {/* Environment */}
              <Select value={selectedEnvironment} onValueChange={setSelectedEnvironment}>
                <SelectTrigger>
                  <SelectValue placeholder="Environment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Environments</SelectItem>
                  <SelectItem value="Production">Production</SelectItem>
                  <SelectItem value="Development">Development</SelectItem>
                  <SelectItem value="Testing">Testing</SelectItem>
                </SelectContent>
              </Select>

              {/* Labels */}
              {selectedEngine && (
                <Select 
                  value={selectedLabels[0] || ""} 
                  onValueChange={(value) => setSelectedLabels(value ? [value] : [])}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Label" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Labels</SelectItem>
                    {getEngineLabels(selectedEngine).map((label) => (
                      <SelectItem key={label} value={label}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Active Filters */}
            {(searchTerm || (selectedEngine && selectedEngine !== "all") || (selectedEnvironment && selectedEnvironment !== "all") || selectedLabels.filter(l => l !== "all").length > 0) && (
              <div className="flex flex-wrap gap-2 mt-4">
                {searchTerm && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: {searchTerm}
                    <button onClick={() => setSearchTerm("")} className="ml-1 hover:text-red-500">×</button>
                  </Badge>
                )}
                {selectedEngine && selectedEngine !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Engine: {selectedEngine}
                    <button onClick={() => setSelectedEngine("")} className="ml-1 hover:text-red-500">×</button>
                  </Badge>
                )}
                {selectedEnvironment && selectedEnvironment !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Environment: {selectedEnvironment}
                    <button onClick={() => setSelectedEnvironment("")} className="ml-1 hover:text-red-500">×</button>
                  </Badge>
                )}
                {selectedLabels.filter(label => label !== "all").map((label) => (
                  <Badge key={label} variant="secondary" className="flex items-center gap-1">
                    Label: {label}
                    <button 
                      onClick={() => setSelectedLabels(selectedLabels.filter(l => l !== label))} 
                      className="ml-1 hover:text-red-500"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Applications ({filteredApplications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ApplicationsTable applications={filteredApplications} isLoading={isLoading} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}