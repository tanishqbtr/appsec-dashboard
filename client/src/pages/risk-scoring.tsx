import React, { useState } from "react";
import Navigation from "@/components/navigation";
import PageWrapper from "@/components/page-wrapper";
import RiskScoringTutorial from "@/components/risk-scoring-tutorial";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { RoleProtectedButton } from "@/components/role-protected-button";
import { 
  TrendingUp, 
  Edit, 
  Save, 
  X, 
  AlertTriangle,
  Shield,
  Activity,
  Clock,
  Search,
  ArrowUpDown,
  HelpCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Application } from "@shared/schema";

export default function RiskScoring() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingScore, setEditingScore] = useState("");
  const [editingReason, setEditingReason] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "score" | "level">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  
  // Risk assessment form state
  const [selectedService, setSelectedService] = useState<string>("");
  const [riskFactors, setRiskFactors] = useState({
    dataClassification: "",
    phi: "",
    eligibilityData: "",
    confidentialityImpact: "",
    integrityImpact: "",
    availabilityImpact: "",
    publicEndpoint: "",
    discoverability: "",
    awareness: ""
  });
  const { toast } = useToast();
  const { logout, isAdmin } = useAuth();
  const queryClient = useQueryClient();

  const handleStartTutorial = () => {
    setShowTutorial(true);
  };

  const handleCompleteTutorial = () => {
    setShowTutorial(false);
    toast({
      title: "Tutorial Complete!",
      description: "You've learned how to conduct comprehensive risk assessments.",
    });
  };

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications-with-risk"],
  });

  // Risk assessment data query
  const { data: riskAssessmentData } = useQuery({
    queryKey: ['/api/risk-assessments', selectedService],
    enabled: !!selectedService && editDialogOpen,
  });

  const saveRiskAssessmentMutation = useMutation({
    mutationFn: (data: any) => apiRequest('POST', '/api/risk-assessments', data),
    onSuccess: () => {
      // Invalidate all related queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: ['/api/risk-assessments'] });
      queryClient.invalidateQueries({ queryKey: ['/api/applications-with-risk'] });
      queryClient.invalidateQueries({ queryKey: ['/api/services-with-risk-scores'] });
      queryClient.invalidateQueries({ queryKey: ['/api/applications'] });
      toast({
        title: "Risk Assessment Saved",
        description: "The risk assessment has been saved successfully.",
      });
    },
    onError: (error) => {
      console.error('Risk assessment save error:', error);
      toast({
        title: "Error",
        description: "Failed to save risk assessment. Please try again.",
        variant: "destructive",
      });
    }
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
      setEditDialogOpen(false);
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
    setSelectedService(app.name);
    setEditDialogOpen(true);
    // Reset form state - will be populated from saved data if available
    setRiskFactors({
      dataClassification: "",
      phi: "",
      eligibilityData: "",
      confidentialityImpact: "",
      integrityImpact: "",
      availabilityImpact: "",
      publicEndpoint: "",
      discoverability: "",
      awareness: ""
    });
  };

  // Effect to populate form with saved data when available
  React.useEffect(() => {
    if (riskAssessmentData && editDialogOpen) {
      setRiskFactors({
        dataClassification: riskAssessmentData.dataClassification || "",
        phi: riskAssessmentData.phi || "",
        eligibilityData: riskAssessmentData.eligibilityData || "",
        confidentialityImpact: riskAssessmentData.confidentialityImpact || "",
        integrityImpact: riskAssessmentData.integrityImpact || "",
        availabilityImpact: riskAssessmentData.availabilityImpact || "",
        publicEndpoint: riskAssessmentData.publicEndpoint || "",
        discoverability: riskAssessmentData.discoverability || "",
        awareness: riskAssessmentData.awareness || ""
      });
    }
  }, [riskAssessmentData, editDialogOpen]);

  const isFormValid = () => {
    return (
      riskFactors.dataClassification &&
      riskFactors.phi &&
      riskFactors.eligibilityData &&
      riskFactors.confidentialityImpact &&
      riskFactors.integrityImpact &&
      riskFactors.availabilityImpact &&
      riskFactors.publicEndpoint &&
      riskFactors.discoverability &&
      riskFactors.awareness
    );
  };

  const handleSave = () => {
    if (!editingId || !selectedService) return;
    
    if (!isFormValid()) {
      toast({
        title: "Incomplete Assessment",
        description: "Please fill in all fields before saving the risk assessment.",
        variant: "destructive",
      });
      return;
    }

    const finalScore = calculateFinalRiskScore();
    const dataClassificationScore = calculateDataClassificationScore();
    const ciaTriadScore = calculateCIATriadScore();
    const attackSurfaceScore = calculateAttackSurfaceScore();
    const riskLevel = getRiskLevel(finalScore).level;

    // Save to risk assessments table
    const assessmentData = {
      serviceName: selectedService,
      ...riskFactors,
      dataClassificationScore,
      ciaTriadScore,
      attackSurfaceScore,
      finalRiskScore: finalScore,
      riskLevel,
      updatedBy: "admin" // TODO: Use actual logged-in user
    };

    saveRiskAssessmentMutation.mutate(assessmentData);
    
    // Update application risk score
    updateRiskScoreMutation.mutate({
      id: editingId,
      riskScore: finalScore.toString(),
      reason: `Risk assessment completed: Data Classification: ${dataClassificationScore}, CIA Triad: ${ciaTriadScore}, Attack Surface: ${attackSurfaceScore}`
    });
  };

  const handleCancel = () => {
    setEditDialogOpen(false);
    setEditingId(null);
    setEditingScore("");
    setEditingReason("");
    setRiskFactors({
      dataClassification: "",
      phi: "",
      eligibilityData: "",
      confidentialityImpact: "",
      integrityImpact: "",
      availabilityImpact: "",
      publicEndpoint: "",
      discoverability: "",
      awareness: ""
    });
  };

  const getRiskLevel = (score: number) => {
    if (score >= 8) return { level: "Critical", color: "bg-red-100 text-red-800", icon: AlertTriangle };
    if (score >= 6) return { level: "High", color: "bg-orange-100 text-orange-800", icon: TrendingUp };
    if (score >= 4) return { level: "Medium", color: "bg-yellow-100 text-yellow-800", icon: Activity };
    return { level: "Low", color: "bg-green-100 text-green-800", icon: Shield };
  };

  // Risk scoring calculations
  const calculateDataClassificationScore = () => {
    let score = 0;
    
    // Data Classification scoring
    switch (riskFactors.dataClassification) {
      case 'sensitive-regulated': score += 7; break;
      case 'restricted': score += 5; break;
      case 'confidential': score += 3; break;
      case 'public': score += 1; break;
    }
    
    // PHI scoring
    if (riskFactors.phi === 'yes') score += 1;
    
    // Eligibility Data scoring
    if (riskFactors.eligibilityData === 'yes') score += 1;
    
    return score;
  };

  const calculateCIATriadScore = () => {
    let score = 0;
    
    // Confidentiality Impact
    switch (riskFactors.confidentialityImpact) {
      case 'high': score += 3; break;
      case 'medium': score += 2; break;
      case 'low': score += 1; break;
    }
    
    // Integrity Impact
    switch (riskFactors.integrityImpact) {
      case 'high': score += 3; break;
      case 'medium': score += 2; break;
      case 'low': score += 1; break;
    }
    
    // Availability Impact
    switch (riskFactors.availabilityImpact) {
      case 'high': score += 3; break;
      case 'medium': score += 2; break;
      case 'low': score += 1; break;
    }
    
    return score;
  };

  const calculateAttackSurfaceScore = () => {
    let score = 0;
    
    // Public Endpoint
    if (riskFactors.publicEndpoint === 'yes') score += 3;
    
    // Discoverability
    switch (riskFactors.discoverability) {
      case 'high': score += 3; break;
      case 'medium': score += 2; break;
      case 'low': score += 1; break;
    }
    
    // Awareness
    switch (riskFactors.awareness) {
      case 'high': score += 3; break;
      case 'medium': score += 2; break;
      case 'low': score += 1; break;
    }
    
    return score;
  };

  const calculateFinalRiskScore = () => {
    const dataScore = calculateDataClassificationScore();
    const ciaScore = calculateCIATriadScore();
    const attackScore = calculateAttackSurfaceScore();
    
    if (dataScore === 0 && ciaScore === 0 && attackScore === 0) return 0;
    
    return ((dataScore + ciaScore + attackScore) / 3).toFixed(1);
  };

  const handleSort = (field: "name" | "score" | "level") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  const filteredAndSortedApplications = applications
    .filter(app => 
      app.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
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
        case "level":
          // Sort by risk score for risk level (since risk level is derived from score)
          aValue = parseFloat(a.riskScore);
          bValue = parseFloat(b.riskScore);
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
        <div className="min-h-screen bg-background">
          <Navigation onLogout={logout} currentPage="risk-scoring" />
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
      <div className="min-h-screen bg-background">
        <Navigation onLogout={logout} currentPage="risk-scoring" />
        
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 page-enter page-enter-active">
          <div className="mb-8 stagger-item">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Risk Scoring</h1>
                <p className="mt-2 text-muted-foreground">
                  Security risk assessment and scoring management for all services
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleStartTutorial}
                className="btn-smooth flex items-center gap-2"
                data-tutorial="tutorial-button"
              >
                <HelpCircle className="h-4 w-4" />
                Take Tutorial
              </Button>
            </div>
          </div>

          {/* Risk Level Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8" data-tutorial="risk-metrics">
            <Card className="stagger-item card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Critical Risk</p>
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

            <Card className="stagger-item card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">High Risk</p>
                    <p className="text-3xl font-bold text-orange-600">
                      {applications.filter(app => {
                        const score = parseFloat(app.riskScore);
                        return score >= 6 && score < 8;
                      }).length}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stagger-item card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Medium Risk</p>
                    <p className="text-3xl font-bold text-yellow-600">
                      {applications.filter(app => {
                        const score = parseFloat(app.riskScore);
                        return score >= 4 && score < 6;
                      }).length}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Activity className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="stagger-item card-hover">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Low Risk</p>
                    <p className="text-3xl font-bold text-green-600">
                      {applications.filter(app => parseFloat(app.riskScore) < 4).length}
                    </p>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Risk Scoring Table */}
          <Card className="stagger-item card-hover" data-tutorial="risk-table">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Service Risk Scores
                </CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search services..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 focus-smooth"
                    data-tutorial="search-services"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 select-none btn-smooth"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center gap-2">
                        Service Name
                        <ArrowUpDown className="h-4 w-4" />
                        {sortBy === "name" && (
                          <span className="text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 select-none btn-smooth"
                      onClick={() => handleSort("score")}
                    >
                      <div className="flex items-center gap-2">
                        Risk Score
                        <ArrowUpDown className="h-4 w-4" />
                        {sortBy === "score" && (
                          <span className="text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer hover:bg-gray-50 select-none btn-smooth"
                      onClick={() => handleSort("level")}
                    >
                      <div className="flex items-center gap-2">
                        Risk Level
                        <ArrowUpDown className="h-4 w-4" />
                        {sortBy === "level" && (
                          <span className="text-xs">{sortOrder === "asc" ? "↑" : "↓"}</span>
                        )}
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedApplications.map((app) => {
                    const riskScore = parseFloat(app.riskScore);
                    const riskInfo = getRiskLevel(riskScore);
                    const findings = app.totalFindings ? JSON.parse(app.totalFindings) : { total: 0, C: 0, H: 0, M: 0, L: 0 };
                    const RiskIcon = riskInfo.icon;
                    const isEditing = editingId === app.id;

                    return (
                      <TableRow key={app.id} className="stagger-item card-hover">
                        <TableCell className="font-medium">{app.name}</TableCell>
                        <TableCell>
                          <span className="text-lg font-semibold">{riskScore.toFixed(1)}</span>
                        </TableCell>
                        <TableCell>
                          <Badge className={riskInfo.color}>
                            <RiskIcon className="h-3 w-3 mr-1" />
                            {riskInfo.level}
                          </Badge>
                        </TableCell>


                        <TableCell>
                          <RoleProtectedButton
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(app)}
                            className="btn-smooth"
                            data-tutorial="edit-assessment"
                            requiredRole="admin"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </RoleProtectedButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Risk Assessment Dialog */}
          <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto chart-enter">
              <DialogHeader>
                <DialogTitle>Risk Assessment - {filteredAndSortedApplications.find(app => app.id === editingId)?.name}</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-8">
                {/* Data Classification Factors */}
                <div className="space-y-4" data-tutorial="data-classification">
                  <h3 className="text-lg font-semibold text-foreground">Data Classification Factors</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="dataClassification">Data Classification</Label>
                      <Select 
                        value={riskFactors.dataClassification} 
                        onValueChange={(value) => setRiskFactors(prev => ({...prev, dataClassification: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select classification" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sensitive-regulated">Sensitive/Regulated</SelectItem>
                          <SelectItem value="restricted">Restricted</SelectItem>
                          <SelectItem value="confidential">Confidential</SelectItem>
                          <SelectItem value="public">Public</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phi">PHI</Label>
                      <Select 
                        value={riskFactors.phi} 
                        onValueChange={(value) => setRiskFactors(prev => ({...prev, phi: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select PHI status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="eligibilityData">Eligibility Data</Label>
                      <Select 
                        value={riskFactors.eligibilityData} 
                        onValueChange={(value) => setRiskFactors(prev => ({...prev, eligibilityData: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select eligibility status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* CIA Triad */}
                <div className="space-y-4" data-tutorial="cia-triad">
                  <h3 className="text-lg font-semibold text-foreground">CIA Triad</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="confidentialityImpact">Confidentiality Impact</Label>
                      <Select 
                        value={riskFactors.confidentialityImpact} 
                        onValueChange={(value) => setRiskFactors(prev => ({...prev, confidentialityImpact: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select impact level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="integrityImpact">Integrity Impact</Label>
                      <Select 
                        value={riskFactors.integrityImpact} 
                        onValueChange={(value) => setRiskFactors(prev => ({...prev, integrityImpact: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select impact level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="availabilityImpact">Availability Impact</Label>
                      <Select 
                        value={riskFactors.availabilityImpact} 
                        onValueChange={(value) => setRiskFactors(prev => ({...prev, availabilityImpact: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select impact level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Attack Surface Factors */}
                <div className="space-y-4" data-tutorial="attack-surface">
                  <h3 className="text-lg font-semibold text-foreground">Attack Surface Factors</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="publicEndpoint">Public Endpoint</Label>
                      <Select 
                        value={riskFactors.publicEndpoint} 
                        onValueChange={(value) => setRiskFactors(prev => ({...prev, publicEndpoint: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select endpoint status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="yes">Yes</SelectItem>
                          <SelectItem value="no">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="discoverability">Discoverability</Label>
                      <Select 
                        value={riskFactors.discoverability} 
                        onValueChange={(value) => setRiskFactors(prev => ({...prev, discoverability: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select discoverability level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="awareness">Awareness</Label>
                      <Select 
                        value={riskFactors.awareness} 
                        onValueChange={(value) => setRiskFactors(prev => ({...prev, awareness: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select awareness level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Risk Scores */}
                <div className="space-y-4" data-tutorial="risk-calculation">
                  <h3 className="text-lg font-semibold text-foreground">Risk Scores</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                      <div className="text-sm font-medium text-blue-600 dark:text-blue-400">Data Classification Score</div>
                      <div className="text-2xl font-bold text-blue-800 dark:text-blue-300">{calculateDataClassificationScore()}</div>
                    </div>
                    
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-700">
                      <div className="text-sm font-medium text-purple-600 dark:text-purple-400">CIA Triad Score</div>
                      <div className="text-2xl font-bold text-purple-800 dark:text-purple-300">{calculateCIATriadScore()}</div>
                    </div>
                    
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-700">
                      <div className="text-sm font-medium text-orange-600 dark:text-orange-400">Attack Surface Score</div>
                      <div className="text-2xl font-bold text-orange-800 dark:text-orange-300">{calculateAttackSurfaceScore()}</div>
                    </div>
                    
                    {(() => {
                      const finalScore = parseFloat(calculateFinalRiskScore());
                      const riskInfo = getRiskLevel(finalScore);
                      const RiskIcon = riskInfo.icon;
                      
                      let bgColor, borderColor, textColor, labelColor;
                      if (finalScore >= 8) {
                        bgColor = "bg-red-50 dark:bg-red-900/20";
                        borderColor = "border-red-200 dark:border-red-700";
                        textColor = "text-red-800 dark:text-red-300";
                        labelColor = "text-red-600 dark:text-red-400";
                      } else if (finalScore >= 6) {
                        bgColor = "bg-orange-50 dark:bg-orange-900/20";
                        borderColor = "border-orange-200 dark:border-orange-700";
                        textColor = "text-orange-800 dark:text-orange-300";
                        labelColor = "text-orange-600 dark:text-orange-400";
                      } else if (finalScore >= 4) {
                        bgColor = "bg-yellow-50 dark:bg-yellow-900/20";
                        borderColor = "border-yellow-200 dark:border-yellow-700";
                        textColor = "text-yellow-800 dark:text-yellow-300";
                        labelColor = "text-yellow-600 dark:text-yellow-400";
                      } else {
                        bgColor = "bg-green-50 dark:bg-green-900/20";
                        borderColor = "border-green-200 dark:border-green-700";
                        textColor = "text-green-800 dark:text-green-300";
                        labelColor = "text-green-600 dark:text-green-400";
                      }
                      
                      return (
                        <div className={`${bgColor} p-4 rounded-lg border-2 ${borderColor}`}>
                          <div className={`text-sm font-medium ${labelColor}`}>Final Risk Score</div>
                          <div className={`text-2xl font-bold ${textColor}`}>{calculateFinalRiskScore()}</div>
                          <div className="mt-1">
                            <div className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${riskInfo.color}`}>
                              <RiskIcon className="h-3 w-3 mr-1" />
                              {riskInfo.level}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <DialogFooter data-tutorial="save-assessment">
                <Button variant="outline" onClick={handleCancel} className="btn-smooth">
                  Cancel
                </Button>
                <Button 
                  onClick={handleSave} 
                  className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed btn-smooth dark:bg-green-600 dark:hover:bg-green-500"
                  disabled={!isFormValid() || updateRiskScoreMutation.isPending}
                >
                  {updateRiskScoreMutation.isPending ? "Saving..." : "Save Assessment"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          {/* Risk Scoring Tutorial */}
          <RiskScoringTutorial
            isOpen={showTutorial}
            onClose={() => setShowTutorial(false)}
            onComplete={handleCompleteTutorial}
          />
        </div>
      </div>
    </PageWrapper>
  );
}