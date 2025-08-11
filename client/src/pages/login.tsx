import React, { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Shield, AlertTriangle, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import HingeLogo from "@/components/hinge-logo";

export default function Login() {
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);

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
    <div className="min-h-screen flex items-center justify-center bg-primary py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center">
            <HingeLogo size="lg" />
          </div>
          <h2 className="mt-3 text-3xl font-bold text-white">
            Security Dashboard
          </h2>
          <p className="mt-2 text-sm text-gray-200">Sign in to your account</p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className="mt-1"
                  />
                </div>
              </div>



              {/* Error messages now shown in popup modal */}

              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Animated Error Popup Modal */}
        <Dialog open={showErrorModal} onOpenChange={setShowErrorModal}>
          <DialogContent className="sm:max-w-md animate-in fade-in-0 zoom-in-95 duration-300 border-0 shadow-2xl">
            <DialogHeader className="space-y-4">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-red-100 to-red-50 shadow-lg">
                <AlertTriangle className="h-8 w-8 text-red-600 animate-bounce" />
              </div>
              <DialogTitle className="text-center text-xl font-bold text-gray-900 animate-in slide-in-from-top-4 duration-500">
                Login Failed
              </DialogTitle>
              <DialogDescription className="text-center text-base text-gray-700 leading-relaxed animate-in slide-in-from-bottom-4 duration-500 delay-150">
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
    </div>
  );
}
