import { useState, useRef } from 'react';

interface ImageUploaderProps {
  currentImage?: string;
  onImageSelected: (imageData: string) => void;
  aspectRatio?: number;
  shape?: 'square' | 'circle';
  maxSize?: number; // 单位：KB
  width?: string | number;
  height?: string | number;
}

export default function ImageUploader({
  currentImage,
  onImageSelected,
  aspectRatio = 1,
  shape = 'circle',
  maxSize = 5000, // 默认5MB
  width = '100%',
  height = '100%'
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件
    if (!validateFile(file, maxSize)) return;

    // 创建预览
    const reader = new FileReader();
    reader.onload = () => {
      const imageData = reader.result as string;
      setPreview(imageData);
      onImageSelected(imageData);
    };
    reader.readAsDataURL(file);
  };

  const validateFile = (file: File, maxSizeKB: number): boolean => {
    // 验证文件类型
    if (!file.type.match(/image\/(jpeg|png|gif|webp|svg\+xml)/)) {
      setError('请上传图片文件 (JPEG, PNG, GIF, WEBP, SVG)');
      return false;
    }

    // 验证文件大小
    if (file.size > maxSizeKB * 1024) {
      setError(`图片大小不能超过 ${maxSizeKB / 1000} MB`);
      return false;
    }

    setError(null);
    return true;
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="relative" style={{ width, height }}>
      {/* 隐藏的文件输入 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
        className="hidden"
      />

      {/* 图片预览/上传区域 */}
      <div
        className={`
          ${shape === 'circle' ? 'rounded-full' : 'rounded-md'}
          overflow-hidden relative cursor-pointer
          border-2 border-dashed border-gray-300 hover:border-indigo-500
          transition-colors duration-300 w-full h-full
        `}
        style={{ aspectRatio: aspectRatio }}
        onClick={triggerFileInput}
      >
        {preview ? (
          <img
            src={preview}
            alt="预览图"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-2">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-xs text-gray-500 text-center mt-1">
              点击上传图片
            </span>
          </div>
        )}

        {/* 悬停覆盖层 */}
        <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {preview ? '更换图片' : '上传图片'}
          </span>
        </div>
      </div>

      {/* 错误信息 */}
      {error && (
        <p className="text-red-500 text-xs mt-2">{error}</p>
      )}
    </div>
  );
} 