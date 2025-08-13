import React from "react";

interface LoadingProps {
  message?: string;
}

export default function Loading({ message = "Loading..." }: LoadingProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative w-16 h-16 mx-auto">
          <div className="absolute inset-0 border-4 border-muted rounded-full"></div>
          <div className="absolute inset-0 border-4 border-green-600 rounded-full animate-spin border-t-transparent"></div>
        </div>
        <p className="text-muted-foreground text-lg font-medium">{message}</p>
      </div>
    </div>
  );
}