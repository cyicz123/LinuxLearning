import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Checkbox } from '../components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { toast } from 'sonner';
import { Search, Plus, Trash2, Upload, Download, MoreVertical } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import Pagination from '../components/Pagination';

// 学生类型定义
interface Student {
  user_id: number;
  username: string;
  email: string;
  enrolled_at: string;
  container_count: number;
}

// 模拟获取课程学生列表的API
const getCourseStudents = async (
  courseId: number,
  page: number = 1,
  limit: number = 10,
  keyword?: string,
  sort_by: string = 'enrolled_at',
  sort_order: string = 'desc'
): Promise<{
  students: Student[];
  total: number;
  page: number;
  limit: number;
}> => {
  // 模拟API调用
  return {
    students: [
      {
        user_id: 1,
        username: '张三',
        email: 'zhangsan@example.com',
        enrolled_at: '2023-05-15T10:30:00Z',
        container_count: 2
      },
      {
        user_id: 2,
        username: '李四',
        email: 'lisi@example.com',
        enrolled_at: '2023-05-16T14:20:00Z',
        container_count: 1
      },
      {
        user_id: 3,
        username: '王五',
        email: 'wangwu@example.com',
        enrolled_at: '2023-05-17T09:15:00Z',
        container_count: 0
      }
    ],
    total: 3,
    page: 1,
    limit: 10
  };
};

// 模拟批量导入学生的API
const importStudents = async (courseId: number, file: File): Promise<boolean> => {
  // 模拟API调用
  return true;
};

// 模拟移除学生的API
const removeStudents = async (courseId: number, studentIds: number[]): Promise<boolean> => {
  // 模拟API调用
  return true;
};

