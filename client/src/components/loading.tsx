import React from "react";
import infinityGif from "@assets/Infinity@1x-1.0s-200px-200px_1752739825180.gif";

interface LoadingProps {
  message?: string;
}

export default function Loading({ message = "Loading..." }: LoadingProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <img 
          src={infinityGif} 
          alt="Loading..." 
          className="mx-auto mb-4 w-16 h-16"
        />
        <p className="text-gray-600 text-lg">{message}</p>
      </div>
    </div>
  );
}