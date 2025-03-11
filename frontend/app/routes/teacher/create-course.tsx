import { useState } from 'react';
import { useNavigate } from 'react-router';
import { createCourse } from '../../services/courseService';
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import Navbar from '../../components/Navbar';
import { useAuth } from '../../contexts/AuthContext';
import { useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

export default function CreateCoursePage() {
  const [courseName, setCourseName] = useState('');
  const [courseDescription, setCourseDescription] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { user } = useAuth();

  // 检查用户是否为教师
  useEffect(() => {
    if (user?.role !== 'teacher') {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    // 简单验证
    if (!courseName.trim()) {
      setError('课程名称不能为空');
      setIsSubmitting(false);
      return;
    }

    if (!courseDescription.trim()) {
      setError('课程描述不能为空');
      setIsSubmitting(false);
      return;
    }

    // 如果没有设置封面图，使用默认图片
    const finalCoverImage = coverImage.trim() || 'https://via.placeholder.com/300x200?text=课程封面';

    try {
      const courseId = await createCourse({
        course_name: courseName,
        course_description: courseDescription,
        cover_image: finalCoverImage
      });

      if (courseId) {
        // 创建成功，跳转到教师课程列表页
        navigate('/teacher', {
          state: { message: '课程创建成功！' }
        });
      } else {
        setError('创建课程失败，请稍后再试');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || '创建课程失败');
      } else {
        setError('创建课程请求失败，请稍后再试');
      }
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* 返回按钮 */}
          <Button
            variant="ghost"
            onClick={() => navigate('/teacher')}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回课程列表
          </Button>

          {/* 创建课程表单 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">创建新课程</h1>

            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <div className="flex">
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="courseName" className="block text-sm font-medium text-gray-700 mb-1">
                  课程名称 <span className="text-red-500">*</span>
                </label>
                <Input
                  id="courseName"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="请输入课程名称"
                  required
                />
              </div>

              <div>
                <label htmlFor="courseDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  课程描述 <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="courseDescription"
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  placeholder="请输入课程描述"
                  rows={5}
                  required
                />
              </div>

              <div>
                <label htmlFor="coverImage" className="block text-sm font-medium text-gray-700 mb-1">
                  封面图片URL（可选）
                </label>
                <Input
                  id="coverImage"
                  value={coverImage}
                  onChange={(e) => setCoverImage(e.target.value)}
                  placeholder="请输入封面图片URL，不填则使用默认图片"
                />
                <p className="text-xs text-gray-500 mt-1">
                  提示：您可以上传图片到图床，然后将URL粘贴到此处。后续将支持直接上传图片。
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/teacher')}
                  className="mr-4"
                  disabled={isSubmitting}
                >
                  取消
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {isSubmitting ? '创建中...' : '创建课程'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 