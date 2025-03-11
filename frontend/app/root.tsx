import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { Toaster } from './components/ui/sonner';

import type { Route } from "./+types/root";
import "./app.css";
import { AuthProvider } from "./contexts/AuthContext";

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
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  const location = useLocation();
  const navigate = useNavigate();

  // 检查用户是否已登录，如果未登录且访问需要认证的页面，则重定向到登录页面
  useEffect(() => {
    const token = localStorage.getItem('token');
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

    // 判断是否是需要认证的路径（教师和管理员页面）
    const isProtectedPath =
      location.pathname.startsWith('/teacher') ||
      location.pathname.startsWith('/admin');

    // 如果用户未登录且访问需要认证的页面，重定向到登录页面
    if (!token && isProtectedPath) {
      navigate('/login', {
        replace: true,
        state: { from: location.pathname, message: '请先登录以访问该页面' }
      });
    }

    // 如果用户已登录且在登录/注册页面，重定向到首页
    if (token && isAuthPage) {
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate, location]);

  return (
    <AuthProvider>
      <Outlet />
      <Toaster />
    </AuthProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
