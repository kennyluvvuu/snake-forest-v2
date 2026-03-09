import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useMatches,
  useNavigation,
} from "react-router";

import type { Route } from "./+types/root";
import "./app.css";
import { HydrationBoundary, QueryClientProvider } from "@tanstack/react-query";
import { getQueryClient } from "./lib/queryClient";
import GlobalLoaderComponent from "./components/ui/GlobalLoaderComponent";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import { toast, Toaster } from "sonner";
import { useEffect } from "react";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const client = getQueryClient()

  const navigation = useNavigation();
  const isNavigating = Boolean(navigation.location);

  const matches = useMatches();
  const dehydratedState = matches.find((m) => m.data?.dehydratedState)?.data?.dehydratedState;

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <QueryClientProvider client={client}>
          {isNavigating && <GlobalLoaderComponent />}
          <HydrationBoundary state={dehydratedState}>
            {children}
          </HydrationBoundary>
        </QueryClientProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <main className="flex flex-col flex-1">
        <Toaster />
        <Outlet />
      </main>
      <Footer />
    </>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Ой!";
  let details = "Произошла непредвиденная ошибка.";

  // Вызываем плашку при монтировании компонента ошибки
  useEffect(() => {
    const errorText = isRouteErrorResponse(error) 
      ? `Ошибка ${error.status}: ${error.statusText}`
      : error instanceof Error ? error.message : "Критический сбой";
      
    toast.error("Системная ошибка", { description: errorText });
  }, [error]);

  if (isRouteErrorResponse(error)) {
    if (error.status === 404) {
      message = "404";
      details = "Страница не найдена.";
    }
  }

  return (
    <main className="container mx-auto p-4">
      <div className="border-l-4 border-red-500 p-4 bg-red-50">
        <h1 className="text-2xl font-bold text-red-700">{message}</h1>
        <p>{details}</p>
        <button onClick={() => window.location.href = "/"} className="mt-4 underline">
          Вернуться на главную
        </button>
      </div>
    </main>
  );
}
