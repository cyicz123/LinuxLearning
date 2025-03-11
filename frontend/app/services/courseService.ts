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

// 课程详情接口
export interface CourseDetail {
  course_id: number;
  course_name: string;
  course_description: string;
  cover_image: string;
  teacher_id: number;
  teacher_name: string;
  enrollment_count: number;
  is_enrolled: boolean;
  created_at: string;
  updated_at: string;
}

// 课程通知接口
export interface Notification {
  notification_id: number;
  title: string;
  content: string;
  teacher_name: string;
  created_at: string;
  updated_at: string;
}

// 课程资源接口
export interface Resource {
  resource_id: number;
  resource_name: string;
  resource_description: string;
  resource_type: 'document' | 'video' | 'archive' | 'other';
  size: number;
  download_url: string;
  created_at: string;
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

// 获取教师课程列表
export async function getTeacherCourses(params: {
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
    let url = `courses?page=${page}&limit=${limit}&teacher_id=current`;

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
    }>(url);

    return response;
  } catch (error) {
    console.error('获取教师课程列表出错:', error);
    return {
      courses: [],
      total: 0,
      page: 1,
      limit: 10
    };
  }
}

// 创建新课程
export async function createCourse(courseData: {
  course_name: string;
  course_description: string;
  cover_image: string;
}): Promise<number | null> {
  try {
    const response = await apiClient.post<{ course_id: number }>('courses', courseData);
    return response.course_id;
  } catch (error) {
    console.error('创建课程失败:', error);
    return null;
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

// 获取课程详情
export async function getCourseDetail(courseId: number): Promise<CourseDetail | null> {
  try {
    const response = await apiClient.get<CourseDetail>(`courses/${courseId}`);
    return response;
  } catch (error) {
    console.error('获取课程详情出错:', error);
    return null;
  }
}

// 获取课程通知列表
export async function getCourseNotifications(
  courseId: number,
  page: number = 1,
  limit: number = 5
): Promise<{
  notifications: Notification[];
  total: number;
  page: number;
  limit: number;
} | null> {
  try {
    const response = await apiClient.get<{
      notifications: Notification[];
      total: number;
      page: number;
      limit: number;
    }>(`courses/${courseId}/notifications?page=${page}&limit=${limit}`);
    return response;
  } catch (error) {
    console.error('获取课程通知列表出错:', error);
    return null;
  }
}

// 选课
export async function enrollCourse(courseId: number): Promise<boolean> {
  try {
    await apiClient.post(`courses/${courseId}/enroll`, {});
    return true;
  } catch (error) {
    console.error('选课失败:', error);
    return false;
  }
}

// 退课
export async function unenrollCourse(courseId: number): Promise<boolean> {
  try {
    await apiClient.post(`courses/${courseId}/unenroll`, {});
    return true;
  } catch (error) {
    console.error('退课失败:', error);
    return false;
  }
}

// 获取课程资源列表
export async function getCourseResources(
  courseId: number,
  page: number = 1,
  limit: number = 10
): Promise<{
  resources: Resource[];
  total: number;
  page: number;
  limit: number;
} | null> {
  try {
    const response = await apiClient.get<{
      resources: Resource[];
      total: number;
      page: number;
      limit: number;
    }>(`courses/${courseId}/resources?page=${page}&limit=${limit}`);
    return response;
  } catch (error) {
    console.error('获取课程资源列表出错:', error);
    return null;
  }
} 