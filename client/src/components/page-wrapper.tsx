import React, { useState, useEffect } from "react";
import Loading from "./loading";

interface PageWrapperProps {
  children: React.ReactNode;
  loadingMessage?: string;
  minLoadingTime?: number; // minimum time to show loading in ms
}

export default function PageWrapper({ 
  children, 
  loadingMessage = "Loading...",
  minLoadingTime = 200 
}: PageWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, minLoadingTime);

    return () => clearTimeout(timer);
  }, [minLoadingTime]);

  if (isLoading) {
    return <Loading message={loadingMessage} />;
  }

  return (
    <div className="min-h-screen bg-background page-enter page-enter-active">
      <div className="animate-in fade-in-0 duration-300">
        {children}
      </div>
    </div>
  );
}