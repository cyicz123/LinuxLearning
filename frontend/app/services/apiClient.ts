import { buildApiUrl } from '../config/api';

// 请求选项接口
interface RequestOptions extends RequestInit {
  requireAuth?: boolean;
}

// API响应类型
interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

// API客户端
export const apiClient = {
  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { requireAuth = true, ...fetchOptions } = options;
    const url = buildApiUrl(endpoint);

    // 默认请求头
    const headers = new Headers(fetchOptions.headers);
    headers.set('Content-Type', 'application/json');

    // 如果需要认证，添加token
    if (requireAuth) {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const responseData: ApiResponse<T> = await response.json();

    // 检查API响应状态码
    if (responseData.code !== 200) {
      throw new Error(responseData.message || '请求失败');
    }

    return responseData.data;
  },

  // GET请求
  get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  },

  // POST请求
  post<T>(endpoint: string, data: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // PUT请求
  put<T>(endpoint: string, data: any, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // DELETE请求
  delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE'
    });
  }
}; 