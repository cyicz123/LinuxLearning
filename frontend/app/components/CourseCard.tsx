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
      className="block bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
    >
      <div className="h-40 overflow-hidden">
        <img
          src={cover_image || '/default-course-cover.jpg'}
          alt={course_name}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{course_name}</h3>
        <p className="mt-1 text-sm text-gray-600 line-clamp-2">{course_description}</p>
        <div className="mt-3 flex justify-between items-center">
          <span className="text-xs text-gray-500">讲师: {teacher_name}</span>
          {enrollment_count !== undefined && (
            <span className="text-xs text-gray-500">已选人数: {enrollment_count}</span>
          )}
          {enrolled_at && (
            <span className="text-xs text-gray-500">选课时间: {new Date(enrolled_at).toLocaleDateString()}</span>
          )}
        </div>
      </div>
    </Link>
  );
} 