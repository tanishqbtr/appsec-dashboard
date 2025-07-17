import Navigation from "@/components/navigation";
import PageWrapper from "@/components/page-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  Shield,
  AlertTriangle,
  Download,
  Calendar,
  FileText,
  PieChart,
  Activity,
  Target,
  Clock,
  Users,
  Zap
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
  LineChart,
  Line,
  Area,
  AreaChart,
  Legend
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { format, subDays } from "date-fns";
import type { Application } from "@shared/schema";

// Analytics data processing functions
const processAnalyticsData = (applications: Application[]) => {
  const findingsByEngine = applications.reduce((acc, app) => {
    const findings = JSON.parse(app.totalFindings);
    const engine = acc.find(e => e.engine === app.scanEngine);
    if (engine) {
      engine.critical += findings.C;
      engine.high += findings.H;
      engine.medium += findings.M;
      engine.low += findings.L;
      engine.total += findings.total;
    } else {
      acc.push({
        engine: app.scanEngine,
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
  const [timeRange, setTimeRange] = useState("7d");

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const analytics = processAnalyticsData(applications);

  const COLORS = {
    critical: '#dc2626',
    high: '#ea580c',
    medium: '#d97706',
    low: '#65a30d'
  };

  const PIE_COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#22c55e'];

  const exportDashboard = async () => {
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text('Security Dashboard Report', 20, 30);
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 50);
    
    // Key metrics
    doc.text('Key Metrics', 20, 70);
    doc.text(`Total Applications: ${applications.length}`, 30, 85);
    doc.text(`Critical Findings: ${applications.reduce((sum, app) => sum + JSON.parse(app.totalFindings).C, 0)}`, 30, 95);
    doc.text(`Average Risk Score: ${(applications.reduce((sum, app) => sum + parseFloat(app.riskScore), 0) / applications.length).toFixed(1)}`, 30, 105);
    
    doc.save(`Dashboard_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (isLoading) {
    return (
      <PageWrapper loadingMessage="Loading Dashboard...">
        <div className="min-h-screen bg-gray-50">
          <Navigation onLogout={handleLogout} currentPage="dashboards" />
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  const totalFindings = applications.reduce((sum, app) => sum + JSON.parse(app.totalFindings).total, 0);
  const criticalFindings = applications.reduce((sum, app) => sum + JSON.parse(app.totalFindings).C, 0);
  const averageRiskScore = applications.length > 0 ? (applications.reduce((sum, app) => sum + parseFloat(app.riskScore), 0) / applications.length) : 0;
  const activeScans = applications.filter(app => {
    const scanDate = new Date(app.lastScan);
    const daysDiff = (new Date().getTime() - scanDate.getTime()) / (1000 * 3600 * 24);
    return daysDiff <= 7;
  }).length;

  return (
    <PageWrapper loadingMessage="Loading Dashboard...">
      <div className="min-h-screen bg-gray-50">
        <Navigation onLogout={handleLogout} currentPage="dashboards" />
      
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Security Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Real-time security insights and comprehensive vulnerability management
              </p>
            </div>
            <div className="flex gap-3">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7d">Last 7 days</SelectItem>
                  <SelectItem value="30d">Last 30 days</SelectItem>
                  <SelectItem value="90d">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={exportDashboard} className="bg-green-600 hover:bg-green-700 transition-all duration-200 hover:scale-105">
                <Download className="h-4 w-4 mr-2" />
                Export Dashboard
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="transition-all duration-200 hover:shadow-lg hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Applications</p>
                    <p className="text-3xl font-bold text-gray-900">{applications.length}</p>
                    <p className="text-sm text-green-600">+2 this week</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-lg hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Critical Findings</p>
                    <p className="text-3xl font-bold text-red-600">{criticalFindings}</p>
                    <p className="text-sm text-red-600">Requires immediate attention</p>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-lg hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Risk Score</p>
                    <p className="text-3xl font-bold text-orange-600">{averageRiskScore.toFixed(1)}</p>
                    <p className="text-sm text-orange-600">Medium risk level</p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-lg hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Scans</p>
                    <p className="text-3xl font-bold text-green-600">{activeScans}</p>
                    <p className="text-sm text-green-600">This week</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Zap className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Weekly Activity */}
            <Card className="transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Weekly Activity Trend
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="scans" 
                      stroke="#22c55e" 
                      strokeWidth={3}
                      name="Scans Completed"
                      dot={{ fill: '#22c55e', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="findings" 
                      stroke="#f59e0b" 
                      strokeWidth={3}
                      name="New Findings"
                      dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="resolved" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      name="Resolved Issues"
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Risk Distribution */}
            <Card className="transition-all duration-200 hover:shadow-lg">
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
                      data={Object.entries(analytics.riskDistribution).map(([name, value]) => ({ name, value }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(analytics.riskDistribution).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Findings by Engine */}
            <Card className="transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Findings by Scan Engine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.findingsByEngine}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="engine" />
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

            {/* Compliance Overview */}
            <Card className="transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Compliance Standards Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {Object.entries(analytics.complianceMetrics).map(([tag, count]) => {
                    const percentage = (count / applications.length) * 100;
                    return (
                      <div key={tag} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                              {tag}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {count} of {applications.length} apps
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {percentage.toFixed(0)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-green-600 h-3 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Scans */}
            <Card className="transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Scan Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {applications
                    .sort((a, b) => new Date(b.lastScan).getTime() - new Date(a.lastScan).getTime())
                    .slice(0, 4)
                    .map((app) => {
                      const findings = JSON.parse(app.totalFindings);
                      return (
                        <div key={app.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <Shield className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{app.name}</p>
                              <p className="text-sm text-gray-600">
                                {app.scanEngine} • {app.lastScan}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {findings.C > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {findings.C} Critical
                              </Badge>
                            )}
                            <span className="text-sm font-medium text-gray-900">
                              {app.riskScore}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Security Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Users className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">Total Findings</p>
                        <p className="text-sm text-gray-600">Across all applications</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">{totalFindings}</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Target className="h-8 w-8 text-green-600" />
                      <div>
                        <p className="font-medium text-gray-900">Compliance Rate</p>
                        <p className="text-sm text-gray-600">Overall security compliance</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-green-600">92%</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock className="h-8 w-8 text-orange-600" />
                      <div>
                        <p className="font-medium text-gray-900">Avg Response Time</p>
                        <p className="text-sm text-gray-600">Time to resolve critical issues</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-orange-600">2.4d</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}