import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import PageWrapper from "@/components/page-wrapper";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Package,
  Server,
  Globe,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  ExternalLink,
  GitBranch,
  Users,
  Calendar
} from "lucide-react";
import { Link } from "wouter";
import type { Application } from "@shared/schema";

export default function ServiceInventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [ownerFilter, setOwnerFilter] = useState("");

  const { data: applications = [], isLoading } = useQuery<Application[]>({
    queryKey: ["/api/applications-with-risk"],
  });

  const { logout } = useAuth();
  const { toast } = useToast();

  // Filter applications based on search and filters
  const filteredApplications = applications.filter((app) => {
    const matchesSearch = app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         app.serviceOwner?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Since the schema doesn't have status/tier fields, we'll show all for now
    // In a real implementation, these would come from the database schema
    const matchesStatus = !statusFilter; // No status filtering for now
    const matchesTier = !tierFilter; // No tier filtering for now
    const matchesOwner = !ownerFilter || app.serviceOwner === ownerFilter;
    
    return matchesSearch && matchesStatus && matchesTier && matchesOwner;
  });

  // Get unique values for filters - using mock data for status/tier since they're not in schema
  const uniqueStatuses = ['Active', 'Inactive', 'Deprecated'];
  const uniqueTiers = ['Tier 1', 'Tier 2', 'Tier 3', 'Tier 4'];
  const uniqueOwners = Array.from(new Set(applications.map(app => app.serviceOwner).filter(Boolean)));

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'inactive':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'deprecated':
        return <Clock className="h-4 w-4 text-red-600" />;
      default:
        return <Server className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTierBadge = (tier: string) => {
    const tierColors = {
      'Tier 1': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'Tier 2': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'Tier 3': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'Tier 4': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    };
    
    return (
      <Badge className={tierColors[tier as keyof typeof tierColors] || 'bg-gray-100 text-gray-800'}>
        {tier}
      </Badge>
    );
  };

  const getRiskScoreBadge = (riskScore: string) => {
    const score = parseFloat(riskScore);
    if (score >= 8) {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Critical</Badge>;
    } else if (score >= 6) {
      return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300">High</Badge>;
    } else if (score >= 4) {
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">Medium</Badge>;
    } else {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">Low</Badge>;
    }
  };

  return (
    <PageWrapper loadingMessage="Loading Service Inventory..." minLoadingTime={30}>
      <div className="min-h-screen bg-background">
        <Navigation onLogout={logout} currentPage="service-inventory" />
        
        <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                  <Package className="h-8 w-8 text-blue-600" />
                  Service Inventory
                </h1>
                <p className="mt-2 text-muted-foreground">
                  Comprehensive catalog of all services and applications in your environment
                </p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Search & Filter Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Search */}
                <div className="lg:col-span-2">
                  <Input
                    placeholder="Search services, descriptions, or owners..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {uniqueStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Tier Filter */}
                <Select value={tierFilter} onValueChange={setTierFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Tiers" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    {uniqueTiers.map((tier) => (
                      <SelectItem key={tier} value={tier}>
                        {tier}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Owner Filter */}
                <Select value={ownerFilter} onValueChange={setOwnerFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Owners" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Owners</SelectItem>
                    {uniqueOwners.map((owner) => (
                      <SelectItem key={owner} value={owner}>
                        {owner}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Active Filters */}
              {(searchTerm || statusFilter || tierFilter || ownerFilter) && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                  {searchTerm && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Search: {searchTerm}
                      <button onClick={() => setSearchTerm("")} className="ml-1 hover:text-red-500">×</button>
                    </Badge>
                  )}
                  {statusFilter && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Status: {statusFilter}
                      <button onClick={() => setStatusFilter("")} className="ml-1 hover:text-red-500">×</button>
                    </Badge>
                  )}
                  {tierFilter && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Tier: {tierFilter}
                      <button onClick={() => setTierFilter("")} className="ml-1 hover:text-red-500">×</button>
                    </Badge>
                  )}
                  {ownerFilter && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      Owner: {ownerFilter}
                      <button onClick={() => setOwnerFilter("")} className="ml-1 hover:text-red-500">×</button>
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Services Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Services ({filteredApplications.length})</CardTitle>
                <div className="text-sm text-muted-foreground italic">
                  Updates take up to 12 hours and may not reflect the latest data
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Service Name</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tier</TableHead>
                        <TableHead>Risk Score</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Links</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApplications.map((app) => (
                        <TableRow key={app.id} className="hover:bg-muted/50 transition-colors">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Server className="h-4 w-4 text-blue-600" />
                              <Link href={`/service/${app.id}`} className="hover:underline text-blue-600">
                                {app.name}
                              </Link>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(app.status || '')}
                              <span className="capitalize">{app.status || 'Unknown'}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {app.tier ? getTierBadge(app.tier) : <span className="text-muted-foreground">-</span>}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold">{parseFloat(app.riskScore).toFixed(1)}</span>
                              {getRiskScoreBadge(app.riskScore)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-500" />
                              <span>{app.owner || 'Unassigned'}</span>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[300px]">
                            <p className="text-sm text-muted-foreground truncate">
                              {app.description || 'No description available'}
                            </p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {app.githubRepo && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                  className="h-8 w-8 p-0"
                                  title="GitHub Repository"
                                >
                                  <a href={app.githubRepo} target="_blank" rel="noopener noreferrer">
                                    <GitBranch className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                              {app.jiraProject && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  asChild
                                  className="h-8 w-8 p-0"
                                  title="Jira Project"
                                >
                                  <a href={app.jiraProject} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              asChild
                              className="transition-all duration-200 hover:bg-blue-50 hover:border-blue-300"
                            >
                              <Link href={`/service/${app.id}`}>
                                View Details
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {filteredApplications.length === 0 && (
                    <div className="text-center py-12">
                      <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">No Services Found</h3>
                      <p className="text-muted-foreground">
                        {searchTerm || statusFilter || tierFilter || ownerFilter
                          ? "Try adjusting your search criteria or filters."
                          : "No services are currently available in the inventory."}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
}