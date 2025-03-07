// 课程类型定义
import { apiClient } from './apiClient';

export interface Course {
  course_id: number;
  course_name: string;
  course_description: string;
  cover_image: string;
  teacher_name: string;
  enrollment_count?: number;
  created_at?: string;
  enrolled_at?: string;
}

// API响应类型
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// 获取热门课程
export async function getPopularCourses(limit: number = 5): Promise<Course[]> {
  try {
    const data = await apiClient.get<{ courses: Course[] }>(`popular-courses?limit=${limit}`, {
      requireAuth: false
    });
    return data.courses;
  } catch (error) {
    console.error('获取热门课程出错:', error);
    return [];
  }
}

// 获取最新课程
export async function getLatestCourses(limit: number = 5): Promise<Course[]> {
  try {
    const data = await apiClient.get<{ courses: Course[] }>(`latest-courses?limit=${limit}`, {
      requireAuth: false
    });
    return data.courses;
  } catch (error) {
    console.error('获取最新课程出错:', error);
    return [];
  }
}

// 获取已选课程
export async function getEnrolledCourses(page: number = 1, limit: number = 10): Promise<{
  courses: Course[];
  total: number;
  page: number;
  limit: number;
}> {
  try {
    return await apiClient.get<{
      courses: Course[];
      total: number;
      page: number;
      limit: number;
    }>(`courses/enrolled?page=${page}&limit=${limit}`);
  } catch (error) {
    console.error('获取已选课程出错:', error);
    return {
      courses: [],
      total: 0,
      page: 1,
      limit: 10
    };
  }
}

// 获取课程列表
export async function getCourses(params: {
  page?: number;
  limit?: number;
  keyword?: string;
  sort_by?: 'created_at' | 'enrollment_count' | 'course_name';
  sort_order?: 'asc' | 'desc';
}): Promise<{
  courses: Course[];
  total: number;
  page: number;
  limit: number;
}> {
  const { page = 1, limit = 10, keyword, sort_by = 'created_at', sort_order = 'desc' } = params;

  try {
    let url = `courses?page=${page}&limit=${limit}`;

    if (keyword) {
      url += `&keyword=${encodeURIComponent(keyword)}`;
    }

    if (sort_by) {
      url += `&sort_by=${sort_by}`;
    }

    if (sort_order) {
      url += `&sort_order=${sort_order}`;
    }

    const response = await apiClient.get<{
      courses: Course[];
      total: number;
      page: number;
      limit: number;
    }>(url, { requireAuth: false });

    return response;
  } catch (error) {
    console.error('获取课程列表出错:', error);
    return {
      courses: [],
      total: 0,
      page: 1,
      limit: 10
    };
  }
} 