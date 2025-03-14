import { apiClient } from './apiClient';

// 资源接口
export interface Resource {
  resource_id: number;
  resource_name: string;
  resource_description: string;
  resource_type: 'document' | 'video' | 'archive' | 'other';
  size: number;
  download_url?: string;
  teacher_id?: number;
  teacher_name?: string;
  created_at: string;
  updated_at?: string;
}

// 获取资源列表
export async function getResources(
  page: number = 1,
  limit: number = 10,
  teacherId?: number,
  resourceType?: string
): Promise<{
  resources: Resource[];
  total: number;
  page: number;
  limit: number;
} | null> {
  try {
    let url = `resources?page=${page}&limit=${limit}`;
    if (teacherId) {
      url += `&teacher_id=${teacherId}`;
    }
    if (resourceType) {
      url += `&resource_type=${resourceType}`;
    }

    const response = await apiClient.get<{
      resources: Resource[];
      total: number;
      page: number;
      limit: number;
    }>(url);
    return response;
  } catch (error) {
    console.error('获取资源列表出错:', error);
    return null;
  }
}

// 上传资源
export async function uploadResource(
  formData: FormData
): Promise<{ resource_id: number; resource_path: string } | null> {
  try {
    const response = await apiClient.postFormData<{
      resource_id: number;
      resource_path: string;
    }>('resources', formData);
    return response;
  } catch (error) {
    console.error('上传资源出错:', error);
    return null;
  }
}

// 删除资源
export async function deleteResource(resourceId: number): Promise<boolean> {
  try {
    await apiClient.delete(`resources/${resourceId}`);
    return true;
  } catch (error) {
    console.error('删除资源出错:', error);
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

// 添加资源到课程
export async function addResourcesToCourse(
  courseId: number,
  resourceIds: number[]
): Promise<boolean> {
  try {
    await apiClient.post(`courses/${courseId}/resources`, {
      resource_ids: resourceIds
    });
    return true;
  } catch (error) {
    console.error('添加资源到课程出错:', error);
    return false;
  }
}

// 从课程移除资源
export async function removeResourceFromCourse(
  courseId: number,
  resourceId: number
): Promise<boolean> {
  try {
    await apiClient.delete(`courses/${courseId}/resources/${resourceId}`);
    return true;
  } catch (error) {
    console.error('从课程移除资源出错:', error);
    return false;
  }
}

// 获取可添加到课程的资源列表（教师自己的资源，但不在当前课程中）
export async function getAvailableResourcesForCourse(
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
    }>(`courses/${courseId}/available-resources?page=${page}&limit=${limit}`);
    return response;
  } catch (error) {
    console.error('获取可添加资源列表出错:', error);
    return null;
  }
}

// 批量设置资源可见性
export async function batchSetResourceVisibility(
  resourceIds: number[],
  courseIds: number[],
  action: 'add' | 'remove'
): Promise<{
  success_count: number;
  failed_count: number;
  details: Array<{
    resource_id: number;
    course_id: number;
    success: boolean;
  }>;
} | null> {
  try {
    const response = await apiClient.post<{
      success_count: number;
      failed_count: number;
      details: Array<{
        resource_id: number;
        course_id: number;
        success: boolean;
      }>;
    }>('resources/batch-visibility', {
      resource_ids: resourceIds,
      course_ids: courseIds,
      action
    });
    return response;
  } catch (error) {
    console.error('批量设置资源可见性出错:', error);
    return null;
  }
} 