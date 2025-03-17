import React, { useState, useRef, useCallback } from 'react';
import { Camera, Info, Check, X, Loader, Upload, Film } from 'lucide-react';
import AdviseImage from '@/components/ui/form/AdviseImage';
import { toast } from 'react-toastify';

// Define TypeScript interfaces for props
interface EnhancedImageUploadProps {
  additionalImagePreviews: string[];
  additionalFileTypes: string[];
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  coverImagePreview: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading?: boolean;
  handleDeleteImage?: (index: number) => void;
  isCoverImageUploading?: boolean;
  isAdditionalImageUploading?: number[];
  coverImageProgress?: number;
  additionalImageProgress?: Record<number, number>;
}

const ImageUploadModal: React.FC<EnhancedImageUploadProps> = ({
  additionalImagePreviews,
  additionalFileTypes,
  handleFileUpload,
  coverImagePreview,
  handleImageUpload,
  isUploading = false,
  handleDeleteImage,
  isCoverImageUploading = false,
  isAdditionalImageUploading = [],
  coverImageProgress = 0,
  additionalImageProgress = {}
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);


  const processFileUpload = (e: React.ChangeEvent<HTMLInputElement>, clickedIndex: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      toast.error('حجم الملف كبير جدًا. الحد الأقصى هو 10 ميجابايت');
      return;
    }

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      toast.error('يُرجى اختيار ملف صورة أو فيديو صالح');
      return;
    }

    if (isVideo) {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = function () {
        window.URL.revokeObjectURL(video.src);

        const MAX_VIDEO_DURATION = 60;
        if (video.duration > MAX_VIDEO_DURATION) {
          toast.error(`مدة الفيديو (${Math.round(video.duration)} ثانية) تتجاوز الحد المسموح به (${MAX_VIDEO_DURATION} ثانية)`);
          return;
        }

        continueWithUpload();
      };

      video.onerror = function () {
        window.URL.revokeObjectURL(video.src);
        toast.error('فشل في التحقق من الفيديو، يرجى التأكد من صحة الملف');
      };

      video.src = URL.createObjectURL(file);
      return;
    }

    // بالنسبة للصور، استمر مباشرة
    continueWithUpload();

    function continueWithUpload() {
      let targetIndex;
      if (additionalImagePreviews[clickedIndex]) {
        targetIndex = clickedIndex;
      } else {
        targetIndex = additionalImagePreviews.length;
      }

      // استدعاء دالة التحميل الأصلية مع الفهرس المصحح
      handleFileUpload(e, targetIndex);
    }
  };

  const renderProgressCircle = (percentage: number) => {
    const clampedPercentage = Math.max(0, Math.min(100, Math.round(percentage)));

    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const dashoffset = circumference * (1 - clampedPercentage / 100);

    return (
      <div className="absolute inset-0 flex items-center justify-center z-30 bg-black bg-opacity-40">
        <div className="relative w-20 h-20 flex items-center justify-center">
          {/* Background circle */}
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="rgba(0,0,0,0.5)"
              stroke="#9ca3af" // Gray-400
              strokeWidth="8"
              strokeLinecap="round"
            />
            {/* Progress circle */}
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#e5e7eb" // Gray-200
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 0.2s ease' }}
            />
          </svg>

          {/* Percentage text */}
          <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl">
            {clampedPercentage}%
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="flex items-center justify-center gap-2 text-blue-600 mb-4 text-sm"
      >
        <Info className="w-4 h-4" />
        نصائح لالتقاط صور جيدة
      </button>

      {/* Image Upload Section */}
      <div className="grid grid-cols-4 gap-2">
        {/* Cover Image Upload Box */}
        <div className="relative col-span-1 border border-gray-300 rounded-lg h-32 flex flex-col items-center justify-center bg-gray-50 overflow-hidden">
          <div className="absolute top-0 right-0 bg-black text-white text-xs px-2 py-1 rounded-bl-lg z-10">
            صورة الغلاف
          </div>

          {/* Upload indicator - show loading spinner or progress */}
          {isCoverImageUploading && (
            coverImageProgress > 0 ?
              renderProgressCircle(coverImageProgress) :
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-30">
                <Loader className="w-8 h-8 text-white animate-spin" />
              </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            disabled={isUploading}
          />

          {coverImagePreview ? (
            <img
              src={coverImagePreview}
              alt="Cover preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                // If image fails to load, show placeholder
                (e.target as HTMLImageElement).src = "/api/placeholder/128/96";
                (e.target as HTMLImageElement).alt = "صورة غير متوفرة";
              }}
            />
          ) : (
            <>
              <div className="relative">
                <Camera className="text-blue-500 w-8 h-8" />
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full border border-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Additional Image Upload Boxes */}
        {Array.from({ length: 30 }).map((_, index) => (
          <div
            key={index}
            className="relative col-span-1 border border-gray-300 rounded-lg h-32 flex flex-col items-center justify-center bg-gray-50 overflow-hidden"
          >
            {/* Upload indicator - show progress or spinner */}
            {isAdditionalImageUploading.includes(index) && (
              additionalImageProgress && additionalImageProgress[index] > 0 ?
                renderProgressCircle(additionalImageProgress[index]) :
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-30">
                  <Loader className="w-8 h-8 text-white animate-spin" />
                </div>
            )}

            <input
              type="file"
              accept="image/*, video/*"
              onChange={(e) => processFileUpload(e, index)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              disabled={isUploading}
            />

            {additionalImagePreviews[index] ? (
              <>
                {/* Delete button */}
                {handleDeleteImage && (
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(index)}
                    className="absolute top-1 right-1 z-20 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {additionalFileTypes[index]?.startsWith('video/') ? (
                  <div className="relative w-full h-full">
                    <video
                      src={additionalImagePreviews[index]}
                      className="w-full h-full object-cover"
                      controls={false}
                      muted
                      onMouseOver={(e) => (e.target as HTMLVideoElement).play()}
                      onMouseOut={(e) => (e.target as HTMLVideoElement).pause()}
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <Film className="w-8 h-8 text-white bg-black bg-opacity-50 rounded-full p-1.5" />
                    </div>
                    <div className="absolute bottom-1 right-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                      فيديو
                    </div>
                  </div>
                ) : (
                  <img
                    src={additionalImagePreviews[index]}
                    alt={`File ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // If image fails to load, show placeholder
                      (e.target as HTMLImageElement).src = "/api/placeholder/128/96";
                      (e.target as HTMLImageElement).alt = "صورة غير متوفرة";
                    }}
                  />
                )}
              </>
            ) : (
              <>
                <div className="relative">
                  <Camera className="text-blue-500 w-8 h-8" />
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full border border-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="text-xs text-gray-500 mt-2 space-y-1">
        <p>يمكنك تحميل صورة واحدة للغلاف وحتى 30 صورة أو فيديو إضافية للعقار.</p>
        <p>سيتم رفع الملفات تلقائياً إلى الخادم عند اختيارها. حجم الصورة الأقصى: 5 ميجابايت، حجم الفيديو الأقصى: 10 ميجابايت (مدة أقصاها 30 ثانية).</p>
      </div>

      {/* Modal */}
      {isModalOpen &&
        <AdviseImage isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
      }
    </>
  );
};

export default ImageUploadModal;