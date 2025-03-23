import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router';
import { getTeacherCourses } from '../services/courseService';
import type { Course } from '../services/courseService';
import CourseCard from '../components/CourseCard';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../components/ui/select';
import Navbar from '../components/Navbar';
import Pagination from '../components/Pagination';
import { useAuth } from '../contexts/AuthContext';
import { BookOpen, FileText, Image, Box, Users, GraduationCap } from 'lucide-react';

interface Statistics {
  total_courses: number;
  total_resources: number;
  total_images: number;
  total_containers: number;
  total_teachers: number;
  total_students: number;
}

export default function AdminPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [keyword, setKeyword] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'enrollment_count' | 'course_name'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [statistics, setStatistics] = useState<Statistics | null>(null);

  const navigate = useNavigate();
  const { user } = useAuth();

  // 检查用户是否为管理员
  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/login');
    }
  }, [user, navigate]);

  // 获取统计数据
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const response = await fetch('/api/v1/admin/statistics');
        const data = await response.json();
        if (data.code === 200) {
          setStatistics(data.data);
        }
      } catch (error) {
        console.error('获取统计数据失败:', error);
      }
    };

    fetchStatistics();
  }, []);

  // 从URL参数中获取初始值
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);
    const keywordParam = searchParams.get('keyword') || '';
    const sortByParam = searchParams.get('sort_by') as 'created_at' | 'enrollment_count' | 'course_name' || 'created_at';
    const sortOrderParam = searchParams.get('sort_order') as 'asc' | 'desc' || 'desc';

    setCurrentPage(page);
    setPageSize(limit);
    setKeyword(keywordParam);
    setInputValue(keywordParam);
    setSortBy(sortByParam);
    setSortOrder(sortOrderParam);
  }, [searchParams]);

  // 加载课程数据
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      try {
        const result = await getTeacherCourses({
          page: currentPage,
          limit: pageSize,
          keyword: keyword || undefined,
          sort_by: sortBy,
          sort_order: sortOrder
        });
        setCourses(result.courses);
        setTotal(result.total);
      } catch (error) {
        console.error('获取课程列表失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [currentPage, pageSize, keyword, sortBy, sortOrder]);

  // 更新URL参数
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('page', currentPage.toString());
    params.set('limit', pageSize.toString());

    if (keyword) {
      params.set('keyword', keyword);
    }

    params.set('sort_by', sortBy);
    params.set('sort_order', sortOrder);

    setSearchParams(params);
  }, [currentPage, pageSize, keyword, sortBy, sortOrder, setSearchParams]);

  // 处理搜索
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setKeyword(inputValue);
    setCurrentPage(1);
  };

  // 处理排序变化
  const handleSortChange = (value: string) => {
    const [newSortBy, newSortOrder] = value.split('-') as ['created_at' | 'enrollment_count' | 'course_name', 'asc' | 'desc'];
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // 计算总页数
  const totalPages = Math.ceil(total / pageSize);

  // 生成分页按钮
  const renderPagination = () => {
    return (
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* 管理员欢迎区域 */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8">
          <h1 className="text-2xl font-bold text-gray-800">系统管理</h1>
          <p className="text-gray-600 mt-1">欢迎回来，{user?.username || '管理员'}</p>
        </div>

        {/* 统计卡片区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">课程总数</p>
                <p className="text-2xl font-semibold text-gray-800">{statistics?.total_courses || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">资源总数</p>
                <p className="text-2xl font-semibold text-gray-800">{statistics?.total_resources || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <Image className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">镜像总数</p>
                <p className="text-2xl font-semibold text-gray-800">{statistics?.total_images || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <Box className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">容器总数</p>
                <p className="text-2xl font-semibold text-gray-800">{statistics?.total_containers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <Users className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">教师总数</p>
                <p className="text-2xl font-semibold text-gray-800">{statistics?.total_teachers || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-indigo-100">
                <GraduationCap className="h-6 w-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-500">学生总数</p>
                <p className="text-2xl font-semibold text-gray-800">{statistics?.total_students || 0}</p>
              </div>
            </div>
          </div>
        </div>

        {/* 搜索和筛选区域 */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="搜索课程名称或描述"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="w-full"
              />
            </div>

            <div className="w-full md:w-48">
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="排序方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at-desc">最新发布</SelectItem>
                  <SelectItem value="created_at-asc">最早发布</SelectItem>
                  <SelectItem value="enrollment_count-desc">选课人数多</SelectItem>
                  <SelectItem value="enrollment_count-asc">选课人数少</SelectItem>
                  <SelectItem value="course_name-asc">课程名称 A-Z</SelectItem>
                  <SelectItem value="course_name-desc">课程名称 Z-A</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="md:w-24">搜索</Button>
          </form>
        </div>

        {/* 课程列表 */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">加载中...</p>
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-gray-500">暂无课程数据</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {courses.map((course) => (
                <CourseCard
                  key={course.course_id}
                  {...course}
                  isStudent={false}
                />
              ))}
            </div>

            {/* 分页控件 */}
            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                {renderPagination()}
              </div>
            )}

            {/* 显示总数 */}
            <div className="text-center mt-4 text-gray-500">
              共 {total} 门课程，当前显示第 {currentPage} 页
            </div>
          </>
        )}
      </div>
    </div>
  );
} 