import { Link } from 'react-router';
import type { Course } from '../services/courseService';
import { Edit, Users, FileText } from 'lucide-react';

type CourseCardProps = Course & {
  isTeacher?: boolean;
};

export default function CourseCard({
  course_id,
  course_name,
  course_description,
  cover_image,
  teacher_name,
  enrollment_count,
  enrolled_at,
  isTeacher = false
}: CourseCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 group relative">
      <Link
        to={`/courses/${course_id}`}
        className="block"
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
          {!isTeacher && (
            <p className="text-sm text-gray-500 mt-1">教师: {teacher_name}</p>
          )}
          {enrollment_count !== undefined && (
            <p className="text-sm text-gray-500 mt-1">已选人数: {enrollment_count}</p>
          )}
        </div>

        {/* 鼠标悬停时只显示课程简介遮罩层 */}
        <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-center p-4">
          <p className="text-white text-lg line-clamp-6">{course_description}</p>
        </div>
      </Link>

      {/* 教师操作按钮 */}
      {isTeacher && (
        <div className="flex justify-around p-2 border-t border-gray-200">
          <Link
            to={`/teacher/courses/${course_id}/edit`}
            className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
          >
            <Edit className="h-4 w-4 mr-1" />
            编辑
          </Link>
          <Link
            to={`/teacher/courses/${course_id}/students`}
            className="flex items-center text-green-600 hover:text-green-800 text-sm"
          >
            <Users className="h-4 w-4 mr-1" />
            学生
          </Link>
          <Link
            to={`/teacher/courses/${course_id}/resources`}
            className="flex items-center text-purple-600 hover:text-purple-800 text-sm"
          >
            <FileText className="h-4 w-4 mr-1" />
            资源
          </Link>
        </div>
      )}
    </div>
  );
} 