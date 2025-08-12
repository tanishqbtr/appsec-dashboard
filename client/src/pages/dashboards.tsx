import React from "react";
import Navigation from "@/components/navigation";
import PageWrapper from "@/components/page-wrapper";
import DashboardTutorial from "@/components/dashboard-tutorial";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import {
  BarChart3,
  TrendingUp,
  Shield,
  AlertTriangle,

  Calendar,
  FileText,
  PieChart,
  Activity,
  Target,
  Clock,
  Users,
  Zap,
  HelpCircle
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

import type { Application } from "@shared/schema";

// Analytics data processing functions
const processAnalyticsData = (applications: Application[]) => {
  const findingsByEngine = applications.reduce((acc, app) => {
    const findings = (app as any).totalFindings && (app as any).totalFindings !== "undefined" ? JSON.parse((app as any).totalFindings) : { total: 0, C: 0, H: 0, M: 0, L: 0 };
    const engine = acc.find(e => e.engine === (app as any).scanEngine);
    if (engine) {
      engine.critical += findings.C;
      engine.high += findings.H;
      engine.medium += findings.M;
      engine.low += findings.L;
      engine.total += findings.total;
    } else {
      acc.push({
        engine: (app as any).scanEngine,
        critical: findings.C,
        high: findings.H,
        medium: findings.M,
        low: findings.L,
        total: findings.total
      });
    }
    return acc;
  }, [] as any[]);

  const riskDistribution = applications.reduce((acc, app) => {
    const score = parseFloat(app.riskScore);
    let category;
    if (score >= 8) category = 'Critical';
    else if (score >= 6) category = 'High';
    else if (score >= 4) category = 'Medium';
    else category = 'Low';
    
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const complianceMetrics = applications.reduce((acc, app) => {
    app.tags?.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  // Trend data (simulated for demo)
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i);
    return {
      date: format(date, 'MMM dd'),
      scans: Math.floor(Math.random() * 5) + 8,
      findings: Math.floor(Math.random() * 20) + 15,
      resolved: Math.floor(Math.random() * 15) + 10,
    };
  });

  return { findingsByEngine, riskDistribution, complianceMetrics, trendData };
};

export default function Dashboards() {
  const [showTutorial, setShowTutorial] = useState(false);
  const { toast } = useToast();
  const { logout } = useAuth();

  const handleStartTutorial = () => {
    setShowTutorial(true);
  };

  const handleCompleteTutorial = () => {
    setShowTutorial(false);
    toast({
      title: "Tutorial Complete!",
      description: "You've learned how to use the comprehensive security dashboard analytics.",
    });
  };

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const { data: dashboardMetrics, isLoading: isMetricsLoading } = useQuery({
    queryKey: ["/api/dashboard/metrics"],
  });

  const { data: scanEngineFindings = [], isLoading: isScanEngineLoading } = useQuery({
    queryKey: ["/api/dashboard/scan-engine-findings"],
  });

  const { data: riskDistribution = [], isLoading: isRiskDistributionLoading } = useQuery({
    queryKey: ["/api/dashboard/risk-distribution"],
  });

  const { data: topAppsTotal = [], isLoading: isTopAppsTotalLoading } = useQuery({
    queryKey: ["/api/dashboard/top-applications-total"],
  });

  const { data: topAppsMend = [], isLoading: isTopAppsMendLoading } = useQuery({
    queryKey: ["/api/dashboard/top-applications-mend"],
  });

  const { data: topAppsEscape = [], isLoading: isTopAppsEscapeLoading } = useQuery({
    queryKey: ["/api/dashboard/top-applications-escape"],
  });

  const { data: topAppsCrowdstrike = [], isLoading: isTopAppsCrowdstrikeLoading } = useQuery({
    queryKey: ["/api/dashboard/top-applications-crowdstrike"],
  });



  const COLORS = {
    critical: '#dc2626',
    high: '#ea580c',
    medium: '#d97706',
    low: '#65a30d'
  };

  const PIE_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e'];



  if (isLoading || isMetricsLoading || isScanEngineLoading || isRiskDistributionLoading || isTopAppsTotalLoading || isTopAppsMendLoading || isTopAppsEscapeLoading || isTopAppsCrowdstrikeLoading) {
    return (
      <PageWrapper loadingMessage="Loading Dashboard..." minLoadingTime={30}>
        <div className="min-h-screen bg-background">
          <Navigation onLogout={logout} currentPage="dashboards" />
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-muted rounded w-1/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-muted rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  // Use metrics from API or fallback to calculated values
  const totalApplications = (dashboardMetrics as any)?.totalApplications ?? applications.length;
  const criticalFindings = (dashboardMetrics as any)?.criticalFindings ?? 0;
  const highFindings = (dashboardMetrics as any)?.highFindings ?? 0;
  const averageRiskScore = (dashboardMetrics as any)?.averageRiskScore ?? 0;

  return (
    <PageWrapper loadingMessage="Loading Dashboard..." minLoadingTime={30}>
      <div className="min-h-screen bg-background">
        <Navigation onLogout={logout} currentPage="dashboards" />
      
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8" data-tutorial="dashboard-header">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Security Dashboard</h1>
                <p className="mt-2 text-muted-foreground">
                  Real-time security insights and comprehensive vulnerability management
                </p>
              </div>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  onClick={handleStartTutorial}
                  className="flex items-center gap-2"
                  data-tutorial="tutorial-button"
                >
                  <HelpCircle className="h-4 w-4" />
                  Take Tutorial
                </Button>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-tutorial="key-metrics">
            <Card className="stagger-item card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Applications</p>
                    <p className="text-3xl font-bold text-foreground">{totalApplications}</p>
                    <p className="text-sm text-green-600">+2 this week</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stagger-item card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Critical Findings</p>
                    <p className="text-3xl font-bold text-red-600">{criticalFindings}</p>
                    <p className="text-sm text-red-600">Requires immediate attention</p>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stagger-item card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">High Findings</p>
                    <p className="text-3xl font-bold text-orange-600">{highFindings}</p>
                    <p className="text-sm text-orange-600">Needs attention</p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stagger-item card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Risk Score</p>
                    <p className="text-3xl font-bold text-orange-600">{averageRiskScore}</p>
                    <p className="text-sm text-orange-600">Medium risk level</p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Risk Distribution */}
            <Card className="chart-enter card-hover" data-tutorial="risk-distribution">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Risk Score Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Pie
                      data={(riskDistribution as any) || []}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {((riskDistribution as any) || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Findings by Engine */}
            <Card className="chart-enter card-hover" data-tutorial="engine-findings">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Findings by Scan Engine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart 
                    data={(scanEngineFindings as any) || []}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="engine" 
                      tick={{ fontSize: 12 }}
                      interval={0}
                      angle={0}
                      textAnchor="middle"
                      height={60}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="critical" stackId="a" fill={COLORS.critical} name="Critical" />
                    <Bar dataKey="high" stackId="a" fill={COLORS.high} name="High" />
                    <Bar dataKey="medium" stackId="a" fill={COLORS.medium} name="Medium" />
                    <Bar dataKey="low" stackId="a" fill={COLORS.low} name="Low" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Top High-Risk Applications Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top 5 Applications by Total Findings */}
            <Card className="chart-enter card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Top 5 High-Risk Applications by Total Findings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(topAppsTotal as any[]).slice(0, 5).map((app, index) => (
                    <div key={app.name} className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-red-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{app.name}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-2 py-1 rounded">
                              Critical: {app.critical}
                            </span>
                            <span className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">
                              High: {app.high}
                            </span>
                            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">
                              Medium: {app.medium}
                            </span>
                            <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                              Low: {app.low}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-red-600">{app.totalFindings}</span>
                        <p className="text-xs text-muted-foreground">Total Findings</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top 5 Applications in Mend */}
            <Card className="chart-enter card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-600" />
                  Top 5 High-Risk Applications in Mend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(topAppsMend as any[]).slice(0, 5).map((app, index) => (
                    <div key={app.name} className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{app.name}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-2 py-1 rounded">
                              Critical: {app.critical}
                            </span>
                            <span className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">
                              High: {app.high}
                            </span>
                            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">
                              Medium: {app.medium}
                            </span>
                            <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                              Low: {app.low}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-blue-600">{app.totalFindings}</span>
                        <p className="text-xs text-muted-foreground">Total Findings</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Top 5 Applications in Escape */}
            <Card className="chart-enter card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  Top 5 High-Risk Applications in Escape
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(topAppsEscape as any[]).slice(0, 5).map((app, index) => (
                    <div key={app.name} className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{app.name}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-2 py-1 rounded">
                              Critical: {app.critical}
                            </span>
                            <span className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">
                              High: {app.high}
                            </span>
                            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">
                              Medium: {app.medium}
                            </span>
                            <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                              Low: {app.low}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-green-600">{app.totalFindings}</span>
                        <p className="text-xs text-muted-foreground">Total Findings</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top 5 Applications in Crowdstrike */}
            <Card className="chart-enter card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-600" />
                  Top 5 High-Risk Applications in Crowdstrike
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(topAppsCrowdstrike as any[]).slice(0, 5).map((app, index) => (
                    <div key={app.name} className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{app.name}</p>
                          <div className="flex items-center gap-4 mt-1">
                            <span className="text-xs bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 px-2 py-1 rounded">
                              Critical: {app.critical}
                            </span>
                            <span className="text-xs bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 px-2 py-1 rounded">
                              High: {app.high}
                            </span>
                            <span className="text-xs bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 px-2 py-1 rounded">
                              Medium: {app.medium}
                            </span>
                            <span className="text-xs bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 px-2 py-1 rounded">
                              Low: {app.low}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-orange-600">{app.totalFindings}</span>
                        <p className="text-xs text-muted-foreground">Total Findings</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Dashboard Tutorial */}
          <DashboardTutorial
            isOpen={showTutorial}
            onClose={() => setShowTutorial(false)}
            onComplete={handleCompleteTutorial}
          />
        </div>
      </div>
    </PageWrapper>
  );
}