import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const auth = useAuth();
  const location = useLocation();

  // 检查用户是否已登录
  if (!auth.isAuthenticated) {
    // 如果未登录，重定向到登录页面，并记录当前位置
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 如果指定了允许的角色，检查用户角色是否在允许的角色列表中
  if (allowedRoles && auth.user && !allowedRoles.includes(auth.user.role)) {
    // 如果用户角色不在允许的角色列表中，重定向到首页
    return <Navigate to="/" replace />;
  }

  // 如果用户已登录且角色符合要求，渲染子组件
  return <>{children}</>;
} 