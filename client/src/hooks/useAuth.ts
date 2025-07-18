import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function useAuth() {
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["/api/auth/user"],
    retry: false,
    staleTime: 0, // Always check for fresh auth status
  });

  const logout = async () => {
    try {
      await apiRequest("POST", "/api/logout");
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear all query cache and reset authentication state
      queryClient.clear();
      // Force a reload to ensure clean state
      window.location.reload();
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !isError,
    logout,
  };
}