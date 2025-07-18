import Navigation from "@/components/navigation";
import PageWrapper from "@/components/page-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Search,
  Edit3,
  Save,
  X,
  AlertTriangle,
  Shield
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Application } from "@shared/schema";

interface NewApplication {
  name: string;
  description: string;
  scanEngine: string;
  githubRepo: string;
  jiraProject: string;
  slackChannel: string;
  serviceOwner: string;
  riskScore: number;
  totalFindings: string;
  tags: string[];
  labels: string[];
}

export default function ManageApplications() {
  const { toast } = useToast();
  const { logout } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newApp, setNewApp] = useState<NewApplication>({
    name: "",
    description: "",
    scanEngine: "mend",
    githubRepo: "",
    jiraProject: "",
    slackChannel: "",
    serviceOwner: "",
    riskScore: 0,
    totalFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
    tags: [],
    labels: []
  });
  const [labelInput, setLabelInput] = useState("");

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const addApplicationMutation = useMutation({
    mutationFn: async (newApplication: any) => {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newApplication),
      });
      if (!response.ok) throw new Error("Failed to add application");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      setIsAddDialogOpen(false);
      resetForm();
      toast({
        title: "Service Added",
        description: "New service has been successfully added.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add service.",
        variant: "destructive",
      });
    },
  });

  const deleteApplicationMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/applications/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete application");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Service Deleted",
        description: "Service has been successfully deleted.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete service.",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setNewApp({
      name: "",
      description: "",
      scanEngine: "mend",
      githubRepo: "",
      jiraProject: "",
      slackChannel: "",
      serviceOwner: "",
      riskScore: 0,
      totalFindings: JSON.stringify({ total: 0, C: 0, H: 0, M: 0, L: 0 }),
      tags: [],
      labels: []
    });
    setLabelInput("");
  };

  const handleAddLabel = () => {
    if (labelInput.trim() && !newApp.labels.includes(labelInput.trim())) {
      setNewApp(prev => ({
        ...prev,
        labels: [...prev.labels, labelInput.trim()]
      }));
      setLabelInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setNewApp(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleRemoveLabel = (label: string) => {
    setNewApp(prev => ({
      ...prev,
      labels: prev.labels.filter(l => l !== label)
    }));
  };

  const handleAddApplication = () => {
    if (!newApp.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Service name is required.",
        variant: "destructive",
      });
      return;
    }

    const applicationData = {
      ...newApp,
      id: Date.now(), // Simple ID generation for demo
      lastScan: new Date().toISOString().split('T')[0],
      hasAlert: false,
      project: newApp.name // Add project field
    };

    addApplicationMutation.mutate(applicationData);
  };

  const filteredApplications = applications.filter(app =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    app.scanEngine.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <PageWrapper loadingMessage="Loading Applications...">
        <div className="min-h-screen bg-gray-50">
          <Navigation onLogout={logout} currentPage="services" />
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper loadingMessage="Loading Applications...">
      <div className="min-h-screen bg-gray-50">
        <Navigation onLogout={logout} currentPage="services" />
        
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/services">
                <Button variant="outline" className="transition-all duration-200 hover:scale-105">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Services
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manage Services</h1>
                <p className="mt-2 text-gray-600">
                  Add new services or remove existing ones from your security dashboard
                </p>
              </div>
              
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Service</DialogTitle>
                    <DialogDescription>
                      Fill in the details for the new service to add to your security dashboard.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Service Name *</Label>
                        <Input
                          id="name"
                          placeholder="My Service"
                          value={newApp.name}
                          onChange={(e) => setNewApp({...newApp, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="scanEngine">Scan Engine</Label>
                        <Select value={newApp.scanEngine} onValueChange={(value) => setNewApp({...newApp, scanEngine: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mend">Mend</SelectItem>
                            <SelectItem value="crowdstrike">Crowdstrike</SelectItem>
                            <SelectItem value="escape">Escape</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Brief description of the service"
                        value={newApp.description}
                        onChange={(e) => setNewApp({...newApp, description: e.target.value})}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="githubRepo">GitHub Repository</Label>
                        <Input
                          id="githubRepo"
                          placeholder="https://github.com/company/repo"
                          value={newApp.githubRepo}
                          onChange={(e) => setNewApp({...newApp, githubRepo: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="jiraProject">Jira Project</Label>
                        <Input
                          id="jiraProject"
                          placeholder="https://company.atlassian.net/browse/PROJECT"
                          value={newApp.jiraProject}
                          onChange={(e) => setNewApp({...newApp, jiraProject: e.target.value})}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="slackChannel">Slack Channel</Label>
                        <Input
                          id="slackChannel"
                          placeholder="https://company.slack.com/channels/team"
                          value={newApp.slackChannel}
                          onChange={(e) => setNewApp({...newApp, slackChannel: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="serviceOwner">Service Owner</Label>
                        <Input
                          id="serviceOwner"
                          placeholder="John Doe (Team Name)"
                          value={newApp.serviceOwner}
                          onChange={(e) => setNewApp({...newApp, serviceOwner: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="riskScore">Risk Score (0-100)</Label>
                      <Input
                        id="riskScore"
                        type="number"
                        min="0"
                        max="100"
                        value={newApp.riskScore}
                        onChange={(e) => setNewApp({...newApp, riskScore: parseInt(e.target.value) || 0})}
                      />
                    </div>

                    <div>
                      <Label>Compliance Tags</Label>
                      <Select onValueChange={(value) => {
                        if (value && !newApp.tags.includes(value)) {
                          setNewApp(prev => ({
                            ...prev,
                            tags: [...prev.tags, value]
                          }));
                        }
                      }}>
                        <SelectTrigger className="mb-2">
                          <SelectValue placeholder="Select compliance tags" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HITRUST">HITRUST</SelectItem>
                          <SelectItem value="ISO 27001">ISO 27001</SelectItem>
                          <SelectItem value="SOC 2">SOC 2</SelectItem>
                          <SelectItem value="HIPAA">HIPAA</SelectItem>
                          <SelectItem value="PCI DSS">PCI DSS</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-2">
                        {newApp.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="bg-green-50 border-green-200 text-green-700">
                            {tag}
                            <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleRemoveTag(tag)} />
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Labels</Label>
                      <div className="flex gap-2 mb-2">
                        <Input
                          placeholder="Add label (e.g., Critical, Backend)"
                          value={labelInput}
                          onChange={(e) => setLabelInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddLabel()}
                        />
                        <Button type="button" variant="outline" onClick={handleAddLabel}>
                          Add
                        </Button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {newApp.labels.map((label, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {label}
                            <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => handleRemoveLabel(label)} />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleAddApplication}
                      disabled={addApplicationMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {addApplicationMutation.isPending ? "Adding..." : "Add Service"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Applications List */}
          <div className="space-y-4">
            {filteredApplications.map((app) => {
              const findings = JSON.parse(app.totalFindings);
              return (
                <Card key={app.id} className="transition-all duration-200 hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{app.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">{app.description}</p>
                            <div className="flex items-center gap-4 mt-3">
                              <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                                {app.scanEngine}
                              </Badge>
                              <span className="text-sm text-gray-600">Risk Score: {app.riskScore}</span>
                              <span className="text-sm text-gray-600">Last scan: {app.lastScan}</span>
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-sm text-gray-600 mb-2">Security Findings</div>
                            <div className="flex gap-2">
                              {findings.C > 0 && <Badge className="bg-red-600 text-white text-xs">{findings.C} Critical</Badge>}
                              {findings.H > 0 && <Badge className="bg-orange-500 text-white text-xs">{findings.H} High</Badge>}
                              {findings.M > 0 && <Badge className="bg-yellow-500 text-white text-xs">{findings.M} Medium</Badge>}
                              {findings.L > 0 && <Badge className="bg-green-500 text-white text-xs">{findings.L} Low</Badge>}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-6">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Service</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{app.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteApplicationMutation.mutate(app.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {filteredApplications.length === 0 && (
            <div className="text-center py-12">
              <Shield className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm ? "No services match your search criteria." : "Get started by adding your first service."}
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}