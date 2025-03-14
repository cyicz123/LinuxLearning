import { useState, useRef } from 'react';
import { Button } from './ui/button';
import { uploadFile, type FileType } from '../services/uploadService';
import { Image, Upload, X } from 'lucide-react';

interface ImageUploaderProps {
  initialImageUrl?: string;
  onImageUpload: (imageUrl: string) => void;
  fileType: FileType;
  resourceId?: number;
  className?: string;
}

export default function ImageUploader({
  initialImageUrl,
  onImageUpload,
  fileType,
  resourceId,
  className = ''
}: ImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState<string>(initialImageUrl || '');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setError('请上传图片文件');
      return;
    }

    // 验证文件大小（限制为5MB）
    if (file.size > 5 * 1024 * 1024) {
      setError('图片大小不能超过5MB');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      // 创建本地预览
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageUrl(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);

      // 上传到服务器
      const response = await uploadFile(file, fileType, resourceId);

      // 更新图片URL并通知父组件
      setImageUrl(response.file_url);
      onImageUpload(response.file_url);
    } catch (err) {
      console.error('上传图片失败:', err);
      setError('上传图片失败，请重试');
    } finally {
      setIsUploading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    onImageUpload('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {imageUrl ? (
        <div className="relative">
          <img
            src={imageUrl}
            alt="上传预览"
            className="w-full h-auto rounded-md object-cover"
          />
          <button
            type="button"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-black bg-opacity-50 rounded-full p-1 text-white hover:bg-opacity-70 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center cursor-pointer hover:border-gray-400 transition-all"
          onClick={handleUploadClick}
        >
          <Image className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">点击上传图片</p>
          <p className="text-xs text-gray-400 mt-1">支持JPG、PNG格式，最大5MB</p>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      {isUploading && <p className="text-sm text-blue-500">上传中，请稍候...</p>}
    </div>
  );
} 