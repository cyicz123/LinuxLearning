import { useState, useRef } from 'react';
import Cropper from 'react-cropper';
import 'cropperjs/dist/cropper.css';

interface ImageCropperProps {
  image: string;
  aspectRatio: number;
  onCropComplete: (croppedImage: string) => void;
  onCancel: () => void;
}

export default function ImageCropper({
  image,
  aspectRatio,
  onCropComplete,
  onCancel
}: ImageCropperProps) {
  const cropperRef = useRef<Cropper>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCrop = () => {
    if (cropperRef.current && typeof cropperRef.current.getCroppedCanvas === 'function') {
      setIsLoading(true);
      try {
        const croppedCanvas = cropperRef.current.getCroppedCanvas({
          minWidth: 256,
          minHeight: 256,
          maxWidth: 4096,
          maxHeight: 4096,
          fillColor: '#fff',
          imageSmoothingEnabled: true,
          imageSmoothingQuality: 'high',
        });

        const croppedImage = croppedCanvas.toDataURL('image/jpeg', 0.85);
        onCropComplete(croppedImage);
      } catch (error) {
        console.error('Error cropping image', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="p-4 border-b">
          <h3 className="text-lg font-medium">裁剪图片</h3>
          <p className="text-sm text-gray-500 mt-1">调整图片大小和位置，然后点击确认</p>
        </div>

        <div className="flex-grow overflow-hidden p-4">
          <Cropper
            ref={cropperRef}
            src={image}
            style={{ height: 400, width: '100%' }}
            aspectRatio={aspectRatio}
            guides={true}
            viewMode={1}
            dragMode="move"
            background={false}
            responsive={true}
            autoCropArea={1}
            checkOrientation={false}
          />
        </div>

        <div className="p-4 border-t flex justify-end space-x-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium hover:bg-gray-50"
            disabled={isLoading}
          >
            取消
          </button>
          <button
            onClick={handleCrop}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                处理中...
              </span>
            ) : '确认裁剪'}
          </button>
        </div>
      </div>
    </div>
  );
} 