import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { toast } from 'sonner';
import { Play, Square, RefreshCw, Trash2, Copy, Plus, X } from 'lucide-react';

import { type Container, getContainers, startContainer, stopContainer, restartContainer, deleteContainer, createContainer } from '../services/containerService';
import { type Image, getCourseImages } from '../services/imageService';
import { Button } from '../components/ui/button';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import { Badge } from '../components/ui/badge';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../components/ui/alert-dialog';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '../components/ui/dialog';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../components/ui/form';

import { Input } from '../components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import Navbar from '../components/Navbar';
import CourseSidebar from '../components/CourseSidebar';
import ScrollToTop from '../components/ScrollToTop';
import { useNavigate } from 'react-router';

// 容器名称验证schema
const containerNameSchema = z.object({
  containerName: z.string()
    .min(3, { message: '容器名称至少需要3个字符' })
    .max(30, { message: '容器名称不能超过30个字符' })
    .regex(/^[a-zA-Z0-9-_]+$/, { message: '容器名称只能包含字母、数字、连字符和下划线' })
});

const ContainersPage: React.FC = () => {
  const [containers, setContainers] = useState<Container[]>([]);
  const [images, setImages] = useState<Image[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingImages, setLoadingImages] = useState(false);
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId') ? parseInt(searchParams.get('courseId')!) : undefined;
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isNamingDialogOpen, setIsNamingDialogOpen] = useState(false);
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState('containers');

  // 表单控制
  const form = useForm<z.infer<typeof containerNameSchema>>({
    resolver: zodResolver(containerNameSchema),
    defaultValues: {
      containerName: '',
    },
  });

  const handleTabChange = (value: string) => {
    if (!courseId) return;

    switch (value) {
      case 'details':
        navigate(`/courses/${courseId}`);
        break;
      case 'resources':
        navigate(`/courses/${courseId}/resources`);
        break;
      case 'containers':
        navigate(`/containers?courseId=${courseId}`);
        break;
      default:
        navigate(`/courses/${courseId}`);
    }
  };

  const fetchContainers = async () => {
    try {
      setLoading(true);
      const data = courseId ? await getContainers(courseId) : await getContainers();
      setContainers(data);
    } catch (error) {
      toast.error('获取容器列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchImages = async () => {
    if (!courseId) {
      toast.error('请先选择一个课程');
      return;
    }

    try {
      setLoadingImages(true);
      const data = await getCourseImages(courseId);
      setImages(data);
    } catch (error) {
      toast.error('获取镜像列表失败');
      console.error(error);
    } finally {
      setLoadingImages(false);
    }
  };

  useEffect(() => {
    fetchContainers();
  }, [courseId]);

  const handleStartContainer = async (containerId: string) => {
    try {
      await startContainer(containerId);
      toast.success('容器启动成功');
      fetchContainers();
    } catch (error) {
      toast.error('容器启动失败');
    }
  };

  const handleStopContainer = async (containerId: string) => {
    try {
      await stopContainer(containerId);
      toast.success('容器停止成功');
      fetchContainers();
    } catch (error) {
      toast.error('容器停止失败');
    }
  };

  const handleRestartContainer = async (containerId: string) => {
    try {
      await restartContainer(containerId);
      toast.success('容器重启成功');
      fetchContainers();
    } catch (error) {
      toast.error('容器重启失败');
    }
  };

  const handleDeleteContainer = async (containerId: string) => {
    try {
      await deleteContainer(containerId);
      toast.success('容器删除成功');
      fetchContainers();
    } catch (error) {
      toast.error('容器删除失败');
    }
  };

  const handleOpenCreateDialog = () => {
    if (!courseId) {
      toast.error('请先选择一个课程');
      return;
    }
    fetchImages();
    setIsCreateDialogOpen(true);
  };

  const handleSelectImage = (imageId: number) => {
    setSelectedImageId(imageId);
    setIsNamingDialogOpen(true);
  };

  const handleCreateContainer = async (values: z.infer<typeof containerNameSchema>) => {
    if (!courseId || !selectedImageId) {
      toast.error('缺少必要参数');
      return;
    }

    try {
      await createContainer(courseId, selectedImageId, values.containerName);
      toast.success('容器创建成功');
      setIsNamingDialogOpen(false);
      setIsCreateDialogOpen(false);
      form.reset();
      fetchContainers();
    } catch (error) {
      toast.error('容器创建失败');
    }
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success(message);
      },
      () => {
        toast.error('复制失败');
      }
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'running':
        return <Badge className="bg-green-500">运行中</Badge>;
      case 'stopped':
        return <Badge className="bg-gray-500">已停止</Badge>;
      case 'error':
        return <Badge className="bg-red-500">错误</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getOsTypeBadge = (osType: string) => {
    switch (osType) {
      case 'ubuntu':
        return <Badge className="bg-orange-500">Ubuntu</Badge>;
      case 'centos':
        return <Badge className="bg-blue-500">CentOS</Badge>;
      case 'debian':
        return <Badge className="bg-purple-500">Debian</Badge>;
      default:
        return <Badge>{osType}</Badge>;
    }
  };

  const getSshCommand = (container: Container) => {
    return `ssh ${container.username}@${container.ip_address} -p ${container.ssh_port}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-8">
        <div className="flex flex-col md:flex-row gap-6 relative">
          {/* 桌面端侧边栏和回到顶部按钮的容器 */}
          {courseId && (
            <div className="hidden md:flex flex-col gap-4 sticky top-6 h-fit">
              <CourseSidebar
                currentTab="containers"
                onTabChange={handleTabChange}
                className="h-fit"
              />
              <ScrollToTop
                className="self-center"
                showAfter={400}
              />
            </div>
          )}

          {/* 移动端只显示侧边栏 */}
          {courseId && (
            <div className="md:hidden">
              <CourseSidebar
                currentTab="containers"
                onTabChange={handleTabChange}
              />
            </div>
          )}

          {/* 主内容区 */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">我的容器</h1>
              {courseId && (<Button className="flex items-center gap-2" onClick={handleOpenCreateDialog}>
                <Plus size={16} />
                <span>创建新容器</span>
              </Button>)}
            </div>

            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : containers.length === 0 ? (
              <div className="text-center py-12 bg-muted rounded-lg">
                <h3 className="text-lg font-medium mb-2">暂无容器</h3>
                <p className="text-muted-foreground mb-4">您还没有创建任何容器，请选择一个课程创建容器</p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-border bg-background">
                <Table>
                  <TableCaption>您的Linux学习环境容器列表</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>容器名称</TableHead>
                      <TableHead>状态</TableHead>
                      <TableHead>镜像</TableHead>
                      <TableHead>课程</TableHead>
                      <TableHead>SSH连接信息</TableHead>
                      <TableHead>创建时间</TableHead>
                      <TableHead className="text-right">操作</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {containers.map((container) => (
                      <TableRow key={container.container_id}>
                        <TableCell className="font-medium">{container.container_name}</TableCell>
                        <TableCell>{getStatusBadge(container.status)}</TableCell>
                        <TableCell>{container.image_name}</TableCell>
                        <TableCell>{container.course_name}</TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">地址: {container.ip_address}:{container.ssh_port}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 ml-2"
                                onClick={() => copyToClipboard(`${container.ip_address}:${container.ssh_port}`, '地址已复制')}
                              >
                                <Copy size={14} />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">用户名: {container.username}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 ml-2"
                                onClick={() => copyToClipboard(container.username, '用户名已复制')}
                              >
                                <Copy size={14} />
                              </Button>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">密码: {container.password}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 ml-2"
                                onClick={() => copyToClipboard(container.password, '密码已复制')}
                              >
                                <Copy size={14} />
                              </Button>
                            </div>
                            <div className="mt-1 flex justify-center">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => copyToClipboard(getSshCommand(container), 'SSH命令已复制')}
                              >
                                复制SSH命令
                              </Button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{new Date(container.created_at).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            {container.status === 'stopped' && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleStartContainer(container.container_id)}
                                title="启动"
                              >
                                <Play size={16} />
                              </Button>
                            )}
                            {container.status === 'running' && (
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleStopContainer(container.container_id)}
                                title="停止"
                              >
                                <Square size={16} />
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleRestartContainer(container.container_id)}
                              title="重启"
                            >
                              <RefreshCw size={16} />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className="text-destructive"
                                  title="删除"
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>确认删除容器</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    您确定要删除容器 "{container.container_name}" 吗？此操作不可撤销，容器中的所有数据将被永久删除。
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>取消</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteContainer(container.container_id)}
                                    className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
                                  >
                                    删除
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 创建新容器对话框 */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="!w-[80vw] !h-[85vh] !max-w-none sm:!max-w-none md:!max-w-none overflow-y-auto flex flex-col">
          <DialogHeader>
            <DialogTitle>选择镜像创建容器</DialogTitle>
            <DialogDescription>
              请从下面的列表中选择一个Linux镜像来创建您的学习环境容器
            </DialogDescription>
          </DialogHeader>

          {loadingImages ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-12 bg-muted rounded-lg">
              <h3 className="text-lg font-medium mb-2">暂无可用镜像</h3>
              <p className="text-muted-foreground mb-4">该课程暂未提供任何可用的Linux镜像</p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg border border-border bg-background">
              <Table>
                <TableCaption>可用的Linux镜像列表</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>镜像名称</TableHead>
                    <TableHead>描述</TableHead>
                    <TableHead>版本</TableHead>
                    <TableHead>系统类型</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {images.map((image) => (
                    <TableRow key={image.image_id}>
                      <TableCell className="font-medium">{image.image_name}</TableCell>
                      <TableCell>{image.image_description}</TableCell>
                      <TableCell>{image.version}</TableCell>
                      <TableCell>{getOsTypeBadge(image.os_type)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          onClick={() => handleSelectImage(image.image_id)}
                          className="bg-primary text-white hover:bg-primary/90"
                        >
                          创建
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

        </DialogContent>
      </Dialog>

      {/* 容器命名对话框 */}
      <Dialog open={isNamingDialogOpen} onOpenChange={setIsNamingDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>为您的容器命名</DialogTitle>
            <DialogDescription>
              请为您的新容器提供一个名称，该名称将用于标识您的Linux学习环境
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateContainer)} className="space-y-4">
              <FormField
                control={form.control}
                name="containerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>容器名称</FormLabel>
                    <FormControl>
                      <Input placeholder="my-linux-container" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="sm:justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsNamingDialogOpen(false)}
                >
                  取消
                </Button>
                <Button type="submit">创建容器</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ContainersPage; 