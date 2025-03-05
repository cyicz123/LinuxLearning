import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import type { Course } from '../services/courseService';

interface CourseCarouselProps {
  courses: Course[];
}

export default function CourseCarousel({ courses }: CourseCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // 自动轮播
  useEffect(() => {
    if (courses.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % courses.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [courses.length]);

  // 如果没有课程，显示占位符
  if (courses.length === 0) {
    return (
      <div className="relative w-full h-64 bg-gray-200 rounded-lg animate-pulse">
        <div className="absolute inset-0 flex items-center justify-center">
          <p className="text-gray-500">加载热门课程中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-64 overflow-hidden rounded-lg">
      {/* 轮播图内容 */}
      <div
        className="flex transition-transform duration-500 ease-in-out h-full"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {courses.map((course) => (
          <div
            key={course.course_id}
            className="w-full h-full flex-shrink-0 relative"
          >
            <img
              src={course.cover_image || '/default-course-cover.jpg'}
              alt={course.course_name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col justify-end p-6">
              <h3 className="text-white text-2xl font-bold">{course.course_name}</h3>
              <p className="text-white text-sm mt-2">{course.course_description}</p>
              <div className="flex justify-between items-center mt-3">
                <span className="text-white text-sm">讲师: {course.teacher_name}</span>
                <span className="text-white text-sm">已选人数: {course.enrollment_count}</span>
              </div>
              <Link
                to={`/course/${course.course_id}`}
                className="mt-3 inline-block bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                查看详情
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* 导航点 */}
      {courses.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
          {courses.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* 左右箭头 */}
      {courses.length > 1 && (
        <>
          <button
            className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 text-white p-2 rounded-full hover:bg-opacity-50"
            onClick={() => setCurrentIndex((prevIndex) => (prevIndex - 1 + courses.length) % courses.length)}
            aria-label="Previous slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-30 text-white p-2 rounded-full hover:bg-opacity-50"
            onClick={() => setCurrentIndex((prevIndex) => (prevIndex + 1) % courses.length)}
            aria-label="Next slide"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}
    </div>
  );
} 