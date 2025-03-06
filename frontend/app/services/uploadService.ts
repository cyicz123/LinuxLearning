import { apiClient } from './apiClient';

export type FileType = 'user_avatar' | 'course_cover' | 'resource';

interface UploadResponse {
  file_id: number;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  created_at: string;
}

/**
 * 上传文件到服务器
 * @param file 要上传的文件
 * @param type 文件类型
 * @param resourceId 资源ID（当type为resource时必填）
 * @returns 上传成功后的文件信息
 */
export async function uploadFile(
  file: File,
  type: FileType,
  resourceId?: number
): Promise<UploadResponse> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('type', type);

  if (type === 'resource' && resourceId) {
    formData.append('resource_id', resourceId.toString());
  }

  try {
    const response = await apiClient.postFormData<UploadResponse>(
      'upload',
      formData
    );
    return response;
  } catch (error) {
    console.error('文件上传失败', error);
    throw new Error('文件上传失败，请重试');
  }
}

/**
 * 根据文件URL创建一个File对象
 * @param dataUrl 文件的Data URL
 * @param filename 文件名
 * @returns 文件对象
 */
export function dataURLtoFile(dataUrl: string, filename: string): File {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

/**
 * 删除已上传的文件
 * @param fileId 文件ID
 */
export async function deleteFile(fileId: number): Promise<void> {
  try {
    await apiClient.delete(`upload/${fileId}`);
  } catch (error) {
    console.error('文件删除失败', error);
    throw new Error('文件删除失败，请重试');
  }
} 