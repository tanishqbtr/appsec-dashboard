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
import { AlertTriangle, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import type { Application } from "@shared/schema";

interface ApplicationsTableProps {
  applications: Application[];
  isLoading: boolean;
}

interface FindingsData {
  total: number;
  C: number;
  H: number;
  M: number;
  L: number;
}

function RiskBadge({ level, count }: { level: string; count: number }) {
  if (count === 0) return null;

  const colors = {
    C: "bg-critical text-white",
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
          <TableCell><Skeleton className="h-4 w-8" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-12" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-16" /></TableCell>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

export default function ApplicationsTable({ applications, isLoading }: ApplicationsTableProps) {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-medium text-gray-500 uppercase tracking-wider">Name</TableHead>
              <TableHead className="font-medium text-gray-500 uppercase tracking-wider">Projects</TableHead>
              <TableHead className="font-medium text-gray-500 uppercase tracking-wider">Violating Findings</TableHead>
              <TableHead className="font-medium text-gray-500 uppercase tracking-wider">Dependencies Risk Factors</TableHead>
              <TableHead className="font-medium text-gray-500 uppercase tracking-wider">Total Findings</TableHead>
              <TableHead className="font-medium text-gray-500 uppercase tracking-wider">Labels</TableHead>
              <TableHead className="font-medium text-gray-500 uppercase tracking-wider">Tags</TableHead>
              <TableHead className="font-medium text-gray-500 uppercase tracking-wider">Last Scan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              applications.map((app) => {
                const violatingFindings: FindingsData = JSON.parse(app.violatingFindings);
                const totalFindings: FindingsData = JSON.parse(app.totalFindings);
                
                return (
                  <TableRow key={app.id} className="hover:bg-gray-50">
                    <TableCell>
                      <div className="text-sm font-medium text-gray-900">{app.name}</div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{app.projects}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900">{violatingFindings.total}</span>
                        {app.hasAlert && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">{app.riskFactors}</TableCell>
                    <TableCell className="text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-900">{totalFindings.total}</span>
                        <div className="flex space-x-1">
                          <RiskBadge level="C" count={totalFindings.C} />
                          <RiskBadge level="H" count={totalFindings.H} />
                          <RiskBadge level="M" count={totalFindings.M} />
                          <RiskBadge level="L" count={totalFindings.L} />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {app.labels?.map((label, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {label}
                          </Badge>
                        ))}
                      </div>
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
                    <TableCell className="text-sm text-gray-500">{app.lastScan}</TableCell>
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
