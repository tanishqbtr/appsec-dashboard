import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Shield, AlertTriangle, X, ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import securityOfficeImage from "@assets/ChatGPT Image Aug 12, 2025, 03_52_20 AM_1754950964913.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowErrorModal(false);
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/login", {
        username,
        password,
      });

      if (response.ok) {
        // Invalidate auth queries to trigger re-fetch
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        setLocation("/dashboards");
      }
    } catch (err: any) {
      // Try to parse the error message from the API response
      let errorMessage = "Invalid credentials";
      
      if (err.message) {
        try {
          // Extract JSON from error message if present
          const jsonMatch = err.message.match(/\{.*\}/);
          if (jsonMatch) {
            const errorData = JSON.parse(jsonMatch[0]);
            if (errorData.message) {
              errorMessage = errorData.message;
            }
          } else if (err.message.includes("disabled")) {
            errorMessage = "Your account has been disabled. Please contact AppSec Team!";
          }
        } catch (parseError) {
          // If parsing fails, check for disabled account text
          if (err.message.includes("disabled")) {
            errorMessage = "Your account has been disabled. Please contact AppSec Team!";
          }
        }
      }
      
      setError(errorMessage);
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex">
      {/* Background Image - Positioned from 40% left */}
      <div className="absolute inset-0">
        <div className="w-full h-full relative">
          <img
            src={securityOfficeImage}
            alt="Security Office"
            className="absolute right-0 top-0 w-3/5 h-full object-cover object-left"
          />
        </div>
      </div>
      
      {/* Left Panel - Login Form with Wall Color Gradient */}
      <div className="flex-1 flex items-center justify-center p-8 lg:p-12 relative z-10 bg-gradient-to-r from-slate-800 via-slate-700/90 via-slate-600/70 to-transparent">
        <div className="w-full max-w-md">
          {/* Back to Home Link */}
          <button className="flex items-center text-slate-300 hover:text-white mb-8 transition-colors duration-200">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </button>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center text-slate-300 mb-6">
              <Shield className="h-5 w-5 mr-2" />
              <span className="text-sm">Hinge Health Security | Application Security</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Security Dashboard Access
            </h1>
            <p className="text-slate-400 text-sm">
              Currently supports web-based authentication
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type="email"
                  placeholder="admin@hingehealth.com"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="pl-10 h-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-400 focus:ring-blue-400/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-center space-x-3">
              <Checkbox
                id="terms"
                checked={agreeToTerms}
                onCheckedChange={setAgreeToTerms}
                className="border-slate-500 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
              <Label htmlFor="terms" className="text-sm text-slate-300">
                I agree to the platform accessing my information
              </Label>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading || !agreeToTerms}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Start now"}
            </Button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 flex items-center justify-center space-x-4 text-sm">
            <span className="text-slate-400">No Account Yet?</span>
            <button className="text-blue-400 hover:text-blue-300 transition-colors duration-200">
              Contact Admin
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel - Continues the background image */}
      <div className="hidden lg:flex flex-1 relative z-10"></div>

      {/* Animated Error Popup Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="sm:max-w-md animate-in fade-in-0 zoom-in-95 duration-300 border-0 shadow-2xl bg-slate-800 border-slate-700">
          <DialogHeader className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-red-100 to-red-50 shadow-lg">
              <AlertTriangle className="h-8 w-8 text-red-600 animate-bounce" />
            </div>
            <DialogTitle className="text-center text-xl font-bold text-white animate-in slide-in-from-top-4 duration-500">
              Login Failed
            </DialogTitle>
            <DialogDescription className="text-center text-base text-slate-300 leading-relaxed animate-in slide-in-from-bottom-4 duration-500 delay-150">
              {error}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center pt-6">
            <Button 
              onClick={() => setShowErrorModal(false)}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg transform active:scale-95 animate-in slide-in-from-bottom-4 duration-500 delay-300"
            >
              <X className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
