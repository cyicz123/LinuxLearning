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
import { Search, Plus, Edit, Trash2, MoreVertical, Upload, X, UserPlus, Copy, Check, AlertCircle, Download } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { formatDate } from '../utils/formatters';
import { teacherService } from '../services/teacherService';
import type { Teacher, CreateTeacherData, ImportTeacherItem } from '../services/teacherService';
import * as XLSX from 'xlsx';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';

// 生成随机密码函数
const generateRandomPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
};

// 添加一个用于生成和下载Excel模板的函数
const downloadTemplate = () => {
  // 创建工作表数据
  const ws = XLSX.utils.json_to_sheet([
    {
      "用户名": "教师1",
      "邮箱": "teacher1@example.com",
      "简介": "这里是教师简介"
    },
    {
      "用户名": "教师2",
      "邮箱": "teacher2@example.com",
      "简介": "这里是教师简介"
    }
  ]);

  // 创建工作簿
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "教师模板");

  // 生成Excel文件并下载
  XLSX.writeFile(wb, "教师导入模板.xlsx");

  toast.success("模板已下载");
};

export default function AdminTeachersPage() {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 分页状态
  const [currentPage, setCurrentPage] = useState(1);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // 搜索和排序状态
  const [searchKeyword, setSearchKeyword] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // 新建教师对话框状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newTeacher, setNewTeacher] = useState<CreateTeacherData>({
    username: '',
    email: '',
    password: generateRandomPassword(),
    bio: ''
  });
  const [creating, setCreating] = useState(false);

  // 创建成功对话框状态
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [createdTeacher, setCreatedTeacher] = useState<{
    username: string;
    email: string;
    password: string;
    user_id?: number;
  } | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  // 批量导入对话框状态
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importPreview, setImportPreview] = useState<ImportTeacherItem[]>([]);
  const [parseErrors, setParseErrors] = useState<{ [key: number]: string }>({});
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 批量删除状态
  const [selectedTeachers, setSelectedTeachers] = useState<number[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | null>(null);

  // 获取教师列表
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const response = await teacherService.getTeachers({
          page: currentPage,
          limit: pageSize,
          keyword: searchKeyword,
          sort_by: sortBy,
          sort_order: sortOrder
        });

        setTeachers(response.teachers);
        setTotalTeachers(response.total);
        setTotalPages(Math.ceil(response.total / pageSize));
      } catch (err) {
        setError('获取教师列表时发生错误');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, [currentPage, pageSize, searchKeyword, sortBy, sortOrder]);

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
  const handleSortChange = (value: string) => {
    const [field, order] = value.split('-');
    setSortBy(field);
    setSortOrder(order as 'asc' | 'desc');
    setCurrentPage(1); // 重置到第一页
  };

  // 处理文件选择
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      parseExcelFile(e.target.files[0]);
    }
  };

  // 解析Excel文件
  const parseExcelFile = async (file: File) => {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      const teachers: ImportTeacherItem[] = [];
      const errors: { [key: number]: string } = {};

      jsonData.forEach((row, index) => {
        const teacher: ImportTeacherItem = {
          username: row.username || row['用户名'] || '',
          email: row.email || row['邮箱'] || '',
          bio: row.bio || row['简介'] || '',
          password: generateRandomPassword() // 为每个导入的用户生成随机密码
        };

        // 验证必填字段
        if (!teacher.username) {
          errors[index] = '用户名不能为空';
        } else if (!teacher.email) {
          errors[index] = '邮箱不能为空';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(teacher.email)) {
          errors[index] = '邮箱格式不正确';
        }

        teachers.push(teacher);
      });

      setImportPreview(teachers);
      setParseErrors(errors);
      setPreviewDialogOpen(true);
      setImportDialogOpen(false);
    } catch (error) {
      console.error('解析Excel文件错误:', error);
      toast.error('解析Excel文件时发生错误');
    }
  };

  // 更新导入预览中的教师信息
  const updatePreviewTeacher = (index: number, field: keyof ImportTeacherItem, value: string) => {
    const updatedPreview = [...importPreview];
    updatedPreview[index] = { ...updatedPreview[index], [field]: value };

    // 重新验证
    const errors = { ...parseErrors };
    if (field === 'username' && !value) {
      errors[index] = '用户名不能为空';
    } else if (field === 'email') {
      if (!value) {
        errors[index] = '邮箱不能为空';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        errors[index] = '邮箱格式不正确';
      } else {
        delete errors[index];
      }
    } else if (field === 'username' && value && updatedPreview[index].email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(updatedPreview[index].email)) {
      delete errors[index];
    }

    setImportPreview(updatedPreview);
    setParseErrors(errors);
  };

  // 处理新建教师
  const handleCreateTeacher = async () => {
    if (!newTeacher.username || !newTeacher.email) {
      toast.error('请填写用户名和邮箱');
      return;
    }

    try {
      setCreating(true);
      const response = await teacherService.createTeacher(newTeacher);
      setCreatedTeacher({
        username: newTeacher.username,
        email: newTeacher.email,
        password: newTeacher.password,
        user_id: response.user_id
      });

      // 关闭创建对话框，打开成功对话框
      setCreateDialogOpen(false);
      setSuccessDialogOpen(true);

      // 重置表单
      setNewTeacher({
        username: '',
        email: '',
        password: generateRandomPassword(),
        bio: ''
      });

      // 刷新列表
      const refreshResponse = await teacherService.getTeachers({
        page: currentPage,
        limit: pageSize,
        keyword: searchKeyword,
        sort_by: sortBy,
        sort_order: sortOrder
      });
      setTeachers(refreshResponse.teachers);
      setTotalTeachers(refreshResponse.total);
      setTotalPages(Math.ceil(refreshResponse.total / pageSize));
    } catch (error) {
      console.error('创建教师时发生错误:', error);
      toast.error('创建教师时发生错误');
    } finally {
      setCreating(false);
    }
  };

  // 处理复制功能
  const handleCopyAll = () => {
    if (!createdTeacher) return;

    const textToCopy = `用户名: ${createdTeacher.username}\n邮箱: ${createdTeacher.email}\n密码: ${createdTeacher.password}`;

    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopySuccess(true);
      toast.success('已复制账号信息');
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    });
  };

  // 处理批量导入
  const handleImportTeachers = async () => {
    // 过滤掉有错误的记录
    const validTeachers = importPreview.filter((_, index) => !parseErrors[index]);

    if (validTeachers.length === 0) {
      toast.error('没有有效的教师数据可导入');
      return;
    }

    try {
      setImporting(true);
      const response = await teacherService.importTeachers(validTeachers);
      toast.success(`成功导入 ${response.success_count} 个教师`);
      if (response.failed_count > 0) {
        toast.warning(`有 ${response.failed_count} 个教师导入失败`);
      }
      setPreviewDialogOpen(false);
      setSelectedFile(null);
      setImportPreview([]);
      setParseErrors({});
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // 刷新列表
      const listResponse = await teacherService.getTeachers({
        page: currentPage,
        limit: pageSize,
        keyword: searchKeyword,
        sort_by: sortBy,
        sort_order: sortOrder
      });
      setTeachers(listResponse.teachers);
      setTotalTeachers(listResponse.total);
      setTotalPages(Math.ceil(listResponse.total / pageSize));
    } catch (error) {
      console.error('导入教师时发生错误:', error);
      toast.error('导入教师时发生错误');
    } finally {
      setImporting(false);
    }
  };

  // 处理删除教师
  const handleDeleteTeacher = async () => {
    if (!selectedTeacherId) return;

    try {
      await teacherService.deleteTeacher(selectedTeacherId);
      toast.success('教师删除成功');
      setDeleteDialogOpen(false);
      // 刷新列表
      const response = await teacherService.getTeachers({
        page: currentPage,
        limit: pageSize,
        keyword: searchKeyword,
        sort_by: sortBy,
        sort_order: sortOrder
      });
      setTeachers(response.teachers);
      setTotalTeachers(response.total);
      setTotalPages(Math.ceil(response.total / pageSize));
    } catch (error) {
      console.error('删除教师时发生错误:', error);
      toast.error('删除教师时发生错误');
    }
  };

  // 打开删除确认对话框
  const handleOpenDeleteDialog = (teacherId: number) => {
    setSelectedTeacherId(teacherId);
    setDeleteDialogOpen(true);
  };

  // 处理教师选择
  const handleTeacherSelect = (teacherId: number) => {
    setSelectedTeachers(prev => {
      if (prev.includes(teacherId)) {
        return prev.filter(id => id !== teacherId);
      } else {
        return [...prev, teacherId];
      }
    });
  };

  // 处理全选
  const handleSelectAll = () => {
    if (selectedTeachers.length === teachers.length) {
      setSelectedTeachers([]);
    } else {
      setSelectedTeachers(teachers.map(teacher => teacher.user_id));
    }
  };

  // 批量删除教师
  const handleBatchDelete = async () => {
    if (selectedTeachers.length === 0) return;

    try {
      const response = await teacherService.batchDeleteTeachers(selectedTeachers);
      toast.success(`成功删除 ${response.success} 个教师`);
      if (response.failed > 0) {
        toast.warning(`有 ${response.failed} 个教师删除失败`);
      }
      setBatchDeleteDialogOpen(false);
      setSelectedTeachers([]);
      // 刷新列表
      const listResponse = await teacherService.getTeachers({
        page: currentPage,
        limit: pageSize,
        keyword: searchKeyword,
        sort_by: sortBy,
        sort_order: sortOrder
      });
      setTeachers(listResponse.teachers);
      setTotalTeachers(listResponse.total);
      setTotalPages(Math.ceil(listResponse.total / pageSize));
    } catch (error) {
      console.error('批量删除教师时发生错误:', error);
      toast.error('批量删除教师时发生错误');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto py-6 px-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl">教师管理</CardTitle>
            <div className="flex space-x-2">
              {selectedTeachers.length > 0 && (
                <Button
                  variant="destructive"
                  onClick={() => setBatchDeleteDialogOpen(true)}
                  className="flex items-center"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  批量删除 ({selectedTeachers.length})
                </Button>
              )}
              <Button onClick={() => setImportDialogOpen(true)} className="flex items-center">
                <Upload className="mr-2 h-4 w-4" />
                批量导入
              </Button>
              <Button onClick={() => setCreateDialogOpen(true)} className="flex items-center">
                <Plus className="mr-2 h-4 w-4" />
                新建教师
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-2 md:space-y-0">
                <form onSubmit={handleSearch} className="flex flex-1 mr-4">
                  <Input
                    type="text"
                    placeholder="搜索教师姓名或邮箱..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    className="mr-2"
                  />
                  <Button type="submit" variant="outline">
                    <Search className="h-4 w-4" />
                  </Button>
                </form>
                <div className="flex w-full md:w-auto space-x-2">
                  <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-full md:w-40">
                      <SelectValue placeholder="排序方式" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at-desc">创建时间（新到旧）</SelectItem>
                      <SelectItem value="created_at-asc">创建时间（旧到新）</SelectItem>
                      <SelectItem value="username-asc">姓名（A-Z）</SelectItem>
                      <SelectItem value="username-desc">姓名（Z-A）</SelectItem>
                      <SelectItem value="email-asc">邮箱（A-Z）</SelectItem>
                      <SelectItem value="email-desc">邮箱（Z-A）</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="w-10 px-4 py-2">
                        <Checkbox
                          checked={selectedTeachers.length === teachers.length && teachers.length > 0}
                          onCheckedChange={handleSelectAll}
                        />
                      </th>
                      <th className="px-4 py-2 text-left">教师姓名</th>
                      <th className="px-4 py-2 text-left">邮箱</th>
                      <th className="px-4 py-2 text-left">课程数</th>
                      <th className="px-4 py-2 text-left">学生数</th>
                      <th className="px-4 py-2 text-left">创建时间</th>
                      <th className="px-4 py-2 text-left">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-3 text-center text-sm text-gray-500">
                          加载中...
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-3 text-center text-sm text-red-500">
                          {error}
                        </td>
                      </tr>
                    ) : teachers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="px-4 py-3 text-center text-sm text-gray-500">
                          暂无教师
                        </td>
                      </tr>
                    ) : (
                      teachers.map((teacher) => (
                        <tr key={teacher.user_id} className="border-t hover:bg-gray-50 cursor-pointer">
                          <td className="px-4 py-3">
                            <Checkbox
                              checked={selectedTeachers.includes(teacher.user_id)}
                              onCheckedChange={() => handleTeacherSelect(teacher.user_id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              {teacher.avatar ? (
                                <img src={teacher.avatar} alt={teacher.username} className="w-8 h-8 rounded-full mr-2" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                                  <UserPlus className="h-4 w-4 text-gray-500" />
                                </div>
                              )}
                              <span className="text-sm font-medium text-gray-900">{teacher.username}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-500">{teacher.email}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{teacher.course_count}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{teacher.student_count}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{formatDate(teacher.created_at)}</td>
                          <td className="px-4 py-3 text-right text-sm font-medium">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={(e) => e.stopPropagation()}>
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/admin/teachers/${teacher.user_id}`);
                                }}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  编辑
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDeleteDialog(teacher.user_id);
                                }}>
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

              {!loading && !error && teachers.length > 0 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-500">
                    共 {totalTeachers} 个教师
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

      {/* 新建教师对话框 */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>新建教师</DialogTitle>
            <DialogDescription>
              创建新教师账号，密码将自动生成
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="username" className="text-right">
                用户名 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="username"
                value={newTeacher.username}
                onChange={(e) => setNewTeacher({ ...newTeacher, username: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                邮箱 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={newTeacher.email}
                onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="generated-password" className="text-right">
                密码
              </Label>
              <Input
                id="generated-password"
                type="text"
                value={newTeacher.password}
                className="col-span-3 bg-gray-50"
                readOnly
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bio" className="text-right">
                简介
              </Label>
              <Textarea
                id="bio"
                value={newTeacher.bio}
                onChange={(e) => setNewTeacher({ ...newTeacher, bio: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              type="button"
              onClick={handleCreateTeacher}
              disabled={creating}
            >
              {creating ? '创建中...' : '创建'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 创建成功对话框 */}
      <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>教师创建成功</DialogTitle>
            <DialogDescription>
              新教师账号已创建，请保存以下登录信息
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="created-username" className="text-right">
                用户名
              </Label>
              <Input
                id="created-username"
                value={createdTeacher?.username || ''}
                readOnly
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="created-email" className="text-right">
                邮箱
              </Label>
              <Input
                id="created-email"
                value={createdTeacher?.email || ''}
                readOnly
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="created-password" className="text-right">
                密码
              </Label>
              <Input
                id="created-password"
                value={createdTeacher?.password || ''}
                readOnly
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter className="flex justify-between">
            <Button
              type="button"
              onClick={handleCopyAll}
              className="flex items-center"
              disabled={copySuccess}
            >
              {copySuccess ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
              {copySuccess ? '已复制' : '一键复制'}
            </Button>
            <Button
              type="button"
              onClick={() => setSuccessDialogOpen(false)}
            >
              关闭
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量导入对话框 */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>批量导入教师</DialogTitle>
            <DialogDescription>
              请上传包含教师信息的Excel文件。文件必须包含以下字段：用户名、邮箱。密码将自动生成。
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file" className="text-right">
                选择文件
              </Label>
              <div className="col-span-3">
                <Input
                  id="file"
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx,.xls"
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">
                模板下载
              </Label>
              <div className="col-span-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center text-blue-600 hover:text-blue-800 hover:bg-blue-50 p-0"
                  onClick={downloadTemplate}
                >
                  <Download className="mr-2 h-4 w-4" />
                  下载Excel导入模板
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setImportDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              type="button"
              onClick={() => parseExcelFile(selectedFile!)}
              disabled={!selectedFile}
            >
              下一步
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 导入预览对话框 */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-h-[85vh] overflow-y-auto" style={{ width: '75vw', maxWidth: '75vw' }}>
          <DialogHeader>
            <DialogTitle>批量导入预览</DialogTitle>
            <DialogDescription>
              请检查并编辑导入数据，红色标记的行存在错误需要修复。密码将自动随机生成。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex justify-between mb-4">
              <div className="text-sm text-muted-foreground">
                总共 {importPreview.length} 条记录，
                <span className="text-green-600">{importPreview.length - Object.keys(parseErrors).length} 条有效</span>，
                <span className="text-red-600">{Object.keys(parseErrors).length} 条错误</span>
              </div>
            </div>

            <div className="border rounded-md overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">序号</TableHead>
                    <TableHead className="min-w-[120px]">用户名</TableHead>
                    <TableHead className="min-w-[180px]">邮箱</TableHead>
                    <TableHead className="min-w-[120px]">密码</TableHead>
                    <TableHead className="min-w-[150px]">简介</TableHead>
                    <TableHead className="w-32">状态</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {importPreview.map((teacher, index) => (
                    <TableRow key={index} className={parseErrors[index] ? "bg-red-50" : ""}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Input
                          value={teacher.username}
                          onChange={(e) => updatePreviewTeacher(index, 'username', e.target.value)}
                          className={parseErrors[index] && !teacher.username ? "border-red-500" : ""}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={teacher.email}
                          onChange={(e) => updatePreviewTeacher(index, 'email', e.target.value)}
                          className={parseErrors[index] && (!teacher.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(teacher.email)) ? "border-red-500" : ""}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={teacher.password || ''}
                          readOnly
                          className="bg-gray-50"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          value={teacher.bio || ''}
                          onChange={(e) => updatePreviewTeacher(index, 'bio', e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        {parseErrors[index] ? (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            <span className="text-xs">{parseErrors[index]}</span>
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            有效
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {importPreview.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                        没有找到可导入的数据
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setPreviewDialogOpen(false);
                setImportDialogOpen(true);
              }}
            >
              返回
            </Button>
            <Button
              type="button"
              onClick={handleImportTeachers}
              disabled={importing || importPreview.length === 0 || Object.keys(parseErrors).length === importPreview.length}
            >
              {importing ? '导入中...' : `导入 ${importPreview.length - Object.keys(parseErrors).length} 条有效数据`}
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
              您确定要删除此教师吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteTeacher}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 批量删除确认对话框 */}
      <Dialog open={batchDeleteDialogOpen} onOpenChange={setBatchDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>确认批量删除</DialogTitle>
            <DialogDescription>
              您确定要删除选中的 {selectedTeachers.length} 名教师吗？此操作不可撤销。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setBatchDeleteDialogOpen(false)}
            >
              取消
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleBatchDelete}
            >
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 