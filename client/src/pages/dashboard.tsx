import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navigation from "@/components/navigation";
import ApplicationsTable from "@/components/applications-table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, RefreshCw, Plus } from "lucide-react";
import type { Application } from "@shared/schema";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEngine, setSelectedEngine] = useState("Dependencies");

  const { data: applications, isLoading, refetch } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const handleLogout = () => {
    setLocation("/login");
  };

  const filteredApplications = applications?.filter((app) =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-white">
      <Navigation onLogout={handleLogout} />
      
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
            <Button variant="ghost" className="text-primary hover:text-primary/80">
              <Plus className="h-4 w-4 mr-1" />
              Manage Applications
            </Button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-sm text-gray-700 font-medium">Scan engine</span>
            <Badge 
              variant={selectedEngine === "Dependencies" ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => setSelectedEngine("Dependencies")}
            >
              Dependencies
            </Badge>
            <Badge 
              variant={selectedEngine === "Code" ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => setSelectedEngine("Code")}
            >
              Code
            </Badge>
            <Badge 
              variant={selectedEngine === "Containers" ? "default" : "secondary"}
              className="cursor-pointer"
              onClick={() => setSelectedEngine("Containers")}
            >
              Containers
            </Badge>
            <Badge variant="outline" className="cursor-pointer text-primary">
              Select all
            </Badge>
          </div>
          
          <div className="flex gap-4 items-center">
            <span className="text-sm text-gray-700 font-medium">Labels</span>
            <Select>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select labels" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="production">Production</SelectItem>
                <SelectItem value="development">Development</SelectItem>
                <SelectItem value="testing">Testing</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex-1 max-w-lg">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search for applications..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="text-sm text-gray-500 flex items-center gap-2">
              Updated 1 minute ago
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => refetch()}
                className="text-primary hover:text-primary/80"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Applications Table */}
        <ApplicationsTable applications={filteredApplications} isLoading={isLoading} />
      </div>
    </div>
  );
}
