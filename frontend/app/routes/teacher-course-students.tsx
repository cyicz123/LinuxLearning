import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import { Progress } from '../components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import Pagination from '../components/Pagination';
import Navbar from '../components/Navbar';
import CourseSidebar from '../components/CourseSidebar';
import ScrollToTop from '../components/ScrollToTop';
import { 
  Search, 
  Plus, 
  Trash2, 
  MoreVertical, 
  Bell, 
  Users, 
  FileTextIcon, 
  ChevronDown, 
  ChevronRight, 
  Play, 
  Square, 
  RefreshCw 
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { getCourseDetail, type CourseDetail } from '../services/courseService';
import { 
  getCourseStudents,
  createStudentContainer,
  updateStudentContainer,
  deleteStudentContainer,
  startStudentContainer,
  stopStudentContainer,
  restartStudentContainer,
  type Student as CourseStudent,
  type Container
} from '../services/studentService';
import { getCourseImages, type Image } from '../services/imageService';

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
    icon: <FileTextIcon className="h-5 w-5" />
  },
  {
    id: 'students',
    label: '学生',
    icon: <Users className="h-5 w-5" />
  }
];

export default function TeacherCourseStudentsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [students, setStudents] = useState<CourseStudent[]>([]);
  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [courseLoading, setCourseLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState('students');

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // 搜索和排序状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [sortBy, setSortBy] = useState<'enrolled_at' | 'username' | 'total_containers' | 'running_containers'>('enrolled_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 展开状态
  const [expandedStudents, setExpandedStudents] = useState<number[]>([]);

  // 容器操作对话框状态
  const [createContainerDialogOpen, setCreateContainerDialogOpen] = useState(false);
  const [editContainerDialogOpen, setEditContainerDialogOpen] = useState(false);
  const [deleteContainerDialogOpen, setDeleteContainerDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
  const [selectedContainerId, setSelectedContainerId] = useState<string | null>(null);
  const [containerName, setContainerName] = useState('');
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const [availableImages, setAvailableImages] = useState<Image[]>([]);
  const [loadingImages, setLoadingImages] = useState(false);

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

  // 获取课程学生列表
  useEffect(() => {
    const fetchStudents = async () => {
      if (!courseId) return;

      try {
        setLoading(true);
        const data = await getCourseStudents(parseInt(courseId), {
          page: currentPage,
          limit: pageSize,
          keyword: searchKeyword,
          sort_by: sortBy,
          sort_order: sortOrder
        });

        if (data) {
          setStudents(data.students);
          setTotalStudents(data.total);
          setTotalPages(Math.ceil(data.total / pageSize));
        } else {
          setError('获取学生列表失败');
        }
      } catch (err) {
        setError('获取学生列表时发生错误');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [courseId, currentPage, pageSize, searchKeyword, sortBy, sortOrder]);

  // 处理分页变化
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchKeyword(inputValue);
    setCurrentPage(1); // 重置到第一页
  };

  // 处理排序变化
  const handleSortChange = (value: 'enrolled_at' | 'username' | 'total_containers' | 'running_containers') => {
    if (value === sortBy) {
      // 如果点击的是当前排序字段，则切换排序方向
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // 否则，更改排序字段并设置为降序
      setSortBy(value);
      setSortOrder('desc');
    }
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

  // 处理展开/折叠
  const handleToggleExpand = (studentId: number) => {
    setExpandedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  // 打开创建容器对话框
  const handleOpenCreateContainerDialog = async (studentId: number) => {
    setSelectedStudentId(studentId);
    setContainerName('');
    setSelectedImageId(null);
    setCreateContainerDialogOpen(true);
    await fetchAvailableImages();
  };

  // 打开编辑容器对话框
  const handleOpenEditContainerDialog = async (studentId: number, containerId: string, containerName: string, imageId: number) => {
    setSelectedStudentId(studentId);
    setSelectedContainerId(containerId);
    setContainerName(containerName);
    setSelectedImageId(imageId);
    setEditContainerDialogOpen(true);
    await fetchAvailableImages();
  };

  // 打开删除容器对话框
  const handleOpenDeleteContainerDialog = (studentId: number, containerId: string) => {
    setSelectedStudentId(studentId);
    setSelectedContainerId(containerId);
    setDeleteContainerDialogOpen(true);
  };

  // 获取可用镜像列表
  const fetchAvailableImages = async () => {
    if (!courseId) return;

    try {
      setLoadingImages(true);
      const images = await getCourseImages(parseInt(courseId));
      if (images) {
        setAvailableImages(images);
      } else {
        toast.error('获取可用镜像列表失败');
      }
    } catch (error) {
      console.error('获取可用镜像列表时发生错误:', error);
      toast.error('获取可用镜像列表失败');
    } finally {
      setLoadingImages(false);
    }
  };

  // 创建容器
  const handleCreateContainer = async () => {
    if (!courseId || !selectedStudentId || !selectedImageId || !containerName.trim()) {
      toast.error('请填写完整信息');
      return;
    }

    try {
      const success = await createStudentContainer(
        parseInt(courseId),
        selectedStudentId,
        {
          image_id: selectedImageId,
          container_name: containerName.trim()
        }
      );

      if (success) {
        toast.success('容器创建成功');
        setCreateContainerDialogOpen(false);

        // 刷新学生列表
        const data = await getCourseStudents(parseInt(courseId), {
          page: currentPage,
          limit: pageSize,
          keyword: searchKeyword,
          sort_by: sortBy,
          sort_order: sortOrder
        });

        if (data) {
          setStudents(data.students);
        }
      } else {
        toast.error('容器创建失败');
      }
    } catch (error) {
      console.error('创建容器时发生错误:', error);
      toast.error('创建容器失败');
    }
  };

  // 更新容器
  const handleUpdateContainer = async () => {
    if (!selectedContainerId || !containerName.trim() || !selectedImageId) {
      toast.error('请填写完整信息');
      return;
    }

    try {
      const success = await updateStudentContainer(
        selectedContainerId,
        {
          container_name: containerName.trim(),
          image_id: selectedImageId
        }
      );

      if (success) {
        toast.success('容器更新成功');
        setEditContainerDialogOpen(false);

        // 刷新学生列表
        if (courseId) {
          const data = await getCourseStudents(parseInt(courseId), {
            page: currentPage,
            limit: pageSize,
            keyword: searchKeyword,
            sort_by: sortBy,
            sort_order: sortOrder
          });

          if (data) {
            setStudents(data.students);
          }
        }
      } else {
        toast.error('容器更新失败');
      }
    } catch (error) {
      console.error('更新容器时发生错误:', error);
      toast.error('更新容器失败');
    }
  };

  // 删除容器
  const handleDeleteContainer = async () => {
    if (!selectedContainerId) return;

    try {
      const success = await deleteStudentContainer(selectedContainerId);

      if (success) {
        toast.success('容器删除成功');
        setDeleteContainerDialogOpen(false);

        // 刷新学生列表
        if (courseId) {
          const data = await getCourseStudents(parseInt(courseId), {
            page: currentPage,
            limit: pageSize,
            keyword: searchKeyword,
            sort_by: sortBy,
            sort_order: sortOrder
          });

          if (data) {
            setStudents(data.students);
          }
        }
      } else {
        toast.error('容器删除失败');
      }
    } catch (error) {
      console.error('删除容器时发生错误:', error);
      toast.error('删除容器失败');
    }
  };

  // 启动容器
  const handleStartContainer = async (containerId: string) => {
    try {
      const success = await startStudentContainer(containerId);

      if (success) {
        toast.success('容器启动成功');

        // 刷新学生列表
        if (courseId) {
          const data = await getCourseStudents(parseInt(courseId), {
            page: currentPage,
            limit: pageSize,
            keyword: searchKeyword,
            sort_by: sortBy,
            sort_order: sortOrder
          });

          if (data) {
            setStudents(data.students);
          }
        }
      } else {
        toast.error('容器启动失败');
      }
    } catch (error) {
      console.error('启动容器时发生错误:', error);
      toast.error('启动容器失败');
    }
  };

  // 停止容器
  const handleStopContainer = async (containerId: string) => {
    try {
      const success = await stopStudentContainer(containerId);

      if (success) {
        toast.success('容器停止成功');

        // 刷新学生列表
        if (courseId) {
          const data = await getCourseStudents(parseInt(courseId), {
            page: currentPage,
            limit: pageSize,
            keyword: searchKeyword,
            sort_by: sortBy,
            sort_order: sortOrder
          });

          if (data) {
            setStudents(data.students);
          }
        }
      } else {
        toast.error('容器停止失败');
      }
    } catch (error) {
      console.error('停止容器时发生错误:', error);
      toast.error('停止容器失败');
    }
  };

  // 重启容器
  const handleRestartContainer = async (containerId: string) => {
    try {
      const success = await restartStudentContainer(containerId);

      if (success) {
        toast.success('容器重启成功');

        // 刷新学生列表
        if (courseId) {
          const data = await getCourseStudents(parseInt(courseId), {
            page: currentPage,
            limit: pageSize,
            keyword: searchKeyword,
            sort_by: sortBy,
            sort_order: sortOrder
          });

          if (data) {
            setStudents(data.students);
          }
        }
      } else {
        toast.error('容器重启失败');
      }
    } catch (error) {
      console.error('重启容器时发生错误:', error);
      toast.error('重启容器失败');
    }
  };

  // 获取容器状态样式
  const getContainerStatusStyle = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-green-100 text-green-800';
      case 'stopped':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-blue-100 text-blue-800';
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
            <Button onClick={() => navigate(`/teacher/courses/${courseId}/edit`)}>返回课程详情</Button>
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
            <Card>
              <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                <CardTitle>课程学生</CardTitle>
              </CardHeader>

              <CardContent>
                {/* 搜索和排序 */}
                <div className="flex flex-col md:flex-row justify-between mb-6 space-y-2 md:space-y-0 md:items-center">
                  <form onSubmit={handleSearch} className="flex flex-1 mr-4">
                    <Input
                      type="text"
                      placeholder="搜索学生姓名或邮箱..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="mr-2"
                    />
                    <Button type="submit" variant="outline">
                      <Search className="h-4 w-4" />
                    </Button>
                  </form>

                  <div className="flex items-center space-x-2">
                    <Label htmlFor="sort-by" className="text-sm whitespace-nowrap">排序方式:</Label>
                    <Select
                      value={sortBy}
                      onValueChange={(value) => handleSortChange(value as any)}
                    >
                      <SelectTrigger id="sort-by" className="w-[180px]">
                        <SelectValue placeholder="选择排序字段" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enrolled_at">选课时间</SelectItem>
                        <SelectItem value="username">学生姓名</SelectItem>
                        <SelectItem value="total_containers">容器总数</SelectItem>
                        <SelectItem value="running_containers">运行容器数</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      title={sortOrder === 'asc' ? '升序' : '降序'}
                    >
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </Button>
                  </div>
                </div>

                {/* 学生列表 */}
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <p className="text-lg text-gray-500">加载学生数据中...</p>
                  </div>
                ) : students.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="w-10 px-4 py-2"></th>
                            <th className="px-4 py-2 text-left">学生姓名</th>
                            <th className="px-4 py-2 text-left">邮箱</th>
                            <th className="px-4 py-2 text-left">选课时间</th>
                            <th className="px-4 py-2 text-left">容器使用情况</th>
                            <th className="px-4 py-2 text-left">操作</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.map((student) => (
                            <>
                              <tr key={student.user_id} className="border-t hover:bg-gray-50">
                                <td className="px-4 py-3">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleToggleExpand(student.user_id)}
                                  >
                                    {expandedStudents.includes(student.user_id) ? (
                                      <ChevronDown className="h-4 w-4" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4" />
                                    )}
                                  </Button>
                                </td>
                                <td className="px-4 py-3 font-medium">
                                  <div className="flex items-center">
                                    <div className="w-8 h-8 rounded-full overflow-hidden mr-2">
                                      <img
                                        src={student.avatar || 'https://via.placeholder.com/40'}
                                        alt={student.username}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    {student.username}
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-gray-600">{student.email}</td>
                                <td className="px-4 py-3 text-gray-600">
                                  {new Date(student.enrolled_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-3">
                                  <div className="flex flex-col space-y-1">
                                    <div className="flex justify-between text-xs text-gray-500">
                                      <span>运行中: {student.containers_stats.running_containers}/{student.containers_stats.total_containers}</span>
                                      <span>{Math.round((student.containers_stats.running_containers / Math.max(student.containers_stats.total_containers, 1)) * 100)}%</span>
                                    </div>
                                    <Progress 
                                      value={(student.containers_stats.running_containers / Math.max(student.containers_stats.total_containers, 1)) * 100} 
                                      className="h-2"
                                    />
                                  </div>
                                </td>
                                <td className="px-4 py-3">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleOpenCreateContainerDialog(student.user_id)}
                                  >
                                    <Plus className="mr-1 h-4 w-4" />
                                    添加容器
                                  </Button>
                                </td>
                              </tr>
                              {expandedStudents.includes(student.user_id) && (
                                <tr className="bg-gray-50">
                                  <td colSpan={6} className="px-4 py-3">
                                    <div className="pl-8 pr-2 py-2">
                                      <h4 className="text-sm font-medium mb-2">容器列表</h4>
                                      {student.containers_stats.containers.length > 0 ? (
                                        <table className="w-full border-collapse">
                                          <thead>
                                            <tr className="bg-gray-100">
                                              <th className="px-3 py-2 text-left text-xs">容器ID</th>
                                              <th className="px-3 py-2 text-left text-xs">容器名称</th>
                                              <th className="px-3 py-2 text-left text-xs">镜像</th>
                                              <th className="px-3 py-2 text-left text-xs">状态</th>
                                              <th className="px-3 py-2 text-left text-xs">操作</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {student.containers_stats.containers.map((container: Container) => (
                                              <tr key={container.container_id} className="border-t border-gray-200">
                                                <td className="px-3 py-2 text-xs">{container.container_id.substring(0, 8)}</td>
                                                <td className="px-3 py-2 text-xs">{container.container_name}</td>
                                                <td className="px-3 py-2 text-xs">{container.image_name}</td>
                                                <td className="px-3 py-2 text-xs">
                                                  <span className={`px-2 py-1 rounded-full text-xs ${getContainerStatusStyle(container.status)}`}>
                                                    {container.status}
                                                  </span>
                                                </td>
                                                <td className="px-3 py-2">
                                                  <div className="flex items-center space-x-1">
                                                    {container.status !== 'running' && (
                                                      <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        title="启动"
                                                        onClick={() => handleStartContainer(container.container_id)}
                                                      >
                                                        <Play className="h-3 w-3" />
                                                      </Button>
                                                    )}
                                                    {container.status === 'running' && (
                                                      <Button
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-7 w-7"
                                                        title="停止"
                                                        onClick={() => handleStopContainer(container.container_id)}
                                                      >
                                                        <Square className="h-3 w-3" />
                                                      </Button>
                                                    )}
                                                    <Button
                                                      variant="outline"
                                                      size="icon"
                                                      className="h-7 w-7"
                                                      title="重启"
                                                      onClick={() => handleRestartContainer(container.container_id)}
                                                    >
                                                      <RefreshCw className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                      variant="outline"
                                                      size="icon"
                                                      className="h-7 w-7"
                                                      title="编辑"
                                                      onClick={() => handleOpenEditContainerDialog(
                                                        student.user_id,
                                                        container.container_id,
                                                        container.container_name,
                                                        container.image_id
                                                      )}
                                                    >
                                                      <MoreVertical className="h-3 w-3" />
                                                    </Button>
                                                    <Button
                                                      variant="outline"
                                                      size="icon"
                                                      className="h-7 w-7 text-red-500"
                                                      title="删除"
                                                      onClick={() => handleOpenDeleteContainerDialog(student.user_id, container.container_id)}
                                                    >
                                                      <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                  </div>
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      ) : (
                                        <p className="text-sm text-gray-500">该学生暂无容器</p>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </>
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
                          共 {totalStudents} 名学生，当前显示第 {currentPage} 页
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">暂无学生选修此课程</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 创建容器对话框 */}
      <Dialog open={createContainerDialogOpen} onOpenChange={setCreateContainerDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>创建容器</DialogTitle>
            <DialogDescription>
              为学生创建一个新的容器。请选择镜像并设置容器名称。
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="container-name">容器名称</Label>
              <Input
                id="container-name"
                value={containerName}
                onChange={(e) => setContainerName(e.target.value)}
                placeholder="请输入容器名称"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image-select">选择镜像</Label>
              {loadingImages ? (
                <p className="text-sm text-gray-500">加载镜像中...</p>
              ) : availableImages.length > 0 ? (
                <Select
                  value={selectedImageId?.toString() || ''}
                  onValueChange={(value) => setSelectedImageId(parseInt(value))}
                >
                  <SelectTrigger id="image-select">
                    <SelectValue placeholder="选择镜像" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableImages.map((image) => (
                      <SelectItem key={image.image_id} value={image.image_id.toString()}>
                        {image.image_name} ({image.version})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-500">暂无可用镜像</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateContainerDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleCreateContainer}
              disabled={!selectedImageId || !containerName.trim() || loadingImages}
            >
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 编辑容器对话框 */}
      <Dialog open={editContainerDialogOpen} onOpenChange={setEditContainerDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>编辑容器</DialogTitle>
            <DialogDescription>
              修改容器的名称或镜像。
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-container-name">容器名称</Label>
              <Input
                id="edit-container-name"
                value={containerName}
                onChange={(e) => setContainerName(e.target.value)}
                placeholder="请输入容器名称"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-image-select">选择镜像</Label>
              {loadingImages ? (
                <p className="text-sm text-gray-500">加载镜像中...</p>
              ) : availableImages.length > 0 ? (
                <Select
                  value={selectedImageId?.toString() || ''}
                  onValueChange={(value) => setSelectedImageId(parseInt(value))}
                >
                  <SelectTrigger id="edit-image-select">
                    <SelectValue placeholder="选择镜像" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableImages.map((image) => (
                      <SelectItem key={image.image_id} value={image.image_id.toString()}>
                        {image.image_name} ({image.version})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-gray-500">暂无可用镜像</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditContainerDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleUpdateContainer}
              disabled={!selectedImageId || !containerName.trim() || loadingImages}
            >
              更新
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除容器确认对话框 */}
      <Dialog open={deleteContainerDialogOpen} onOpenChange={setDeleteContainerDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              您确定要删除此容器吗？此操作不可撤销，容器中的所有数据将被永久删除。
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteContainerDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteContainer}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}