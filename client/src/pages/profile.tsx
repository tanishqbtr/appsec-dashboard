import React, { useState } from "react";
import Navigation from "@/components/navigation";
import PageWrapper from "@/components/page-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Lock, Save, ArrowLeft, Clock, Check, X, Eye, EyeOff } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Link } from "wouter";

export default function Profile() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    username: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // Password strength validation
  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 8 && password.length <= 20,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    
    const score = Object.values(requirements).filter(Boolean).length;
    const strength = score <= 2 ? "weak" : score <= 3 ? "medium" : score <= 4 ? "strong" : "excellent";
    
    return { requirements, score, strength };
  };

  const passwordValidation = validatePassword(profileData.newPassword);
  
  // Check if passwords match
  const passwordsMatch = profileData.newPassword && profileData.confirmPassword && 
    profileData.newPassword === profileData.confirmPassword;
  const passwordsDontMatch = profileData.newPassword && profileData.confirmPassword && 
    profileData.newPassword !== profileData.confirmPassword;

  // Fetch user profile data
  const { data: profileUser, isLoading } = useQuery({
    queryKey: ["/api/profile"],
  });

  // Update profile data when user data changes
  React.useEffect(() => {
    if (profileUser) {
      setProfileData(prev => ({
        ...prev,
        name: profileUser.name || "",
        username: profileUser.username || "",
      }));
    }
  }, [profileUser]);

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest("PATCH", "/api/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
      setProfileData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
      queryClient.invalidateQueries({ queryKey: ["/api/profile"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof typeof profileData, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!profileData.name.trim() || !profileData.username.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and username are required.",
        variant: "destructive",
      });
      return;
    }

    if (profileData.newPassword) {
      if (!profileData.currentPassword) {
        toast({
          title: "Validation Error",
          description: "Current password is required to change password.",
          variant: "destructive",
        });
        return;
      }
      if (profileData.newPassword !== profileData.confirmPassword) {
        toast({
          title: "Validation Error",
          description: "New passwords do not match.",
          variant: "destructive",
        });
        return;
      }
      // Validate password strength
      if (passwordValidation.score < 5) {
        toast({
          title: "Password Too Weak",
          description: "Please ensure your password meets all security requirements.",
          variant: "destructive",
        });
        return;
      }
    }

    const updateData: any = {
      name: profileData.name,
      username: profileData.username,
    };

    if (profileData.newPassword) {
      updateData.currentPassword = profileData.currentPassword;
      updateData.newPassword = profileData.newPassword;
    }

    updateProfileMutation.mutate(updateData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfileData(prev => ({
      ...prev,
      name: profileUser?.name || "",
      username: profileUser?.username || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
  };

  if (isLoading) {
    return (
      <PageWrapper loadingMessage="Loading Profile...">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="h-64 bg-gray-300 rounded"></div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper loadingMessage="Loading Profile...">
      <div className="min-h-screen bg-gray-50">
        <Navigation onLogout={logout} currentPage="profile" />
        
        <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">User Profile</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage your account information and security settings
            </p>
          </div>

          {/* Profile Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{profileUser?.name || "User"}</h3>
                    <p className="text-sm text-gray-600">{profileUser?.username}</p>
                    <Badge className={
                      profileUser?.type === "Admin" 
                        ? "bg-purple-100 text-purple-800 border-purple-200" 
                        : "bg-blue-100 text-blue-800 border-blue-200"
                    }>
                      {profileUser?.type || "User"}
                    </Badge>
                  </div>
                </div>
                <Button 
                  onClick={() => setIsEditing(!isEditing)}
                  variant={isEditing ? "outline" : "default"}
                  className={!isEditing ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {isEditing ? "Cancel" : "Edit Profile"}
                </Button>
              </div>

              {isEditing && (
                <>
                  <Separator />
                  <div className="grid gap-6">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={profileData.name}
                        onChange={(e) => handleInputChange("name", e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="username">Username (Email)</Label>
                      <Input
                        id="username"
                        type="email"
                        value={profileData.username}
                        onChange={(e) => handleInputChange("username", e.target.value)}
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Security Settings */}
          {isEditing && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="h-5 w-5" />
                  Security Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPasswords.current ? "text" : "password"}
                        value={profileData.currentPassword}
                        onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                        placeholder="Enter current password (required to change password)"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPasswords.new ? "text" : "password"}
                        value={profileData.newPassword}
                        onChange={(e) => handleInputChange("newPassword", e.target.value)}
                        placeholder="Enter new password (leave blank to keep current)"
                        maxLength={20}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    
                    {/* Password Strength Indicator */}
                    {profileData.newPassword && (
                      <div className="space-y-3 mt-2">
                        {/* Strength Bar */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>Password Strength</span>
                            <span className={`font-medium capitalize ${
                              passwordValidation.strength === "weak" ? "text-red-600" :
                              passwordValidation.strength === "medium" ? "text-orange-500" :
                              passwordValidation.strength === "strong" ? "text-blue-600" :
                              "text-green-600"
                            }`}>
                              {passwordValidation.strength}
                            </span>
                          </div>
                          <div className="flex gap-1 h-2">
                            {[1, 2, 3, 4, 5].map((bar) => (
                              <div
                                key={bar}
                                className={`flex-1 rounded-full transition-colors duration-300 ${
                                  bar <= passwordValidation.score
                                    ? passwordValidation.strength === "weak" ? "bg-red-500" :
                                      passwordValidation.strength === "medium" ? "bg-orange-500" :
                                      passwordValidation.strength === "strong" ? "bg-blue-500" :
                                      "bg-green-500"
                                    : "bg-gray-200"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        
                        {/* Requirements Checklist */}
                        <div className="space-y-2 text-sm">
                          <p className="font-medium text-gray-700">Requirements:</p>
                          <div className="grid gap-1">
                            {[
                              { key: "length", text: "8-20 characters" },
                              { key: "uppercase", text: "One uppercase letter (A-Z)" },
                              { key: "lowercase", text: "One lowercase letter (a-z)" },
                              { key: "numbers", text: "One number (0-9)" },
                              { key: "special", text: "One special character (!@#$%^&*)" },
                            ].map((req) => (
                              <div key={req.key} className="flex items-center gap-2">
                                {passwordValidation.requirements[req.key as keyof typeof passwordValidation.requirements] ? (
                                  <Check className="h-4 w-4 text-green-600" />
                                ) : (
                                  <X className="h-4 w-4 text-red-500" />
                                )}
                                <span className={
                                  passwordValidation.requirements[req.key as keyof typeof passwordValidation.requirements]
                                    ? "text-green-700"
                                    : "text-gray-600"
                                }>
                                  {req.text}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={profileData.confirmPassword}
                        onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                        placeholder="Confirm new password"
                        maxLength={20}
                        className={`pr-10 ${
                          passwordsDontMatch ? "border-red-500 focus:border-red-500 focus:ring-red-500" :
                          passwordsMatch ? "border-green-500 focus:border-green-500 focus:ring-green-500" :
                          ""
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    
                    {/* Real-time password match indicator */}
                    {profileData.confirmPassword && (
                      <div className={`flex items-center gap-2 text-sm mt-1 ${
                        passwordsMatch ? "text-green-600" : "text-red-600"
                      }`}>
                        {passwordsMatch ? (
                          <>
                            <Check className="h-4 w-4" />
                            <span>Passwords match</span>
                          </>
                        ) : (
                          <>
                            <X className="h-4 w-4" />
                            <span>Passwords do not match</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={handleCancel}>
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSubmit}
                    disabled={updateProfileMutation.isPending}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Email Notification Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Notification Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-100 to-blue-50 shadow-lg">
                    <Clock className="h-8 w-8 text-blue-600 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">Coming Soon!</h3>
                    <p className="text-gray-600 max-w-md">
                      Email notification preferences will be available in an upcoming release. 
                      You'll be able to customize alerts for security findings, scan results, and system updates.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </PageWrapper>
  );
}