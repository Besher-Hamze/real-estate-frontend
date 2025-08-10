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
  handleMultipleFileUpload?: (files: FileList) => void;
  isUploading?: boolean;
  handleDeleteImage?: (index: number) => void;
  handleDeleteCoverImage?: () => void;
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
  handleMultipleFileUpload,
  isUploading = false,
  handleDeleteImage,
  handleDeleteCoverImage,
  isCoverImageUploading = false,
  isAdditionalImageUploading = [],
  coverImageProgress = 0,
  additionalImageProgress = {}
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return { isValid: false, error: 'حجم الملف كبير جدًا. الحد الأقصى هو 10 ميجابايت' };
    }

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    if (!isImage && !isVideo) {
      return { isValid: false, error: 'يُرجى اختيار ملف صورة أو فيديو صالح' };
    }

    return { isValid: true };
  };

  const validateVideo = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = function () {
        window.URL.revokeObjectURL(video.src);
        const MAX_VIDEO_DURATION = 60;
        if (video.duration > MAX_VIDEO_DURATION) {
          toast.error(`مدة الفيديو (${Math.round(video.duration)} ثانية) تتجاوز الحد المسموح به (${MAX_VIDEO_DURATION} ثانية)`);
          resolve(false);
        } else {
          resolve(true);
        }
      };

      video.onerror = function () {
        window.URL.revokeObjectURL(video.src);
        toast.error('فشل في التحقق من الفيديو، يرجى التأكد من صحة الملف');
        resolve(false);
      };

      video.src = URL.createObjectURL(file);
    });
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length === 1) {
      // Single file for cover
      const file = files[0];
      const validation = validateFile(file);

      if (!validation.isValid) {
        toast.error(validation.error);
        return;
      }

      if (file.type.startsWith('video/')) {
        const isValidVideo = await validateVideo(file);
        if (!isValidVideo) return;
      }

      handleImageUpload(e);
    } else {
      // Multiple files - use handleMultipleFileUpload if available
      if (handleMultipleFileUpload) {
        handleMultipleFileUpload(files);
      } else {
        // Fallback: first file as cover, rest as additional
        const validFiles: File[] = [];

        for (const file of Array.from(files)) {
          const validation = validateFile(file);
          if (!validation.isValid) {
            toast.error(validation.error);
            continue;
          }

          if (file.type.startsWith('video/')) {
            const isValidVideo = await validateVideo(file);
            if (!isValidVideo) continue;
          }

          validFiles.push(file);
        }

        if (validFiles.length > 0) {
          // Set first file as cover
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(validFiles[0]);
          const coverEvent = {
            ...e,
            target: { ...e.target, files: dataTransfer.files }
          } as React.ChangeEvent<HTMLInputElement>;
          handleImageUpload(coverEvent);

          // Set remaining files as additional images
          for (let i = 1; i < validFiles.length; i++) {
            const additionalDataTransfer = new DataTransfer();
            additionalDataTransfer.items.add(validFiles[i]);
            const additionalEvent = {
              ...e,
              target: { ...e.target, files: additionalDataTransfer.files }
            } as React.ChangeEvent<HTMLInputElement>;
            handleFileUpload(additionalEvent, i - 1);
          }
        }
      }
    }

    // Clear the input
    e.target.value = '';
  };

  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, clickedIndex: number) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (files.length === 1) {
      // Single file
      const file = files[0];
      const validation = validateFile(file);

      if (!validation.isValid) {
        toast.error(validation.error);
        return;
      }

      if (file.type.startsWith('video/')) {
        const isValidVideo = await validateVideo(file);
        if (!isValidVideo) return;
      }

      handleFileUpload(e, clickedIndex);
    } else {
      // Multiple files
      if (handleMultipleFileUpload) {
        handleMultipleFileUpload(files);
      } else {
        // Process each file individually
        const validFiles: File[] = [];

        for (const file of Array.from(files)) {
          const validation = validateFile(file);
          if (!validation.isValid) {
            toast.error(validation.error);
            continue;
          }

          if (file.type.startsWith('video/')) {
            const isValidVideo = await validateVideo(file);
            if (!isValidVideo) continue;
          }

          validFiles.push(file);
        }

        // Process valid files
        for (let i = 0; i < validFiles.length; i++) {
          const targetIndex = clickedIndex + i;
          if (targetIndex < 30) { // Max 30 additional images
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(validFiles[i]);
            const newEvent = {
              ...e,
              target: { ...e.target, files: dataTransfer.files }
            } as React.ChangeEvent<HTMLInputElement>;
            handleFileUpload(newEvent, targetIndex);
          }
        }
      }
    }

    // Clear the input
    e.target.value = '';
  };

  const renderProgressCircle = (percentage: number) => {
    const clampedPercentage = Math.max(0, Math.min(100, Math.round(percentage)));
    const radius = 40;
    const circumference = 2 * Math.PI * radius;
    const dashoffset = circumference * (1 - clampedPercentage / 100);

    return (
      <div className="absolute inset-0 flex items-center justify-center z-30 bg-black bg-opacity-40">
        <div className="relative w-20 h-20 flex items-center justify-center">
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="rgba(0,0,0,0.5)"
              stroke="#9ca3af"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke="#e5e7eb"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashoffset}
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dashoffset 0.2s ease' }}
            />
          </svg>
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

          {/* Upload indicator */}
          {isCoverImageUploading && (
            coverImageProgress > 0 ?
              renderProgressCircle(coverImageProgress) :
              <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-30">
                <Loader className="w-8 h-8 text-white animate-spin" />
              </div>
          )}

          {/* Delete button for cover image */}
          {coverImagePreview && handleDeleteCoverImage && (
            <button
              type="button"
              onClick={handleDeleteCoverImage}
              className="absolute top-1 left-1 z-20 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
              disabled={isUploading}
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <input
            type="file"
            accept="image/*, video/*"
            multiple
            onChange={handleCoverImageUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            disabled={isUploading}
          />

          {coverImagePreview ? (
            <img
              src={coverImagePreview}
              alt="Cover preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/api/placeholder/128/96";
                (e.target as HTMLImageElement).alt = "صورة غير متوفرة";
              }}
            />
          ) : (
            <div className="text-center">
              <div className="relative mb-2">
                <Camera className="text-blue-500 w-8 h-8 mx-auto" />
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full border border-blue-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>
              </div>
              <div className="text-xs text-center text-gray-500 px-1">
                اختر عدة صور<br />الأولى للغلاف
              </div>
            </div>
          )}
        </div>

        {/* Additional Image Upload Boxes */}
        {Array.from({ length: 30 }).map((_, index) => (
          <div
            key={index}
            className="relative col-span-1 border border-gray-300 rounded-lg h-32 flex flex-col items-center justify-center bg-gray-50 overflow-hidden"
          >
            {/* Upload indicator */}
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
              multiple
              onChange={(e) => handleAdditionalImageUpload(e, index)}
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
                      (e.target as HTMLImageElement).src = "/api/placeholder/128/96";
                      (e.target as HTMLImageElement).alt = "صورة غير متوفرة";
                    }}
                  />
                )}
              </>
            ) : (
              <div className="text-center">
                <div className="relative mb-2">
                  <Camera className="text-blue-500 w-8 h-8 mx-auto" />
                  <div className="absolute -bottom-1 -right-1 bg-white rounded-full border border-blue-500">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </div>
                </div>
                <div className="text-xs text-center text-gray-500 px-1">
                  اختر عدة صور
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-xs text-gray-500 mt-2 space-y-1">
        <p>يمكنك تحميل صورة واحدة للغلاف وحتى 30 صورة أو فيديو إضافية للعقار.</p>
        <p className="font-medium text-blue-600">💡 نصيحة: اختر عدة صور معاً - الأولى ستكون صورة الغلاف والباقي صور إضافية</p>
        <p>سيتم رفع الملفات تلقائياً إلى الخادم عند اختيارها. حجم الصورة الأقصى: 5 ميجابايت، حجم الفيديو الأقصى: 10 ميجابايت (مدة أقصاها 60 ثانية).</p>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <AdviseImage isModalOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
      )}
    </>
  );
};

export default ImageUploadModal;