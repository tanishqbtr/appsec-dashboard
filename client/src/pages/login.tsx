import React, { useState, FormEvent } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import hingeHealthLogo from "@assets/Hinge_Health_Logo_1752759155411.png";
import oktaLogo from "@assets/okta_1759800113776.png";

export default function Login() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"email" | "password">("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  const handleEmailContinue = (e: FormEvent) => {
    e.preventDefault();
    if (email) {
      setStep("password");
      setError("");
    }
  };

  const handlePasswordContinue = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await apiRequest("POST", "/api/login", {
        username: email,
        password,
      });

      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        setLocation("/dashboards");
      }
    } catch (err: any) {
      setError("Wrong email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditEmail = () => {
    setStep("email");
    setPassword("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Email Step */}
        {step === "email" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img 
                src={hingeHealthLogo} 
                alt="Hinge Health" 
                className="h-24"
              />
            </div>

            {/* Subtitle */}
            <p className="text-lg text-gray-600 text-center mb-2">
              Application Security Dashboard
            </p>

            {/* Title */}
            <h1 className="text-xl font-semibold text-gray-900 text-center mb-8">
              Sign in
            </h1>

            {/* Email Form */}
            <form onSubmit={handleEmailContinue} className="space-y-6">
              {/* Floating Label Email Field */}
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder=""
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  className="h-12 bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-green-600 focus:ring-green-600 pt-6 pb-2"
                  required
                  data-testid="input-email"
                />
                <label
                  htmlFor="email"
                  className={`absolute left-3 transition-all duration-200 pointer-events-none ${
                    emailFocused || email
                      ? "top-1.5 text-xs text-gray-500"
                      : "top-3.5 text-sm text-gray-500"
                  }`}
                >
                  Email address*
                </label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#3d7c4d] hover:bg-[#2d6c3d] text-white font-medium rounded-full transition-colors duration-200"
                data-testid="button-continue"
              >
                Continue
              </Button>
            </form>

            {/* Enroll Link */}
            <p className="text-center text-sm text-gray-600 mt-6">
              No account?{" "}
              <a href="#" className="text-[#3d7c4d] hover:text-[#2d6c3d] font-medium">
                Enroll Now
              </a>
            </p>

            {/* Divider */}
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-2 text-gray-500">OR</span>
              </div>
            </div>

            {/* Okta Sign In */}
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 mt-6 bg-white border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-full transition-colors duration-200 flex items-center justify-center gap-2"
              data-testid="button-okta"
            >
              <span>Sign in with</span>
              <img src={oktaLogo} alt="Okta" className="h-4" />
            </Button>
          </div>
        )}

        {/* Password Step */}
        {step === "password" && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <img 
                src={hingeHealthLogo} 
                alt="Hinge Health" 
                className="h-24"
              />
            </div>

            {/* Subtitle */}
            <p className="text-lg text-gray-600 text-center mb-2">
              Application Security Dashboard
            </p>

            {/* Title */}
            <h1 className="text-xl font-semibold text-gray-900 text-center mb-8">
              Enter Your Password
            </h1>

            {/* Password Form */}
            <form onSubmit={handlePasswordContinue} className="space-y-6">
              {/* Email Display with Edit */}
              <div>
                <div className="flex items-center justify-between h-12 px-4 bg-gray-50 border border-gray-300 rounded-lg">
                  <span className="text-gray-900">{email}</span>
                  <button
                    type="button"
                    onClick={handleEditEmail}
                    className="text-[#3d7c4d] hover:text-[#2d6c3d] font-medium text-sm"
                    data-testid="button-edit-email"
                  >
                    Edit
                  </button>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password*
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Password*"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`h-12 pr-10 bg-white text-gray-900 placeholder:text-gray-400 ${
                      error
                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                        : "border-gray-300 focus:border-green-600 focus:ring-green-600"
                    }`}
                    required
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                
                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 mt-2 text-red-600 text-sm animate-in slide-in-from-top-2 duration-200">
                    <AlertCircle className="h-4 w-4" />
                    <span data-testid="text-error">{error}</span>
                  </div>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="text-left">
                <a href="#" className="text-[#3d7c4d] hover:text-[#2d6c3d] text-sm font-medium">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-[#3d7c4d] hover:bg-[#2d6c3d] text-white font-medium rounded-full transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="button-signin"
              >
                {isLoading ? "Signing in..." : "Continue"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
