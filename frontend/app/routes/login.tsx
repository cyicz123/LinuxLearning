import { useState } from 'react';
import { Form, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/apiClient';
import type { User } from '../contexts/AuthContext';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('student');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();

  // 获取从注册页面传递过来的消息
  const message = location.state?.message || '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 使用apiClient调用登录API
      const data = await apiClient.post<{
        token: string;
        user: User
      }>('auth/login', { username, password }, { requireAuth: false });

      // 使用AuthContext进行登录
      auth.login(data.token, data.user);

      // 根据角色跳转到不同页面
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else if (data.user.role === 'teacher') {
        navigate('/teacher');
      } else {
        // 学生角色跳转到首页
        navigate('/');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || '登录失败，请检查用户名和密码');
      } else {
        setError('登录请求失败，请稍后再试');
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* 左侧宣传内容 */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center p-12 bg-indigo-50">
        <div className="max-w-md text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">Linux操作系统学习平台</h1>
          <p className="text-lg text-gray-600 mb-8">
            欢迎来到Linux操作系统学习平台，这里提供丰富的Linux学习资源和实践环境。
          </p>

          <div className="mt-8 text-center">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">平台特色</h2>
            <div className="space-y-6">
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-medium text-gray-900">丰富的学习资源</h3>
                <p className="mt-2 text-gray-600">
                  提供全面的Linux学习资料，包括教程、文档和视频。
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-medium text-gray-900">实践环境</h3>
                <p className="mt-2 text-gray-600">
                  通过Docker容器提供真实的Linux操作环境，随时进行实践。
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg shadow-md">
                <h3 className="text-lg font-medium text-gray-900">多角色支持</h3>
                <p className="mt-2 text-gray-600">
                  支持学生、教师和管理员多种角色，满足不同需求。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 右侧登录表单 */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-xl shadow-md">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              登录账号
            </h2>
            <p className="mt-2 text-sm text-gray-600">请登录您的账号以开始学习</p>
          </div>

          {message && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-green-700">{message}</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
              <div className="flex">
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="username" className="sr-only">用户名</label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="用户名"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">密码</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">选择角色</label>
              <div className="mt-2 space-y-2">
                <div className="flex items-center">
                  <input
                    id="role-student"
                    name="role"
                    type="radio"
                    value="student"
                    checked={role === 'student'}
                    onChange={() => setRole('student')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="role-student" className="ml-3 block text-sm font-medium text-gray-700">
                    学生
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="role-teacher"
                    name="role"
                    type="radio"
                    value="teacher"
                    checked={role === 'teacher'}
                    onChange={() => setRole('teacher')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="role-teacher" className="ml-3 block text-sm font-medium text-gray-700">
                    教师
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="role-admin"
                    name="role"
                    type="radio"
                    value="admin"
                    checked={role === 'admin'}
                    onChange={() => setRole('admin')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <label htmlFor="role-admin" className="ml-3 block text-sm font-medium text-gray-700">
                    管理员
                  </label>
                </div>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${isLoading ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {isLoading ? '登录中...' : '登录'}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
                  没有账号？立即注册
                </a>
              </div>
              <div className="text-sm">
                <a href="/" className="font-medium text-gray-600 hover:text-gray-500">
                  返回首页
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 