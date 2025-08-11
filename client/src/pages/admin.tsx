import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import PageWrapper from "@/components/page-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, 
  Shield, 
  Settings, 
  Activity, 
  Database,
  UserPlus,
  Edit,
  Trash2,
  RefreshCw,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  History
} from "lucide-react";

interface User {
  id: number;
  name: string;
  username: string;
  status: string;
  type: string;
  createdAt?: string;
  updatedAt?: string;
}

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  totalServices: number;
  totalFindings: number;
  criticalFindings: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
}

interface ActivityLog {
  id: number;
  userId: number;
  username: string;
  action: string;
  serviceName?: string;
  details?: string;
  timestamp: string;
}

export default function AdminPanel() {
  const [activeSection, setActiveSection] = useState("overview");
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    password: "",
    status: "Active",
    type: "User"
  });

  const { toast } = useToast();
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  // Fetch data
  const { data: users = [], isLoading: usersLoading } = useQuery({
    queryKey: ["/api/admin/users"],
  });

  const { data: metrics } = useQuery<SystemMetrics>({
    queryKey: ["/api/admin/metrics"],
  });

  const { data: applications = [] } = useQuery({
    queryKey: ["/api/applications"],
  });

  const { data: activityLogs = [] } = useQuery<ActivityLog[]>({
    queryKey: ["/api/admin/activity-logs"],
    enabled: activeSection === "logs"
  });

  // Mutations
  const createUserMutation = useMutation({
    mutationFn: async (userData: typeof newUser) => {
      return apiRequest("POST", "/api/admin/users", userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/metrics"] });
      setIsAddUserOpen(false);
      setNewUser({
        name: "",
        username: "",
        password: "",
        status: "Active",
        type: "User"
      });
      toast({
        title: "User Created",
        description: "New user has been created successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create user.",
        variant: "destructive",
      });
    }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, ...updates }: { id: number; [key: string]: any }) => {
      return apiRequest("PATCH", `/api/admin/users/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/metrics"] });
      setIsEditUserOpen(false);
      setEditingUser(null);
      toast({
        title: "User Updated",
        description: "User has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user.",
        variant: "destructive",
      });
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId: number) => {
      return apiRequest("DELETE", `/api/admin/users/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/metrics"] });
      toast({
        title: "User Deleted",
        description: "User has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user.",
        variant: "destructive",
      });
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setNewUser(prev => ({ ...prev, [field]: value }));
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsEditUserOpen(true);
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;
    updateUserMutation.mutate({
      id: editingUser.id,
      name: editingUser.name,
      status: editingUser.status,
      type: editingUser.type
    });
  };

  const handleDeleteUser = (userId: number) => {
    if (userId === user?.id) {
      toast({
        title: "Cannot Delete",
        description: "You cannot delete your own account.",
        variant: "destructive",
      });
      return;
    }
    
    if (confirm("Are you sure you want to delete this user?")) {
      deleteUserMutation.mutate(userId);
    }
  };

  const getStatusBadge = (status: string) => {
    const color = status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
    return (
      <Badge className={color}>
        {status === 'Active' ? <CheckCircle className="h-3 w-3 mr-1" /> : <Clock className="h-3 w-3 mr-1" />}
        {status}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const color = type === 'Admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
    return (
      <Badge className={color}>
        <Shield className="h-3 w-3 mr-1" />
        {type}
      </Badge>
    );
  };

  // Sidebar navigation items
  const sidebarItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "logs", label: "Activity Logs", icon: History },
    { id: "system", label: "System", icon: Database },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const formatActivityAction = (action: string) => {
    switch (action) {
      case 'CREATE_SERVICE': return 'Created service';
      case 'DELETE_SERVICE': return 'Deleted service';
      case 'UPDATE_RISK_SCORE': return 'Updated risk score';
      case 'EXPORT_DATA': return 'Exported data';
      case 'CREATE_USER': return 'Created user';
      case 'UPDATE_USER': return 'Updated user';
      case 'DELETE_USER': return 'Deleted user';
      default: return action.replace(/_/g, ' ').toLowerCase();
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!user || user.type !== 'Admin') {
    return (
      <PageWrapper>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Card className="w-96">
            <CardContent className="p-6 text-center">
              <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-4">Admin access required to view this page.</p>
              <Button onClick={() => window.location.href = "/"}>
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gray-50">
        <Navigation onLogout={logout} currentPage="admin" />
        
        <div className="flex">
          {/* Left Sidebar */}
          <div className="w-64 bg-white shadow-lg border-r min-h-screen">
            <div className="p-6">
              <h1 className="text-xl font-bold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-600 mt-1">System Management</p>
            </div>
            
            <nav className="px-3 pb-6">
              {sidebarItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1 transition-colors ${
                      activeSection === item.id
                        ? 'bg-green-50 text-green-700 border-r-2 border-green-500'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${
                      activeSection === item.id ? 'text-green-500' : 'text-gray-400'
                    }`} />
                    {item.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-8">
            <div className="max-w-7xl mx-auto page-enter page-enter-active">

              {/* Overview Section */}
              {activeSection === "overview" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <p className="text-3xl font-bold text-blue-600">
                              {metrics?.totalUsers || users.length}
                            </p>
                          </div>
                          <Users className="h-8 w-8 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Active Users</p>
                            <p className="text-3xl font-bold text-green-600">
                              {metrics?.activeUsers || users.filter(u => u.status === 'Active').length}
                            </p>
                          </div>
                          <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Total Services</p>
                            <p className="text-3xl font-bold text-purple-600">
                              {applications.length}
                            </p>
                          </div>
                          <Database className="h-8 w-8 text-purple-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600">System Health</p>
                            <p className="text-lg font-bold text-green-600">Healthy</p>
                          </div>
                          <Activity className="h-8 w-8 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">System initialized successfully</p>
                              <p className="text-xs text-gray-500">Database connection established</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">User authentication active</p>
                              <p className="text-xs text-gray-500">Role-based access control enabled</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Security scanners operational</p>
                              <p className="text-xs text-gray-500">All engines reporting data</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>User Distribution</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Admin Users</span>
                            <span className="font-medium">
                              {users.filter(u => u.type === 'Admin').length}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Regular Users</span>
                            <span className="font-medium">
                              {users.filter(u => u.type === 'User').length}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Active Users</span>
                            <span className="font-medium text-green-600">
                              {users.filter(u => u.status === 'Active').length}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm">Inactive Users</span>
                            <span className="font-medium text-red-600">
                              {users.filter(u => u.status === 'Inactive').length}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Users Section */}
              {activeSection === "users" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">User Management</h2>
                    <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                      <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Add User
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Create New User</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                              id="name"
                              placeholder="Enter full name"
                              value={newUser.name}
                              onChange={(e) => handleInputChange("name", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="username">Username (Email)</Label>
                            <Input
                              id="username"
                              type="email"
                              placeholder="user@hingehealth.com"
                              value={newUser.username}
                              onChange={(e) => handleInputChange("username", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                              id="password"
                              type="password"
                              placeholder="Enter password"
                              value={newUser.password}
                              onChange={(e) => handleInputChange("password", e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="type">User Type</Label>
                            <Select value={newUser.type} onValueChange={(value) => handleInputChange("type", value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="User">User</SelectItem>
                                <SelectItem value="Admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="status">Status</Label>
                            <Select value={newUser.status} onValueChange={(value) => handleInputChange("status", value)}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsAddUserOpen(false)}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={() => createUserMutation.mutate(newUser)}
                            disabled={createUserMutation.isPending || !newUser.name || !newUser.username || !newUser.password}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {createUserMutation.isPending ? "Creating..." : "Create User"}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Card>
                    <CardContent className="p-0">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Created</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user: User) => (
                            <TableRow key={user.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{user.name}</p>
                                  <p className="text-sm text-gray-500">{user.username}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                {getStatusBadge(user.status)}
                              </TableCell>
                              <TableCell>
                                {getTypeBadge(user.type)}
                              </TableCell>
                              <TableCell className="text-sm text-gray-500">
                                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                              </TableCell>
                              <TableCell>
                                <div className="flex space-x-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleEditUser(user)}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleDeleteUser(user.id)}
                                    className="text-red-600 hover:bg-red-50"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>

                  {/* Edit User Dialog */}
                  <Dialog open={isEditUserOpen} onOpenChange={setIsEditUserOpen}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit User</DialogTitle>
                      </DialogHeader>
                      {editingUser && (
                        <div className="grid gap-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-name">Full Name</Label>
                            <Input
                              id="edit-name"
                              value={editingUser.name}
                              onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-username">Username (Read Only)</Label>
                            <Input
                              id="edit-username"
                              value={editingUser.username}
                              disabled
                              className="bg-gray-100"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-type">User Type</Label>
                            <Select 
                              value={editingUser.type} 
                              onValueChange={(value) => setEditingUser({ ...editingUser, type: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="User">User</SelectItem>
                                <SelectItem value="Admin">Admin</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="edit-status">Status</Label>
                            <Select 
                              value={editingUser.status} 
                              onValueChange={(value) => setEditingUser({ ...editingUser, status: value })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Inactive">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditUserOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleUpdateUser}
                          disabled={updateUserMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          {updateUserMutation.isPending ? "Updating..." : "Update User"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              )}

              {/* Activity Logs Section */}
              {activeSection === "logs" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold">Activity Logs</h2>
                    <Button
                      variant="outline"
                      onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/activity-logs"] })}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </Button>
                  </div>

                  <Card>
                    <CardContent className="p-0">
                      {activityLogs.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                          <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                          <p>No activity logs found</p>
                          <p className="text-sm">User actions will appear here</p>
                        </div>
                      ) : (
                        <ScrollArea className="h-96">
                          <div className="p-4 space-y-4">
                            {activityLogs.map((log) => (
                              <div key={log.id} className="flex items-start space-x-4 p-3 bg-gray-50 rounded-md">
                                <div className="flex-shrink-0">
                                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium text-gray-900">
                                      <span className="font-semibold">{log.username}</span> {formatActivityAction(log.action)}
                                      {log.serviceName && (
                                        <span className="text-blue-600"> "{log.serviceName}"</span>
                                      )}
                                    </p>
                                    <p className="text-xs text-gray-500 flex-shrink-0">
                                      {formatTimestamp(log.timestamp)}
                                    </p>
                                  </div>
                                  {log.details && (
                                    <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* System Section */}
              {activeSection === "system" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">System Status</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Database Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Connection</p>
                            <p className="font-medium text-green-600">Healthy</p>
                          </div>
                          <CheckCircle className="h-8 w-8 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Security Scanners</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm">Mend Scanner</span>
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Escape Scanner</span>
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm">Crowdstrike Scanner</span>
                            <Badge className="bg-green-100 text-green-800">Active</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Settings Section */}
              {activeSection === "settings" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">System Settings</h2>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Security Configuration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Session Timeout</p>
                            <p className="text-sm text-gray-600">Automatic logout after inactivity</p>
                          </div>
                          <Badge>30 minutes</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Password Policy</p>
                            <p className="text-sm text-gray-600">Minimum security requirements</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Enforced</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">Audit Logging</p>
                            <p className="text-sm text-gray-600">Track user activities</p>
                          </div>
                          <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}