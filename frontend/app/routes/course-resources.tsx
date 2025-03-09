import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { getCourseResources, getCourseDetail, type CourseDetail } from '../services/courseService';
import type { Resource } from '../services/courseService';
import Pagination from '../components/Pagination';
import { FileIcon, FileTextIcon, VideoIcon, ArchiveIcon } from 'lucide-react';
import { formatFileSize } from '../utils/formatters';
import Navbar from '../components/Navbar';
import CourseSidebar from '../components/CourseSidebar';
import ScrollToTop from '../components/ScrollToTop';

export default function CourseResourcesPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [resources, setResources] = useState<Resource[]>([]);
  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [courseLoading, setCourseLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState('resources');

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResources, setTotalResources] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // 获取课程详情
  useEffect(() => {
    const fetchCourseDetail = async () => {
      if (!courseId) return;

      try {
        setCourseLoading(true);
        const data = await getCourseDetail(parseInt(courseId));
        if (data) {
          setCourseDetail(data);
        } else {
          setError('获取课程详情失败');
        }
      } catch (err) {
        setError('获取课程详情时发生错误');
        console.error(err);
      } finally {
        setCourseLoading(false);
      }
    };

    fetchCourseDetail();
  }, [courseId]);

  // 获取课程资源
  useEffect(() => {
    const fetchResources = async () => {
      if (!courseId) return;

      try {
        setLoading(true);
        const data = await getCourseResources(parseInt(courseId), currentPage, pageSize);
        if (data) {
          setResources(data.resources);
          setTotalResources(data.total);
          setTotalPages(Math.ceil(data.total / pageSize));
        } else {
          setError('获取资源列表失败');
        }
      } catch (err) {
        setError('获取资源列表时发生错误');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [courseId, currentPage, pageSize]);

  // 处理分页变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 处理标签切换
  const handleTabChange = (value: string) => {
    setCurrentTab(value);

    switch (value) {
      case 'details':
        navigate(`/courses/${courseId}`);
        break;
      case 'resources':
        navigate(`/courses/${courseId}/resources`);
        break;
      case 'images':
        navigate(`/courses/${courseId}/images`);
        break;
      default:
        navigate(`/courses/${courseId}`);
    }
  };

  // 获取资源类型图标
  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileTextIcon className="h-5 w-5 text-blue-500" />;
      case 'video':
        return <VideoIcon className="h-5 w-5 text-red-500" />;
      case 'archive':
        return <ArchiveIcon className="h-5 w-5 text-yellow-500" />;
      default:
        return <FileIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  if (courseLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-8">
          <div className="flex justify-center items-center h-64">
            <p className="text-lg text-gray-500">加载中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !courseDetail) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-8">
          <div className="flex flex-col justify-center items-center h-64">
            <p className="text-lg text-red-500 mb-4">{error || '出现错误，请稍后重试'}</p>
            <Button onClick={() => navigate(`/courses/${courseId}`)}>返回课程详情</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row gap-6 relative">
          {/* 桌面端侧边栏和回到顶部按钮的容器 */}
          <div className="hidden md:flex flex-col gap-4 sticky top-6 h-fit">
            <CourseSidebar
              currentTab={currentTab}
              onTabChange={handleTabChange}
              className="h-fit"
            />
            <ScrollToTop
              className="self-center"
              showAfter={400}
            />
          </div>

          {/* 移动端只显示侧边栏 */}
          <div className="md:hidden">
            <CourseSidebar
              currentTab={currentTab}
              onTabChange={handleTabChange}
            />
          </div>

          {/* 主内容区 */}
          <div className="flex-1">
            <Card>
              <CardHeader>
                <CardTitle>课程资源</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <p className="text-lg text-gray-500">加载资源中...</p>
                  </div>
                ) : resources.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-4 py-2 text-left">类型</th>
                            <th className="px-4 py-2 text-left">资源名称</th>
                            <th className="px-4 py-2 text-left">描述</th>
                            <th className="px-4 py-2 text-left">大小</th>
                            <th className="px-4 py-2 text-left">上传时间</th>
                            <th className="px-4 py-2 text-left">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {resources.map((resource) => (
                            <tr key={resource.resource_id} className="border-t hover:bg-gray-50">
                              <td className="px-4 py-3">
                                {getResourceIcon(resource.resource_type)}
                              </td>
                              <td className="px-4 py-3 font-medium">{resource.resource_name}</td>
                              <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                                {resource.resource_description || '无描述'}
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                {formatFileSize(resource.size)}
                              </td>
                              <td className="px-4 py-3 text-gray-600">
                                {new Date(resource.created_at).toLocaleDateString()}
                              </td>
                              <td className="px-4 py-3">
                                <a
                                  href={resource.download_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center"
                                >
                                  <Button variant="outline" size="sm">
                                    下载
                                  </Button>
                                </a>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* 分页控件 */}
                    {totalPages > 1 && (
                      <div className="mt-6">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={handlePageChange}
                        />
                        <div className="text-center mt-2 text-sm text-gray-500">
                          共 {totalResources} 个资源，当前显示第 {currentPage} 页
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">暂无资源</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 