import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { Loader2, Eye, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import Navbar from '../components/Navbar';
import { useAuth } from '../contexts/AuthContext';
import { getTeacherImages, createImage, batchSetImageVisibility, type Image, updateImage, deleteImage } from '../services/imageService';
import { getTeacherCourses, type Course } from '../services/courseService';

// 系统类型和对应的版本选项
const OS_VERSIONS = {
  ubuntu: ['18.04', '20.04', '22.04'],
  centos: ['7', '8', '9'],
  debian: ['10', '11', '12']
} as const;

type OsType = keyof typeof OS_VERSIONS;

export default function TeacherImagesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [images, setImages] = useState<Image[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedImages, setSelectedImages] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [newImage, setNewImage] = useState<{
    image_name: string;
    image_description: string;
    version: string;
    os_type: OsType;
    packages: string[];
  }>({
    image_name: '',
    image_description: '',
    version: '',
    os_type: 'ubuntu',
    packages: []
  });
  const [packageInput, setPackageInput] = useState('');
  const [formErrors, setFormErrors] = useState<{
    image_name?: string;
    version?: string;
  }>({});

  // 批量设置可见性对话框状态
  const [batchVisibilityDialogOpen, setBatchVisibilityDialogOpen] = useState(false);
  const [visibilityAction, setVisibilityAction] = useState<'add' | 'remove'>('add');
  const [processingBatchVisibility, setProcessingBatchVisibility] = useState(false);
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);

  const [editingImage, setEditingImage] = useState<Image | null>(null);

  // 获取教师的课程列表
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await getTeacherCourses({});
        setCourses(data.courses);
      } catch (err) {
        setError('获取课程列表失败');
        console.error(err);
      }
    };

    fetchCourses();
  }, []);

  // 获取教师的镜像列表
  const fetchImages = async () => {
    try {
      setLoading(true);
      const data = await getTeacherImages({});
      setImages(data.images);
    } catch (err) {
      setError('获取镜像列表失败');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 在 useEffect 中使用 fetchImages
  useEffect(() => {
    fetchImages();
  }, []);

  // 处理添加软件包
  const handleAddPackage = () => {
    if (packageInput.trim()) {
      setNewImage(prev => ({
        ...prev,
        packages: [...prev.packages, packageInput.trim()]
      }));
      setPackageInput('');
    }
  };

  // 处理删除软件包
  const handleRemovePackage = (index: number) => {
    setNewImage(prev => ({
      ...prev,
      packages: prev.packages.filter((_, i) => i !== index)
    }));
  };

  // 处理创建镜像
  const handleCreateImage = async () => {
    // 表单验证
    const errors: { image_name?: string; version?: string } = {};
    if (!newImage.image_name.trim()) {
      errors.image_name = '镜像名称为必填项';
    }
    if (!newImage.version) {
      errors.version = '系统版本为必填项';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    try {
      setIsCreating(true);
      const success = await createImage(newImage);
      if (success) {
        setIsDialogOpen(false);
        // 重置表单
        setNewImage({
          image_name: '',
          image_description: '',
          version: '',
          os_type: 'ubuntu',
          packages: []
        });
        setFormErrors({});
        // 刷新镜像列表
        const data = await getTeacherImages({});
        setImages(data.images);
        toast.success('镜像创建成功');
      } else {
        setError('创建镜像失败');
      }
    } catch (err) {
      setError('创建镜像时发生错误');
      console.error(err);
    } finally {
      setIsCreating(false);
    }
  };

  // 处理系统类型变化
  const handleOsTypeChange = (osType: OsType) => {
    setNewImage(prev => ({
      ...prev,
      os_type: osType,
      version: '' // 重置版本
    }));
    setFormErrors(prev => ({ ...prev, version: undefined }));
  };

  // 检查用户是否为教师
  useEffect(() => {
    if (user?.role !== 'teacher') {
      navigate('/login');
    }
  }, [user, navigate]);

  // 处理镜像选择
  const handleSelectImage = (imageId: number) => {
    setSelectedImages(prev => {
      if (prev.includes(imageId)) {
        return prev.filter(id => id !== imageId);
      } else {
        return [...prev, imageId];
      }
    });
  };

  // 处理全选
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedImages([]);
    } else {
      setSelectedImages(images.map(i => i.image_id));
    }
    setSelectAll(!selectAll);
  };

  // 打开批量设置可见性对话框
  const handleOpenBatchVisibilityDialog = (action: 'add' | 'remove') => {
    if (selectedImages.length === 0) {
      toast.error('请先选择要设置的镜像');
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
      const coursesData = await getTeacherCourses({});
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

  // 处理批量设置镜像可见性
  const handleBatchSetVisibility = async () => {
    if (selectedImages.length === 0 || selectedCourses.length === 0) {
      toast.error('请选择镜像和课程');
      return;
    }

    try {
      setProcessingBatchVisibility(true);

      const result = await batchSetImageVisibility(
        selectedImages,
        selectedCourses,
        visibilityAction
      );

      if (result) {
        const actionText = visibilityAction === 'add' ? '添加到' : '从';
        toast.success(`已成功${actionText}${result.success_count}个课程设置镜像可见性`);

        if (result.failed_count > 0) {
          toast.warning(`有${result.failed_count}个操作失败`);
        }

        setBatchVisibilityDialogOpen(false);
        setSelectedCourses([]);
        setSelectedImages([]);
        setSelectAll(false);
      } else {
        toast.error('设置镜像可见性失败');
      }
    } catch (error) {
      console.error('设置镜像可见性时发生错误:', error);
      toast.error('设置镜像可见性失败');
    } finally {
      setProcessingBatchVisibility(false);
    }
  };

  // 添加编辑镜像的处理函数
  const handleEditImage = async () => {
    if (!editingImage) return;

    try {
      // 确保 os_type 不是 'other'
      if (editingImage.os_type === 'other') {
        toast.error('不支持的系统类型');
        return;
      }

      // 确保 packages 不是 undefined
      const packages = editingImage.packages || [];

      await updateImage(editingImage.image_id, {
        image_name: editingImage.image_name,
        image_description: editingImage.image_description,
        version: editingImage.version,
        os_type: editingImage.os_type,
        packages: packages
      });
      toast.success('镜像更新成功');
      setEditingImage(null);
      fetchImages();
    } catch (error) {
      console.error('更新镜像失败:', error);
      toast.error('更新镜像失败');
    }
  };

  // 修改删除镜像的处理函数
  const handleDeleteImage = async (imageId: number) => {
    try {
      const result = await batchSetImageVisibility([imageId], [], 'remove');
      if (result) {
        toast.success('镜像删除成功');
        fetchImages();
      } else {
        toast.error('删除镜像失败');
      }
    } catch (error) {
      console.error('删除镜像失败:', error);
      toast.error('删除镜像失败');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto py-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>镜像管理</CardTitle>
            <div className="flex items-center gap-4">
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button>创建新镜像</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>创建新镜像</DialogTitle>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="image_name">镜像名称 <span className="text-red-500">*</span></Label>
                      <Input
                        id="image_name"
                        value={newImage.image_name}
                        onChange={(e) => {
                          setNewImage(prev => ({ ...prev, image_name: e.target.value }));
                          setFormErrors(prev => ({ ...prev, image_name: undefined }));
                        }}
                        placeholder="输入镜像名称"
                        className={formErrors.image_name ? 'border-red-500' : ''}
                      />
                      {formErrors.image_name && (
                        <p className="text-sm text-red-500">{formErrors.image_name}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="image_description">镜像描述</Label>
                      <Textarea
                        id="image_description"
                        value={newImage.image_description}
                        onChange={(e) => setNewImage(prev => ({ ...prev, image_description: e.target.value }))}
                        placeholder="输入镜像描述"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="os_type">系统类型</Label>
                      <Select
                        value={newImage.os_type}
                        onValueChange={handleOsTypeChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="选择系统类型" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ubuntu">Ubuntu</SelectItem>
                          <SelectItem value="centos">CentOS</SelectItem>
                          <SelectItem value="debian">Debian</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="version">系统版本 <span className="text-red-500">*</span></Label>
                      <Select
                        value={newImage.version}
                        onValueChange={(value) => {
                          setNewImage(prev => ({ ...prev, version: value }));
                          setFormErrors(prev => ({ ...prev, version: undefined }));
                        }}
                      >
                        <SelectTrigger className={formErrors.version ? 'border-red-500' : ''}>
                          <SelectValue placeholder="选择系统版本" />
                        </SelectTrigger>
                        <SelectContent>
                          {OS_VERSIONS[newImage.os_type].map((version) => (
                            <SelectItem key={version} value={version}>
                              {version}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {formErrors.version && (
                        <p className="text-sm text-red-500">{formErrors.version}</p>
                      )}
                    </div>
                    <div className="grid gap-2">
                      <Label>需要安装的软件</Label>
                      <div className="flex gap-2">
                        <Input
                          value={packageInput}
                          onChange={(e) => setPackageInput(e.target.value)}
                          placeholder="输入软件名称"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddPackage();
                            }
                          }}
                        />
                        <Button onClick={handleAddPackage}>添加</Button>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {newImage.packages.map((pkg, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded"
                          >
                            <span>{pkg}</span>
                            <button
                              onClick={() => handleRemovePackage(index)}
                              className="text-gray-500 hover:text-gray-700"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => {
                      setIsDialogOpen(false);
                      setFormErrors({});
                    }}>
                      取消
                    </Button>
                    <Button onClick={handleCreateImage} disabled={isCreating}>
                      {isCreating ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          创建中...
                        </>
                      ) : (
                        '创建'
                      )}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center py-8">
                <p className="text-red-500">{error}</p>
              </div>
            ) : loading ? (
              <div className="flex justify-center items-center h-64">
                <p className="text-lg text-gray-500">加载镜像中...</p>
              </div>
            ) : images.length > 0 ? (
              <>
                {/* 批量操作按钮 */}
                {selectedImages.length > 0 && (
                  <div className="flex space-x-2 mb-4">
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
                  </div>
                )}
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="w-6 px-4 py-2">
                          <Checkbox
                            checked={selectAll}
                            onCheckedChange={handleSelectAll}
                            aria-label="选择所有镜像"
                          />
                        </th>
                        <th className="px-4 py-2 text-left">镜像名称</th>
                        <th className="px-4 py-2 text-left">描述</th>
                        <th className="px-4 py-2 text-left">系统类型</th>
                        <th className="px-4 py-2 text-left">版本</th>
                        <th className="px-4 py-2 text-left">软件包数量</th>
                        <th className="px-4 py-2 text-left">操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {images.map((image) => (
                        <tr key={image.image_id} className="border-t hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <Checkbox
                              checked={selectedImages.includes(image.image_id)}
                              onCheckedChange={() => handleSelectImage(image.image_id)}
                              aria-label={`选择镜像 ${image.image_name}`}
                            />
                          </td>
                          <td className="px-4 py-3 font-medium">{image.image_name}</td>
                          <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                            {image.image_description || '无描述'}
                          </td>
                          <td className="px-4 py-3 text-gray-600 capitalize">{image.os_type}</td>
                          <td className="px-4 py-3 text-gray-600">{image.version}</td>
                          <td className="px-4 py-3 text-gray-600">
                            {image.packages?.length || 0}
                          </td>
                          <td className="px-4 py-3 text-gray-600">
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setEditingImage(image)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteImage(image.image_id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">暂无镜像</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 批量设置可见性对话框 */}
      <Dialog open={batchVisibilityDialogOpen} onOpenChange={setBatchVisibilityDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>批量设置镜像可见性</DialogTitle>
            <DialogDescription>
              {visibilityAction === 'add'
                ? `选择要将选中的 ${selectedImages.length} 个镜像添加到的课程。`
                : `选择要将选中的 ${selectedImages.length} 个镜像从哪些课程中移除。`}
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

      {/* 编辑镜像对话框 */}
      <Dialog open={!!editingImage} onOpenChange={() => setEditingImage(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>编辑镜像</DialogTitle>
            <DialogDescription>
              修改镜像信息。修改后需要重新创建容器才能生效。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-image-name">镜像名称</Label>
              <Input
                id="edit-image-name"
                value={editingImage?.image_name || ''}
                onChange={(e) => setEditingImage(prev => prev ? {
                  ...prev,
                  image_name: e.target.value
                } : null)}
                placeholder="输入镜像名称"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-image-description">镜像描述</Label>
              <Textarea
                id="edit-image-description"
                value={editingImage?.image_description || ''}
                onChange={(e) => setEditingImage(prev => prev ? {
                  ...prev,
                  image_description: e.target.value
                } : null)}
                placeholder="输入镜像描述"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-image-version">系统版本</Label>
              <Select
                value={editingImage?.version || ''}
                onValueChange={(value) => setEditingImage(prev => prev ? {
                  ...prev,
                  version: value
                } : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择系统版本" />
                </SelectTrigger>
                <SelectContent>
                  {editingImage?.os_type && editingImage.os_type !== 'other' && OS_VERSIONS[editingImage.os_type].map((version: string) => (
                    <SelectItem key={version} value={version}>
                      {version}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-image-packages">预装软件包</Label>
              <Input
                id="edit-image-packages"
                value={editingImage?.packages?.join(', ') || ''}
                onChange={(e) => setEditingImage(prev => prev ? {
                  ...prev,
                  packages: e.target.value.split(',').map(pkg => pkg.trim()).filter(Boolean)
                } : null)}
                placeholder="输入软件包名称，用逗号分隔"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingImage(null)}>
              取消
            </Button>
            <Button onClick={handleEditImage}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 