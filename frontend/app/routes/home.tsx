import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import Navbar from '../components/Navbar';
import CourseCarousel from '../components/CourseCarousel';
import CourseList from '../components/CourseList';
import { useAuth } from '../contexts/AuthContext';
import {
  getPopularCourses,
  getLatestCourses,
  getEnrolledCourses,
  type Course
} from '../services/courseService';

export default function Home() {
  const { isAuthenticated } = useAuth();
  const [popularCourses, setPopularCourses] = useState<Course[]>([]);
  const [latestCourses, setLatestCourses] = useState<Course[]>([]);
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 获取热门课程
        const popular = await getPopularCourses(5);
        setPopularCourses(popular);

        // 获取最新课程
        const latest = await getLatestCourses(8);
        setLatestCourses(latest);

        // 如果已登录，获取已选课程
        if (isAuthenticated) {
          const enrolled = await getEnrolledCourses(1, 8);
          setEnrolledCourses(enrolled.courses);
        }
      } catch (error) {
        console.error('获取首页数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <main className="flex-grow container mx-auto px-4 py-8">
        {isLoading ? (
          // 加载状态
          <div className="flex flex-col space-y-8">
            <div className="h-64 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-gray-200 h-64 rounded-lg animate-pulse"></div>
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* 热门课程轮播图 */}
            <section>
              <h1 className="text-3xl font-bold text-gray-800 mb-6">欢迎使用Linux操作系统学习平台</h1>
              <CourseCarousel courses={popularCourses} />
            </section>

            {/* 最新课程 */}
            <CourseList
              title="最新课程"
              courses={latestCourses}
              viewAllLink="/courses"
              emptyMessage="暂无最新课程"
              maxDisplay={4}
            />

            {/* 已选课程（仅登录用户可见） */}
            {isAuthenticated && (
              <CourseList
                title="我的课程"
                courses={enrolledCourses}
                viewAllLink="/my-courses"
                emptyMessage="您还没有选择任何课程"
                maxDisplay={4}
              />
            )}

            {/* 未登录用户提示 */}
            {!isAuthenticated && (
              <div className="mt-12 bg-white rounded-lg shadow-md p-8 text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">开始您的学习之旅</h2>
                <p className="text-gray-600 mb-6">登录后可以选课、查看课程资源和使用Linux环境</p>
                <div className="flex justify-center space-x-4">
                  <Link
                    to="/login"
                    className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    登录
                  </Link>
                  <Link
                    to="/register"
                    className="bg-white text-indigo-600 border border-indigo-600 px-6 py-2 rounded-md hover:bg-indigo-50 transition-colors"
                  >
                    注册
                  </Link>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <footer className="bg-white shadow-inner py-6">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Linux操作系统学习平台 版权所有</p>
        </div>
      </footer>
    </div>
  );
}
