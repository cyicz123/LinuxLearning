import { apiClient } from './apiClient';

export interface Container {
  container_id: string;
  container_name: string;
  status: 'running' | 'stopped' | 'error';
  image_name: string;
  image_id: number;
}

export interface StudentContainerStats {
  total_containers: number;
  running_containers: number;
  stopped_containers: number;
  error_containers: number;
  containers: Container[];
}

export interface Student {
  user_id: number;
  username: string;
  email: string;
  avatar?: string;
  enrolled_at: string;
  containers_stats: StudentContainerStats;
}

// 为了兼容现有代码，添加别名
export type CourseStudent = Student;
export type StudentContainersStats = StudentContainerStats;
export type StudentContainer = Container;

interface GetCourseStudentsParams {
  page?: number;
  limit?: number;
  keyword?: string;
  sort_by?: 'enrolled_at' | 'username' | 'total_containers' | 'running_containers';
  sort_order?: 'asc' | 'desc';
}

/**
 * 获取课程学生列表
 * @param courseId 课程ID
 * @param params 查询参数
 * @returns 学生列表及分页信息
 */
export const getCourseStudents = async (
  courseId: number,
  params: GetCourseStudentsParams = {}
): Promise<{
  students: Student[];
  total: number;
  page: number;
  limit: number;
} | null> => {
  const { page = 1, limit = 10, keyword, sort_by = 'enrolled_at', sort_order = 'desc' } = params;

  try {
    let url = `courses/${courseId}/students?page=${page}&limit=${limit}`;

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
      students: Student[];
      total: number;
      page: number;
      limit: number;
    }>(url);

    return response;
  } catch (error) {
    console.error('获取课程学生列表失败:', error);
    return null;
  }
};

/**
 * 批量导入学生到课程
 * @param courseId 课程ID
 * @param studentIds 学生ID数组
 * @returns 是否成功
 */
export const addStudentsToCourse = async (
  courseId: number,
  studentIds: number[]
): Promise<boolean> => {
  try {
    await apiClient.post(`courses/${courseId}/students/batch`, {
      student_ids: studentIds
    });
    return true;
  } catch (error) {
    console.error('批量导入学生失败:', error);
    return false;
  }
};

/**
 * 从课程中移除学生
 * @param courseId 课程ID
 * @param studentId 学生ID
 * @returns 是否成功
 */
export const removeStudentFromCourse = async (
  courseId: number,
  studentId: number
): Promise<boolean> => {
  try {
    await apiClient.delete(`courses/${courseId}/students/${studentId}`);
    return true;
  } catch (error) {
    console.error('从课程移除学生失败:', error);
    return false;
  }
};

/**
 * 从课程中批量移除学生
 * @param courseId 课程ID
 * @param studentIds 学生ID数组
 * @returns 是否成功
 */
export const batchRemoveStudentsFromCourse = async (
  courseId: number,
  studentIds: number[]
): Promise<boolean> => {
  try {
    await apiClient.post(`courses/${courseId}/students/batch-remove`, {
      student_ids: studentIds
    });
    return true;
  } catch (error) {
    console.error('批量移除学生失败:', error);
    return false;
  }
};

/**
 * 为学生创建容器
 * @param courseId 课程ID
 * @param studentId 学生ID
 * @param data 容器数据
 * @returns 是否成功
 */
export const createStudentContainer = async (
  courseId: number,
  studentId: number,
  data: {
    image_id: number;
    container_name: string;
  }
): Promise<boolean> => {
  try {
    await apiClient.post(`courses/${courseId}/students/${studentId}/containers`, data);
    return true;
  } catch (error) {
    console.error('创建学生容器失败:', error);
    return false;
  }
};

/**
 * 更新学生容器
 * @param containerId 容器ID
 * @param data 更新数据
 * @returns 是否成功
 */
export const updateStudentContainer = async (
  containerId: string,
  data: {
    container_name?: string;
    image_id?: number;
  }
): Promise<boolean> => {
  try {
    await apiClient.put(`containers/${containerId}`, data);
    return true;
  } catch (error) {
    console.error('更新学生容器失败:', error);
    return false;
  }
};

/**
 * 删除学生容器
 * @param containerId 容器ID
 * @returns 是否成功
 */
export const deleteStudentContainer = async (containerId: string): Promise<boolean> => {
  try {
    await apiClient.delete(`containers/${containerId}`);
    return true;
  } catch (error) {
    console.error('删除学生容器失败:', error);
    return false;
  }
};

/**
 * 启动学生容器
 * @param containerId 容器ID
 * @returns 是否成功
 */
export const startStudentContainer = async (containerId: string): Promise<boolean> => {
  try {
    await apiClient.post(`containers/${containerId}/start`, {});
    return true;
  } catch (error) {
    console.error('启动学生容器失败:', error);
    return false;
  }
};

/**
 * 停止学生容器
 * @param containerId 容器ID
 * @returns 是否成功
 */
export const stopStudentContainer = async (containerId: string): Promise<boolean> => {
  try {
    await apiClient.post(`containers/${containerId}/stop`, {});
    return true;
  } catch (error) {
    console.error('停止学生容器失败:', error);
    return false;
  }
};

/**
 * 重启学生容器
 * @param containerId 容器ID
 * @returns 是否成功
 */
export const restartStudentContainer = async (containerId: string): Promise<boolean> => {
  try {
    await apiClient.post(`containers/${containerId}/restart`, {});
    return true;
  } catch (error) {
    console.error('重启学生容器失败:', error);
    return false;
  }
};