import Navigation from "@/components/navigation";
import PageWrapper from "@/components/page-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Github,
  ExternalLink,
  MessageSquare,
  User,
  Shield,
  AlertTriangle,
  Calendar,
  Target,
  Activity,
  TrendingUp,
  Clock,
  Edit3,
  Save,
  X
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useParams, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import type { Application } from "@shared/schema";

interface FindingsData {
  total: number;
  C: number;
  H: number;
  M: number;
  L: number;
}

function RiskBadge({ level, count }: { level: string; count: number }) {
  if (count === 0) return <span className="text-xs text-gray-400">0</span>;

  const colors = {
    C: "bg-red-600 text-white",
    H: "bg-orange-500 text-white", 
    M: "bg-yellow-500 text-white",
    L: "bg-green-500 text-white"
  };

  const labels = {
    C: "Critical",
    H: "High", 
    M: "Medium",
    L: "Low"
  };

  return (
    <Badge className={`${colors[level as keyof typeof colors]} text-sm px-3 py-1`}>
      {count} {labels[level as keyof typeof labels]}
    </Badge>
  );
}

function EngineBadge({ engine, findings }: { engine: string; findings: FindingsData }) {
  const engineColors = {
    mend: "bg-blue-100 text-blue-800 border-blue-200",
    crowdstrike: "bg-red-100 text-red-800 border-red-200",
    escape: "bg-purple-100 text-purple-800 border-purple-200"
  };

  return (
    <div className="border rounded-lg p-3 space-y-2">
      <div className={`text-xs font-medium px-2 py-1 rounded-full border ${engineColors[engine as keyof typeof engineColors]}`}>
        {engine.charAt(0).toUpperCase() + engine.slice(1)}
      </div>
      <div className="flex flex-wrap gap-1 text-xs">
        <span className="bg-red-50 text-red-700 px-1 py-0.5 rounded">C: {findings.C}</span>
        <span className="bg-orange-50 text-orange-700 px-1 py-0.5 rounded">H: {findings.H}</span>
        <span className="bg-yellow-50 text-yellow-700 px-1 py-0.5 rounded">M: {findings.M}</span>
        <span className="bg-green-50 text-green-700 px-1 py-0.5 rounded">L: {findings.L}</span>
      </div>
    </div>
  );
}

// Calculate percentile ranking based on total findings
function calculatePercentile(applications: Application[], currentApp: Application): number {
  const currentFindings = JSON.parse(currentApp.totalFindings).total;
  const allFindings = applications.map(app => JSON.parse(app.totalFindings).total);
  
  // Count how many applications have more findings than current app
  const higherCount = allFindings.filter(findings => findings > currentFindings).length;
  
  // Calculate percentile (fewer findings = higher percentile)
  return (higherCount / applications.length) * 100;
}

function PercentileBadge({ percentile }: { percentile: number }) {
  let color = "bg-gray-500";
  let label = "Average";
  
  if (percentile >= 90) {
    color = "bg-green-600";
    label = "Top 10%";
  } else if (percentile >= 75) {
    color = "bg-blue-500";
    label = "Top 25%";
  } else if (percentile >= 50) {
    color = "bg-yellow-500";
    label = "Top 50%";
  } else if (percentile >= 25) {
    color = "bg-orange-500";
    label = "Bottom 50%";
  } else {
    color = "bg-red-600";
    label = "Bottom 25%";
  }

  return (
    <Badge className={`${color} text-white text-xs px-2 py-0.5`}>
      {Math.round(percentile)}%
    </Badge>
  );
}

