import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import Pagination from '../components/Pagination';
import Navbar from '../components/Navbar';
import { FileIcon, FileTextIcon, VideoIcon, ArchiveIcon, Search, Plus, Edit, Trash2, MoreVertical, Upload, X, Eye } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { formatFileSize } from '../utils/formatters';
import { getResources, uploadResource, deleteResource, batchSetResourceVisibility, type Resource } from '../services/resourceService';
import { getCourses } from '../services/courseService';
import { addResourcesToCourse } from '../services/resourceService';

export default function TeacherResourcesPage() {
  const navigate = useNavigate();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResources, setTotalResources] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // 搜索和筛选状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [resourceType, setResourceType] = useState<string>('all');

  // 资源选择状态
  const [selectedResources, setSelectedResources] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // 上传资源对话框状态
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [resourceName, setResourceName] = useState('');
  const [resourceDescription, setResourceDescription] = useState('');
  const [selectedResourceType, setSelectedResourceType] = useState<string>('document');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 课程分配对话框状态
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [selectedResourceId, setSelectedResourceId] = useState<number | null>(null);
  const [courses, setCourses] = useState<{ course_id: number; course_name: string }[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  // 批量设置可见性对话框状态
  const [batchVisibilityDialogOpen, setBatchVisibilityDialogOpen] = useState(false);
  const [visibilityAction, setVisibilityAction] = useState<'add' | 'remove'>('add');
  const [processingBatchVisibility, setProcessingBatchVisibility] = useState(false);

  // 删除确认对话框状态
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<number | null>(null);
  const [isBatchDelete, setIsBatchDelete] = useState(false);

  // 获取资源列表
  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const data = await getResources(currentPage, pageSize, undefined, resourceType === "all" ? undefined : resourceType);
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
  }, [currentPage, pageSize, resourceType, searchKeyword]);

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

  // 处理资源类型筛选变化
  const handleResourceTypeChange = (value: string) => {
    setResourceType(value);
    setCurrentPage(1); // 重置到第一页
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

  // 打开批量删除对话框
  const handleOpenBatchDeleteDialog = () => {
    if (selectedResources.length === 0) {
      toast.error('请先选择要删除的资源');
      return;
    }
    setIsBatchDelete(true);
    setDeleteDialogOpen(true);
  };

  // 处理批量删除资源
  const handleBatchDeleteResources = async () => {
    try {
      const promises = selectedResources.map(resourceId => deleteResource(resourceId));
      const results = await Promise.all(promises);

      if (results.every(result => result)) {
        toast.success(`成功删除 ${selectedResources.length} 个资源`);

        // 从列表中移除已删除的资源
        setResources(prev => prev.filter(resource => !selectedResources.includes(resource.resource_id)));

        // 重置选择状态
        setSelectedResources([]);
        setSelectAll(false);

        // 如果当前页没有资源了，且不是第一页，则返回上一页
        if (resources.length === selectedResources.length && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }

        setDeleteDialogOpen(false);
        setIsBatchDelete(false);
      } else {
        toast.error('部分资源删除失败');
      }
    } catch (error) {
      console.error('批量删除资源时发生错误:', error);
      toast.error('批量删除资源失败');
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

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // 处理资源上传
  const handleUploadResource = async () => {
    if (!selectedFile) {
      toast.error('请选择要上传的文件');
      return;
    }

    if (!resourceName) {
      toast.error('请输入资源名称');
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append('resource_name', resourceName);
      formData.append('resource_description', resourceDescription);
      formData.append('resource_type', selectedResourceType);
      formData.append('file', selectedFile);

      const result = await uploadResource(formData);

      if (result) {
        toast.success('资源上传成功');
        setUploadDialogOpen(false);

        // 重置表单
        setResourceName('');
        setResourceDescription('');
        setSelectedResourceType('document');
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // 刷新资源列表
        const data = await getResources(currentPage, pageSize, undefined, resourceType === "all" ? undefined : resourceType);
        if (data) {
          setResources(data.resources);
          setTotalResources(data.total);
          setTotalPages(Math.ceil(data.total / pageSize));
        }
      } else {
        toast.error('资源上传失败');
      }
    } catch (error) {
      console.error('上传资源时发生错误:', error);
      toast.error('上传资源时发生错误');
    } finally {
      setUploading(false);
    }
  };

  // 打开批量设置可见性对话框
  const handleOpenBatchVisibilityDialog = (action: 'add' | 'remove') => {
    if (selectedResources.length === 0) {
      toast.error('请先选择要设置的资源');
      return;
    }

    setVisibilityAction(action);
    setBatchVisibilityDialogOpen(true);
    loadCourses();
  };

  // 加载课程列表
  const loadCourses = async () => {
    try {
      setLoadingCourses(true);
      const coursesData = await getCourses({
        page: 1,
        limit: 100
      });
      if (coursesData && coursesData.courses) {
        setCourses(coursesData.courses);
      }
    } catch (error) {
      console.error('获取课程列表时发生错误:', error);
      toast.error('获取课程列表失败');
    } finally {
      setLoadingCourses(false);
    }
  };

  // 打开课程分配对话框
  const handleOpenAssignDialog = async (resourceId: number) => {
    setSelectedResourceId(resourceId);
    setSelectedCourses([]);
    setAssignDialogOpen(true);

    await loadCourses();
  };

  // 处理课程选择变化
  const handleCourseSelectionChange = (courseId: number) => {
    setSelectedCourses(prev => {
      if (prev.includes(courseId)) {
        return prev.filter(id => id !== courseId);
      } else {
        return [...prev, courseId];
      }
    });
  };

  // 处理批量设置资源可见性
  const handleBatchSetVisibility = async () => {
    if (selectedResources.length === 0 || selectedCourses.length === 0) {
      toast.error('请选择资源和课程');
      return;
    }

    try {
      setProcessingBatchVisibility(true);

      const result = await batchSetResourceVisibility(
        selectedResources,
        selectedCourses,
        visibilityAction
      );

      if (result) {
        const actionText = visibilityAction === 'add' ? '添加到' : '从';
        toast.success(`已成功${actionText}${result.success_count}个课程设置资源可见性`);

        if (result.failed_count > 0) {
          toast.warning(`有${result.failed_count}个操作失败`);
        }

        setBatchVisibilityDialogOpen(false);
        setSelectedCourses([]);
      } else {
        toast.error('设置资源可见性失败');
      }
    } catch (error) {
      console.error('设置资源可见性时发生错误:', error);
      toast.error('设置资源可见性失败');
    } finally {
      setProcessingBatchVisibility(false);
    }
  };

  // 处理资源分配到课程
  const handleAssignToCourses = async () => {
    if (!selectedResourceId || selectedCourses.length === 0) {
      toast.error('请选择至少一个课程');
      return;
    }

    try {
      const result = await batchSetResourceVisibility(
        [selectedResourceId],
        selectedCourses,
        'add'
      );

      if (result) {
        toast.success('资源已成功分配到所选课程');
        if (result.failed_count > 0) {
          toast.warning(`有${result.failed_count}个操作失败`);
        }
        setAssignDialogOpen(false);
      } else {
        toast.error('分配资源到课程失败');
      }
    } catch (error) {
      console.error('分配资源到课程时发生错误:', error);
      toast.error('分配资源到课程失败');
    }
  };

  // 打开删除确认对话框
  const handleOpenDeleteDialog = (resourceId: number) => {
    setResourceToDelete(resourceId);
    setIsBatchDelete(false);
    setDeleteDialogOpen(true);
  };

  // 处理资源删除
  const handleDeleteResource = async () => {
    if (isBatchDelete) {
      await handleBatchDeleteResources();
      return;
    }

    if (!resourceToDelete) return;

    try {
      const success = await deleteResource(resourceToDelete);

      if (success) {
        toast.success('资源删除成功');

        // 从列表中移除已删除的资源
        setResources(prev => prev.filter(resource => resource.resource_id !== resourceToDelete));

        // 从选中列表中移除
        setSelectedResources(prev => prev.filter(id => id !== resourceToDelete));

        // 如果当前页没有资源了，且不是第一页，则返回上一页
        if (resources.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }

        setDeleteDialogOpen(false);
      } else {
        toast.error('资源删除失败');
      }
    } catch (error) {
      console.error('删除资源时发生错误:', error);
      toast.error('删除资源时发生错误');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-6 px-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl">资源管理</CardTitle>
            <div className="flex space-x-2">
              <Button onClick={() => setUploadDialogOpen(true)} className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                上传资源
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
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
                <div className="flex w-full md:w-auto space-x-2">
                  <Select value={resourceType} onValueChange={handleResourceTypeChange}>
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="资源类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">所有类型</SelectItem>
                      <SelectItem value="document">文档</SelectItem>
                      <SelectItem value="video">视频</SelectItem>
                      <SelectItem value="archive">压缩包</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* 批量操作按钮 */}
              {selectedResources.length > 0 && (
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenBatchVisibilityDialog('add')}
                    className="flex items-center"
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    批量添加可见性
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenBatchVisibilityDialog('remove')}
                    className="flex items-center"
                  >
                    <Eye className="mr-2 h-4 w-4 text-red-500" />
                    批量移除可见性
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleOpenBatchDeleteDialog}
                    className="flex items-center"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    批量删除
                  </Button>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-6 px-4 py-2">
                        <Checkbox
                          checked={selectAll}
                          onCheckedChange={handleSelectAll}
                          aria-label="选择所有资源"
                        />
                      </th>
                      <th className="px-4 py-2 text-left">资源名称</th>
                      <th className="px-4 py-2 text-left">类型</th>
                      <th className="px-4 py-2 text-left">大小</th>
                      <th className="px-4 py-2 text-left">上传时间</th>
                      <th className="px-4 py-2 text-left">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-3 text-center text-sm text-gray-500">
                          加载中...
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-3 text-center text-sm text-red-500">
                          {error}
                        </td>
                      </tr>
                    ) : resources.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-3 text-center text-sm text-gray-500">
                          暂无资源
                        </td>
                      </tr>
                    ) : (
                      resources.map((resource) => (
                        <tr key={resource.resource_id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <Checkbox
                              checked={selectedResources.includes(resource.resource_id)}
                              onCheckedChange={() => handleSelectResource(resource.resource_id)}
                              aria-label={`选择资源 ${resource.resource_name}`}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              {getResourceIcon(resource.resource_type)}
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {resource.resource_name}
                                </div>
                                {resource.resource_description && (
                                  <div className="text-sm text-gray-500 max-w-xs truncate">
                                    {resource.resource_description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {resource.resource_type === 'document' ? '文档' :
                              resource.resource_type === 'video' ? '视频' :
                                resource.resource_type === 'archive' ? '压缩包' : '其他'}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {formatFileSize(resource.size)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">
                            {new Date(resource.created_at).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-medium">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleOpenAssignDialog(resource.resource_id)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  设置可见性
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleOpenDeleteDialog(resource.resource_id)}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  删除
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {!loading && !error && resources.length > 0 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    共 {totalResources} 个资源
                  </div>
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 上传资源对话框 */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>上传资源</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="resource-name" className="text-right">
                资源名称
              </Label>
              <Input
                id="resource-name"
                value={resourceName}
                onChange={(e) => setResourceName(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="resource-description" className="text-right">
                资源描述
              </Label>
              <Textarea
                id="resource-description"
                value={resourceDescription}
                onChange={(e) => setResourceDescription(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="resource-type" className="text-right">
                资源类型
              </Label>
              <Select value={selectedResourceType} onValueChange={setSelectedResourceType}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="选择资源类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">文档</SelectItem>
                  <SelectItem value="video">视频</SelectItem>
                  <SelectItem value="archive">压缩包</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="resource-file" className="text-right">
                选择文件
              </Label>
              <div className="col-span-3">
                <Input
                  id="resource-file"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    选择文件
                  </Button>
                  {selectedFile && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="truncate max-w-[200px]">{selectedFile.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedFile(null);
                          if (fileInputRef.current) {
                            fileInputRef.current.value = '';
                          }
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setUploadDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              type="button"
              onClick={handleUploadResource}
              disabled={uploading}
            >
              {uploading ? '上传中...' : '上传'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 课程分配对话框 */}
      <Dialog open={assignDialogOpen} onOpenChange={setAssignDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>设置资源可见性</DialogTitle>
            <DialogDescription>
              选择要将此资源分配到的课程。学生只能在选课后查看和下载资源。
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {loadingCourses ? (
              <div className="text-center py-4">
                <p className="text-gray-500">加载课程中...</p>
              </div>
            ) : courses.length > 0 ? (
              <div className="border rounded-md max-h-60 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                        <Checkbox
                          checked={selectedCourses.length === courses.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCourses(courses.map(course => course.course_id));
                            } else {
                              setSelectedCourses([]);
                            }
                          }}
                          aria-label="选择所有课程"
                        />
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        课程名称
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {courses.map((course) => (
                      <tr key={course.course_id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap">
                          <Checkbox
                            id={`course-${course.course_id}`}
                            checked={selectedCourses.includes(course.course_id)}
                            onCheckedChange={() => handleCourseSelectionChange(course.course_id)}
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <Label
                            htmlFor={`course-${course.course_id}`}
                            className="cursor-pointer text-sm font-medium text-gray-900"
                          >
                            {course.course_name}
                          </Label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">暂无课程</p>
                <Button
                  onClick={() => navigate('/teacher/create-course')}
                  className="mt-2"
                  variant="outline"
                  size="sm"
                >
                  创建课程
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
            <div>已选择 {selectedCourses.length} 个课程</div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAssignDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleAssignToCourses}
              disabled={selectedCourses.length === 0}
            >
              确认分配
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>确认删除</DialogTitle>
            <DialogDescription>
              {isBatchDelete
                ? `确定要删除选中的 ${selectedResources.length} 个资源吗？此操作不可撤销。`
                : '确定要删除此资源吗？此操作不可撤销。'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteResource}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量设置可见性对话框 */}
      <Dialog open={batchVisibilityDialogOpen} onOpenChange={setBatchVisibilityDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>批量设置资源可见性</DialogTitle>
            <DialogDescription>
              {visibilityAction === 'add'
                ? `选择要将选中的 ${selectedResources.length} 个资源添加到的课程。`
                : `选择要将选中的 ${selectedResources.length} 个资源从哪些课程中移除。`}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {loadingCourses ? (
              <div className="text-center py-4">
                <p className="text-gray-500">加载课程中...</p>
              </div>
            ) : courses.length > 0 ? (
              <div className="border rounded-md max-h-60 overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                        <Checkbox
                          checked={selectedCourses.length === courses.length}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedCourses(courses.map(course => course.course_id));
                            } else {
                              setSelectedCourses([]);
                            }
                          }}
                          aria-label="选择所有课程"
                        />
                      </th>
                      <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        课程名称
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {courses.map((course) => (
                      <tr key={course.course_id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 whitespace-nowrap">
                          <Checkbox
                            id={`course-${course.course_id}`}
                            checked={selectedCourses.includes(course.course_id)}
                            onCheckedChange={() => handleCourseSelectionChange(course.course_id)}
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <Label
                            htmlFor={`course-${course.course_id}`}
                            className="cursor-pointer text-sm font-medium text-gray-900"
                          >
                            {course.course_name}
                          </Label>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-gray-500">暂无课程</p>
                <Button
                  onClick={() => navigate('/teacher/create-course')}
                  className="mt-2"
                  variant="outline"
                  size="sm"
                >
                  创建课程
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
            <div>已选择 {selectedCourses.length} 个课程</div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBatchVisibilityDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              onClick={handleBatchSetVisibility}
              disabled={selectedCourses.length === 0 || processingBatchVisibility}
            >
              {processingBatchVisibility ? '处理中...' : '确认设置'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 