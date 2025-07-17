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
import { Filter, Search } from "lucide-react";
import type { Application } from "@shared/schema";

export default function Services() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEngine, setSelectedEngine] = useState("Mend");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const handleEngineSelect = (engine: string) => {
    setSelectedEngine(engine);
    setSelectedLabels([]); // Clear labels when switching engines
  };

  const handleLabelSelect = (label: string) => {
    setSelectedLabels(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  // Define available labels based on selected engine
  const getAvailableLabels = () => {
    switch (selectedEngine) {
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
    const matchesLabels = selectedLabels.length === 0 || 
      selectedLabels.some(label => app.labels?.includes(label));
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.some(tag => app.tags?.includes(tag));
    return matchesSearch && matchesLabels && matchesTags;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation onLogout={handleLogout} currentPage="services" />
      
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Security Services</h1>
          <p className="mt-2 text-gray-600">
            Manage and monitor your security scanning services across different environments
          </p>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Scan Engine and Labels */}
            <div>
              {/* Scan Engine Selection */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Scan Engine</h3>
                <div className="flex gap-2">
                  {["Mend", "Escape", "Crowdstrike"].map((engine) => (
                    <Button
                      key={engine}
                      variant={selectedEngine === engine ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleEngineSelect(engine)}
                      className={selectedEngine === engine ? "bg-primary text-white" : ""}
                    >
                      {engine}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Labels Selection - Only show when engine is selected */}
              {selectedEngine && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    {selectedEngine} Labels
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {getAvailableLabels().map((label) => (
                      <Button
                        key={label}
                        variant={selectedLabels.includes(label) ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleLabelSelect(label)}
                        className={selectedLabels.includes(label) ? "bg-blue-600 text-white" : ""}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Tags Selection */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Compliance Tags</h3>
              <div className="flex flex-wrap gap-2">
                {["HITRUST", "ISO 27001", "SOC 2", "HIPAA", "PCI DSS"].map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTagSelect(tag)}
                    className={selectedTags.includes(tag) ? "bg-green-600 text-white" : ""}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || selectedLabels.length > 0 || selectedTags.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: {searchTerm}
                  <button onClick={() => setSearchTerm("")} className="ml-1 hover:text-red-500">×</button>
                </Badge>
              )}
              {selectedLabels.map((label) => (
                <Badge key={label} variant="secondary" className="flex items-center gap-1">
                  {selectedEngine}: {label}
                  <button 
                    onClick={() => handleLabelSelect(label)} 
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
              {selectedTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                  Tag: {tag}
                  <button 
                    onClick={() => handleTagSelect(tag)} 
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Applications Table */}
        <Card>
          <CardHeader>
            <CardTitle>Applications ({filteredApplications.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <ApplicationsTable 
              applications={filteredApplications} 
              isLoading={isLoading}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              selectedEngine={selectedEngine}
              selectedLabels={selectedLabels}
              selectedTags={selectedTags}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}