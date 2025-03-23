import { apiClient } from './apiClient';

export interface Teacher {
  user_id: number;
  username: string;
  email: string;
  phone: string;
  avatar: string;
  bio: string;
  created_at: string;
  course_count: number;
  student_count: number;
}

export interface CreateTeacherData {
  username: string;
  email: string;
  password: string;
  phone?: string;
  bio?: string;
}

export interface TeachersResponse {
  teachers: Teacher[];
  total: number;
}

export interface ImportResponse {
  success_count: number;
  failed_count: number;
}

export interface BatchDeleteResponse {
  total: number;
  success: number;
  failed: number;
  errors?: Array<{
    teacher_id: number;
    error: string;
  }>;
}

export const teacherService = {
  // 获取教师列表
  getTeachers: async (params: {
    page: number;
    limit: number;
    keyword?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<TeachersResponse> => {
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      limit: params.limit.toString(),
      ...(params.keyword && { keyword: params.keyword }),
      ...(params.sort_by && { sort_by: params.sort_by }),
      ...(params.sort_order && { sort_order: params.sort_order })
    });
    return apiClient.get(`admin/teachers?${queryParams}`);
  },

  // 创建教师
  createTeacher: async (data: CreateTeacherData): Promise<Teacher> => {
    return apiClient.post('admin/teachers', data);
  },

  // 批量导入教师
  importTeachers: async (file: File): Promise<ImportResponse> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.postFormData('admin/teachers/batch-import', formData);
  },

  // 删除教师
  deleteTeacher: async (teacherId: number): Promise<void> => {
    return apiClient.delete(`admin/teachers/${teacherId}`);
  },

  // 批量删除教师
  batchDeleteTeachers: async (teacherIds: number[]): Promise<BatchDeleteResponse> => {
    return apiClient.post('admin/teachers/batch-delete', { teacher_ids: teacherIds });
  },

  // 获取教师详情
  getTeacherDetail: async (teacherId: number): Promise<Teacher> => {
    return apiClient.get(`admin/teachers/${teacherId}`);
  },

  // 更新教师信息
  updateTeacher: async (teacherId: number, data: Partial<CreateTeacherData>): Promise<Teacher> => {
    return apiClient.put(`admin/teachers/${teacherId}`, data);
  }
}; 