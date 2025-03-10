import { apiClient } from './apiClient';

export interface Container {
  container_id: string;
  container_name: string;
  status: 'running' | 'stopped' | 'error';
  image_name: string;
  course_name: string;
  ip_address: string;
  ssh_port: number;
  username: string;
  password: string;
  created_at: string;
}

/**
 * 获取当前学生的容器列表
 * @param courseId 可选的课程ID筛选
 * @returns 容器列表
 */
export const getContainers = async (courseId?: number): Promise<Container[]> => {
  try {
    const url = courseId ? `containers?course_id=${courseId}` : 'containers';
    const response = await apiClient.get<{ containers: Container[] }>(url);
    return response.containers;
  } catch (error) {
    console.error('获取容器列表失败:', error);
    throw error;
  }
};

/**
 * 启动容器
 * @param containerId 容器ID
 * @returns 操作结果
 */
export const startContainer = async (containerId: string): Promise<void> => {
  try {
    await apiClient.post(`containers/${containerId}/start`, {});
  } catch (error) {
    console.error('启动容器失败:', error);
    throw error;
  }
};

/**
 * 停止容器
 * @param containerId 容器ID
 * @returns 操作结果
 */
export const stopContainer = async (containerId: string): Promise<void> => {
  try {
    await apiClient.post(`containers/${containerId}/stop`, {});
  } catch (error) {
    console.error('停止容器失败:', error);
    throw error;
  }
};

/**
 * 重启容器
 * @param containerId 容器ID
 * @returns 操作结果
 */
export const restartContainer = async (containerId: string): Promise<void> => {
  try {
    await apiClient.post(`containers/${containerId}/restart`, {});
  } catch (error) {
    console.error('重启容器失败:', error);
    throw error;
  }
};

/**
 * 删除容器
 * @param containerId 容器ID
 * @returns 操作结果
 */
export const deleteContainer = async (containerId: string): Promise<void> => {
  try {
    await apiClient.delete(`containers/${containerId}`);
  } catch (error) {
    console.error('删除容器失败:', error);
    throw error;
  }
};

/**
 * 创建新容器
 * @param courseId 课程ID
 * @param imageId 镜像ID
 * @returns 新创建的容器信息
 */
export const createContainer = async (courseId: number, imageId: number, container_name: string): Promise<Container> => {
  try {
    const response = await apiClient.post<{ container: Container }>(
      `courses/${courseId}/containers`,
      { image_id: imageId, container_name: container_name }
    );
    return response.container;
  } catch (error) {
    console.error('创建容器失败:', error);
    throw error;
  }
}; 