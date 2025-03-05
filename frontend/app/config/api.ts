// API基础URL配置
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

// API版本
export const API_VERSION = 'v1';

// 完整的API基础路径
export const API_BASE_PATH = `${API_BASE_URL}/api/${API_VERSION}`;

// 构建完整的API URL
export function buildApiUrl(endpoint: string): string {
  return `${API_BASE_PATH}/${endpoint.replace(/^\//, '')}`;
} 