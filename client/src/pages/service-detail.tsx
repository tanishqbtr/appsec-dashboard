import React from "react";
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
  X,
  Database,
  Lock,
  Globe,
  BarChart3,
  AlertOctagon,
  Zap,
  AlertCircle,
  Info
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import type { Application } from "@shared/schema";

// Function to format lowercase values to proper case
function formatValue(value: string): string {
  if (!value) return value;
  
  const formatMap: { [key: string]: string } = {
    'yes': 'Yes',
    'no': 'No',
    'high': 'High',
    'medium': 'Medium',
    'low': 'Low',
    'critical': 'Critical',
    'sensitive-regulated': 'Sensitive Regulated',
    'public-regulated': 'Public Regulated',
    'internal': 'Internal',
    'confidential': 'Confidential',
    'restricted': 'Restricted'
  };
  
  return formatMap[value.toLowerCase()] || value.charAt(0).toUpperCase() + value.slice(1).replace(/-/g, ' ');
}

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

// Calculate percentile ranking based on total findings across ALL engines
function calculatePercentileWithAllFindings(applications: Application[], app: Application, getAllServiceFindings: (serviceName: string) => FindingsData): number {
  // Get total findings for this app across ALL engines
  const appFindings = getAllServiceFindings(app.name);
  const appTotal = appFindings.total;
  
  // Count how many applications have fewer total findings than this one
  const appsWithFewerFindings = applications.filter(otherApp => {
    const otherFindings = getAllServiceFindings(otherApp.name);
    return otherFindings.total < appTotal;
  }).length;
  
  return Math.round((appsWithFewerFindings / applications.length) * 100);
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
  const { logout } = useAuth();
  const [editingService, setEditingService] = useState<any>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [newTagInput, setNewTagInput] = useState("");

  const handleGoBack = () => {
    window.history.back();
  };

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications-with-risk"],
  });

  // Get total findings data for percentile calculation
  const { data: servicesWithFindings = [] } = useQuery({
    queryKey: ["/api/services-total-findings"],
  });

  const application = applications.find(app => app.id.toString() === serviceId);

  // Risk assessment data query
  const { data: riskAssessmentData } = useQuery({
    queryKey: ['/api/risk-assessments', application?.name],
    enabled: !!application?.name,
  });

  // Fetch all findings data for accurate percentile calculation
  const allScaQuery = useQuery({
    queryKey: ["/api/mend/sca"],
  });
  
  const allSastQuery = useQuery({
    queryKey: ["/api/mend/sast"],
  });
  
  const allMendContainersQuery = useQuery({
    queryKey: ["/api/mend/containers"],
  });

  const allWebAppsQuery = useQuery({
    queryKey: ["/api/escape/webapps"],
  });
  
  const allApisQuery = useQuery({
    queryKey: ["/api/escape/apis"],
  });

  const allImagesQuery = useQuery({
    queryKey: ["/api/crowdstrike/images"],
  });
  
  const allCrowdstrikeContainersQuery = useQuery({
    queryKey: ["/api/crowdstrike/containers"],
  });

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
      queryClient.invalidateQueries({ queryKey: ["/api/applications-with-risk"] });
      queryClient.invalidateQueries({ queryKey: ["/api/services-with-risk-scores"] });
      queryClient.invalidateQueries({ queryKey: ["/api/risk-assessments"] });
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
      name: application?.name || "",
      description: application?.description || "",
      githubRepo: application?.githubRepo || "",
      jiraProject: application?.jiraProject || "",
      slackChannel: application?.slackChannel || "",
      serviceOwner: application?.serviceOwner || "",
      tags: application?.tags || [],
      mendUrl: application?.mendUrl || "",
      crowdstrikeUrl: application?.crowdstrikeUrl || "",
      escapeUrl: application?.escapeUrl || "",
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
          <Navigation onLogout={logout} currentPage="services" />
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
          <Navigation onLogout={logout} currentPage="services" />
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">Service Not Found</h1>
              <p className="text-gray-600 mb-6">The requested service could not be found.</p>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={handleGoBack}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Calculate percentile using all findings data across all engines
  const getAllServiceFindings = (serviceName: string): FindingsData => {
    let totalFindings = { total: 0, C: 0, H: 0, M: 0, L: 0 };
    
    // Helper function to add findings
    const addFindings = (findings: any[]) => {
      findings?.forEach((finding: any) => {
        if (finding.serviceName === serviceName) {
          totalFindings.C += finding.critical;
          totalFindings.H += finding.high;
          totalFindings.M += finding.medium;
          totalFindings.L += finding.low;
          totalFindings.total += finding.critical + finding.high + finding.medium + finding.low;
        }
      });
    };

    // Add findings from all engines
    addFindings(allScaQuery.data);
    addFindings(allSastQuery.data);
    addFindings(allMendContainersQuery.data);
    addFindings(allWebAppsQuery.data);
    addFindings(allApisQuery.data);
    addFindings(allImagesQuery.data);
    addFindings(allCrowdstrikeContainersQuery.data);
    
    return totalFindings;
  };

  const calculatePercentileWithTotalFindings = (currentApp: Application): number => {
    if (!currentApp || !servicesWithFindings.length) return 0;
    
    // Find this service's total findings
    const findingsData = servicesWithFindings.find(service => service.name === currentApp.name);
    const currentTotalFindings = findingsData?.totalFindings || 0;
    
    // Count applications with higher total findings (worse security)
    const appsWithMoreFindings = servicesWithFindings.filter(service => {
      return service.totalFindings > currentTotalFindings;
    }).length;
    
    // Higher percentile = better security (fewer findings)
    return Math.round((appsWithMoreFindings / servicesWithFindings.length) * 100);
  };

  const percentile = application ? calculatePercentileWithTotalFindings(application) : 0;
  
  // Get comprehensive findings data across all engines for this service
  const comprehensiveFindings: FindingsData = application ? getAllServiceFindings(application.name) : { total: 0, C: 0, H: 0, M: 0, L: 0 };
  
  // Calculate actual engine findings data from real API data
  const getEngineFindings = () => {
    if (!application) return { mend: { total: 0, C: 0, H: 0, M: 0, L: 0 }, crowdstrike: { total: 0, C: 0, H: 0, M: 0, L: 0 }, escape: { total: 0, C: 0, H: 0, M: 0, L: 0 } };
    
    const serviceName = application.name;
    const engineFindings = {
      mend: { total: 0, C: 0, H: 0, M: 0, L: 0 },
      crowdstrike: { total: 0, C: 0, H: 0, M: 0, L: 0 },
      escape: { total: 0, C: 0, H: 0, M: 0, L: 0 }
    };

    // Add Mend findings (SCA, SAST, Containers)
    [allScaQuery.data, allSastQuery.data, allMendContainersQuery.data].forEach(findings => {
      findings?.forEach((finding: any) => {
        if (finding.serviceName === serviceName) {
          engineFindings.mend.C += finding.critical;
          engineFindings.mend.H += finding.high;
          engineFindings.mend.M += finding.medium;
          engineFindings.mend.L += finding.low;
          engineFindings.mend.total += finding.critical + finding.high + finding.medium + finding.low;
        }
      });
    });

    // Add Crowdstrike findings (Images, Containers)
    [allImagesQuery.data, allCrowdstrikeContainersQuery.data].forEach(findings => {
      findings?.forEach((finding: any) => {
        if (finding.serviceName === serviceName) {
          engineFindings.crowdstrike.C += finding.critical;
          engineFindings.crowdstrike.H += finding.high;
          engineFindings.crowdstrike.M += finding.medium;
          engineFindings.crowdstrike.L += finding.low;
          engineFindings.crowdstrike.total += finding.critical + finding.high + finding.medium + finding.low;
        }
      });
    });

    // Add Escape findings (Web Apps, APIs)
    [allWebAppsQuery.data, allApisQuery.data].forEach(findings => {
      findings?.forEach((finding: any) => {
        if (finding.serviceName === serviceName) {
          engineFindings.escape.C += finding.critical;
          engineFindings.escape.H += finding.high;
          engineFindings.escape.M += finding.medium;
          engineFindings.escape.L += finding.low;
          engineFindings.escape.total += finding.critical + finding.high + finding.medium + finding.low;
        }
      });
    });

    return engineFindings;
  };

  const engineFindings = getEngineFindings();

  return (
    <PageWrapper loadingMessage="Loading Service Details...">
      <TooltipProvider>
        <div className="min-h-screen bg-gray-50">
          <Navigation onLogout={logout} currentPage="services" />
      
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <Button 
                variant="outline" 
                className="transition-all duration-200 hover:scale-105"
                onClick={handleGoBack}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
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
                <p className={`mt-2 ${application.description ? "text-gray-600" : "text-gray-400"}`}>
                  {application.description || "Description not set"}
                </p>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-600">Risk Score</div>
                <div className="text-3xl font-bold text-orange-600">
                  {riskAssessmentData?.finalRiskScore || application.riskScore || "0.0"}
                </div>
                <div className="text-sm text-gray-600">
                  {riskAssessmentData?.riskLevel || "Medium Risk"}
                </div>
              </div>
            </div>
          </div>

          {/* Service Information & Links */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="transition-all duration-200 hover:shadow-lg hover:scale-105">
              <CardContent className="p-4">
                {application.githubRepo ? (
                  <a 
                    href={application.githubRepo} 
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
                ) : (
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Github className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">GitHub Repo</p>
                      <p className="text-sm text-gray-400">Not set</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="transition-all duration-200 hover:shadow-lg hover:scale-105">
              <CardContent className="p-4">
                {application.jiraProject ? (
                  <a 
                    href={application.jiraProject} 
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
                ) : (
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Target className="h-5 w-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="font-medium">Jira Project</p>
                      <p className="text-sm text-gray-400">Not set</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="transition-all duration-200 hover:shadow-lg hover:scale-105">
              <CardContent className="p-4">
                {application.slackChannel ? (
                  <a 
                    href={application.slackChannel} 
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
                ) : (
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="h-10 w-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="font-medium">Slack Channel</p>
                      <p className="text-sm text-gray-400">Not set</p>
                    </div>
                  </div>
                )}
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
                    <p className={`text-sm ${application.serviceOwner ? "text-green-600" : "text-gray-400"}`}>
                      {application.serviceOwner || "Not set"}
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
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Critical:</span>
                        <RiskBadge level="C" count={comprehensiveFindings.C} />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">High:</span>
                        <RiskBadge level="H" count={comprehensiveFindings.H} />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Medium:</span>
                        <RiskBadge level="M" count={comprehensiveFindings.M} />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Low:</span>
                        <RiskBadge level="L" count={comprehensiveFindings.L} />
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t text-sm text-gray-600 font-medium">
                      Total: {comprehensiveFindings.total} findings
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Target className="h-5 w-5 text-blue-600" />
                      <h4 className="text-lg font-semibold text-gray-900">Findings by Scanner</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                      {/* Mend Scanner Card */}
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Shield className="h-4 w-4 text-blue-600" />
                            </div>
                            <h5 className="font-semibold text-gray-800">Mend</h5>
                          </div>
                          {application.mendUrl ? (
                            <a 
                              href={application.mendUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <Button size="sm" variant="outline" className="bg-white/50 border-blue-300 text-blue-700 hover:bg-blue-50">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Take me to Mend
                              </Button>
                            </a>
                          ) : (
                            <Button size="sm" variant="outline" disabled className="bg-gray-100 border-gray-300 text-gray-400">
                              Not configured
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          <div className="flex flex-col items-center bg-red-50 rounded-lg p-3 border border-red-200">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertOctagon className="h-4 w-4 text-red-600" />
                              <span className="text-xs font-medium text-red-700">Critical</span>
                            </div>
                            <div className="text-red-600 font-bold text-xl">{engineFindings.mend.C}</div>
                          </div>
                          <div className="flex flex-col items-center bg-orange-50 rounded-lg p-3 border border-orange-200">
                            <div className="flex items-center gap-2 mb-1">
                              <Zap className="h-4 w-4 text-orange-600" />
                              <span className="text-xs font-medium text-orange-700">High</span>
                            </div>
                            <div className="text-orange-600 font-bold text-xl">{engineFindings.mend.H}</div>
                          </div>
                          <div className="flex flex-col items-center bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertCircle className="h-4 w-4 text-yellow-600" />
                              <span className="text-xs font-medium text-yellow-700">Medium</span>
                            </div>
                            <div className="text-yellow-600 font-bold text-xl">{engineFindings.mend.M}</div>
                          </div>
                          <div className="flex flex-col items-center bg-green-50 rounded-lg p-3 border border-green-200">
                            <div className="flex items-center gap-2 mb-1">
                              <Info className="h-4 w-4 text-green-600" />
                              <span className="text-xs font-medium text-green-700">Low</span>
                            </div>
                            <div className="text-green-600 font-bold text-xl">{engineFindings.mend.L}</div>
                          </div>
                        </div>
                        <div className="text-center mt-2 text-sm text-gray-600">
                          Total: {engineFindings.mend.total} findings
                        </div>
                      </div>

                      {/* Crowdstrike Scanner Card */}
                      <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-slate-100 rounded-lg flex items-center justify-center">
                              <Shield className="h-4 w-4 text-slate-600" />
                            </div>
                            <h5 className="font-semibold text-gray-800">Crowdstrike</h5>
                          </div>
                          {application.crowdstrikeUrl ? (
                            <a 
                              href={application.crowdstrikeUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <Button size="sm" variant="outline" className="bg-white/50 border-slate-300 text-slate-700 hover:bg-slate-50">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Take me to Crowdstrike
                              </Button>
                            </a>
                          ) : (
                            <Button size="sm" variant="outline" disabled className="bg-gray-100 border-gray-300 text-gray-400">
                              Not configured
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          <div className="flex flex-col items-center bg-red-50 rounded-lg p-3 border border-red-200">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertOctagon className="h-4 w-4 text-red-600" />
                              <span className="text-xs font-medium text-red-700">Critical</span>
                            </div>
                            <div className="text-red-600 font-bold text-xl">{engineFindings.crowdstrike.C}</div>
                          </div>
                          <div className="flex flex-col items-center bg-orange-50 rounded-lg p-3 border border-orange-200">
                            <div className="flex items-center gap-2 mb-1">
                              <Zap className="h-4 w-4 text-orange-600" />
                              <span className="text-xs font-medium text-orange-700">High</span>
                            </div>
                            <div className="text-orange-600 font-bold text-xl">{engineFindings.crowdstrike.H}</div>
                          </div>
                          <div className="flex flex-col items-center bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertCircle className="h-4 w-4 text-yellow-600" />
                              <span className="text-xs font-medium text-yellow-700">Medium</span>
                            </div>
                            <div className="text-yellow-600 font-bold text-xl">{engineFindings.crowdstrike.M}</div>
                          </div>
                          <div className="flex flex-col items-center bg-green-50 rounded-lg p-3 border border-green-200">
                            <div className="flex items-center gap-2 mb-1">
                              <Info className="h-4 w-4 text-green-600" />
                              <span className="text-xs font-medium text-green-700">Low</span>
                            </div>
                            <div className="text-green-600 font-bold text-xl">{engineFindings.crowdstrike.L}</div>
                          </div>
                        </div>
                        <div className="text-center mt-2 text-sm text-gray-600">
                          Total: {engineFindings.crowdstrike.total} findings
                        </div>
                      </div>

                      {/* Escape Scanner Card */}
                      <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-4 hover:shadow-lg transition-all duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Shield className="h-4 w-4 text-purple-600" />
                            </div>
                            <h5 className="font-semibold text-gray-800">Escape</h5>
                          </div>
                          {application.escapeUrl ? (
                            <a 
                              href={application.escapeUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                            >
                              <Button size="sm" variant="outline" className="bg-white/50 border-purple-300 text-purple-700 hover:bg-purple-50">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Take me to Escape
                              </Button>
                            </a>
                          ) : (
                            <Button size="sm" variant="outline" disabled className="bg-gray-100 border-gray-300 text-gray-400">
                              Not configured
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                          <div className="flex flex-col items-center bg-red-50 rounded-lg p-3 border border-red-200">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertOctagon className="h-4 w-4 text-red-600" />
                              <span className="text-xs font-medium text-red-700">Critical</span>
                            </div>
                            <div className="text-red-600 font-bold text-xl">{engineFindings.escape.C}</div>
                          </div>
                          <div className="flex flex-col items-center bg-orange-50 rounded-lg p-3 border border-orange-200">
                            <div className="flex items-center gap-2 mb-1">
                              <Zap className="h-4 w-4 text-orange-600" />
                              <span className="text-xs font-medium text-orange-700">High</span>
                            </div>
                            <div className="text-orange-600 font-bold text-xl">{engineFindings.escape.H}</div>
                          </div>
                          <div className="flex flex-col items-center bg-yellow-50 rounded-lg p-3 border border-yellow-200">
                            <div className="flex items-center gap-2 mb-1">
                              <AlertCircle className="h-4 w-4 text-yellow-600" />
                              <span className="text-xs font-medium text-yellow-700">Medium</span>
                            </div>
                            <div className="text-yellow-600 font-bold text-xl">{engineFindings.escape.M}</div>
                          </div>
                          <div className="flex flex-col items-center bg-green-50 rounded-lg p-3 border border-green-200">
                            <div className="flex items-center gap-2 mb-1">
                              <Info className="h-4 w-4 text-green-600" />
                              <span className="text-xs font-medium text-green-700">Low</span>
                            </div>
                            <div className="text-green-600 font-bold text-xl">{engineFindings.escape.L}</div>
                          </div>
                        </div>
                        <div className="text-center mt-2 text-sm text-gray-600">
                          Total: {engineFindings.escape.total} findings
                        </div>
                      </div>
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
                          {riskAssessmentData?.finalRiskScore || application.riskScore || "0.0"}
                        </p>
                        {riskAssessmentData?.riskLevel && (
                          <Badge className={`${
                            riskAssessmentData.riskLevel === 'Critical' ? 'bg-red-100 text-red-800 border-red-200' :
                            riskAssessmentData.riskLevel === 'High' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                            riskAssessmentData.riskLevel === 'Medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                            'bg-green-100 text-green-800 border-green-200'
                          }`}>
                            {riskAssessmentData.riskLevel}
                          </Badge>
                        )}
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


                  </div>

                  {/* Risk Assessment Details */}
                  <div className="space-y-4 border-t pt-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Shield className="h-5 w-5 text-green-600" />
                        <h4 className="text-lg font-semibold text-gray-900">Risk Assessment Details</h4>
                      </div>
                      <Button 
                        size="sm"
                        variant="outline"
                        onClick={() => window.location.href = '/risk-scoring'}
                        className="flex items-center gap-1 text-green-600 border-green-200 hover:bg-green-50"
                      >
                        <Edit3 className="h-3 w-3" />
                        {riskAssessmentData ? "Edit" : "Create"}
                      </Button>
                    </div>
                    
                    {riskAssessmentData ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Data Classification Card */}
                        <div className="bg-gradient-to-br from-cyan-50 to-cyan-100 border border-cyan-200 rounded-xl p-5 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 transform relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-200/20 rounded-full -mr-10 -mt-10"></div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="h-8 w-8 bg-cyan-100 rounded-lg flex items-center justify-center">
                              <Database className="h-4 w-4 text-cyan-600" />
                            </div>
                            <h5 className="font-semibold text-gray-800">Data Classification</h5>
                          </div>
                          <div className="space-y-2">
                            {riskAssessmentData.dataClassification && (
                              <div className="flex justify-between items-center py-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                                  <span className="text-sm font-medium text-gray-700">Classification:</span>
                                </div>
                                <Badge className="bg-gradient-to-r from-cyan-100 to-cyan-200 text-cyan-800 border-cyan-300 font-semibold">
                                  {formatValue(riskAssessmentData.dataClassification)}
                                </Badge>
                              </div>
                            )}
                            {riskAssessmentData.phi && (
                              <div className="flex justify-between items-center py-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                                  <span className="text-sm font-medium text-gray-700">PHI:</span>
                                </div>
                                <Badge className={`font-semibold ${
                                  riskAssessmentData.phi.toLowerCase() === 'yes' 
                                    ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300' 
                                    : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300'
                                }`}>
                                  {formatValue(riskAssessmentData.phi)}
                                </Badge>
                              </div>
                            )}
                            {riskAssessmentData.eligibilityData && (
                              <div className="flex justify-between items-center py-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse"></div>
                                  <span className="text-sm font-medium text-gray-700">Eligibility Data:</span>
                                </div>
                                <Badge className={`font-semibold ${
                                  riskAssessmentData.eligibilityData.toLowerCase() === 'yes' 
                                    ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300' 
                                    : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300'
                                }`}>
                                  {formatValue(riskAssessmentData.eligibilityData)}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* CIA Triad Card */}
                        <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-xl p-5 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 transform relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-200/20 rounded-full -mr-10 -mt-10"></div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="h-8 w-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                              <Lock className="h-4 w-4 text-indigo-600" />
                            </div>
                            <h5 className="font-semibold text-gray-800">CIA Triad</h5>
                          </div>
                          <div className="space-y-2">
                            {riskAssessmentData.confidentialityImpact && (
                              <div className="flex justify-between items-center py-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                                  <span className="text-sm font-medium text-gray-700">Confidentiality Impact:</span>
                                </div>
                                <Badge className={`font-semibold ${
                                  riskAssessmentData.confidentialityImpact.toLowerCase() === 'high' 
                                    ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300'
                                    : riskAssessmentData.confidentialityImpact.toLowerCase() === 'medium'
                                    ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300'
                                    : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300'
                                }`}>
                                  {formatValue(riskAssessmentData.confidentialityImpact)}
                                </Badge>
                              </div>
                            )}
                            {riskAssessmentData.integrityImpact && (
                              <div className="flex justify-between items-center py-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                                  <span className="text-sm font-medium text-gray-700">Integrity Impact:</span>
                                </div>
                                <Badge className={`font-semibold ${
                                  riskAssessmentData.integrityImpact.toLowerCase() === 'high' 
                                    ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300'
                                    : riskAssessmentData.integrityImpact.toLowerCase() === 'medium'
                                    ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300'
                                    : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300'
                                }`}>
                                  {formatValue(riskAssessmentData.integrityImpact)}
                                </Badge>
                              </div>
                            )}
                            {riskAssessmentData.availabilityImpact && (
                              <div className="flex justify-between items-center py-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
                                  <span className="text-sm font-medium text-gray-700">Availability Impact:</span>
                                </div>
                                <Badge className={`font-semibold ${
                                  riskAssessmentData.availabilityImpact.toLowerCase() === 'high' 
                                    ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300'
                                    : riskAssessmentData.availabilityImpact.toLowerCase() === 'medium'
                                    ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300'
                                    : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300'
                                }`}>
                                  {formatValue(riskAssessmentData.availabilityImpact)}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Attack Surface Factors Card */}
                        <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-5 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 transform relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-200/20 rounded-full -mr-10 -mt-10"></div>
                          <div className="flex items-center gap-2 mb-3">
                            <div className="h-8 w-8 bg-amber-100 rounded-lg flex items-center justify-center">
                              <Globe className="h-4 w-4 text-amber-600" />
                            </div>
                            <h5 className="font-semibold text-gray-800">Attack Surface Factors</h5>
                          </div>
                          <div className="space-y-2">
                            {riskAssessmentData.publicEndpoint && (
                              <div className="flex justify-between items-center py-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                                  <span className="text-sm font-medium text-gray-700">Public Endpoint:</span>
                                </div>
                                <Badge className={`font-semibold ${
                                  riskAssessmentData.publicEndpoint.toLowerCase() === 'yes' 
                                    ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300' 
                                    : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300'
                                }`}>
                                  {formatValue(riskAssessmentData.publicEndpoint)}
                                </Badge>
                              </div>
                            )}
                            {riskAssessmentData.discoverability && (
                              <div className="flex justify-between items-center py-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                                  <span className="text-sm font-medium text-gray-700">Discoverability:</span>
                                </div>
                                <Badge className={`font-semibold ${
                                  riskAssessmentData.discoverability.toLowerCase() === 'high' 
                                    ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300'
                                    : riskAssessmentData.discoverability.toLowerCase() === 'medium'
                                    ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300'
                                    : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300'
                                }`}>
                                  {formatValue(riskAssessmentData.discoverability)}
                                </Badge>
                              </div>
                            )}
                            {riskAssessmentData.awareness && (
                              <div className="flex justify-between items-center py-2">
                                <div className="flex items-center gap-2">
                                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                                  <span className="text-sm font-medium text-gray-700">Awareness:</span>
                                </div>
                                <Badge className={`font-semibold ${
                                  riskAssessmentData.awareness.toLowerCase() === 'high' 
                                    ? 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300'
                                    : riskAssessmentData.awareness.toLowerCase() === 'medium'
                                    ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300'
                                    : 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300'
                                }`}>
                                  {formatValue(riskAssessmentData.awareness)}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Risk Scores Card */}
                        <div className={`bg-gradient-to-br border rounded-xl p-4 hover:shadow-md transition-all duration-200 ${
                          riskAssessmentData.finalRiskScore >= 7 
                            ? 'from-red-50 to-red-100 border-red-200' 
                            : riskAssessmentData.finalRiskScore >= 4 
                            ? 'from-orange-50 to-orange-100 border-orange-200'
                            : 'from-green-50 to-green-100 border-green-200'
                        }`}>
                          <div className="flex items-center gap-2 mb-3">
                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
                              riskAssessmentData.finalRiskScore >= 7 
                                ? 'bg-red-100' 
                                : riskAssessmentData.finalRiskScore >= 4 
                                ? 'bg-orange-100'
                                : 'bg-green-100'
                            }`}>
                              <BarChart3 className={`h-4 w-4 ${
                                riskAssessmentData.finalRiskScore >= 7 
                                  ? 'text-red-600' 
                                  : riskAssessmentData.finalRiskScore >= 4 
                                  ? 'text-orange-600'
                                  : 'text-green-600'
                              }`} />
                            </div>
                            <h5 className="font-semibold text-gray-800">Risk Scores</h5>
                          </div>
                          <div className="space-y-2">
                            {riskAssessmentData.dataClassificationScore !== null && riskAssessmentData.dataClassificationScore !== undefined && (
                              <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-600">Data Classification Score:</span>
                                <Badge className="bg-cyan-100 text-cyan-800 border-cyan-200">
                                  {riskAssessmentData.dataClassificationScore}
                                </Badge>
                              </div>
                            )}
                            {riskAssessmentData.ciaTriadScore !== null && riskAssessmentData.ciaTriadScore !== undefined && (
                              <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-600">CIA Triad Score:</span>
                                <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                                  {riskAssessmentData.ciaTriadScore}
                                </Badge>
                              </div>
                            )}
                            {riskAssessmentData.attackSurfaceScore !== null && riskAssessmentData.attackSurfaceScore !== undefined && (
                              <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-600">Attack Surface Score:</span>
                                <Badge className="bg-amber-100 text-amber-800 border-amber-200">
                                  {riskAssessmentData.attackSurfaceScore}
                                </Badge>
                              </div>
                            )}
                            {riskAssessmentData.finalRiskScore !== null && riskAssessmentData.finalRiskScore !== undefined && (
                              <div className="flex justify-between items-center py-2 border-t border-gray-200 mt-3 pt-3">
                                <span className="text-sm font-medium text-gray-700">Final Risk Score:</span>
                                <Badge className={`text-sm font-semibold px-3 py-1 ${
                                  riskAssessmentData.finalRiskScore >= 7 
                                    ? 'bg-red-100 text-red-800 border-red-200' 
                                    : riskAssessmentData.finalRiskScore >= 4 
                                    ? 'bg-orange-100 text-orange-800 border-orange-200'
                                    : 'bg-green-100 text-green-800 border-green-200'
                                }`}>
                                  {riskAssessmentData.finalRiskScore}
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                        /* Placeholder cards for when no risk assessment data exists */
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Data Classification Placeholder */}
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 transition-all duration-200">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Database className="h-4 w-4 text-gray-400" />
                              </div>
                              <h5 className="font-semibold text-gray-800">Data Classification</h5>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-600">Classification:</span>
                                <span className="text-sm text-gray-400">Not assessed</span>
                              </div>
                              <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-600">PHI:</span>
                                <span className="text-sm text-gray-400">Not assessed</span>
                              </div>
                              <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-600">Eligibility Data:</span>
                                <span className="text-sm text-gray-400">Not assessed</span>
                              </div>
                            </div>
                          </div>

                          {/* CIA Triad Placeholder */}
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 transition-all duration-200">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Lock className="h-4 w-4 text-gray-400" />
                              </div>
                              <h5 className="font-semibold text-gray-800">CIA Triad</h5>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-600">Confidentiality Impact:</span>
                                <span className="text-sm text-gray-400">Not assessed</span>
                              </div>
                              <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-600">Integrity Impact:</span>
                                <span className="text-sm text-gray-400">Not assessed</span>
                              </div>
                              <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-600">Availability Impact:</span>
                                <span className="text-sm text-gray-400">Not assessed</span>
                              </div>
                            </div>
                          </div>

                          {/* Attack Surface Factors Placeholder */}
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 transition-all duration-200">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <Globe className="h-4 w-4 text-gray-400" />
                              </div>
                              <h5 className="font-semibold text-gray-800">Attack Surface Factors</h5>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-600">Public Endpoint:</span>
                                <span className="text-sm text-gray-400">Not assessed</span>
                              </div>
                              <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-600">Discoverability:</span>
                                <span className="text-sm text-gray-400">Not assessed</span>
                              </div>
                              <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-600">Awareness:</span>
                                <span className="text-sm text-gray-400">Not assessed</span>
                              </div>
                            </div>
                          </div>

                          {/* Risk Scores Placeholder */}
                          <div className="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4 transition-all duration-200">
                            <div className="flex items-center gap-2 mb-3">
                              <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                                <BarChart3 className="h-4 w-4 text-gray-400" />
                              </div>
                              <h5 className="font-semibold text-gray-800">Risk Scores</h5>
                            </div>
                            <div className="space-y-2">
                              <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-600">Data Classification Score:</span>
                                <span className="text-sm text-gray-400">Not assessed</span>
                              </div>
                              <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-600">CIA Triad Score:</span>
                                <span className="text-sm text-gray-400">Not assessed</span>
                              </div>
                              <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-600">Attack Surface Score:</span>
                                <span className="text-sm text-gray-400">Not assessed</span>
                              </div>
                              <div className="flex justify-between items-center py-1">
                                <span className="text-sm text-gray-600">Final Risk Score:</span>
                                <span className="text-sm text-gray-400">Not assessed</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {riskAssessmentData?.lastUpdated && (
                        <div className="flex items-center gap-2 justify-center pt-4 border-t border-gray-200">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <p className="text-sm text-gray-500">
                            Last updated: {new Date(riskAssessmentData.lastUpdated).toLocaleDateString()}
                            {riskAssessmentData.updatedBy && ` by ${riskAssessmentData.updatedBy}`}
                          </p>
                        </div>
                      )}
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

          {/* Edit Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Edit Service Information</DialogTitle>
                <DialogDescription>
                  Update the service name, links, compliance tags, and owner information below.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4 max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="serviceName">Service Name</Label>
                    <Input
                      id="serviceName"
                      placeholder="Enter service name"
                      value={editingService?.name || ""}
                      onChange={(e) => setEditingService({...editingService, name: e.target.value})}
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
                  <div>
                    <Label htmlFor="serviceDescription">Description</Label>
                    <Input
                      id="serviceDescription"
                      placeholder="Brief description of the service"
                      value={editingService?.description || ""}
                      onChange={(e) => setEditingService({...editingService, description: e.target.value})}
                    />
                  </div>
                  
                  <div className="space-y-4 border-t pt-4">
                    <Label className="text-sm font-medium text-gray-700">Scanner URLs</Label>
                    <div>
                      <Label htmlFor="mendUrl">Mend Scanner URL</Label>
                      <Input
                        id="mendUrl"
                        placeholder="https://mend.company.com/..."
                        value={editingService?.mendUrl || ""}
                        onChange={(e) => setEditingService({...editingService, mendUrl: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="crowdstrikeUrl">Crowdstrike URL</Label>
                      <Input
                        id="crowdstrikeUrl"
                        placeholder="https://crowdstrike.company.com/..."
                        value={editingService?.crowdstrikeUrl || ""}
                        onChange={(e) => setEditingService({...editingService, crowdstrikeUrl: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="escapeUrl">Escape Scanner URL</Label>
                      <Input
                        id="escapeUrl"
                        placeholder="https://escape.company.com/..."
                        value={editingService?.escapeUrl || ""}
                        onChange={(e) => setEditingService({...editingService, escapeUrl: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 border-t pt-4">
                    <Label className="text-sm font-medium text-gray-700">External Links</Label>
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
                        placeholder="https://company.atlassian.net/..."
                        value={editingService?.jiraProject || ""}
                        onChange={(e) => setEditingService({...editingService, jiraProject: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="slackChannel">Slack Channel</Label>
                      <Input
                        id="slackChannel"
                        placeholder="https://company.slack.com/channels/..."
                        value={editingService?.slackChannel || ""}
                        onChange={(e) => setEditingService({...editingService, slackChannel: e.target.value})}
                      />
                    </div>
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