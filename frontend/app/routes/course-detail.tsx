import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import {
  type CourseDetail,
  type Notification,
  getCourseDetail,
  getCourseNotifications,
  enrollCourse,
  unenrollCourse
} from '../services/courseService';
import Navbar from '../components/Navbar';
import { toast } from 'sonner';
import CourseSidebar from '../components/CourseSidebar';
import Pagination from '../components/Pagination';

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [enrollLoading, setEnrollLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState('details');

  // 通知分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  // 获取课程详情
  useEffect(() => {
    const fetchCourseDetail = async () => {
      if (!courseId) return;

      try {
        setLoading(true);
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
        setLoading(false);
      }
    };

    fetchCourseDetail();
  }, [courseId]);

  // 获取课程通知
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!courseId) return;

      try {
        setNotificationsLoading(true);
        const data = await getCourseNotifications(parseInt(courseId), currentPage, pageSize);
        if (data) {
          setNotifications(data.notifications);
          setTotalNotifications(data.total);
          setTotalPages(Math.ceil(data.total / pageSize));
        }
      } catch (err) {
        console.error('获取通知列表失败:', err);
      } finally {
        setNotificationsLoading(false);
      }
    };

    fetchNotifications();
  }, [courseId, currentPage, pageSize]);

  // 处理通知分页变化
  const handleNotificationPageChange = (page: number) => {
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

  // 根据当前路径设置活动标签
  useEffect(() => {
    if (location.pathname.includes('/resources')) {
      setCurrentTab('resources');
    } else if (location.pathname.includes('/images')) {
      setCurrentTab('images');
    } else {
      setCurrentTab('details');
    }
  }, [location.pathname]);

  // 处理选课
  const handleEnroll = async () => {
    if (!courseId || !courseDetail) return;

    try {
      setEnrollLoading(true);
      const success = await enrollCourse(parseInt(courseId));

      if (success) {
        toast.success(`您已成功选修《${courseDetail.course_name}》课程`);

        // 更新课程详情
        const updatedCourse = await getCourseDetail(parseInt(courseId));
        if (updatedCourse) {
          setCourseDetail(updatedCourse);
        }
      } else {
        toast.error("选课失败，请稍后重试");
      }
    } catch (err) {
      console.error(err);
      toast.error("选课失败，发生错误，请稍后重试");
    } finally {
      setEnrollLoading(false);
    }
  };

  // 处理退课
  const handleUnenroll = async () => {
    if (!courseId || !courseDetail) return;

    try {
      setEnrollLoading(true);
      const success = await unenrollCourse(parseInt(courseId));

      if (success) {
        toast.success(`您已成功退出《${courseDetail.course_name}》课程`);

        // 更新课程详情
        const updatedCourse = await getCourseDetail(parseInt(courseId));
        if (updatedCourse) {
          setCourseDetail(updatedCourse);
        }
      } else {
        toast.error("退课失败，请稍后重试");
      }
    } catch (err) {
      console.error(err);
      toast.error("退课失败，发生错误，请稍后重试");
    } finally {
      setEnrollLoading(false);
    }
  };

  if (loading) {
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
            <p className="text-lg text-red-500 mb-4">{error || '课程不存在'}</p>
            <Button onClick={() => navigate('/courses')}>返回课程列表</Button>
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
          {/* 使用抽取的侧边栏组件 */}
          <CourseSidebar
            currentTab={currentTab}
            onTabChange={handleTabChange}
          />

          {/* 主内容区 */}
          <div className="flex-1">
            {currentTab === 'details' && (
              <div className="space-y-6">
                {/* 课程详情卡片 */}
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-2xl">{courseDetail.course_name}</CardTitle>
                        <CardDescription className="mt-2">
                          <div className="flex flex-col md:flex-row justify-between gap-2">
                            <div className="text-gray-600">
                              教师: {courseDetail.teacher_name} | 选课人数: {courseDetail.enrollment_count}
                            </div>
                            <div className="flex gap-4 text-gray-600">
                              <div>创建时间: {new Date(courseDetail.created_at).toLocaleString()}</div>
                              <div>更新时间: {new Date(courseDetail.updated_at).toLocaleString()}</div>
                            </div>
                          </div>
                        </CardDescription>
                      </div>
                      <div>
                        {courseDetail.is_enrolled ? (
                          <Button
                            variant="destructive"
                            onClick={handleUnenroll}
                            disabled={enrollLoading}
                          >
                            {enrollLoading ? '处理中...' : '退课'}
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            onClick={handleEnroll}
                            disabled={enrollLoading}
                          >
                            {enrollLoading ? '处理中...' : '选课'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/3">
                        <img
                          src={courseDetail.cover_image || '/Linux.png'}
                          alt={courseDetail.course_name}
                          className="w-full h-auto rounded-md object-cover"
                        />
                      </div>
                      <div className="md:w-2/3">
                        <h3 className="text-lg font-medium mb-2">课程简介</h3>
                        <p className="text-gray-700 whitespace-pre-line">
                          {courseDetail.course_description || '暂无课程简介'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* 通知公告列表 */}
                <Card>
                  <CardHeader>
                    <CardTitle>课程通知</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {notificationsLoading ? (
                      <p className="text-center py-4 text-gray-500">加载通知中...</p>
                    ) : notifications.length > 0 ? (
                      <>
                        <div className="space-y-4">
                          {notifications.map((notification) => (
                            <div key={notification.notification_id} className="border-b pb-4 last:border-b-0">
                              <div className="flex justify-between items-start">
                                <h3 className="font-medium">{notification.title}</h3>
                                <span className="text-sm text-gray-500">
                                  {new Date(notification.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="mt-2 text-gray-700 whitespace-pre-line">{notification.content}</p>
                              <div className="mt-2 text-sm text-gray-500">
                                发布者: {notification.teacher_name}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* 分页控件 */}
                        {totalPages > 1 && (
                          <div className="mt-6">
                            <Pagination
                              currentPage={currentPage}
                              totalPages={totalPages}
                              onPageChange={handleNotificationPageChange}
                            />
                            <div className="text-center mt-2 text-sm text-gray-500">
                              共 {totalNotifications} 条通知，当前显示第 {currentPage} 页
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-center py-4 text-gray-500">暂无通知</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* 其他标签页内容将通过路由渲染 */}
            {currentTab !== 'details' && (
              <div className="text-center py-4 text-gray-500">
                请等待页面加载...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 