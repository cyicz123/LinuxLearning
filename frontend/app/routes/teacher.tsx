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
import { PlusCircle } from 'lucide-react';

export default function TeacherPage() {
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

  const navigate = useNavigate();
  const { user } = useAuth();

  // 检查用户是否为教师
  useEffect(() => {
    if (user?.role !== 'teacher') {
      navigate('/login');
    }
  }, [user, navigate]);

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

  // 加载教师课程数据
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
        console.error('获取教师课程列表失败:', error);
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
    setCurrentPage(1); // 重置到第一页
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // 跳转到创建课程页面
  const handleCreateCourse = () => {
    navigate('/teacher/create-course');
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
        {/* 教师欢迎区域 */}
        <div className="bg-white shadow-sm rounded-lg p-6 mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">我的课程</h1>
            <p className="text-gray-600 mt-1">欢迎回来，{user?.username || '教师'}老师</p>
          </div>
          <Button
            onClick={handleCreateCourse}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <PlusCircle className="mr-2 h-5 w-5" />
            创建新课程
          </Button>
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
            <p className="text-gray-500">您还没有创建任何课程</p>
            <Button
              onClick={handleCreateCourse}
              className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <PlusCircle className="mr-2 h-5 w-5" />
              立即创建课程
            </Button>
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