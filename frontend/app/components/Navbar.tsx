import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [showUserInfo, setShowUserInfo] = useState(false);
  const userInfoRef = useRef<HTMLDivElement>(null);

  // 点击页面其他地方关闭用户信息弹窗
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userInfoRef.current && !userInfoRef.current.contains(event.target as Node)) {
        setShowUserInfo(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-gray-900">
                Linux学习平台
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                首页
              </Link>
              <Link
                to="/courses"
                className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                课程列表
              </Link>
              {isAuthenticated && user?.role === 'student' && (
                <Link
                  to="/containers"
                  className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300"
                >
                  我的容器
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4 relative" ref={userInfoRef}>
                <span className="text-sm text-gray-700">
                  {user?.username}
                </span>

                {/* 用户头像 */}
                <div
                  className="relative cursor-pointer"
                  onMouseEnter={() => setShowUserInfo(true)}
                >
                  <Link to="/profile">
                    {user?.avatar ? (
                      <img
                        className="h-8 w-8 rounded-full"
                        src={user.avatar}
                        alt={user.username}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white">
                        {user?.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </Link>

                  {/* 用户信息弹窗 */}
                  {showUserInfo && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 py-2 px-3">
                      <div className="border-b border-gray-200 pb-2 mb-2">
                        <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                        <p className="text-xs text-gray-500">
                          {user?.role === 'admin' ? '管理员' :
                            user?.role === 'teacher' ? '教师' : '学生'}
                        </p>
                      </div>

                      <div className="py-1">
                        <div className="flex items-center py-1">
                          <svg className="h-4 w-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs text-gray-700">{user?.email || '未设置'}</span>
                        </div>
                        <div className="flex items-center py-1">
                          <svg className="h-4 w-4 text-gray-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                          </svg>
                          <span className="text-xs text-gray-700">ID: {user?.user_id}</span>
                        </div>
                      </div>

                      <div className="pt-2 mt-2 border-t border-gray-200">
                        <Link
                          to="/profile"
                          className="block text-xs text-indigo-600 hover:text-indigo-800 py-1"
                          onClick={() => setShowUserInfo(false)}
                        >
                          查看个人信息
                        </Link>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={logout}
                  className="text-sm text-gray-700 hover:text-gray-900"
                >
                  退出
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  登录
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 