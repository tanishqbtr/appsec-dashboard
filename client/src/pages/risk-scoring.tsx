import { useState } from "react";
import Navigation from "@/components/navigation";
import PageWrapper from "@/components/page-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  TrendingUp, 
  Edit, 
  Save, 
  X, 
  AlertTriangle,
  Shield,
  Activity,
  Clock
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Application } from "@shared/schema";

export default function RiskScoring() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingScore, setEditingScore] = useState("");
  const [editingReason, setEditingReason] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "score" | "findings">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications"],
  });

  const updateRiskScoreMutation = useMutation({
    mutationFn: async ({ id, riskScore, reason }: { id: number; riskScore: string; reason: string }) => {
      await apiRequest("PATCH", `/api/applications/${id}`, {
        riskScore,
        riskScoreReason: reason,
        riskScoreUpdatedAt: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Risk Score Updated",
        description: "The risk score has been successfully updated.",
      });
      setEditingId(null);
      setEditingScore("");
      setEditingReason("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update risk score. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (app: Application) => {
    setEditingId(app.id!);
    setEditingScore(app.riskScore);
    setEditingReason("");
  };

  const handleSave = () => {
    if (!editingId || !editingScore) return;
    
    const score = parseFloat(editingScore);
    if (isNaN(score) || score < 0 || score > 10) {
      toast({
        title: "Invalid Score",
        description: "Risk score must be a number between 0 and 10.",
        variant: "destructive",
      });
      return;
    }

    updateRiskScoreMutation.mutate({
      id: editingId,
      riskScore: editingScore,
      reason: editingReason
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingScore("");
    setEditingReason("");
  };

  const getRiskLevel = (score: number) => {
    if (score >= 8) return { level: "Critical", color: "bg-red-100 text-red-800", icon: AlertTriangle };
    if (score >= 6) return { level: "High", color: "bg-orange-100 text-orange-800", icon: TrendingUp };
    if (score >= 4) return { level: "Medium", color: "bg-yellow-100 text-yellow-800", icon: Activity };
    return { level: "Low", color: "bg-green-100 text-green-800", icon: Shield };
  };

  const sortedApplications = [...applications].sort((a, b) => {
    let aValue: any, bValue: any;
    
    switch (sortBy) {
      case "name":
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case "score":
        aValue = parseFloat(a.riskScore);
        bValue = parseFloat(b.riskScore);
        break;
      case "findings":
        aValue = JSON.parse(a.totalFindings).total;
        bValue = JSON.parse(b.totalFindings).total;
        break;
      default:
        return 0;
    }
    
    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  if (isLoading) {
    return (
      <PageWrapper loadingMessage="Loading Risk Scoring...">
        <div className="min-h-screen bg-gray-50">
          <Navigation onLogout={handleLogout} currentPage="risk-scoring" />
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper loadingMessage="Loading Risk Scoring...">
      <div className="min-h-screen bg-gray-50">
        <Navigation onLogout={handleLogout} currentPage="risk-scoring" />
        
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Risk Scoring</h1>
            <p className="mt-2 text-gray-600">
              Security risk assessment and scoring management for all services
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Services</p>
                    <p className="text-3xl font-bold text-gray-900">{applications.length}</p>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Critical Risk</p>
                    <p className="text-3xl font-bold text-red-600">
                      {applications.filter(app => parseFloat(app.riskScore) >= 8).length}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="h-6 w-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Risk Score</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {(applications.reduce((sum, app) => sum + parseFloat(app.riskScore), 0) / applications.length).toFixed(1)}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Recently Updated</p>
                    <p className="text-3xl font-bold text-green-600">
                      {applications.filter(app => {
                        const lastScan = new Date(app.lastScan);
                        const daysDiff = (new Date().getTime() - lastScan.getTime()) / (1000 * 3600 * 24);
                        return daysDiff <= 7;
                      }).length}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Scoring Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 mb-6">
                <TrendingUp className="h-5 w-5" />
                Service Risk Scores
              </CardTitle>
              <div className="flex gap-2 mt-4">
                <Button
                  variant={sortBy === "name" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSortBy("name");
                    setSortOrder(sortBy === "name" && sortOrder === "asc" ? "desc" : "asc");
                  }}
                >
                  Sort by Name {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                </Button>
                <Button
                  variant={sortBy === "score" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSortBy("score");
                    setSortOrder(sortBy === "score" && sortOrder === "desc" ? "asc" : "desc");
                  }}
                >
                  Sort by Score {sortBy === "score" && (sortOrder === "asc" ? "↑" : "↓")}
                </Button>
                <Button
                  variant={sortBy === "findings" ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSortBy("findings");
                    setSortOrder(sortBy === "findings" && sortOrder === "desc" ? "asc" : "desc");
                  }}
                >
                  Sort by Findings {sortBy === "findings" && (sortOrder === "asc" ? "↑" : "↓")}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service Name</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Risk Level</TableHead>
                    <TableHead>Total Findings</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedApplications.map((app) => {
                    const riskScore = parseFloat(app.riskScore);
                    const riskInfo = getRiskLevel(riskScore);
                    const findings = JSON.parse(app.totalFindings);
                    const RiskIcon = riskInfo.icon;
                    const isEditing = editingId === app.id;

                    return (
                      <TableRow key={app.id}>
                        <TableCell className="font-medium">{app.name}</TableCell>
                        <TableCell>
                          {isEditing ? (
                            <div className="flex gap-2 items-center">
                              <Input
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                value={editingScore}
                                onChange={(e) => setEditingScore(e.target.value)}
                                className="w-20"
                              />
                              <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={updateRiskScoreMutation.isPending}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancel}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-lg font-semibold">{riskScore.toFixed(1)}</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={riskInfo.color}>
                            <RiskIcon className="h-3 w-3 mr-1" />
                            {riskInfo.level}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-medium">{findings.total}</span>
                          <span className="text-sm text-gray-500 ml-2">
                            (C:{findings.C} H:{findings.H} M:{findings.M} L:{findings.L})
                          </span>
                        </TableCell>

                        <TableCell>
                          {isEditing ? (
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button size="sm" variant="outline">
                                  Add Reason
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Risk Score Update Reason</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label htmlFor="reason">Reason for Risk Score Change</Label>
                                    <Textarea
                                      id="reason"
                                      placeholder="Explain why you're changing the risk score..."
                                      value={editingReason}
                                      onChange={(e) => setEditingReason(e.target.value)}
                                    />
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(app)}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}