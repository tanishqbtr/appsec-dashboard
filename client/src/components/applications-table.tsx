import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle, ChevronLeft, ChevronRight, Search, ArrowUpDown, Download, ExternalLink, Settings } from "lucide-react";
import { RoleProtectedButton } from "@/components/role-protected-button";
import { useLocation, Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Application } from "@shared/schema";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import { useAuth } from "@/hooks/useAuth";
import { RoleProtectedButton } from "./role-protected-button";

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ApplicationsTableProps {
  applications: Application[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  selectedEngine: string;
  selectedLabels: string[];
  selectedTags: string[];
}

interface MendFindings {
  id: number;
  serviceName: string;
  scanDate: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface EscapeFindings {
  id: number;
  serviceName: string;
  scanDate: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface CrowdstrikeFindings {
  id: number;
  serviceName: string;
  scanDate: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

interface FindingsData {
  total: number;
  C: number;
  H: number;
  M: number;
  L: number;
}

function RiskBadge({ level, count }: { level: string; count: number }) {
  if (count === 0) return <span className="text-xs text-muted-foreground">0</span>;

  const colors = {
    C: "bg-red-600 text-white",
    H: "bg-high text-white", 
    M: "bg-medium text-white",
    L: "bg-low text-white"
  };

  return (
    <Badge className={`${colors[level as keyof typeof colors]} text-xs px-2 py-0.5`}>
      {count}
    </Badge>
  );
}

function PercentileBadge({ percentile }: { percentile: number }) {
  let color = "bg-gray-500";
  let label = "Platinum";
  
  if (percentile >= 76) {
    color = "bg-purple-600";
    label = "Platinum";
  } else if (percentile >= 51) {
    color = "bg-yellow-500";
    label = "Gold";
  } else if (percentile >= 26) {
    color = "bg-gray-500";
    label = "Silver";
  } else {
    color = "bg-orange-500";
    label = "Bronze";
  }

  return (
    <Badge className={`${color} text-white text-xs px-2 py-0.5`}>
      {Math.round(percentile)}%
    </Badge>
  );
}

// Helper function to calculate percentile based on total findings across all engines
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

// Calculate percentile ranking based on risk score (since totalFindings is removed)
function calculatePercentile(applications: Application[], currentApp: Application): number {
  const currentRiskScore = parseFloat(currentApp.riskScore);
  const allRiskScores = applications.map(app => parseFloat(app.riskScore));
  
  // Count how many applications have higher risk scores than current app
  const higherCount = allRiskScores.filter(score => score > currentRiskScore).length;
  
  // Calculate percentile (lower risk = higher percentile)
  return ((applications.length - higherCount) / applications.length) * 100;
}

function LoadingSkeleton() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-48" /></TableCell>
          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

export default function ApplicationsTable({ applications, isLoading, searchTerm, onSearchChange, selectedEngine, selectedLabels, selectedTags }: ApplicationsTableProps) {
  const { isAdmin, user } = useAuth();
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [, setLocation] = useLocation();

  // Determine which APIs to query based on selected engine and labels
  const getActiveEndpoints = () => {
    const endpoints: string[] = [];
    
    // Only query APIs if an engine is selected and has labels
    if (selectedEngine === "Mend" && selectedLabels.length > 0) {
      if (selectedLabels.includes("SCA")) endpoints.push("/api/mend/sca");
      if (selectedLabels.includes("SAST")) endpoints.push("/api/mend/sast");
      if (selectedLabels.includes("Containers")) endpoints.push("/api/mend/containers");
    }
    
    if (selectedEngine === "Escape" && selectedLabels.length > 0) {
      if (selectedLabels.includes("Web Applications")) endpoints.push("/api/escape/webapps");
      if (selectedLabels.includes("APIs")) endpoints.push("/api/escape/apis");
    }
    
    if (selectedEngine === "Crowdstrike" && selectedLabels.length > 0) {
      if (selectedLabels.includes("Images")) endpoints.push("/api/crowdstrike/images");
      if (selectedLabels.includes("Containers")) endpoints.push("/api/crowdstrike/containers");
    }
    
    return endpoints;
  };

  // Fetch findings from multiple endpoints when multiple labels are selected
  const activeEndpoints = getActiveEndpoints();
  
  // Mend queries
  const scaQuery = useQuery<MendFindings[]>({
    queryKey: ["/api/mend/sca"],
    enabled: activeEndpoints.includes("/api/mend/sca"),
  });
  
  const sastQuery = useQuery<MendFindings[]>({
    queryKey: ["/api/mend/sast"],
    enabled: activeEndpoints.includes("/api/mend/sast"),
  });
  
  const containersQuery = useQuery<MendFindings[]>({
    queryKey: ["/api/mend/containers"],
    enabled: activeEndpoints.includes("/api/mend/containers"),
  });

  // Escape queries
  const webAppsQuery = useQuery<EscapeFindings[]>({
    queryKey: ["/api/escape/webapps"],
    enabled: activeEndpoints.includes("/api/escape/webapps"),
  });
  
  const apisQuery = useQuery<EscapeFindings[]>({
    queryKey: ["/api/escape/apis"],
    enabled: activeEndpoints.includes("/api/escape/apis"),
  });

  // Crowdstrike queries
  const imagesQuery = useQuery<CrowdstrikeFindings[]>({
    queryKey: ["/api/crowdstrike/images"],
    enabled: activeEndpoints.includes("/api/crowdstrike/images"),
  });
  
  const crowdstrikeContainersQuery = useQuery<CrowdstrikeFindings[]>({
    queryKey: ["/api/crowdstrike/containers"],
    enabled: activeEndpoints.includes("/api/crowdstrike/containers"),
  });

  // Combine findings from all selected scan types - rebuild fresh each time
  const combinedFindings = useMemo(() => {
    const findingsMap = new Map<string, MendFindings | EscapeFindings | CrowdstrikeFindings>();
    
    // Helper function to add findings to the combined map
    const addFindings = (findings: (MendFindings | EscapeFindings | CrowdstrikeFindings)[], scanType: string) => {
      findings.forEach(finding => {
        const existing = findingsMap.get(finding.serviceName);
        if (existing) {
          // Sum the findings if service already exists
          findingsMap.set(finding.serviceName, {
            ...existing,
            critical: existing.critical + finding.critical,
            high: existing.high + finding.high,
            medium: existing.medium + finding.medium,
            low: existing.low + finding.low,
            scanDate: finding.scanDate > existing.scanDate ? finding.scanDate : existing.scanDate // Keep most recent date
          });
        } else {
          // Add new service
          findingsMap.set(finding.serviceName, { ...finding });
        }
      });
    };

    // Add findings from each enabled query - only add if query is enabled and has data
    if (activeEndpoints.includes("/api/mend/sca") && scaQuery.data) {
      addFindings(scaQuery.data, "SCA");
    }
    if (activeEndpoints.includes("/api/mend/sast") && sastQuery.data) {
      addFindings(sastQuery.data, "SAST");
    }
    if (activeEndpoints.includes("/api/mend/containers") && containersQuery.data) {
      addFindings(containersQuery.data, "Containers");
    }
    if (activeEndpoints.includes("/api/escape/webapps") && webAppsQuery.data) {
      addFindings(webAppsQuery.data, "Web Applications");
    }
    if (activeEndpoints.includes("/api/escape/apis") && apisQuery.data) {
      addFindings(apisQuery.data, "APIs");
    }
    if (activeEndpoints.includes("/api/crowdstrike/images") && imagesQuery.data) {
      addFindings(imagesQuery.data, "Images");
    }
    if (activeEndpoints.includes("/api/crowdstrike/containers") && crowdstrikeContainersQuery.data) {
      addFindings(crowdstrikeContainersQuery.data, "Crowdstrike Containers");
    }
    
    return findingsMap;
  }, [
    activeEndpoints, 
    scaQuery.data, 
    sastQuery.data, 
    containersQuery.data, 
    webAppsQuery.data, 
    apisQuery.data, 
    imagesQuery.data, 
    crowdstrikeContainersQuery.data
  ]);

  // Always fetch all findings data for percentile calculation (regardless of selection)
  const allScaQuery = useQuery<MendFindings[]>({
    queryKey: ["/api/mend/sca"],
  });
  
  const allSastQuery = useQuery<MendFindings[]>({
    queryKey: ["/api/mend/sast"],
  });
  
  const allMendContainersQuery = useQuery<MendFindings[]>({
    queryKey: ["/api/mend/containers"],
  });

  const allWebAppsQuery = useQuery<EscapeFindings[]>({
    queryKey: ["/api/escape/webapps"],
  });
  
  const allApisQuery = useQuery<EscapeFindings[]>({
    queryKey: ["/api/escape/apis"],
  });

  const allImagesQuery = useQuery<CrowdstrikeFindings[]>({
    queryKey: ["/api/crowdstrike/images"],
  });
  
  const allCrowdstrikeContainersQuery = useQuery<CrowdstrikeFindings[]>({
    queryKey: ["/api/crowdstrike/containers"],
  });

  // Check if any queries are loading
  const isLoadingFindings = scaQuery.isLoading || sastQuery.isLoading || containersQuery.isLoading || 
                           webAppsQuery.isLoading || apisQuery.isLoading || imagesQuery.isLoading || 
                           crowdstrikeContainersQuery.isLoading;

  // Create a combined map of ALL findings for percentile calculation (independent of selection)
  const allCombinedFindings = useMemo(() => {
    const findingsMap = new Map<string, MendFindings | EscapeFindings | CrowdstrikeFindings>();
    
    // Helper function to add findings to the combined map
    const addFindings = (findings: (MendFindings | EscapeFindings | CrowdstrikeFindings)[], scanType: string) => {
      findings.forEach(finding => {
        const existing = findingsMap.get(finding.serviceName);
        if (existing) {
          // Sum the findings if service already exists
          findingsMap.set(finding.serviceName, {
            ...existing,
            critical: existing.critical + finding.critical,
            high: existing.high + finding.high,
            medium: existing.medium + finding.medium,
            low: existing.low + finding.low,
            scanDate: finding.scanDate > existing.scanDate ? finding.scanDate : existing.scanDate
          });
        } else {
          // Add new service
          findingsMap.set(finding.serviceName, { ...finding });
        }
      });
    };

    // Add findings from ALL engines (for percentile calculation)
    if (allScaQuery.data) addFindings(allScaQuery.data, "SCA");
    if (allSastQuery.data) addFindings(allSastQuery.data, "SAST");
    if (allMendContainersQuery.data) addFindings(allMendContainersQuery.data, "Mend Containers");
    if (allWebAppsQuery.data) addFindings(allWebAppsQuery.data, "Web Applications");
    if (allApisQuery.data) addFindings(allApisQuery.data, "APIs");
    if (allImagesQuery.data) addFindings(allImagesQuery.data, "Images");
    if (allCrowdstrikeContainersQuery.data) addFindings(allCrowdstrikeContainersQuery.data, "Crowdstrike Containers");
    
    return findingsMap;
  }, [
    allScaQuery.data, 
    allSastQuery.data, 
    allMendContainersQuery.data, 
    allWebAppsQuery.data, 
    allApisQuery.data, 
    allImagesQuery.data, 
    allCrowdstrikeContainersQuery.data
  ]);

  // Function to get ALL findings data for a service (for percentile calculation)
  const getAllServiceFindings = (serviceName: string): FindingsData => {
    const combinedFinding = allCombinedFindings.get(serviceName);
    if (combinedFinding) {
      return {
        total: combinedFinding.critical + combinedFinding.high + combinedFinding.medium + combinedFinding.low,
        C: combinedFinding.critical,
        H: combinedFinding.high,
        M: combinedFinding.medium,
        L: combinedFinding.low
      };
    }
    return { total: 0, C: 0, H: 0, M: 0, L: 0 };
  };

  // Function to get findings data for a service (now using combined findings)
  const getServiceFindings = (serviceName: string): FindingsData => {
    // Only show findings if we have an active scan engine with selected labels
    if ((selectedEngine === "Mend" || selectedEngine === "Escape" || selectedEngine === "Crowdstrike") && selectedLabels.length > 0) {
      const combinedFinding = combinedFindings.get(serviceName);
      if (combinedFinding) {
        return {
          total: combinedFinding.critical + combinedFinding.high + combinedFinding.medium + combinedFinding.low,
          C: combinedFinding.critical,
          H: combinedFinding.high,
          M: combinedFinding.medium,
          L: combinedFinding.low
        };
      }
    }
    // Return zeros if no engine/labels selected or no findings found
    return { total: 0, C: 0, H: 0, M: 0, L: 0 };
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedApplications = [...applications].sort((a, b) => {
    if (!sortField) return 0;
    
    let aValue: any, bValue: any;
    
    switch (sortField) {
      case 'name':
        aValue = a.name;
        bValue = b.name;
        break;
      case 'riskScore':
        aValue = parseFloat(a.riskScore);
        bValue = parseFloat(b.riskScore);
        break;
      case 'totalFindings':
        const aFindings = getServiceFindings(a.name);
        const bFindings = getServiceFindings(b.name);
        aValue = aFindings.total;
        bValue = bFindings.total;
        break;
      case 'criticalFindings':
        const aCritical = getServiceFindings(a.name);
        const bCritical = getServiceFindings(b.name);
        aValue = aCritical.C;
        bValue = bCritical.C;
        break;
      case 'highFindings':
        const aHigh = getServiceFindings(a.name);
        const bHigh = getServiceFindings(b.name);
        aValue = aHigh.H;
        bValue = bHigh.H;
        break;
      case 'mediumFindings':
        const aMedium = getServiceFindings(a.name);
        const bMedium = getServiceFindings(b.name);
        aValue = aMedium.M;
        bValue = bMedium.M;
        break;
      case 'lowFindings':
        const aLow = getServiceFindings(a.name);
        const bLow = getServiceFindings(b.name);
        aValue = aLow.L;
        bValue = bLow.L;
        break;
      case 'percentile':
        aValue = calculatePercentileWithAllFindings(applications, a, getAllServiceFindings);
        bValue = calculatePercentileWithAllFindings(applications, b, getAllServiceFindings);
        break;
      default:
        return 0;
    }
    
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    
    if (sortDirection === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  // Pagination logic
  const totalPages = Math.ceil(sortedApplications.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedApplications = sortedApplications.slice(startIndex, endIndex);

  // Reset to first page when pageSize changes
  const handlePageSizeChange = (newPageSize: string) => {
    setPageSize(parseInt(newPageSize));
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(totalPages, prev + 1));
  };

  const generateFileName = (format: string) => {
    const now = new Date();
    const dateTime = now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const engine = selectedEngine || 'All';
    const labels = selectedLabels.length > 0 ? selectedLabels.join('-') : 'All';
    const tags = selectedTags.length > 0 ? `_${selectedTags.join('-')}` : '';
    return `${engine}_${labels}${tags}_${dateTime}.${format}`;
  };

  const exportToCSV = () => {
    const headers = ['Service Name', 'Risk Score', 'Total Findings', 'Critical Findings', 'High Findings', 'Medium Findings', 'Low Findings', 'Tags'];
    const csvData = sortedApplications.map(app => {
      // Get findings from Mend data if available
      const findings = getServiceFindings(app.name);
      return [
        app.name,
        app.riskScore,
        findings.total,
        findings.C,
        findings.H,
        findings.M,
        findings.L,
        app.tags?.join(', ') || ''
      ];
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = generateFileName('csv');
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const exportToXLSX = () => {
    const headers = ['Service Name', 'Risk Score', 'Total Findings', 'Critical Findings', 'High Findings', 'Medium Findings', 'Low Findings', 'Tags'];
    const data = sortedApplications.map(app => {
      // Get findings from Mend data if available
      const findings = getServiceFindings(app.name);
      return [
        app.name,
        app.riskScore,
        findings.total,
        findings.C,
        findings.H,
        findings.M,
        findings.L,
        app.tags?.join(', ') || ''
      ];
    });

    const ws = XLSX.utils.aoa_to_sheet([headers, ...data]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Applications');
    XLSX.writeFile(wb, generateFileName('xlsx'));
  };

  const exportToPDF = async () => {
    // Dynamically import jspdf-autotable
    const { default: autoTable } = await import('jspdf-autotable');
    
    const doc = new jsPDF();
    
    // Add title
    const engine = selectedEngine || 'All Engines';
    const labels = selectedLabels.length > 0 ? ` (${selectedLabels.join(', ')})` : '';
    const tags = selectedTags.length > 0 ? ` - Tags: ${selectedTags.join(', ')}` : '';
    const title = `Security Applications Report - ${engine}${labels}${tags}`;
    
    doc.setFontSize(16);
    doc.text(title, 14, 20);
    
    // Add timestamp
    doc.setFontSize(10);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);

    const headers = [['Service Name', 'Risk Score', 'Total', 'Critical', 'High', 'Medium', 'Low', 'Tags']];
    const data = sortedApplications.map(app => {
      // Get findings from Mend data if available
      const findings = getServiceFindings(app.name);
      return [
        app.name,
        app.riskScore,
        findings.total.toString(),
        findings.C.toString(),
        findings.H.toString(),
        findings.M.toString(),
        findings.L.toString(),
        app.tags?.join(', ') || ''
      ];
    });

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 15 },
        2: { cellWidth: 12 },
        3: { cellWidth: 12 },
        4: { cellWidth: 12 },
        5: { cellWidth: 12 },
        6: { cellWidth: 12 },
        7: { cellWidth: 25 }
      }
    });

    doc.save(generateFileName('pdf'));
  };

  const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <TableHead 
      className="font-medium text-muted-foreground uppercase tracking-wider cursor-pointer hover:bg-muted/50 transition-all duration-200"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1 transition-all duration-200 hover:text-foreground">
        {children}
        <ArrowUpDown className="h-3 w-3 transition-transform duration-200 hover:scale-110" />
      </div>
    </TableHead>
  );

  return (
    <div className="bg-background shadow overflow-hidden sm:rounded-md border border-border">
      {/* Search Bar and Export */}
      <div className="px-6 py-4 border-b border-border flex justify-between items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
            data-tutorial="search-bar"
          />
        </div>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <RoleProtectedButton 
                variant="outline" 
                size="sm" 
                className="transition-all duration-200 hover:scale-105 hover:bg-green-50 hover:border-green-300 dark:hover:bg-slate-700/20 dark:hover:border-slate-600" 
                data-tutorial="export-controls"
                requiredRole="admin"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </RoleProtectedButton>
            </DropdownMenuTrigger>
            {isAdmin && (
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={exportToCSV}>
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToXLSX}>
                  Export as XLSX
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToPDF}>
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            )}
          </DropdownMenu>
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 dark:bg-muted/10">
              <SortableHeader field="name">Service Name</SortableHeader>
              <SortableHeader field="riskScore">Risk Score</SortableHeader>

              <SortableHeader field="totalFindings">Total Findings</SortableHeader>
              <SortableHeader field="criticalFindings">Critical Findings</SortableHeader>
              <SortableHeader field="highFindings">High Findings</SortableHeader>
              <SortableHeader field="mediumFindings">Medium Findings</SortableHeader>
              <SortableHeader field="lowFindings">Low Findings</SortableHeader>
              <TableHead className="font-medium text-muted-foreground uppercase tracking-wider">
                Tags
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <LoadingSkeleton />
            ) : isLoadingFindings && selectedEngine && selectedLabels.length > 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
                    <span className="text-muted-foreground">Loading findings data...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : !selectedEngine || selectedLabels.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="text-muted-foreground">
                    <div className="text-lg font-medium mb-2">Select a scan engine and labels to view data</div>
                    <div className="text-sm">Choose from Mend, Escape, or Crowdstrike engines and their respective labels</div>
                  </div>
                </TableCell>
              </TableRow>
            ) : paginatedApplications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No applications found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              paginatedApplications.map((app, index) => {
                // Get findings from Mend data if available, otherwise use defaults
                const totalFindings: FindingsData = getServiceFindings(app.name);

                
                return (
                  <TableRow 
                    key={app.id} 
                    className="hover:bg-green-50 dark:hover:bg-slate-700/30 cursor-pointer transition-all duration-200 hover:shadow-sm"
                    onClick={() => setLocation(`/service/${app.id}`)}
                    data-tutorial-target={index === 0 ? "service-row" : undefined}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="text-sm font-medium text-foreground hover:text-green-600 transition-colors">
                          {app.name}
                        </div>
                        <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-bold text-orange-600">{app.riskScore}</div>
                    </TableCell>

                    <TableCell>
                      <div className="text-sm font-medium text-foreground">{totalFindings.total}</div>
                    </TableCell>
                    <TableCell>
                      <RiskBadge level="C" count={totalFindings.C} />
                    </TableCell>
                    <TableCell>
                      <RiskBadge level="H" count={totalFindings.H} />
                    </TableCell>
                    <TableCell>
                      <RiskBadge level="M" count={totalFindings.M} />
                    </TableCell>
                    <TableCell>
                      <RiskBadge level="L" count={totalFindings.L} />
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {app.tags?.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-700 dark:text-green-400">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      <div className="bg-background px-4 py-3 flex items-center justify-between border-t border-border sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {startIndex + 1} to {Math.min(endIndex, sortedApplications.length)} of {sortedApplications.length}
            </p>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Show:</span>
              <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">per page</span>
            </div>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-l-md"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="rounded-none">
                Page {currentPage} of {totalPages}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-r-md"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
