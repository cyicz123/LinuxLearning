import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { getCourses } from '../services/courseService';
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

export default function CoursesPage() {
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
        const result = await getCourses({
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
    setCurrentPage(1); // 重置到第一页
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
    const pages = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // 首页按钮
    if (startPage > 1) {
      pages.push(
        <Button
          key="first"
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(1)}
          className="mx-1"
        >
          首页
        </Button>
      );
    }

    // 页码按钮
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={i === currentPage ? "default" : "outline"}
          size="sm"
          onClick={() => handlePageChange(i)}
          className="mx-1"
        >
          {i}
        </Button>
      );
    }

    // 末页按钮
    if (endPage < totalPages) {
      pages.push(
        <Button
          key="last"
          variant="outline"
          size="sm"
          onClick={() => handlePageChange(totalPages)}
          className="mx-1"
        >
          末页
        </Button>
      );
    }

    return pages;
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        {/* <div className="bg-white shadow-sm rounded-lg p-4 mb-8">
          <h1 className="text-2xl font-bold text-gray-800">课程列表</h1>
        </div> */}

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
            <p className="text-gray-500">没有找到符合条件的课程</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {courses.map((course) => (
                <CourseCard key={course.course_id} {...course} />
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