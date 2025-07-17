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
import { AlertTriangle, ChevronLeft, ChevronRight, Search, ArrowUpDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import type { Application } from "@shared/schema";

interface ApplicationsTableProps {
  applications: Application[];
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (term: string) => void;
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

function LoadingSkeleton() {
  return (
    <>
      {Array.from({ length: 10 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-48" /></TableCell>
          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
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

export default function ApplicationsTable({ applications, isLoading, searchTerm, onSearchChange }: ApplicationsTableProps) {
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

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
        const aTotalFindings = JSON.parse(a.totalFindings);
        const bTotalFindings = JSON.parse(b.totalFindings);
        aValue = aTotalFindings.total;
        bValue = bTotalFindings.total;
        break;
      case 'criticalFindings':
        const aCriticalFindings = JSON.parse(a.totalFindings);
        const bCriticalFindings = JSON.parse(b.totalFindings);
        aValue = aCriticalFindings.C;
        bValue = bCriticalFindings.C;
        break;
      case 'highFindings':
        const aHighFindings = JSON.parse(a.totalFindings);
        const bHighFindings = JSON.parse(b.totalFindings);
        aValue = aHighFindings.H;
        bValue = bHighFindings.H;
        break;
      case 'mediumFindings':
        const aMediumFindings = JSON.parse(a.totalFindings);
        const bMediumFindings = JSON.parse(b.totalFindings);
        aValue = aMediumFindings.M;
        bValue = bMediumFindings.M;
        break;
      case 'lowFindings':
        const aLowFindings = JSON.parse(a.totalFindings);
        const bLowFindings = JSON.parse(b.totalFindings);
        aValue = aLowFindings.L;
        bValue = bLowFindings.L;
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

  const SortableHeader = ({ field, children }: { field: string; children: React.ReactNode }) => (
    <TableHead 
      className="font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        <ArrowUpDown className="h-3 w-3" />
      </div>
    </TableHead>
  );

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      {/* Search Bar */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search applications..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <SortableHeader field="name">Service Name</SortableHeader>
              <SortableHeader field="riskScore">Risk Score</SortableHeader>
              <SortableHeader field="totalFindings">Total Findings</SortableHeader>
              <SortableHeader field="criticalFindings">Critical Findings</SortableHeader>
              <SortableHeader field="highFindings">High Findings</SortableHeader>
              <SortableHeader field="mediumFindings">Medium Findings</SortableHeader>
              <SortableHeader field="lowFindings">Low Findings</SortableHeader>
              <TableHead className="font-medium text-gray-500 uppercase tracking-wider">Tags</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              sortedApplications.map((app) => {
                const totalFindings: FindingsData = JSON.parse(app.totalFindings);
                
                return (
                  <TableRow key={app.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="text-sm font-medium text-gray-900">{app.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-bold text-primary">{app.riskScore}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium text-gray-900">{totalFindings.total}</div>
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
                          <Badge key={index} variant="outline" className="text-xs text-primary border-primary">
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
      <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <Button variant="outline" size="sm">Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              1 to {Math.min(50, applications.length)} of {applications.length}
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <Button variant="outline" size="sm" className="rounded-l-md">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" className="rounded-none">
                Page 1 of 3
              </Button>
              <Button variant="outline" size="sm" className="rounded-r-md">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}
