import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';

export default function Profile() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">请先登录</h1>
            <p className="mt-4 text-gray-600">您需要登录后才能查看个人信息</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">个人信息</h1>

          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 flex justify-center mb-6 md:mb-0">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username}
                  className="w-40 h-40 rounded-full object-cover"
                />
              ) : (
                <div className="w-40 h-40 rounded-full bg-indigo-600 flex items-center justify-center text-white text-4xl">
                  {user?.username.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div className="md:w-2/3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">用户名</h3>
                  <p className="mt-1 text-lg text-gray-900">{user?.username}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">用户ID</h3>
                  <p className="mt-1 text-lg text-gray-900">{user?.user_id}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">角色</h3>
                  <p className="mt-1 text-lg text-gray-900">
                    {user?.role === 'admin' ? '管理员' :
                      user?.role === 'teacher' ? '教师' : '学生'}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">邮箱</h3>
                  <p className="mt-1 text-lg text-gray-900">{user?.email || '未设置'}</p>
                </div>
              </div>

              <div className="mt-8">
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                  编辑个人信息
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 