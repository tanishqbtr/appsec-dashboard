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
  Filter,
  FileText,
  PieChart,
  Activity,
  Target
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
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import type { Application } from "@shared/schema";

// Analytics data processing functions
const processAnalyticsData = (applications: Application[]) => {
  const findingsByEngine = applications.reduce((acc, app) => {
    const findings = app.totalFindings && app.totalFindings !== "undefined" ? JSON.parse(app.totalFindings) : { C: 0, H: 0, M: 0, L: 0, total: 0 };
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
  const trendData = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    return {
      date: format(date, 'MMM dd'),
      critical: Math.floor(Math.random() * 20) + 40,
      high: Math.floor(Math.random() * 50) + 80,
      medium: Math.floor(Math.random() * 100) + 150,
      low: Math.floor(Math.random() * 50) + 30,
    };
  });

  return { findingsByEngine, riskDistribution, complianceMetrics, trendData };
};

export default function Reports() {
  const [timeRange, setTimeRange] = useState("30d");
  const [selectedEngine, setSelectedEngine] = useState("all");

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

  const PIE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];

  const exportReport = async () => {
    // Generate comprehensive security report
    const reportData = {
      summary: {
        totalApplications: applications.length,
        criticalFindings: applications.reduce((sum, app) => {
          const findings = app.totalFindings && app.totalFindings !== "undefined" ? JSON.parse(app.totalFindings) : { C: 0 };
          return sum + findings.C;
        }, 0),
        averageRiskScore: (applications.reduce((sum, app) => sum + parseFloat(app.riskScore), 0) / applications.length).toFixed(1),
        reportDate: new Date().toISOString(),
        timeRange
      },
      analytics,
      applications: applications.map(app => ({
        ...app,
        findings: app.totalFindings && app.totalFindings !== "undefined" ? JSON.parse(app.totalFindings) : { total: 0, C: 0, H: 0, M: 0, L: 0 }
      }))
    };

    // Create comprehensive PDF report
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    
    const doc = new jsPDF();
    
    // Title page
    doc.setFontSize(20);
    doc.text('Security Analytics Report', 20, 30);
    doc.setFontSize(12);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 20, 50);
    doc.text(`Time Range: ${timeRange}`, 20, 60);
    
    // Executive Summary
    doc.text('Executive Summary', 20, 80);
    doc.text(`Total Applications: ${reportData.summary.totalApplications}`, 30, 100);
    doc.text(`Critical Findings: ${reportData.summary.criticalFindings}`, 30, 110);
    doc.text(`Average Risk Score: ${reportData.summary.averageRiskScore}`, 30, 120);
    
    // Applications table
    doc.addPage();
    doc.text('Applications Overview', 20, 30);
    
    const tableData = applications.map(app => {
      const findings = app.totalFindings && app.totalFindings !== "undefined" ? JSON.parse(app.totalFindings) : { total: 0, C: 0, H: 0, M: 0, L: 0 };
      return [
        app.name,
        app.scanEngine,
        app.riskScore,
        findings.C.toString(),
        findings.H.toString(),
        findings.M.toString(),
        findings.L.toString(),
        app.tags?.join(', ') || ''
      ];
    });
    
    autoTable(doc, {
      head: [['Application', 'Engine', 'Risk Score', 'Critical', 'High', 'Medium', 'Low', 'Tags']],
      body: tableData,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [34, 197, 94] },
    });
    
    doc.save(`Security_Report_${timeRange}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  if (isLoading) {
    return (
      <PageWrapper loadingMessage="Loading Reports...">
        <div className="min-h-screen bg-gray-50">
          <Navigation onLogout={handleLogout} currentPage="reports" />
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

  return (
    <PageWrapper loadingMessage="Loading Reports...">
      <div className="min-h-screen bg-gray-50">
        <Navigation onLogout={handleLogout} currentPage="reports" />
      
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Security Reports</h1>
              <p className="mt-2 text-gray-600">
                Generate detailed compliance reports and export security documentation
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
              <Button onClick={exportReport} className="bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="transition-all duration-200 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Applications</p>
                    <p className="text-3xl font-bold text-gray-900">{applications.length}</p>
                    <p className="text-sm text-green-600">+2 this month</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Critical Findings</p>
                    <p className="text-3xl font-bold text-red-600">
                      {applications.reduce((sum, app) => sum + (app.totalFindings && app.totalFindings !== "undefined" ? JSON.parse(app.totalFindings).C : 0), 0)}
                    </p>
                    <p className="text-sm text-red-600">Requires attention</p>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Risk Score</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {(applications.reduce((sum, app) => sum + parseFloat(app.riskScore), 0) / applications.length).toFixed(1)}
                    </p>
                    <p className="text-sm text-orange-600">Medium risk</p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="transition-all duration-200 hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Compliance Rate</p>
                    <p className="text-3xl font-bold text-green-600">92%</p>
                    <p className="text-sm text-green-600">Above target</p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Target className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Findings by Scan Engine */}
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
            {/* Findings Trend */}
            <Card className="transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Findings Trend (30 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.trendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="critical" stackId="1" stroke={COLORS.critical} fill={COLORS.critical} name="Critical" />
                    <Area type="monotone" dataKey="high" stackId="1" stroke={COLORS.high} fill={COLORS.high} name="High" />
                    <Area type="monotone" dataKey="medium" stackId="1" stroke={COLORS.medium} fill={COLORS.medium} name="Medium" />
                    <Area type="monotone" dataKey="low" stackId="1" stroke={COLORS.low} fill={COLORS.low} name="Low" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Compliance Tags */}
            <Card className="transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Compliance Coverage
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(analytics.complianceMetrics).map(([tag, count]) => (
                    <div key={tag} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-green-50 border-green-200 text-green-700">
                          {tag}
                        </Badge>
                        <span className="text-sm text-gray-600">
                          {count} application{count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${(count / applications.length) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card className="transition-all duration-200 hover:shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Scan Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {applications
                  .sort((a, b) => new Date(b.lastScan).getTime() - new Date(a.lastScan).getTime())
                  .slice(0, 5)
                  .map((app) => {
                    const findings = app.totalFindings && app.totalFindings !== "undefined" ? JSON.parse(app.totalFindings) : { total: 0, C: 0, H: 0, M: 0, L: 0 };
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
                        <div className="flex items-center gap-4">
                          <div className="flex gap-2">
                            {findings.C > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {findings.C} Critical
                              </Badge>
                            )}
                            {findings.H > 0 && (
                              <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-700">
                                {findings.H} High
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            Risk: {app.riskScore}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}