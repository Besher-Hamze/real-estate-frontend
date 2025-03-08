import React, { useState } from "react";
import { Camera } from "lucide-react";
import { FormField } from "@/components/ui/form/FormField";

interface ImageUploaderProps {
  onCoverImageChange: (file: File) => void;
  onAdditionalImagesChange: (files: File[]) => void;
  existingImages?: string[];
}

export default function ImageUploader({
  onCoverImageChange,
  onAdditionalImagesChange,
  existingImages = []
}: ImageUploaderProps) {
  const [previewImages, setPreviewImages] = useState<string[]>(existingImages);
  const [coverImage, setCoverImage] = useState<string | null>(null);

  const handleCoverImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCoverImageChange(file);
      setCoverImage(URL.createObjectURL(file));
    }
  };

  const handleAdditionalImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      onAdditionalImagesChange(files);
      
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviewImages(prev => [...prev, ...newPreviews]);
    }
  };

  return (
    <div className="space-y-4">
      <FormField label="صور العقار">
        <div className="grid grid-cols-4 gap-2">
          {/* Cover Image Upload Box */}
          <div className="relative col-span-1 border-2 border-dashed rounded-lg h-32 flex flex-col items-center justify-center bg-gray-50">
            <div className="absolute top-0 right-0 bg-black text-white text-xs px-2 py-1 rounded-bl-lg">
              صورة الغلاف
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleCoverImageUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              required
            />
            {coverImage ? (
              <img 
                src={coverImage} 
                alt="Cover preview" 
                className="w-full h-full object-cover rounded-lg" 
              />
            ) : (
              <Camera className="text-blue-500 w-8 h-8" />
            )}
          </div>

          {/* Additional Image Upload Boxes */}
          {Array.from({ length: 7 }).map((_, index) => (
            <div 
              key={index} 
              className="relative col-span-1 border-2 border-dashed rounded-lg h-32 flex items-center justify-center bg-gray-50"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleAdditionalImagesUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {previewImages[index] ? (
                <img 
                  src={previewImages[index]} 
                  alt={`Preview ${index}`} 
                  className="w-full h-full object-cover rounded-lg" 
                />
              ) : (
                <Camera className="text-blue-500 w-8 h-8" />
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">يمكنك تحميل صورة واحدة للغلاف و حتى 7 صور إضافية للعقار</p>
      </FormField>
    </div>
  );
}