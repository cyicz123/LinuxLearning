import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { Checkbox } from '../components/ui/checkbox';
import { Label } from '../components/ui/label';
import { toast } from 'sonner';
import Pagination from '../components/Pagination';
import Navbar from '../components/Navbar';
import CourseSidebar from '../components/CourseSidebar';
import ScrollToTop from '../components/ScrollToTop';
import { FileIcon, FileTextIcon, VideoIcon, ArchiveIcon, Search, Plus, Trash2, MoreVertical, Download, Bell, Users } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { formatFileSize } from '../utils/formatters';
import { getCourseDetail, type CourseDetail } from '../services/courseService';
import { getCourseResources, getAvailableResourcesForCourse, addResourcesToCourse, removeResourceFromCourse, type Resource } from '../services/resourceService';

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

export default function TeacherCourseResourcesPage() {
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

  // 搜索状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [inputValue, setInputValue] = useState('');

  // 资源选择状态
  const [selectedResources, setSelectedResources] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // 添加资源对话框状态
  const [addResourceDialogOpen, setAddResourceDialogOpen] = useState(false);
  const [availableResources, setAvailableResources] = useState<Resource[]>([]);
  const [selectedResourcesToAdd, setSelectedResourcesToAdd] = useState<number[]>([]);
  const [loadingAvailableResources, setLoadingAvailableResources] = useState(false);

  // 删除确认对话框状态
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [resourceToRemove, setResourceToRemove] = useState<number | null>(null);
  const [isBatchRemove, setIsBatchRemove] = useState(false);

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
          // 重置选择状态
          setSelectedResources([]);
          setSelectAll(false);
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
  }, [courseId, currentPage, pageSize, searchKeyword]);

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

  // 处理资源选择
  const handleSelectResource = (resourceId: number) => {
    setSelectedResources(prev => {
      if (prev.includes(resourceId)) {
        return prev.filter(id => id !== resourceId);
      } else {
        return [...prev, resourceId];
      }
    });
  };

  // 处理全选
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedResources([]);
    } else {
      setSelectedResources(resources.map(r => r.resource_id));
    }
    setSelectAll(!selectAll);
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

  // 打开添加资源对话框
  const handleOpenAddResourceDialog = async () => {
    if (!courseId) return;

    setSelectedResourcesToAdd([]);
    setAddResourceDialogOpen(true);

    try {
      setLoadingAvailableResources(true);
      const data = await getAvailableResourcesForCourse(parseInt(courseId), 1, 100);
      if (data) {
        setAvailableResources(data.resources);
      } else {
        toast.error('获取可用资源列表失败');
      }
    } catch (error) {
      console.error('获取可用资源列表时发生错误:', error);
      toast.error('获取可用资源列表失败');
    } finally {
      setLoadingAvailableResources(false);
    }
  };

  // 处理资源选择变化（添加对话框中）
  const handleResourceSelectionChange = (resourceId: number) => {
    setSelectedResourcesToAdd(prev => {
      if (prev.includes(resourceId)) {
        return prev.filter(id => id !== resourceId);
      } else {
        return [...prev, resourceId];
      }
    });
  };

  // 处理添加资源到课程
  const handleAddResourcesToClass = async () => {
    if (!courseId || selectedResourcesToAdd.length === 0) {
      toast.error('请选择至少一个资源');
      return;
    }

    try {
      const success = await addResourcesToCourse(parseInt(courseId), selectedResourcesToAdd);

      if (success) {
        toast.success('资源添加成功');
        setAddResourceDialogOpen(false);

        // 刷新资源列表
        const data = await getCourseResources(parseInt(courseId), currentPage, pageSize);
        if (data) {
          setResources(data.resources);
          setTotalResources(data.total);
          setTotalPages(Math.ceil(data.total / pageSize));
        }
      } else {
        toast.error('资源添加失败');
      }
    } catch (error) {
      console.error('添加资源到课程时发生错误:', error);
      toast.error('添加资源到课程失败');
    }
  };

  // 打开批量移除对话框
  const handleOpenBatchRemoveDialog = () => {
    if (selectedResources.length === 0) {
      toast.error('请先选择要移除的资源');
      return;
    }
    setIsBatchRemove(true);
    setRemoveDialogOpen(true);
  };

  // 打开移除资源确认对话框
  const handleOpenRemoveDialog = (resourceId: number) => {
    setResourceToRemove(resourceId);
    setIsBatchRemove(false);
    setRemoveDialogOpen(true);
  };

  // 处理批量从课程移除资源
  const handleBatchRemoveResourcesFromClass = async () => {
    if (!courseId || selectedResources.length === 0) return;

    try {
      const promises = selectedResources.map(resourceId =>
        removeResourceFromCourse(parseInt(courseId), resourceId)
      );

      const results = await Promise.all(promises);

      if (results.every(result => result)) {
        toast.success(`成功移除 ${selectedResources.length} 个资源`);

        // 从列表中移除已删除的资源
        setResources(prev => prev.filter(resource => !selectedResources.includes(resource.resource_id)));

        // 重置选择状态
        setSelectedResources([]);
        setSelectAll(false);

        // 如果当前页没有资源了，且不是第一页，则返回上一页
        if (resources.length === selectedResources.length && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }

        setRemoveDialogOpen(false);
        setIsBatchRemove(false);
      } else {
        toast.error('部分资源移除失败');
      }
    } catch (error) {
      console.error('批量移除资源时发生错误:', error);
      toast.error('批量移除资源失败');
    }
  };

  // 处理从课程移除资源
  const handleRemoveResourceFromClass = async () => {
    if (isBatchRemove) {
      await handleBatchRemoveResourcesFromClass();
      return;
    }

    if (!courseId || !resourceToRemove) return;

    try {
      const success = await removeResourceFromCourse(parseInt(courseId), resourceToRemove);

      if (success) {
        toast.success('资源已从课程中移除');

        // 从列表中移除已删除的资源
        setResources(prev => prev.filter(resource => resource.resource_id !== resourceToRemove));

        // 从选中列表中移除
        setSelectedResources(prev => prev.filter(id => id !== resourceToRemove));

        // 如果当前页没有资源了，且不是第一页，则返回上一页
        if (resources.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }

        setRemoveDialogOpen(false);
      } else {
        toast.error('移除资源失败');
      }
    } catch (error) {
      console.error('从课程移除资源时发生错误:', error);
      toast.error('从课程移除资源失败');
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
                <CardTitle>课程资源</CardTitle>
                <Button onClick={handleOpenAddResourceDialog}>
                  <Plus className="mr-2 h-4 w-4" />
                  添加资源
                </Button>
              </CardHeader>

              <CardContent>
                {/* 搜索和操作 */}
                <div className="flex flex-col md:flex-row justify-between mb-6 space-y-2 md:space-y-0 md:items-center">
                  <form onSubmit={handleSearch} className="flex flex-1 mr-4">
                    <Input
                      type="text"
                      placeholder="搜索资源名称..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="mr-2"
                    />
                    <Button type="submit" variant="outline">
                      <Search className="h-4 w-4" />
                    </Button>
                  </form>

                  {selectedResources.length > 0 && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleOpenBatchRemoveDialog}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> 批量移除
                    </Button>
                  )}
                </div>

                {/* 资源列表 */}
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
                            <th className="w-6 px-4 py-2">
                              <Checkbox
                                checked={selectAll}
                                onCheckedChange={handleSelectAll}
                                aria-label="选择所有资源"
                              />
                            </th>
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
                                <Checkbox
                                  checked={selectedResources.includes(resource.resource_id)}
                                  onCheckedChange={() => handleSelectResource(resource.resource_id)}
                                  aria-label={`选择资源 ${resource.resource_name}`}
                                />
                              </td>
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
                                <div className="flex items-center space-x-2">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <Button variant="ghost" size="sm">
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                      <DropdownMenuItem onClick={() => handleOpenRemoveDialog(resource.resource_id)}>
                                        <Trash2 className="mr-2 h-4 w-4 text-red-500" />
                                        从课程移除
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>

                                  {resource.download_url && (
                                    <a
                                      href={resource.download_url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      <Button variant="outline" size="sm">
                                        <Download className="mr-2 h-4 w-4" />
                                        下载
                                      </Button>
                                    </a>
                                  )}
                                </div>
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
                    <Button
                      onClick={handleOpenAddResourceDialog}
                      className="mt-4"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      添加第一个资源
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 添加资源对话框 */}
      <Dialog open={addResourceDialogOpen} onOpenChange={setAddResourceDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>添加资源到课程</DialogTitle>
            <DialogDescription>
              选择要添加到课程的资源。学生只能在选课后查看和下载这些资源。
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {loadingAvailableResources ? (
              <div className="text-center py-4">
                <p className="text-gray-500">加载资源中...</p>
              </div>
            ) : availableResources.length > 0 ? (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {availableResources.map((resource) => (
                  <div key={resource.resource_id} className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                    <Checkbox
                      id={`resource-${resource.resource_id}`}
                      checked={selectedResourcesToAdd.includes(resource.resource_id)}
                      onCheckedChange={() => handleResourceSelectionChange(resource.resource_id)}
                    />
                    <div className="flex items-center space-x-2">
                      {getResourceIcon(resource.resource_type)}
                      <Label
                        htmlFor={`resource-${resource.resource_id}`}
                        className="cursor-pointer"
                      >
                        {resource.resource_name}
                      </Label>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">暂无可添加的资源</p>
                <Button
                  onClick={() => {
                    setAddResourceDialogOpen(false);
                    navigate('/teacher/resources');
                  }}
                  className="mt-2"
                  variant="outline"
                  size="sm"
                >
                  上传新资源
                </Button>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddResourceDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleAddResourcesToClass}
              disabled={selectedResourcesToAdd.length === 0}
            >
              添加到课程
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 移除资源确认对话框 */}
      <Dialog open={removeDialogOpen} onOpenChange={setRemoveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>确认移除</DialogTitle>
            <DialogDescription>
              {isBatchRemove
                ? `您确定要从课程中移除选中的 ${selectedResources.length} 个资源吗？学生将无法再访问这些资源，但资源本身不会被删除。`
                : '您确定要从课程中移除此资源吗？学生将无法再访问此资源，但资源本身不会被删除。'
              }
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRemoveDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleRemoveResourceFromClass}
            >
              确认移除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 