import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { getCourseDetail, type CourseDetail } from '../services/courseService';
import { getCourseImages, createImage, type Image } from '../services/imageService';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import CourseSidebar from '../components/CourseSidebar';
import ScrollToTop from '../components/ScrollToTop';

export default function CourseImagesPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [images, setImages] = useState<Image[]>([]);
  const [courseDetail, setCourseDetail] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [courseLoading, setCourseLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState('images');
  const [isCreating, setIsCreating] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newImage, setNewImage] = useState<{
    image_name: string;
    image_description: string;
    version: string;
    os_type: 'ubuntu' | 'centos' | 'debian' | 'other';
    packages: string[];
  }>({
    image_name: '',
    image_description: '',
    version: '',
    os_type: 'ubuntu',
    packages: []
  });
  const [packageInput, setPackageInput] = useState('');
  const [isCreatingImage, setIsCreatingImage] = useState(false);

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

  // 获取镜像列表
  useEffect(() => {
    const fetchImages = async () => {
      if (!courseId) return;

      try {
        setLoading(true);
        const data = await getCourseImages(parseInt(courseId));
        setImages(data);
      } catch (err) {
        setError('获取镜像列表失败');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [courseId]);

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
    if (!courseId) return;

    try {
      setIsCreatingImage(true);
      const success = await createImage(parseInt(courseId), newImage);
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
        // 刷新镜像列表
        const data = await getCourseImages(parseInt(courseId));
        setImages(data);
      } else {
        setError('创建镜像失败');
      }
    } catch (err) {
      setError('创建镜像时发生错误');
      console.error(err);
    } finally {
      setIsCreatingImage(false);
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
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>课程镜像</CardTitle>
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
                        <Label htmlFor="image_name">镜像名称</Label>
                        <Input
                          id="image_name"
                          value={newImage.image_name}
                          onChange={(e) => setNewImage(prev => ({ ...prev, image_name: e.target.value }))}
                          placeholder="输入镜像名称"
                        />
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
                        <Label htmlFor="version">系统版本</Label>
                        <Input
                          id="version"
                          value={newImage.version}
                          onChange={(e) => setNewImage(prev => ({ ...prev, version: e.target.value }))}
                          placeholder="输入系统版本"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="os_type">系统类型</Label>
                        <Select
                          value={newImage.os_type}
                          onValueChange={(value: 'ubuntu' | 'centos' | 'debian' | 'other') =>
                            setNewImage(prev => ({ ...prev, os_type: value }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择系统类型" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ubuntu">Ubuntu</SelectItem>
                            <SelectItem value="centos">CentOS</SelectItem>
                            <SelectItem value="debian">Debian</SelectItem>
                            <SelectItem value="other">其他</SelectItem>
                          </SelectContent>
                        </Select>
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
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        取消
                      </Button>
                      <Button onClick={handleCreateImage} disabled={isCreatingImage}>
                        {isCreatingImage ? (
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
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <p className="text-lg text-gray-500">加载镜像中...</p>
                  </div>
                ) : images.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-4 py-2 text-left">镜像名称</th>
                          <th className="px-4 py-2 text-left">描述</th>
                          <th className="px-4 py-2 text-left">系统类型</th>
                          <th className="px-4 py-2 text-left">版本</th>
                          <th className="px-4 py-2 text-left">软件包数量</th>
                        </tr>
                      </thead>
                      <tbody>
                        {images.map((image) => (
                          <tr key={image.image_id} className="border-t hover:bg-gray-50">
                            <td className="px-4 py-3 font-medium">{image.image_name}</td>
                            <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                              {image.image_description || '无描述'}
                            </td>
                            <td className="px-4 py-3 text-gray-600 capitalize">{image.os_type}</td>
                            <td className="px-4 py-3 text-gray-600">{image.version}</td>
                            <td className="px-4 py-3 text-gray-600">
                              {image.packages?.length || 0}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">暂无镜像</p>
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