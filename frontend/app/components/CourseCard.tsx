import { Link } from 'react-router';
import type { Course } from '../services/courseService';

type CourseCardProps = Course;

export default function CourseCard({
  course_id,
  course_name,
  course_description,
  cover_image,
  teacher_name,
  enrollment_count,
  enrolled_at
}: CourseCardProps) {
  return (
    <Link
      to={`/course/${course_id}`}
      className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group relative"
    >
      <div className="h-48 overflow-hidden">
        <img
          src={cover_image || '/Linux.png'}
          alt={course_name}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* 默认只显示课程名称 */}
      <div className="p-3">
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{course_name}</h3>
      </div>

      {/* 鼠标悬停时只显示课程简介遮罩层 */}
      <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center p-4">
        <p className="text-white text-lg line-clamp-6">{course_description}</p>
      </div>
    </Link>
  );
} 