import { Link } from 'react-router';
import CourseCard from './CourseCard';
import type { Course } from '../services/courseService';

interface CourseListProps {
  title: string;
  courses: Course[];
  viewAllLink: string;
  emptyMessage: string;
  maxDisplay?: number;
}

export default function CourseList({
  title,
  courses,
  viewAllLink,
  emptyMessage,
  maxDisplay = 4
}: CourseListProps) {
  // 如果没有课程，显示空状态
  if (courses.length === 0) {
    return (
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">{title}</h2>
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-500">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  // 显示的课程数量
  const displayCourses = courses.slice(0, maxDisplay);
  // 是否有更多课程
  const hasMore = courses.length > maxDisplay;

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        {hasMore && (
          <Link
            to={viewAllLink}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
          >
            查看全部 &rarr;
          </Link>
        )}
      </div>

      <div className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {displayCourses.map((course) => (
            <CourseCard
              key={course.course_id}
              {...course}
            />
          ))}
        </div>

        {/* 右侧半透明遮罩，仅在桌面端显示 */}
        {hasMore && (
          <div className="hidden md:block absolute right-0 top-0 bottom-0 w-1/4 bg-gradient-to-r from-transparent to-gray-100 pointer-events-none">
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 -translate-x-1/2 flex flex-col items-center justify-center">
              <Link
                to={viewAllLink}
                className="bg-indigo-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-indigo-700 transition-colors duration-300 pointer-events-auto"
              >
                查看全部
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 