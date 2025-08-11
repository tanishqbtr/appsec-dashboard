import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import ApplicationsTable from "@/components/applications-table";
import ReportsTutorial from "@/components/reports-tutorial";
import PageWrapper from "@/components/page-wrapper";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { RoleProtectedButton } from "@/components/role-protected-button";
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
import { Filter, Search, Settings, HelpCircle } from "lucide-react";
import { Link } from "wouter";
import type { Application } from "@shared/schema";

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEngine, setSelectedEngine] = useState("");
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [filterMode, setFilterMode] = useState<"labels" | "tags">("tags");
  const [showTutorial, setShowTutorial] = useState(false);

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications-with-risk"],
  });

  const { toast } = useToast();
  const { logout, isAdmin } = useAuth();

  const handleStartTutorial = () => {
    setShowTutorial(true);
  };

  const handleCompleteTutorial = () => {
    setShowTutorial(false);
    toast({
      title: "Tutorial Complete!",
      description: "You've learned how to filter and analyze security findings.",
    });
  };

  const handleEngineSelect = (engine: string) => {
    // If clicking the same engine that's already selected, deselect it
    if (selectedEngine === engine && filterMode === "labels") {
      setSelectedEngine("");
      setSelectedLabels([]);
      setFilterMode("tags"); // Switch back to tags mode when no engine selected
    } else {
      // Switch to new engine - clear all previous selections
      setSelectedEngine(engine);
      setSelectedLabels([]); // Clear labels when switching engines
      setFilterMode("labels"); // Switch to labels mode
      setSelectedTags([]); // Clear tags when switching to labels mode
    }
  };

  const handleLabelSelect = (label: string) => {
    setFilterMode("labels"); // Switch to labels mode
    setSelectedTags([]); // Clear tags when switching to labels mode
    setSelectedLabels(prev => 
      prev.includes(label) 
        ? prev.filter(l => l !== label)
        : [...prev, label]
    );
  };

  const handleTagSelect = (tag: string) => {
    setFilterMode("tags"); // Switch to tags mode
    setSelectedLabels([]); // Clear labels when switching to tags mode
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
    
    // Apply either labels OR tags filtering, never both
    if (filterMode === "labels" && selectedEngine) {
      // Special handling for Mend and Escape engines: only show services when specific labels are selected
      // and findings data comes from separate database tables, not service labels
      if ((selectedEngine === "Mend" && selectedLabels.length > 0 && 
          selectedLabels.some(label => ["SCA", "SAST", "Containers"].includes(label))) ||
          (selectedEngine === "Escape" && selectedLabels.length > 0 && 
          selectedLabels.some(label => ["Web Applications", "APIs"].includes(label))) ||
          (selectedEngine === "Crowdstrike" && selectedLabels.length > 0 && 
          selectedLabels.some(label => ["Images", "Containers"].includes(label)))) {
        return matchesSearch; // Show all services, findings will be populated from APIs
      }
      
      // If an engine is selected but no labels chosen, show no services (reset state)
      if (selectedEngine && selectedLabels.length === 0) {
        return false; // Hide all services until labels are selected
      }
      
      return matchesSearch;
    } else {
      // Default behavior: show all applications when no filters are applied, or filter by tags
      if (selectedTags.length === 0) {
        return matchesSearch; // Show all applications when no tags are selected
      }
      const matchesTags = selectedTags.some(tag => app.tags?.includes(tag));
      return matchesSearch && matchesTags;
    }
  });

  if (isLoading) {
    return (
      <PageWrapper loadingMessage="Loading Reports...">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper loadingMessage="Loading Reports...">
      <div className="min-h-screen bg-background">
        <Navigation onLogout={logout} currentPage="reports" />
      
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Security Findings</h1>
              <p className="mt-2 text-muted-foreground">
                Manage and monitor your services across different security tools.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleStartTutorial}
              className="btn-smooth flex items-center gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              Take Tutorial
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 bg-card border border-border rounded-lg p-6" data-tutorial="filter-section">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Scan Engine and Labels */}
            <div>
              {/* Scan Engine Selection */}
              <div data-tutorial="scan-engines">
                <h3 className="text-sm font-medium text-muted-foreground mb-2">Scan Engine</h3>
                <div className="flex gap-2">
                  {["Mend", "Escape", "Crowdstrike"].map((engine) => (
                    <Button
                      key={engine}
                      variant={selectedEngine === engine && filterMode === "labels" ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleEngineSelect(engine)}
                      className={`transition-all duration-200 hover:scale-105 ${
                        selectedEngine === engine && filterMode === "labels"
                          ? "bg-green-600 text-white hover:bg-green-700" 
                          : "hover:bg-green-50 hover:border-green-300"
                      }`}
                    >
                      {engine}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Labels Selection - Only show when engine is selected */}
              {selectedEngine && (
                <div className="mt-4" data-tutorial="engine-labels">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">
                    {selectedEngine} Labels
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {getAvailableLabels().map((label) => (
                      <Button
                        key={label}
                        variant={selectedLabels.includes(label) && filterMode === "labels" ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleLabelSelect(label)}
                        className={`transition-all duration-200 hover:scale-105 ${
                          selectedLabels.includes(label) && filterMode === "labels"
                            ? "bg-green-400 text-white hover:bg-green-500" 
                            : "hover:bg-green-50 hover:border-green-300"
                        }`}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Side - Tags Selection */}
            <div data-tutorial="compliance-tags">
              <h3 className="text-sm font-medium text-muted-foreground mb-2">Compliance Tags</h3>
              <div className="flex flex-wrap gap-2">
                {["HITRUST", "ISO 27001", "SOC 2", "HIPAA", "PCI DSS"].map((tag) => (
                  <Button
                    key={tag}
                    variant={selectedTags.includes(tag) && filterMode === "tags" ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTagSelect(tag)}
                    className={`transition-all duration-200 hover:scale-105 ${
                      selectedTags.includes(tag) && filterMode === "tags"
                        ? "bg-green-600 text-white hover:bg-green-700" 
                        : "hover:bg-green-50 hover:border-green-300"
                    }`}
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Filters */}
          {(searchTerm || selectedLabels.length > 0 || selectedTags.length > 0) && (
            <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200" data-tutorial="active-filters">
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
        <Card data-tutorial="services-table">
          <CardHeader>
            <CardTitle>Services ({filteredApplications.length})</CardTitle>
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
      
      {/* Reports Tutorial */}
      <ReportsTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onComplete={handleCompleteTutorial}
      />
    </div>
    </PageWrapper>
  );
}