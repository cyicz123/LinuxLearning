import { apiClient } from './apiClient';

export interface Image {
  image_id: number;
  image_name: string;
  image_description: string;
  version: string;
  os_type: 'ubuntu' | 'centos' | 'debian' | 'other';
  packages?: string[];
  teacher_id?: number;
  teacher_name?: string;
  created_at?: string;
}

/**
 * 获取教师的镜像列表
 * @param params 查询参数
 * @returns 镜像列表及分页信息
 */
export const getTeacherImages = async (params?: {
  page?: number;
  limit?: number;
  os_type?: string;
}): Promise<{
  images: Image[];
  total: number;
  page: number;
  limit: number;
}> => {
  try {
    const { page = 1, limit = 10, os_type } = params || {};
    let url = `images?page=${page}&limit=${limit}&teacher_id=current`;

    if (os_type) {
      url += `&os_type=${os_type}`;
    }

    const response = await apiClient.get<{
      images: Image[];
      total: number;
      page: number;
      limit: number;
    }>(url);
    return response;
  } catch (error) {
    console.error('获取教师镜像列表失败:', error);
    throw error;
  }
};

/**
 * 获取课程可用的镜像列表
 * @param courseId 课程ID
 * @returns 镜像列表
 */
export const getCourseImages = async (courseId: number): Promise<Image[]> => {
  try {
    const response = await apiClient.get<{ images: Image[] }>(
      `courses/${courseId}/images`
    );
    return response.images;
  } catch (error) {
    console.error('获取课程镜像列表失败:', error);
    throw error;
  }
};

/**
 * 创建新镜像
 * @param data 镜像数据
 * @returns 是否成功
 */
export const createImage = async (
  data: {
    image_name: string;
    image_description: string;
    version: string;
    os_type: 'ubuntu' | 'centos' | 'debian' | 'other';
    packages: string[];
  }
): Promise<boolean> => {
  try {
    await apiClient.post('images', data);
    return true;
  } catch (error) {
    console.error('创建镜像失败:', error);
    return false;
  }
};

/**
 * 批量设置镜像可见性
 * @param imageIds 镜像ID数组
 * @param courseIds 课程ID数组
 * @param action 操作类型：'add' 或 'remove'
 * @returns 操作结果
 */
export const batchSetImageVisibility = async (
  imageIds: number[],
  courseIds: number[],
  action: 'add' | 'remove'
): Promise<{
  success_count: number;
  failed_count: number;
  details: Array<{
    image_id: number;
    course_id: number;
    success: boolean;
  }>;
} | null> => {
  try {
    const response = await apiClient.post<{
      success_count: number;
      failed_count: number;
      details: Array<{
        image_id: number;
        course_id: number;
        success: boolean;
      }>;
    }>('images/batch-visibility', {
      image_ids: imageIds,
      course_ids: courseIds,
      action
    });
    return response;
  } catch (error) {
    console.error('批量设置镜像可见性失败:', error);
    return null;
  }
}; 