export default function TeacherCourseStudentsPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // 搜索和排序
  const [searchKeyword, setSearchKeyword] = useState('');
  const [sortBy, setSortBy] = useState('enrolled_at');
  const [sortOrder, setSortOrder] = useState('desc');

  // 选择状态
  const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  // 对话框状态
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);

  // 获取课程学生列表
  useEffect(() => {
    const fetchStudents = async () => {
      if (!courseId) return;

      try {
        setLoading(true);
        const data = await getCourseStudents(
          parseInt(courseId),
          currentPage,
          pageSize,
          searchKeyword,
          sortBy,
          sortOrder
        );

        setStudents(data.students);
        setTotalStudents(data.total);
        setTotalPages(Math.ceil(data.total / pageSize));
        // 重置选择状态
        setSelectedStudents([]);
        setSelectAll(false);
      } catch (err) {
        console.error('获取学生列表失败:', err);
        setError('获取学生列表失败');
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
    setCurrentPage(1); // 重置到第一页
  };

  // 处理排序变化
  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-');
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1); // 重置到第一页
  };

  // 处理学生选择
  const handleSelectStudent = (studentId: number) => {
    setSelectedStudents(prev => {
      if (prev.includes(studentId)) {
        return prev.filter(id => id !== studentId);
      } else {
        return [...prev, studentId];
      }
    });
  };

  // 处理全选
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(students.map(s => s.user_id));
    }
    setSelectAll(!selectAll);
  };

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImportFile(e.target.files[0]);
    }
  };

  // 处理导入学生
  const handleImportStudents = async () => {
    if (!importFile || !courseId) return;

    try {
      const success = await importStudents(parseInt(courseId), importFile);

      if (success) {
        toast.success('学生导入成功');
        setIsImportDialogOpen(false);
        setImportFile(null);

        // 重新获取学生列表
        const data = await getCourseStudents(
          parseInt(courseId),
          currentPage,
          pageSize,
          searchKeyword,
          sortBy,
          sortOrder
        );

        setStudents(data.students);
        setTotalStudents(data.total);
        setTotalPages(Math.ceil(data.total / pageSize));
      } else {
        toast.error('学生导入失败');
      }
    } catch (err) {
      console.error('导入学生失败:', err);
      toast.error('导入学生失败，请稍后重试');
    }
  };

  // 处理移除学生
  const handleRemoveStudents = async () => {
    if (selectedStudents.length === 0 || !courseId) return;

    try {
      const success = await removeStudents(parseInt(courseId), selectedStudents);

      if (success) {
        toast.success(`成功移除 ${selectedStudents.length} 名学生`);
        setIsRemoveDialogOpen(false);
        setSelectedStudents([]);
        setSelectAll(false);

        // 重新获取学生列表
        const data = await getCourseStudents(
          parseInt(courseId),
          currentPage,
          pageSize,
          searchKeyword,
          sortBy,
          sortOrder
        );

        setStudents(data.students);
        setTotalStudents(data.total);
        setTotalPages(Math.ceil(data.total / pageSize));
      } else {
        toast.error('移除学生失败');
      }
    } catch (err) {
      console.error('移除学生失败:', err);
      toast.error('移除学生失败，请稍后重试');
    }
  };

  // 下载学生导入模板
  const handleDownloadTemplate = () => {
    // 实际应用中应该提供一个下载链接
    toast.success('模板下载成功');
  };

  // 查看学生容器
  const handleViewContainers = (studentId: number) => {
    navigate(`/teacher/courses/${courseId}/students/${studentId}/containers`);
  };

  if (loading && students.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-lg text-gray-500">加载中...</p>
      </div>
    );
  }

  if (error && students.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <p className="text-lg text-red-500 mb-4">{error}</p>
        <Button onClick={() => navigate(`/teacher/courses/${courseId}`)}>返回课程详情</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle>学生管理</CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsImportDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-1" /> 导入学生
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
                <Download className="h-4 w-4 mr-1" /> 下载模板
              </Button>
              {selectedStudents.length > 0 && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => setIsRemoveDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> 移除学生
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 搜索和筛选工具栏 */}
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <form onSubmit={handleSearch} className="flex-1 flex gap-2">
              <Input
                placeholder="搜索学生姓名或邮箱..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" variant="secondary" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </form>
            <div className="flex gap-2">
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="排序方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="enrolled_at-desc">最近选课</SelectItem>
                  <SelectItem value="enrolled_at-asc">最早选课</SelectItem>
                  <SelectItem value="username-asc">姓名 A-Z</SelectItem>
                  <SelectItem value="username-desc">姓名 Z-A</SelectItem>
                  <SelectItem value="container_count-desc">容器数量 多-少</SelectItem>
                  <SelectItem value="container_count-asc">容器数量 少-多</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 学生列表表格 */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectAll}
                      onCheckedChange={handleSelectAll}
                      aria-label="选择所有学生"
                    />
                  </TableHead>
                  <TableHead>姓名</TableHead>
                  <TableHead>邮箱</TableHead>
                  <TableHead>选课时间</TableHead>
                  <TableHead>容器数量</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students.length > 0 ? (
                  students.map((student) => (
                    <TableRow key={student.user_id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedStudents.includes(student.user_id)}
                          onCheckedChange={() => handleSelectStudent(student.user_id)}
                          aria-label={`选择学生 ${student.username}`}
                        />
                      </TableCell>
                      <TableCell>{student.username}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{new Date(student.enrolled_at).toLocaleString()}</TableCell>
                      <TableCell>{student.container_count}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewContainers(student.user_id)}>
                              查看容器
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => {
                                setSelectedStudents([student.user_id]);
                                setIsRemoveDialogOpen(true);
                              }}
                            >
                              移除学生
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-4 text-gray-500">
                      暂无学生选修此课程
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
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
        </CardContent>
      </Card>

      {/* 导入学生对话框 */}
      <Dialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>导入学生</DialogTitle>
            <DialogDescription>
              请上传包含学生信息的Excel文件，支持.xlsx和.csv格式。
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="file" className="text-sm font-medium">选择文件</label>
              <Input
                id="file"
                type="file"
                accept=".xlsx,.csv"
                onChange={handleFileChange}
              />
              <p className="text-xs text-gray-500">
                文件格式要求：第一列为学生姓名，第二列为学生邮箱。
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsImportDialogOpen(false)}>取消</Button>
            <Button
              onClick={handleImportStudents}
              disabled={!importFile}
            >
              导入
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 移除学生确认对话框 */}
      <Dialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>确认移除</DialogTitle>
            <DialogDescription>
              您确定要将选中的 {selectedStudents.length} 名学生从课程中移除吗？此操作将同时删除这些学生在本课程中创建的所有容器。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRemoveDialogOpen(false)}>取消</Button>
            <Button variant="destructive" onClick={handleRemoveStudents}>
              确认移除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 