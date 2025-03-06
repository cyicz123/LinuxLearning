import { useState } from 'react';
import ImageUploader from './ImageUploader';
import ImageCropper from './ImageCropper';
import { uploadFile, dataURLtoFile } from '../services/uploadService';
import { useAuth } from '../contexts/AuthContext';

interface AvatarUploaderProps {
  currentAvatar?: string;
  onAvatarUpdated?: (avatarUrl: string) => void;
  size?: number; // 头像组件大小，单位：像素
}

export default function AvatarUploader({
  currentAvatar,
  onAvatarUpdated,
  size = 120
}: AvatarUploaderProps) {
  const { user, login } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelected = (imageData: string) => {
    setSelectedImage(imageData);
    setShowCropper(true);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setSelectedImage(null);
  };

  const handleCropComplete = async (croppedImage: string) => {
    try {
      setIsUploading(true);
      setError(null);

      // 将Base64图片转换为File对象
      const file = dataURLtoFile(croppedImage, `avatar_${Date.now()}.jpg`);

      // 上传头像
      const uploadResponse = await uploadFile(file, 'user_avatar');

      // 更新用户信息
      if (user) {
        // 创建更新后的用户对象
        const updatedUser = {
          ...user,
          avatar: uploadResponse.file_url
        };

        // 更新本地存储和认证上下文
        localStorage.setItem('user', JSON.stringify(updatedUser));
        login(localStorage.getItem('token') || '', updatedUser);

        // 通知父组件头像已更新
        if (onAvatarUpdated) {
          onAvatarUpdated(uploadResponse.file_url);
        }
      }

      // 关闭裁剪器
      setShowCropper(false);
      setSelectedImage(null);
    } catch (error) {
      console.error('头像上传失败', error);
      setError('头像上传失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col items-center">
        <div style={{ width: size, height: size }}>
          <ImageUploader
            currentImage={currentAvatar}
            onImageSelected={handleImageSelected}
            shape="circle"
            maxSize={5000} // 5MB
          />
        </div>

        <p className="text-xs text-gray-500 mt-2">
          点击上传头像，支持JPG、PNG、GIF格式，最大5MB
        </p>

        {error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}

        {isUploading && (
          <div className="mt-2 flex items-center justify-center">
            <svg className="animate-spin h-5 w-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span className="ml-2 text-sm text-gray-600">正在上传...</span>
          </div>
        )}
      </div>

      {showCropper && selectedImage && (
        <ImageCropper
          image={selectedImage}
          aspectRatio={1} // 1:1 正方形头像
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
} 