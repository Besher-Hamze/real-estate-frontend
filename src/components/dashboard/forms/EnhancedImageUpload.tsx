import React, { useState } from 'react';
import { Camera, Info, Check, X } from 'lucide-react';

// Define TypeScript interfaces for props
interface EnhancedImageUploadProps {
  additionalImagePreviews: string[];
  additionalFileTypes: string[];
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>, index: number) => void;
  coverImagePreview: string | null;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ImageUploadModal: React.FC<EnhancedImageUploadProps> = ({
  additionalImagePreviews,
  additionalFileTypes,
  handleFileUpload,
  coverImagePreview,
  handleImageUpload
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
            
          />

          {coverImagePreview ? (
            <img
              src={coverImagePreview}
              alt="Cover preview"
              className="w-full h-full object-cover"
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
            <input
              type="file"
              accept="image/* , video/*"
              onChange={(e) => handleFileUpload(e, index)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />

            {additionalImagePreviews[index] ? (
              additionalFileTypes[index]?.startsWith('video/') ? (
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="bg-black bg-opacity-50 rounded-full p-1">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </div>
                </div>
              ) : (
                <img
                  src={additionalImagePreviews[index]}
                  alt={`File ${index + 1}`}
                  className="w-full h-full object-cover cursor-move"
                />
              )
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
      <p className="text-xs text-gray-500 mt-2">يمكنك تحميل صورة واحدة للغلاف وحتى 30 صور إضافية للعقار</p>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
            {/* Modal Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-5 h-5 text-blue-500" />
                <h3 className="font-medium text-lg">نصائح لالتقاط صور جيدة</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 text-right">
              <p className="text-gray-600 mb-4">
                فيما يلي بعض النصائح للمساعدة في جعل إعلاناتك أكثر جاذبية عن طريق تحميل صور عالية الجودة.
              </p>

              {/* Tip 1 - Zoom */}
              <div className="mb-6">
                <h4 className="font-semibold text-lg mb-2">التكبير</h4>
                <p className="text-gray-600 mb-3">
                  اقترب من المنتج أو قم بالابتعاد عنه وضبط إطار العدسة به لتزويد المشترين المحتملين برؤية واضحة للتفاصيل. تجنب تكبير أو قص الصورة بطريقة غير صحيحة الذي قد ينتج عنه صورة مشوهة أو غير واضحة.
                </p>
                <div className="flex gap-4 justify-center">
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-24 border border-red-200 rounded overflow-hidden mb-2">
                      <X className="absolute top-1 right-1 w-6 h-6 text-red-500 bg-white rounded-full p-1" />
                      <img src="/api/placeholder/128/96" alt="مثال سيء" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs text-red-500">غير صحيح</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-24 border border-green-200 rounded overflow-hidden mb-2">
                      <Check className="absolute top-1 right-1 w-6 h-6 text-green-500 bg-white rounded-full p-1" />
                      <img src="/api/placeholder/128/96" alt="مثال جيد" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs text-green-500">صحيح</span>
                  </div>
                </div>
              </div>

              {/* Tip 2 - Lighting */}
              <div className="mb-6">
                <h4 className="font-semibold text-lg mb-2">استخدم الإضاءة الجيدة</h4>
                <p className="text-gray-600 mb-3">
                  الإضاءة الجيدة ضرورية لالتقاط صور جذابة. استخدم الضوء الطبيعي كلما أمكن ذلك بالتصوير بالقرب من النافذة أو بالخارج أثناء النهار. إذا كنت تقوم بالتصوير في الداخل, فكر في استخدام مصادر الإضاءة الناعمة والمنتشرة مثل المصابيح أو صناديق الإضاءة لتجنب الظلال.
                </p>
                <div className="flex gap-4 justify-center">
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-24 border border-red-200 rounded overflow-hidden mb-2">
                      <X className="absolute top-1 right-1 w-6 h-6 text-red-500 bg-white rounded-full p-1" />
                      <img src="/api/placeholder/128/96" alt="إضاءة سيئة" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs text-red-500">إضاءة سيئة</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <div className="relative w-32 h-24 border border-green-200 rounded overflow-hidden mb-2">
                      <Check className="absolute top-1 right-1 w-6 h-6 text-green-500 bg-white rounded-full p-1" />
                      <img src="/api/placeholder/128/96" alt="إضاءة جيدة" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-xs text-green-500">إضاءة جيدة</span>
                  </div>
                </div>
              </div>

              {/* Tip 3 - Multiple Angles */}
              <div className="mb-6">
                <h4 className="font-semibold text-lg mb-2">زوايا متعددة</h4>
                <p className="text-gray-600 mb-3">
                  التقط صوراً للعقار من زوايا مختلفة لإظهار جميع التفاصيل المهمة. قم بتصوير الغرف من الزوايا المختلفة، والتقط صوراً للمميزات الفريدة مثل النوافذ الكبيرة أو التشطيبات عالية الجودة.
                </p>
              </div>

              {/* Modal Footer */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  فهمت
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageUploadModal;