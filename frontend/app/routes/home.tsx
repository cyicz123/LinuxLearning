import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // 根据用户角色进行重定向
    if (!isAuthenticated) {
      // 未登录用户重定向到学生页面
      navigate('/student');
    } else {
      // 根据用户角色重定向
      switch (user?.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'teacher':
          navigate('/teacher');
          break;
        case 'student':
        default:
          navigate('/student');
          break;
      }
    }
  }, [isAuthenticated, user, navigate]);

  // 返回一个空的加载状态，因为这个组件只用于重定向
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">正在加载...</p>
      </div>
    </div>
  );
}
