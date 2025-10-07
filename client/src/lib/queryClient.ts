import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function parseError(res: Response) {
  try {
    const data = await res.clone().json();
    return { status: res.status, message: data?.message || res.statusText };
  } catch {
    const text = await res.text();
    return { status: res.status, message: text || res.statusText };
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const err = await parseError(res);
    const e = new Error(err.message) as any;
    e.status = err.status;
    throw e;
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const csrf = typeof document !== 'undefined' && document.cookie.includes('XSRF-TOKEN=')
    ? decodeURIComponent((document.cookie.split(';').find(c => c.trim().startsWith('XSRF-TOKEN=')) || '').split('=')[1] || '')
    : '';
  const headers: Record<string, string> = {};
  if (data) headers["Content-Type"] = "application/json";
  if (csrf) headers["x-csrf-token"] = csrf;
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
