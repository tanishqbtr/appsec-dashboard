import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Shield, AlertTriangle, X, Mail, Lock, Eye, EyeOff } from "lucide-react";
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
    <div className="min-h-screen relative">
      {/* Base Background Image - Starts from 25% */}
      <div className="absolute inset-0">
        <img
          src={securityOfficeImage}
          alt="Security Office"
          className="absolute left-[25%] top-0 w-[75%] h-full object-cover"
        />
      </div>
      
      {/* Overlay - Solid color left side */}
      <div className="absolute inset-0 bg-[#070f1b] w-[25%]"></div>
      
      {/* Login Form Container */}
      <div className="relative z-10 min-h-screen flex items-center justify-start p-6 sm:p-8 lg:p-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center text-slate-300 mb-6">
              <Shield className="h-5 w-5 mr-2" />
              <span className="text-sm">Hinge Health AppSec Team</span>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Security Dashboard
            </h1>
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

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Okta Sign In Option */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#070f1b] px-2 text-slate-400">Or</span>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 mt-4 bg-slate-700/30 border-slate-600 text-slate-300 hover:bg-slate-600/50 hover:text-white transition-all duration-200"
            >
              Sign in with Okta
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - Continues the background image */}
      <div className="hidden lg:block w-[60%] relative z-10"></div>

      {/* Animated Error Popup Modal */}
      <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
        <DialogContent className="sm:max-w-md animate-in fade-in-0 zoom-in-95 duration-300 border-0 shadow-2xl bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 border border-slate-600/50">
          <DialogHeader className="space-y-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-red-50 to-pink-50 shadow-lg ring-2 ring-red-100">
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
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg transform active:scale-95 animate-in slide-in-from-bottom-4 duration-500 delay-300 ring-2 ring-red-500/20"
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
