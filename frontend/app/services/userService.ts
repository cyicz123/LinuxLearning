import { apiClient } from './apiClient';
import type { User } from '../contexts/AuthContext';

/**
 * 更新用户头像
 * @param userId 用户ID
 * @param avatarUrl 头像URL
 */
export async function updateUserAvatar(userId: number, avatarUrl: string): Promise<void> {
  try {
    await apiClient.put<void>(`users/${userId}`, {
      avatar: avatarUrl
    });
  } catch (error) {
    console.error('更新用户头像失败', error);
    throw new Error('更新用户头像失败，请重试');
  }
}

/**
 * 获取用户详情
 * @param userId 用户ID
 * @returns 用户详情
 */
export async function getUserDetails(userId: number): Promise<User> {
  try {
    return await apiClient.get<User>(`users/${userId}`);
  } catch (error) {
    console.error('获取用户详情失败', error);
    throw new Error('获取用户详情失败，请重试');
  }
}

/**
 * 更新用户信息
 * @param userId 用户ID
 * @param userData 用户数据
 */
export async function updateUserProfile(
  userId: number,
  userData: Partial<User>
): Promise<void> {
  try {
    await apiClient.put<void>(`users/${userId}`, userData);
  } catch (error) {
    console.error('更新用户信息失败', error);
    throw new Error('更新用户信息失败，请重试');
  }
} 