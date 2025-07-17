import { useState, useEffect } from "react";
import Loading from "./loading";

interface PageWrapperProps {
  children: React.ReactNode;
  loadingMessage?: string;
  minLoadingTime?: number; // minimum time to show loading in ms
}

export default function PageWrapper({ 
  children, 
  loadingMessage = "Loading...",
  minLoadingTime = 500 
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

  return <>{children}</>;
}