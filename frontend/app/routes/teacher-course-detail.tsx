import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  type CourseDetail,
  type Notification,
  getCourseDetail,
  getCourseNotifications,
  createNotification,
  updateNotification,
  deleteNotifications,
  updateCourse
} from '../services/courseService';
import Navbar from '../components/Navbar';
import CourseSidebar from '../components/CourseSidebar';
import { toast } from 'sonner';
import Pagination from '../components/Pagination';
import ScrollToTop from '../components/ScrollToTop';
import { Bell, FileText, Users, Menu, ChevronUp, Search, Plus, Edit, Trash2, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';

// 自定义侧边栏项目
const teacherSidebarItems = [
  {
    id: 'details',
    label: '公告',
    icon: <Bell className="h-5 w-5" />
  },
  {
    id: 'resources',
    label: '资源',
    icon: <FileText className="h-5 w-5" />
  },
  {
    id: 'students',
    label: '学生',
    icon: <Users className="h-5 w-5" />
  }
];


export default function TeacherCourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [notificationsLoading, setNotificationsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState('details');

  // 通知分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalNotifications, setTotalNotifications] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  // 通知搜索和排序
  const [searchKeyword, setSearchKeyword] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // 通知选择状态
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // 通知编辑对话框
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentNotification, setCurrentNotification] = useState<Notification | null>(null);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationContent, setNotificationContent] = useState('');

  // 课程编辑对话框
  const [isCourseEditDialogOpen, setIsCourseEditDialogOpen] = useState(false);
  const [courseEditLoading, setCourseEditLoading] = useState(false);
  const [editCourseName, setEditCourseName] = useState('');
  const [editCourseDescription, setEditCourseDescription] = useState('');
  const [editCoverImage, setEditCoverImage] = useState('');

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
        const data = await getCourseNotifications(
          parseInt(courseId),
          currentPage,
          pageSize,
          searchKeyword,
          sortBy,
          sortOrder
        );
        if (data) {
          setNotifications(data.notifications);
          setTotalNotifications(data.total);
          setTotalPages(Math.ceil(data.total / pageSize));
          // 重置选择状态
          setSelectedNotifications([]);
          setSelectAll(false);
        }
      } catch (err) {
        console.error('获取通知列表失败:', err);
      } finally {
        setNotificationsLoading(false);
      }
    };

    if (currentTab === 'details') {
      fetchNotifications();
    }
  }, [courseId, currentPage, pageSize, currentTab, searchKeyword, sortBy, sortOrder]);

  // 处理通知分页变化
  const handleNotificationPageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 处理标签切换
  const handleTabChange = (value: string) => {
    setCurrentTab(value);

    switch (value) {
      case 'details':
        navigate(`/teacher/courses/${courseId}/edit`);
        break;
      case 'resources':
        navigate(`/teacher/courses/${courseId}/resources`);
        break;
      case 'students':
        navigate(`/teacher/courses/${courseId}/students`);
        break;
      default:
        navigate(`/teacher/courses/${courseId}/edit`);
    }
  };

  // 根据当前路径设置活动标签
  useEffect(() => {
    if (location.pathname.includes('/resources')) {
      setCurrentTab('resources');
    } else if (location.pathname.includes('/students')) {
      setCurrentTab('students');
    } else {
      setCurrentTab('details');
    }
  }, [location.pathname]);

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchKeyword(inputValue);
    setCurrentPage(1); // 重置到第一页
  };

  // 处理排序变化
  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1); // 重置到第一页
  };

  // 处理通知选择
  const handleSelectNotification = (notificationId: number) => {
    setSelectedNotifications(prev => {
      if (prev.includes(notificationId)) {
        return prev.filter(id => id !== notificationId);
      } else {
        return [...prev, notificationId];
      }
    });
  };

  // 处理全选
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n.notification_id));
    }
    setSelectAll(!selectAll);
  };

  // 打开编辑对话框
  const handleOpenEditDialog = (notification: Notification) => {
    setCurrentNotification(notification);
    setNotificationTitle(notification.title);
    setNotificationContent(notification.content);
    setIsEditDialogOpen(true);
  };

  // 处理通知编辑
  const handleEditNotification = async () => {
    if (!currentNotification) return;

    try {
      const success = await updateNotification(currentNotification.notification_id, {
        title: notificationTitle,
        content: notificationContent
      });

      if (success) {
        toast.success('通知更新成功');
        setIsEditDialogOpen(false);

        // 重新获取通知列表
        const data = await getCourseNotifications(
          parseInt(courseId!),
          currentPage,
          pageSize,
          searchKeyword,
          sortBy,
          sortOrder
        );
        if (data) {
          setNotifications(data.notifications);
          setTotalNotifications(data.total);
          setTotalPages(Math.ceil(data.total / pageSize));
        }
      } else {
        toast.error('通知更新失败');
      }
    } catch (err) {
      console.error('更新通知失败:', err);
      toast.error('更新通知失败，请稍后重试');
    }
  };

  // 打开删除对话框
  const handleOpenDeleteDialog = () => {
    if (selectedNotifications.length === 0) {
      toast.error('请先选择要删除的通知');
      return;
    }
    setIsDeleteDialogOpen(true);
  };

  // 处理通知删除
  const handleDeleteNotifications = async () => {
    try {
      const success = await deleteNotifications(selectedNotifications);

      if (success) {
        toast.success(`成功删除 ${selectedNotifications.length} 条通知`);
        setIsDeleteDialogOpen(false);
        setSelectedNotifications([]);
        setSelectAll(false);

        // 重新获取通知列表
        const data = await getCourseNotifications(
          parseInt(courseId!),
          currentPage,
          pageSize,
          searchKeyword,
          sortBy,
          sortOrder
        );
        if (data) {
          setNotifications(data.notifications);
          setTotalNotifications(data.total);
          setTotalPages(Math.ceil(data.total / pageSize));
        }
      } else {
        toast.error('删除通知失败');
      }
    } catch (err) {
      console.error('删除通知失败:', err);
      toast.error('删除通知失败，请稍后重试');
    }
  };

  // 处理添加新通知
  const handleAddNotification = () => {
    setCurrentNotification(null);
    setNotificationTitle('');
    setNotificationContent('');
    setIsEditDialogOpen(true);
  };

  // 处理创建新通知
  const handleCreateNotification = async () => {
    try {
      const success = await createNotification(parseInt(courseId!), {
        title: notificationTitle,
        content: notificationContent
      });

      if (success) {
        toast.success('通知创建成功');
        setIsEditDialogOpen(false);

        // 重新获取通知列表
        const data = await getCourseNotifications(
          parseInt(courseId!),
          currentPage,
          pageSize,
          searchKeyword,
          sortBy,
          sortOrder
        );
        if (data) {
          setNotifications(data.notifications);
          setTotalNotifications(data.total);
          setTotalPages(Math.ceil(data.total / pageSize));
        }
      } else {
        toast.error('通知创建失败');
      }
    } catch (err) {
      console.error('创建通知失败:', err);
      toast.error('创建通知失败，请稍后重试');
    }
  };

  // 打开课程编辑对话框
  const handleOpenCourseEditDialog = () => {
    if (courseDetail) {
      setEditCourseName(courseDetail.course_name);
      setEditCourseDescription(courseDetail.course_description);
      setEditCoverImage(courseDetail.cover_image || '');
      setIsCourseEditDialogOpen(true);
    }
  };

  // 处理课程信息更新
  const handleUpdateCourse = async () => {
    if (!courseId) return;

    try {
      setCourseEditLoading(true);
      const success = await updateCourse(parseInt(courseId), {
        course_name: editCourseName,
        course_description: editCourseDescription,
        cover_image: editCoverImage
      });

      if (success) {
        toast.success('课程信息更新成功');
        setIsCourseEditDialogOpen(false);

        // 重新获取课程详情
        const updatedCourse = await getCourseDetail(parseInt(courseId));
        if (updatedCourse) {
          setCourseDetail(updatedCourse);
        }
      } else {
        toast.error('课程信息更新失败');
      }
    } catch (err) {
      console.error('更新课程信息失败:', err);
      toast.error('更新课程信息失败，请稍后重试');
    } finally {
      setCourseEditLoading(false);
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
            <Button onClick={() => navigate('/teacher/courses')}>返回课程列表</Button>
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
              items={teacherSidebarItems}
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
              items={teacherSidebarItems}
            />
          </div>

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
                        <Button variant="default" onClick={handleOpenCourseEditDialog}>
                          <Edit className="h-4 w-4 mr-1" /> 编辑
                        </Button>
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
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-center">
                      <CardTitle>课程通知</CardTitle>
                      <Button variant="default" size="sm" onClick={handleAddNotification}>
                        <Plus className="h-4 w-4 mr-1" /> 添加通知
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* 搜索和筛选工具栏 */}
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                      <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                        <Input
                          placeholder="搜索通知标题或内容..."
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          className="flex-1"
                        />
                        <Button type="submit" variant="default" size="icon">
                          <Search className="h-4 w-4" />
                        </Button>
                      </form>
                      <div className="flex gap-2">
                        <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
                          <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="排序方式" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="created_at-desc">最新发布</SelectItem>
                            <SelectItem value="created_at-asc">最早发布</SelectItem>
                            <SelectItem value="title-asc">标题 A-Z</SelectItem>
                            <SelectItem value="title-desc">标题 Z-A</SelectItem>
                          </SelectContent>
                        </Select>
                        {selectedNotifications.length > 0 && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleOpenDeleteDialog}
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> 删除
                          </Button>
                        )}
                      </div>
                    </div>

                    {notificationsLoading ? (
                      <p className="text-center py-4 text-gray-500">加载通知中...</p>
                    ) : notifications.length > 0 ? (
                      <>
                        {/* 表头 */}
                        <div className="flex items-center py-2 border-b">
                          <div className="w-6 mr-2">
                            <Checkbox
                              checked={selectAll}
                              onCheckedChange={handleSelectAll}
                              aria-label="选择所有通知"
                            />
                          </div>
                          <div className="flex-1 font-medium">标题</div>
                          <div className="w-32 text-center hidden md:block">发布时间</div>
                          <div className="w-24 text-center">操作</div>
                        </div>

                        {/* 通知列表 */}
                        <div className="space-y-2 mt-2">
                          {notifications.map((notification) => (
                            <div key={notification.notification_id} className="flex items-center py-2 border-b last:border-b-0">
                              <div className="w-6 mr-2">
                                <Checkbox
                                  checked={selectedNotifications.includes(notification.notification_id)}
                                  onCheckedChange={() => handleSelectNotification(notification.notification_id)}
                                  aria-label={`选择通知 ${notification.title}`}
                                />
                              </div>
                              <div className="flex-1 truncate" title={notification.title}>
                                {notification.title}
                              </div>
                              <div className="w-32 text-center text-sm text-gray-500 hidden md:block">
                                {new Date(notification.created_at).toLocaleDateString()}
                              </div>
                              <div className="w-24 text-center">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleOpenEditDialog(notification)}>
                                      <Edit className="h-4 w-4 mr-2" /> 编辑
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="text-red-600"
                                      onClick={() => {
                                        setSelectedNotifications([notification.notification_id]);
                                        setIsDeleteDialogOpen(true);
                                      }}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" /> 删除
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
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
                正在加载{currentTab === 'resources' ? '资源' : '学生'}页面...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 编辑通知对话框 */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{currentNotification ? '编辑通知' : '添加通知'}</DialogTitle>
            <DialogDescription>
              {currentNotification
                ? '修改通知内容，所有选课学生都将看到更新后的内容。'
                : '创建新通知，所有选课学生都将收到此通知。'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">标题</label>
              <Input
                id="title"
                value={notificationTitle}
                onChange={(e) => setNotificationTitle(e.target.value)}
                placeholder="输入通知标题"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">内容</label>
              <textarea
                id="content"
                value={notificationContent}
                onChange={(e) => setNotificationContent(e.target.value)}
                placeholder="输入通知内容"
                className="w-full min-h-[150px] p-2 border rounded-md"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>取消</Button>
            <Button
              onClick={currentNotification ? handleEditNotification : handleCreateNotification}
              disabled={!notificationTitle.trim() || !notificationContent.trim()}
            >
              {currentNotification ? '保存修改' : '创建通知'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除通知确认对话框 */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除选中的 {selectedNotifications.length} 条通知吗？此操作无法撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={handleDeleteNotifications}>
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑课程信息对话框 */}
      <Dialog open={isCourseEditDialogOpen} onOpenChange={setIsCourseEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>编辑课程信息</DialogTitle>
            <DialogDescription>
              修改课程的基本信息，包括名称、描述和封面图片。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="course-name" className="text-sm font-medium">课程名称</label>
              <Input
                id="course-name"
                value={editCourseName}
                onChange={(e) => setEditCourseName(e.target.value)}
                placeholder="输入课程名称"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="cover-image" className="text-sm font-medium">封面图片URL</label>
              <Input
                id="cover-image"
                value={editCoverImage}
                onChange={(e) => setEditCoverImage(e.target.value)}
                placeholder="输入封面图片URL"
              />
              <p className="text-xs text-gray-500">
                请输入有效的图片URL，建议尺寸为16:9的比例
              </p>
            </div>
            <div className="space-y-2">
              <label htmlFor="course-description" className="text-sm font-medium">课程描述</label>
              <textarea
                id="course-description"
                value={editCourseDescription}
                onChange={(e) => setEditCourseDescription(e.target.value)}
                placeholder="输入课程描述"
                className="w-full min-h-[150px] p-2 border rounded-md"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCourseEditDialogOpen(false)}>取消</Button>
            <Button
              onClick={handleUpdateCourse}
              disabled={!editCourseName.trim() || courseEditLoading}
            >
              {courseEditLoading ? '保存中...' : '保存修改'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 