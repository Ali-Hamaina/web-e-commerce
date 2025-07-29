import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { PhotoIcon, XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { uploadService } from '../services/uploadService';
import toast from 'react-hot-toast';

interface ImageUploadProps {
  value?: string;
  onChange: (imageUrl: string) => void;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ value, onChange, className = '' }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('يرجى اختيار ملف صورة صحيح');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
      return;
    }

    setUploading(true);
    try {
      const result = await uploadService.uploadImage(file);
      if (result.success && result.imageUrl) {
        onChange(result.imageUrl);
        toast.success('تم رفع الصورة بنجاح');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('فشل في رفع الصورة');
    } finally {
      setUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const removeImage = () => {
    onChange('');
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  const fullImageUrl = value ? uploadService.getImageUrl(value) : '';

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Preview or Upload Area */}
      {fullImageUrl ? (
        <div className="relative">
          <div className="relative group">
            <img
              src={fullImageUrl}
              alt="Product preview"
              className="w-full h-48 object-cover rounded-lg border border-gray-300"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                <button
                  type="button"
                  onClick={openFileDialog}
                  className="p-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  title="تغيير الصورة"
                >
                  <ArrowUpTrayIcon className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={removeImage}
                  className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  title="حذف الصورة"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <motion.div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={openFileDialog}
          className={`
            relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200
            ${dragOver 
              ? 'border-indigo-500 bg-indigo-50' 
              : 'border-gray-300 hover:border-indigo-400 hover:bg-gray-50'
            }
            ${uploading ? 'pointer-events-none' : ''}
          `}
          initial={{ scale: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {uploading ? (
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="text-gray-600">جاري رفع الصورة...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-4">
              <div className="p-4 bg-gray-100 rounded-full">
                <PhotoIcon className="w-12 h-12 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-700 mb-2">
                  {dragOver ? 'اترك الصورة هنا' : 'اختر صورة أو اسحبها هنا'}
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, GIF حتى 5MB
                </p>
              </div>
              <button
                type="button"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                اختر صورة
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* File info */}
      <div className="text-xs text-gray-500 text-center">
        الحد الأقصى لحجم الملف: 5 ميجابايت • الأنواع المدعومة: JPG, PNG, GIF, WebP
      </div>
    </div>
  );
};

export default ImageUpload;
