import { useState, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, X, ChevronLeft, ChevronRight, ZoomIn, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface PropertyGalleryProps {
  property: {
    title: string;
    files: string[];
  };
}

const PropertyGallery: React.FC<PropertyGalleryProps> = ({ property }) => {
  const [activeImage, setActiveImage] = useState<number>(0);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const router = useRouter();

  // Reset zoom when changing images
  useEffect(() => {
    setIsZoomed(false);
  }, [activeImage]);

  const handlePrevImage = () => {
    setActiveImage((prev) => (prev === 0 ? property.files.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImage((prev) => (prev === property.files.length - 1 ? 0 : prev + 1));
  };

  const isVideoFile = (url: string): boolean => {
    return /\.(mp4|webm|ogg)$/i.test(url);
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = `${process.env.NEXT_PUBLIC_API_URL}/${property.files[activeImage]}`;
    link.download = property.files[activeImage].split('/').pop() || 'image';
    link.click();
  };

  return (
    <div className="relative h-[70vh] bg-gray-900">
      <div className="absolute inset-0 group cursor-pointer">
        {isVideoFile(property.files[activeImage]) ? (
          <>
            <video
              src={`${process.env.NEXT_PUBLIC_API_URL}/${property.files[activeImage]}`}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            >
              <source
                src={`${process.env.NEXT_PUBLIC_API_URL}/${property.files[activeImage]}`}
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
            <div
              className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors"
              onClick={() =>
                window.open(`${process.env.NEXT_PUBLIC_API_URL}/${property.files[activeImage]}`, '_blank')
              }
            >
              <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                فتح الفيديو في نافذة جديدة
              </div>
            </div>
          </>
        ) : (
          <>
            <Image
              src={`${process.env.NEXT_PUBLIC_API_URL}/${property.files[activeImage]}`}
              alt={property.title}
              fill
              className="object-cover"
              onClick={() => setModalOpen(true)}
              priority
            />
          </>
        )}
      </div>

      {/* Image Gallery Thumbnails */}
      {property.files.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 max-w-full px-4 overflow-x-auto pb-2"
        onClick={() => setModalOpen(true)}
        >
          {property.files.map((file: string, index: number) => (
            <motion.button
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveImage(index)}
              className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 
                ${activeImage === index ? 'border-blue-500 shadow-lg' : 'border-white/50'}`}
            >
              {isVideoFile(file) ? (
                <video
                  src={`${process.env.NEXT_PUBLIC_API_URL}/${file}`}
                  muted
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={`${process.env.NEXT_PUBLIC_API_URL}/${file}`}
                  alt=""
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              )}
              {activeImage === index && (
                <div className="absolute inset-0 bg-blue-500/20" />
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* Back Button */}
      <motion.button
        whileHover={{ x: -5 }}
        className="absolute top-8 right-8 flex items-center gap-2 text-white bg-black/20 backdrop-blur-sm px-4 py-2 rounded-lg"
        onClick={() => router.push('/')}
      >
        <ArrowRight className="w-5 h-5" />
        عودة
      </motion.button>

      {/* Fixed Size Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) setModalOpen(false);
            }}
          >
            {/* Fixed size container that takes up the entire viewport */}
            <div className="fixed inset-0 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                className="relative w-full h-full flex items-center justify-center"
              >
                {/* Image Container */}
                <div className="relative w-full h-full flex items-center justify-center p-8">
                  {isVideoFile(property.files[activeImage]) ? (
                    <video
                      src={`${process.env.NEXT_PUBLIC_API_URL}/${property.files[activeImage]}`}
                      autoPlay
                      controls
                      className="max-w-full max-h-full object-contain"
                    />
                  ) : (
                    <div 
                      className="relative max-w-full max-h-full mb-8"
                      onClick={() => setIsZoomed(!isZoomed)}
                    >
                      <img
                        src={`${process.env.NEXT_PUBLIC_API_URL}/${property.files[activeImage]}`}
                        alt={property.title}
                        height={800}
                        className={`max-w-full max-h-full object-contain ${isZoomed ? 'cursor-zoom-out scale-150 transition-transform duration-300' : 'cursor-zoom-in'}`}
                      />
                    </div>
                  )}

                  {/* Modal Controls */}
                  <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      className="text-white bg-black/50 p-2 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsZoomed(!isZoomed);
                      }}
                    >
                      <ZoomIn className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      className="text-white bg-black/50 p-2 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownload();
                      }}
                    >
                      <Download className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      className="text-white bg-black/50 p-2 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        setModalOpen(false);
                      }}
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>

                  {/* Navigation Arrows */}
                  {property.files.length > 1 && (
                    <>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 p-2 rounded-full z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePrevImage();
                        }}
                      >
                        <ChevronLeft className="w-6 h-6" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 p-2 rounded-full z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNextImage();
                        }}
                      >
                        <ChevronRight className="w-6 h-6" />
                      </motion.button>
                    </>
                  )}

                  {/* Image Counter */}
                  <div 
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white bg-black/50 px-3 py-1 rounded-full text-sm z-10"
                  >
                    {activeImage + 1} / {property.files.length}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PropertyGallery;