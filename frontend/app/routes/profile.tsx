import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/Navbar';
import AvatarUploader from '../components/AvatarUploader';
import { updateUserProfile, changePassword } from '../services/userService';
import { useNavigate } from 'react-router';

export default function Profile() {
  const { user, isAuthenticated, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    bio: user?.bio || ''
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [avatarUpdated, setAvatarUpdated] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpdated = (avatarUrl: string) => {
    setAvatarUpdated(true);
    setSuccess('头像更新成功！');

    // 3秒后隐藏成功提示
    setTimeout(() => {
      setSuccess(null);
    }, 3000);
  };

  const toggleEdit = () => {
    if (isEditing) {
      // 重置表单数据
      setFormData({
        username: user?.username || '',
        email: user?.email || '',
        bio: user?.bio || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const toggleChangePassword = () => {
    if (isChangingPassword) {
      // 重置密码表单数据
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordError(null);
    }
    setIsChangingPassword(!isChangingPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) return;

    try {
      setIsSubmitting(true);
      setError(null);

      await updateUserProfile(user.user_id, {
        username: formData.username,
        email: formData.email,
        bio: formData.bio
      });

      setSuccess('个人信息更新成功！');
      setIsEditing(false);

      // 3秒后隐藏成功提示
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (error) {
      console.error('更新个人信息失败', error);
      setError('更新个人信息失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    // 验证新密码和确认密码是否一致
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('新密码和确认密码不一致');
      return;
    }

    // 验证新密码长度
    if (passwordData.newPassword.length < 6) {
      setPasswordError('新密码长度不能少于6个字符');
      return;
    }

    try {
      setIsSubmittingPassword(true);

      await changePassword(passwordData.oldPassword, passwordData.newPassword);

      setPasswordSuccess('密码修改成功！请重新登录以确保账户安全');
      setIsChangingPassword(false);

      // 重置密码表单
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // 2秒后登出并重定向到登录页面
      setTimeout(() => {
        logout(); // 调用AuthContext中的logout函数
        navigate('/login', {
          state: { message: '密码已成功修改，请使用新密码登录' }
        });
      }, 2000);

    } catch (error) {
      console.error('修改密码失败', error);
      setPasswordError('修改密码失败，请检查旧密码是否正确');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="md:flex">
            {/* 侧边栏 - 头像和基本信息 */}
            <div className="md:w-1/3 bg-gray-50 p-8 border-r border-gray-200">
              <div className="flex flex-col items-center">
                <h2 className="text-xl font-bold text-gray-800 mb-6">个人信息</h2>

                {/* 头像上传组件 */}
                <AvatarUploader
                  currentAvatar={user?.avatar}
                  onAvatarUpdated={handleAvatarUpdated}
                  size={150}
                />

                <div className="mt-6 text-center">
                  <h3 className="text-lg font-medium text-gray-900">{user?.username}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {user?.role === 'admin' ? '管理员' :
                      user?.role === 'teacher' ? '教师' : '学生'}
                  </p>
                </div>

                {/* 修改密码按钮 */}
                <button
                  onClick={toggleChangePassword}
                  className="mt-6 px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  {isChangingPassword ? '取消修改密码' : '修改密码'}
                </button>
              </div>
            </div>

            {/* 主要内容区 - 个人资料 */}
            <div className="md:w-2/3 p-8">
              {/* 密码修改成功提示 */}
              {passwordSuccess && (
                <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{passwordSuccess}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 修改密码表单 */}
              {isChangingPassword ? (
                <div className="mb-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">修改密码</h2>
                  </div>

                  {/* 密码错误提示 */}
                  {passwordError && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{passwordError}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handlePasswordSubmit}>
                    <div className="space-y-6">
                      <div>
                        <label htmlFor="oldPassword" className="block text-sm font-medium text-gray-700">
                          当前密码
                        </label>
                        <input
                          type="password"
                          id="oldPassword"
                          name="oldPassword"
                          value={passwordData.oldPassword}
                          onChange={handlePasswordInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                          新密码
                        </label>
                        <input
                          type="password"
                          id="newPassword"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          required
                          minLength={6}
                        />
                        <p className="mt-1 text-xs text-gray-500">密码长度至少为6个字符</p>
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                          确认新密码
                        </label>
                        <input
                          type="password"
                          id="confirmPassword"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordInputChange}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          required
                        />
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={toggleChangePassword}
                          className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          取消
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmittingPassword}
                          className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isSubmittingPassword ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                        >
                          {isSubmittingPassword ? '提交中...' : '修改密码'}
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">
                      {isEditing ? '编辑个人资料' : '个人资料'}
                    </h2>
                    <button
                      onClick={toggleEdit}
                      className={`px-4 py-2 rounded-md text-sm font-medium ${isEditing
                        ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                    >
                      {isEditing ? '取消' : '编辑资料'}
                    </button>
                  </div>

                  {/* 成功/错误提示 */}
                  {success && (
                    <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-green-700">{success}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {error && (
                    <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {isEditing ? (
                    // 编辑表单
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-6">
                        <div>
                          <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            用户名
                          </label>
                          <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            邮箱
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>

                        <div>
                          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                            个人简介
                          </label>
                          <textarea
                            id="bio"
                            name="bio"
                            rows={4}
                            value={formData.bio}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>

                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={toggleEdit}
                            className="mr-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            取消
                          </button>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isSubmitting ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'
                              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                          >
                            {isSubmitting ? '保存中...' : '保存'}
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    // 展示信息
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">用户ID</h3>
                        <p className="mt-1 text-sm text-gray-900">{user?.user_id}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">角色</h3>
                        <p className="mt-1 text-sm text-gray-900">
                          {user?.role === 'admin' ? '管理员' :
                            user?.role === 'teacher' ? '教师' : '学生'}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">邮箱</h3>
                        <p className="mt-1 text-sm text-gray-900">{user?.email || '未设置'}</p>
                      </div>

                      <div>
                        <h3 className="text-sm font-medium text-gray-500">个人简介</h3>
                        <p className="mt-1 text-sm text-gray-900">{user?.bio || '暂无个人简介'}</p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 