function ServiceTierBadge({ percentile }: { percentile: number }) {
  let tier: string;
  let colors: string;
  let glowColor: string;
  let tooltipText: string;
  
  if (percentile >= 76) {
    tier = "Platinum";
    colors = "bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg";
    glowColor = "shadow-purple-400/50";
    tooltipText = "🎉 Congrats! Platinum Tier (76-100%): Exceptional security with minimal findings. Your service is in the top performers!";
  } else if (percentile >= 51) {
    tier = "Gold";
    colors = "bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg";
    glowColor = "shadow-yellow-400/50";
    tooltipText = "Gold Tier (51-75%): Strong security posture with relatively few findings. Well above average performance.";
  } else if (percentile >= 26) {
    tier = "Silver";
    colors = "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg";
    glowColor = "shadow-gray-400/50";
    tooltipText = "Silver Tier (26-50%): Moderate security level with average findings. Room for improvement exists.";
  } else {
    tier = "Bronze";
    colors = "bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-lg";
    glowColor = "shadow-orange-400/50";
    tooltipText = "Bronze Tier (0-25%): Higher number of findings detected. Consider prioritizing security improvements.";
  }

  const isPlatinum = percentile >= 76;

  return (
    <div className="relative">
      <Tooltip>
        <TooltipTrigger>
          <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${colors} ${glowColor} text-sm px-4 py-2 font-bold tracking-wide
            animate-badge-reveal animate-float
            hover:scale-110 hover:shadow-2xl hover:brightness-110 hover:animate-glow-pulse
            transform transition-all duration-500 ease-in-out
            cursor-pointer relative overflow-hidden rounded-full
            before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent
            before:animate-shimmer before:duration-2000 before:ease-in-out
            after:absolute after:inset-0 after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent
            after:animate-pulse after:duration-3000
            group`}>
            <span className="relative z-10 drop-shadow-sm">{tier}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-center">
          <p>{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
      
      {/* Animated ring effect */}
      <div className={`absolute inset-0 rounded-full border-2 ${glowColor.replace('shadow-', 'border-')} 
        animate-ping opacity-20 scale-110`}></div>
      
      {/* Sparkle effects */}
      <div className="absolute -top-1 -right-1 w-2 h-2 bg-white/80 rounded-full animate-ping delay-500"></div>
      <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-white/60 rounded-full animate-ping delay-1000"></div>
      
      {/* Confetti for Platinum services */}
      {isPlatinum && (
        <>
          <div className="absolute -top-2 -left-2 w-1 h-1 bg-yellow-400 rounded-full animate-confetti-1"></div>
          <div className="absolute -top-3 left-1/2 w-1 h-1 bg-blue-400 rounded-full animate-confetti-2"></div>
          <div className="absolute -top-2 -right-2 w-1 h-1 bg-red-400 rounded-full animate-confetti-3"></div>
          <div className="absolute top-1/2 -left-3 w-1 h-1 bg-green-400 rounded-full animate-confetti-4"></div>
          <div className="absolute top-1/2 -right-3 w-1 h-1 bg-pink-400 rounded-full animate-confetti-5"></div>
          <div className="absolute -bottom-2 -left-2 w-1 h-1 bg-purple-400 rounded-full animate-confetti-6"></div>
          <div className="absolute -bottom-3 left-1/3 w-1 h-1 bg-orange-400 rounded-full animate-confetti-7"></div>
          <div className="absolute -bottom-2 -right-2 w-1 h-1 bg-cyan-400 rounded-full animate-confetti-8"></div>
        </>
      )}
    </div>
  );
}

export default function ServiceDetail() {
  const params = useParams();
  const serviceId = params.id;
  const { toast } = useToast();
  const [editingService, setEditingService] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const application = applications.find(app => app.id.toString() === serviceId);

  const updateServiceMutation = useMutation({
    mutationFn: async (updatedData: any) => {
      const response = await fetch(`/api/applications/${serviceId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) throw new Error("Failed to update service");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      setIsEditDialogOpen(false);
      setEditingService(null);
      toast({
        title: "Service Updated",
        description: "Service information has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update service information.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    setEditingService({
      githubRepo: application?.githubRepo || "",
      jiraProject: application?.jiraProject || "",
      slackChannel: application?.slackChannel || "",
      serviceOwner: application?.serviceOwner || "",
      riskScore: application?.riskScore || 0,
      tags: application?.tags || [],
      mendLink: application?.mendLink || "",
      crowdstrikeLink: application?.crowdstrikeLink || "",
      escapeLink: application?.escapeLink || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleSave = () => {
    updateServiceMutation.mutate(editingService);
  };

  if (isLoading) {
    return (
      <PageWrapper loadingMessage="Loading Service Details...">
        <div className="min-h-screen bg-gray-50">
          <Navigation onLogout={handleLogout} currentPage="services" />
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="h-64 bg-gray-200 rounded"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!application) {
    return (
      <PageWrapper loadingMessage="Service not found">
        <div className="min-h-screen bg-gray-50">
          <Navigation onLogout={handleLogout} currentPage="services" />
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h1>
              <p className="text-gray-600 mb-6">The requested service could not be found.</p>
              <Link href="/services">
                <Button className="bg-green-600 hover:bg-green-700">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Services
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Use default values if totalFindings is not available
  const findings: FindingsData = application.totalFindings ? 
    JSON.parse(application.totalFindings) : 
    { total: 0, C: 0, H: 0, M: 0, L: 0 };
  const percentile = calculatePercentile(applications, application);
  
  // Mock engine findings data
  const engineFindings = {
    mend: { total: Math.floor(findings.total * 0.4), C: Math.floor(findings.C * 0.5), H: Math.floor(findings.H * 0.3), M: Math.floor(findings.M * 0.4), L: Math.floor(findings.L * 0.5) },
    crowdstrike: { total: Math.floor(findings.total * 0.35), C: Math.floor(findings.C * 0.3), H: Math.floor(findings.H * 0.4), M: Math.floor(findings.M * 0.3), L: Math.floor(findings.L * 0.3) },
    escape: { total: Math.floor(findings.total * 0.25), C: Math.floor(findings.C * 0.2), H: Math.floor(findings.H * 0.3), M: Math.floor(findings.M * 0.3), L: Math.floor(findings.L * 0.2) }
  };

  return (
    <PageWrapper loadingMessage="Loading Service Details...">
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          <Navigation onLogout={handleLogout} currentPage="services" />
      
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Link href="/services">
                <Button variant="outline" className="transition-all duration-200 hover:scale-105">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Services
                </Button>
              </Link>
              
              <Button 
                onClick={handleEdit}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit Service Info
              </Button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{application.name}</h1>
                <p className="mt-2 text-gray-600">
                  {application.description || "Comprehensive security analysis and vulnerability management"}
                </p>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-600">Risk Score</div>
                <div className="text-3xl font-bold text-orange-600">{application.riskScore}</div>
                <div className="text-sm text-gray-600">Medium Risk</div>
              </div>
            </div>
          </div>

          {/* Service Information & Links */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="transition-all duration-200 hover:shadow-lg hover:scale-105">
              <CardContent className="p-4">
                <a 
                  href={application.githubRepo || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-900 hover:text-green-600 transition-colors"
                >
                  <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Github className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium">GitHub Repo</p>
                    <p className="text-sm text-gray-600">View source code</p>
                  </div>
                  <ExternalLink className="h-4 w-4 ml-auto" />
                </a>
              </CardContent>
            </Card>
            
            <Card className="transition-all duration-200 hover:shadow-lg hover:scale-105">
              <CardContent className="p-4">
                <a 
                  href={application.jiraProject || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-900 hover:text-green-600 transition-colors"
                >
                  <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Target className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Jira Project</p>
                    <p className="text-sm text-gray-600">Track issues</p>
                  </div>
                  <ExternalLink className="h-4 w-4 ml-auto" />
                </a>
              </CardContent>
            </Card>
            
            <Card className="transition-all duration-200 hover:shadow-lg hover:scale-105">
              <CardContent className="p-4">
                <a 
                  href={application.slackChannel || "#"} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-gray-900 hover:text-green-600 transition-colors"
                >
                  <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">Slack Channel</p>
                    <p className="text-sm text-gray-600">Team communication</p>
                  </div>
                  <ExternalLink className="h-4 w-4 ml-auto" />
                </a>
              </CardContent>
            </Card>
            
            <Card className="transition-all duration-200 hover:shadow-lg hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Service Owner</p>
                    <p className="text-sm text-green-600">
                      {application.serviceOwner || "Engineering Team"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Findings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Card className="transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Security Findings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Total by Severity</h4>
                    <div className="flex flex-wrap gap-3">
                      <RiskBadge level="C" count={findings.C} />
                      <RiskBadge level="H" count={findings.H} />
                      <RiskBadge level="M" count={findings.M} />
                      <RiskBadge level="L" count={findings.L} />
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      Total: {findings.total} findings
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Findings by Scanner</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <EngineBadge engine="mend" findings={engineFindings.mend} />
                      <EngineBadge engine="crowdstrike" findings={engineFindings.crowdstrike} />
                      <EngineBadge engine="escape" findings={engineFindings.escape} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Service Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 2x2 Grid for Risk Score and Percentile */}
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-600 animate-in fade-in-0 slide-in-from-left-2 duration-500">Risk Score</p>
                      <div className="flex items-center gap-3">
                        <p className="text-2xl font-bold text-orange-600 animate-in fade-in-0 slide-in-from-left-2 duration-500 delay-150 hover:scale-105 transition-transform duration-300">
                          {application.riskScore}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 animate-in fade-in-0 slide-in-from-left-2 duration-500">Percentile Rank</p>
                      <div className="flex items-center gap-3">
                        <p className="text-2xl font-bold text-blue-600 animate-in fade-in-0 slide-in-from-left-2 duration-500 delay-150 hover:scale-105 transition-transform duration-300">
                          {Math.round(percentile)}%
                        </p>
                        <ServiceTierBadge percentile={percentile} />
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Based on total findings</div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Compliance Tags</p>
                      <div className="flex flex-wrap gap-2">
                        {application.tags?.map((tag, index) => (
                          <Badge key={index} variant="outline" className="bg-green-50 border-green-200 text-green-700">
                            {tag}
                          </Badge>
                        )) || <span className="text-sm text-gray-400">No tags assigned</span>}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm text-gray-600 mb-2">Labels</p>
                      <div className="flex flex-wrap gap-2">
                        {application.labels?.map((label, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {label}
                          </Badge>
                        )) || <span className="text-sm text-gray-400">No labels assigned</span>}
                      </div>
                    </div>
                  </div>

                  {application.hasAlert && (
                    <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      <span className="text-sm text-red-700 font-medium">
                        Active security alert - requires immediate attention
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Scanner Links */}
          <div className="flex gap-4 mb-8">
            <a 
              href={application.mendLink || "#"} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="transition-all duration-200 hover:scale-105 border-blue-200 hover:bg-blue-50">
                <Shield className="h-4 w-4 mr-2" />
                Take me to Mend
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </a>
            <a 
              href={application.crowdstrikeLink || "#"} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="transition-all duration-200 hover:scale-105 border-red-200 hover:bg-red-50">
                <Shield className="h-4 w-4 mr-2" />
                Take me to Crowdstrike
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </a>
            <a 
              href={application.escapeLink || "#"} 
              target="_blank" 
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="transition-all duration-200 hover:scale-105 border-purple-200 hover:bg-purple-50">
                <Shield className="h-4 w-4 mr-2" />
                Take me to Escape
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </a>
          </div>

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Edit Service Information</DialogTitle>
                <DialogDescription>
                  Update the service links, risk score, compliance tags, and owner information below.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="riskScore">Risk Score</Label>
                    <Input
                      id="riskScore"
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      placeholder="1.9"
                      value={editingService?.riskScore || ""}
                      onChange={(e) => setEditingService({...editingService, riskScore: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="serviceOwner">Service Owner</Label>
                    <Input
                      id="serviceOwner"
                      placeholder="John Doe (Team Name)"
                      value={editingService?.serviceOwner || ""}
                      onChange={(e) => setEditingService({...editingService, serviceOwner: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Compliance Tags</Label>
                  <div className="space-y-3 mt-2">
                    {/* Display selected tags */}
                    <div className="flex flex-wrap gap-2">
                      {(editingService?.tags || []).map((tag: string, index: number) => (
                        <Badge key={index} variant="outline" className="bg-green-50 border-green-200 text-green-700 flex items-center gap-1">
                          {tag}
                          <button
                            type="button"
                            onClick={() => {
                              const newTags = editingService.tags.filter((_: string, i: number) => i !== index);
                              setEditingService({...editingService, tags: newTags});
                            }}
                            className="ml-1 hover:text-red-500 text-green-500"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                    
                    {/* Dropdown for adding tags */}
                    <Select
                      onValueChange={(value) => {
                        if (value === "custom") {
                          // Don't add anything, let user type in custom field
                          return;
                        }
                        const currentTags = editingService?.tags || [];
                        if (!currentTags.includes(value)) {
                          setEditingService({...editingService, tags: [...currentTags, value]});
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select or add compliance tags" />
                      </SelectTrigger>
                      <SelectContent>
                        {["HITRUST", "ISO 27001", "SOC 2", "HIPAA", "PCI DSS"].map((tag) => (
                          <SelectItem key={tag} value={tag}>
                            {tag}
                          </SelectItem>
                        ))}
                        <SelectItem value="custom">+ Add custom tag</SelectItem>
                      </SelectContent>
                    </Select>
                    
                    {/* Custom tag input */}
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter custom compliance tag"
                        value={newTagInput}
                        onChange={(e) => setNewTagInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && newTagInput.trim()) {
                            e.preventDefault();
                            const currentTags = editingService?.tags || [];
                            if (!currentTags.includes(newTagInput.trim())) {
                              setEditingService({...editingService, tags: [...currentTags, newTagInput.trim()]});
                            }
                            setNewTagInput("");
                          }
                        }}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (newTagInput.trim()) {
                            const currentTags = editingService?.tags || [];
                            if (!currentTags.includes(newTagInput.trim())) {
                              setEditingService({...editingService, tags: [...currentTags, newTagInput.trim()]});
                            }
                            setNewTagInput("");
                          }
                        }}
                        disabled={!newTagInput.trim()}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Select from dropdown or add custom compliance tags
                  </p>
                </div>

                <div>
                  <Label htmlFor="githubRepo">GitHub Repository</Label>
                  <Input
                    id="githubRepo"
                    placeholder="https://github.com/company/repo"
                    value={editingService?.githubRepo || ""}
                    onChange={(e) => setEditingService({...editingService, githubRepo: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="jiraProject">Jira Project</Label>
                  <Input
                    id="jiraProject"
                    placeholder="https://company.atlassian.net/browse/PROJECT"
                    value={editingService?.jiraProject || ""}
                    onChange={(e) => setEditingService({...editingService, jiraProject: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="slackChannel">Slack Channel</Label>
                  <Input
                    id="slackChannel"
                    placeholder="https://company.slack.com/channels/team"
                    value={editingService?.slackChannel || ""}
                    onChange={(e) => setEditingService({...editingService, slackChannel: e.target.value})}
                  />
                </div>
                
                {/* Security Scanner Links */}
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-medium text-gray-900">Security Scanner Links</h4>
                  <div>
                    <Label htmlFor="mendLink">Mend Scanner Link</Label>
                    <Input
                      id="mendLink"
                      placeholder="https://mend.company.com/project/..."
                      value={editingService?.mendLink || ""}
                      onChange={(e) => setEditingService({...editingService, mendLink: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="crowdstrikeLink">Crowdstrike Scanner Link</Label>
                    <Input
                      id="crowdstrikeLink"
                      placeholder="https://falcon.crowdstrike.com/investigate/..."
                      value={editingService?.crowdstrikeLink || ""}
                      onChange={(e) => setEditingService({...editingService, crowdstrikeLink: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="escapeLink">Escape Scanner Link</Label>
                    <Input
                      id="escapeLink"
                      placeholder="https://escape.company.com/dashboard/..."
                      value={editingService?.escapeLink || ""}
                      onChange={(e) => setEditingService({...editingService, escapeLink: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave}
                  disabled={updateServiceMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {updateServiceMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        </div>
      </TooltipProvider>
    </PageWrapper>
  );
}