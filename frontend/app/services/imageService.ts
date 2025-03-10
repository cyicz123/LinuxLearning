import { apiClient } from './apiClient';

export interface Image {
  image_id: number;
  image_name: string;
  image_description: string;
  version: string;
  os_type: 'ubuntu' | 'centos' | 'debian' | 'other';
}

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