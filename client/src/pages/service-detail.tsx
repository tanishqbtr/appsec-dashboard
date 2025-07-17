import Navigation from "@/components/navigation";
import PageWrapper from "@/components/page-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Clock
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useParams, Link } from "wouter";
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
    C: "bg-red-600 text-white hover:bg-red-700",
    H: "bg-orange-500 text-white hover:bg-orange-600", 
    M: "bg-yellow-500 text-white hover:bg-yellow-600",
    L: "bg-green-500 text-white hover:bg-green-600"
  };

  const labels = {
    C: "Critical",
    H: "High", 
    M: "Medium",
    L: "Low"
  };

  return (
    <Badge className={`${colors[level as keyof typeof colors]} text-sm px-3 py-1 transition-all duration-200 hover:scale-105`}>
      {count} {labels[level as keyof typeof labels]}
    </Badge>
  );
}

export default function ServiceDetail() {
  const params = useParams();
  const serviceId = params.id;

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const application = applications.find(app => app.id.toString() === serviceId);

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
      <PageWrapper loadingMessage="Loading Service Details...">
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

  const findings: FindingsData = JSON.parse(application.totalFindings);
  const violatingFindings: FindingsData = JSON.parse(application.violatingFindings);

  return (
    <PageWrapper loadingMessage="Loading Service Details...">
      <div className="min-h-screen bg-gray-50">
        <Navigation onLogout={handleLogout} currentPage="services" />
      
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
            
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{application.name}</h1>
                <p className="mt-2 text-gray-600">
                  {application.description || "Comprehensive security analysis and vulnerability management"}
                </p>
                <div className="flex items-center gap-4 mt-4">
                  <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-700">
                    {application.scanEngine}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    Last scan: {application.lastScan}
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-gray-600">Risk Score</div>
                <div className="text-3xl font-bold text-orange-600">{application.riskScore}</div>
                <div className="text-sm text-gray-600">Medium Risk</div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Links */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {application.githubRepo && (
              <Card className="transition-all duration-200 hover:shadow-lg hover:scale-105">
                <CardContent className="p-4">
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
                </CardContent>
              </Card>
            )}

            {application.jiraProject && (
              <Card className="transition-all duration-200 hover:shadow-lg hover:scale-105">
                <CardContent className="p-4">
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
                </CardContent>
              </Card>
            )}

            {application.slackChannel && (
              <Card className="transition-all duration-200 hover:shadow-lg hover:scale-105">
                <CardContent className="p-4">
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
                </CardContent>
              </Card>
            )}

            <Card className="transition-all duration-200 hover:shadow-lg hover:scale-105">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">Service Owner</p>
                    <p className="text-sm text-green-600">
                      {application.serviceOwner || "Engineering Team"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Findings Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Security Findings */}
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
                    <h4 className="font-medium text-gray-900 mb-3">Total Findings</h4>
                    <div className="flex flex-wrap gap-3">
                      <RiskBadge level="C" count={findings.C} />
                      <RiskBadge level="H" count={findings.H} />
                      <RiskBadge level="M" count={findings.M} />
                      <RiskBadge level="L" count={findings.L} />
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      Total: {findings.total} findings across {application.projects} projects
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Violating Findings</h4>
                    <div className="flex flex-wrap gap-3">
                      <RiskBadge level="C" count={violatingFindings.C} />
                      <RiskBadge level="H" count={violatingFindings.H} />
                      <RiskBadge level="M" count={violatingFindings.M} />
                      <RiskBadge level="L" count={violatingFindings.L} />
                    </div>
                    <div className="mt-3 text-sm text-gray-600">
                      {violatingFindings.total} findings require immediate attention
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Information */}
            <Card className="transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Service Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Risk Score</p>
                      <p className="text-2xl font-bold text-orange-600">{application.riskScore}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Projects</p>
                      <p className="text-2xl font-bold text-gray-900">{application.projects}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-2">Risk Factors</p>
                    <p className="text-sm text-gray-900">{application.riskFactors}</p>
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

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button className="bg-green-600 hover:bg-green-700 transition-all duration-200 hover:scale-105">
              <Shield className="h-4 w-4 mr-2" />
              Trigger New Scan
            </Button>
            <Button variant="outline" className="transition-all duration-200 hover:scale-105">
              <TrendingUp className="h-4 w-4 mr-2" />
              View History
            </Button>
            <Button variant="outline" className="transition-all duration-200 hover:scale-105">
              <Clock className="h-4 w-4 mr-2" />
              Schedule Scan
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}