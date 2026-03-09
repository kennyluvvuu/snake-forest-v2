import { QueryClient, QueryCache } from "@tanstack/react-query";
import { toast } from "sonner";

export function createNewQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        const customMessage = query.meta?.errorMessage as string;
        
        toast.error(customMessage || "Произошла ошибка при загрузке данных", {
          description: error instanceof Error ? error.message : "Неизвестная ошибка",
          duration: 5000,
        });
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 20, 
        refetchOnWindowFocus: false,
        retry: 1, 
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

export function getQueryClient() {
  if (typeof window === "undefined") {
    return createNewQueryClient();
  }

  if (!browserQueryClient) browserQueryClient = createNewQueryClient();
  return browserQueryClient;
}
