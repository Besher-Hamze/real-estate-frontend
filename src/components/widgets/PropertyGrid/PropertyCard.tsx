import React, { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { MapPin, BedDouble, Bath, Maximize2, Heart, Share2, ChevronLeft, ChevronRight, Copy } from "lucide-react";
import { RealEstateCardProps } from "@/lib/types";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  EmailShareButton,
  FacebookIcon,
  TwitterIcon,
  WhatsappIcon,
  TelegramIcon,
  EmailIcon
} from 'react-share';
import { toast } from "react-toastify";
import { Clock } from "lucide-react";

interface EnhancedRealEstateCardProps extends RealEstateCardProps {
  onHover?: () => void;
  onLeave?: () => void;
  selectedSubType?: any;
}

const RealEstateCard: React.FC<EnhancedRealEstateCardProps> = ({
  item,
  mainType,
  selectedSubType,
  onHover,
  onLeave
}) => {
  const [isFavorite, setIsFavorite] = useState<boolean>(false);
  const [showShareOptions, setShowShareOptions] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isHovering, setIsHovering] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const images = React.useMemo(() => {
    const allImages = [item.coverImage];
    if (item.files && Array.isArray(item.files) && item.files.length > 0) {
      allImages.push(...item.files);
    }
    return [...new Set(allImages)].filter(Boolean);
  }, [item.coverImage, item.files]);

  const formatRelativeTime = (createdAt: string | undefined): string => {
    if (!createdAt) return 'تاريخ غير معروف';

    const now = new Date();
    const createdDate = new Date(createdAt);

    const timeDiff = now.getTime() - createdDate.getTime();

    const minutesDiff = Math.floor(timeDiff / (1000 * 60));
    const hoursDiff = Math.floor(timeDiff / (1000 * 60 * 60));
    const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const weeksDiff = Math.floor(daysDiff / 7);
    const monthsDiff = Math.floor(daysDiff / 30);

    if (minutesDiff < 60) {
      return minutesDiff <= 1 ? 'منذ دقيقة' : `منذ ${minutesDiff} دقيقة`;
    } else if (hoursDiff < 24) {
      return hoursDiff === 1 ? 'منذ ساعة' : `منذ ${hoursDiff} ساعة`;
    } else if (daysDiff < 7) {
      return daysDiff === 1 ? 'منذ يوم' : `منذ ${daysDiff} أيام`;
    } else if (weeksDiff < 4) {
      return weeksDiff === 1 ? 'منذ أسبوع' : `منذ ${weeksDiff} أسابيع`;
    } else {
      return monthsDiff === 1 ? 'منذ شهر' : `منذ ${monthsDiff} أشهر`;
    }
  };

  useEffect(() => {
    const favorites = localStorage.getItem('favorites');
    if (favorites) {
      const favoritesArray = JSON.parse(favorites);
      setIsFavorite(favoritesArray.includes(item.id));
    }
  }, [item.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showShareOptions && cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setShowShareOptions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showShareOptions]);

  const isCurrentMediaVideo = React.useMemo(() => {
    const currentMedia = images[currentImageIndex];
    return currentMedia &&
      (currentMedia.toLowerCase().endsWith('.mp4') ||
        currentMedia.toLowerCase().endsWith('.mov') ||
        currentMedia.toLowerCase().endsWith('.avi'));
  }, [currentImageIndex, images]);

  useEffect(() => {
    if (isHovering && images.length > 1) {
      timerRef.current = setInterval(() => {
        setCurrentImageIndex(prevIndex => (prevIndex + 1) % images.length);
      }, 1500);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isHovering, images.length]);

  useEffect(() => {
    if (videoRef.current) {
      if (isHovering) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
      }
    }
  }, [isHovering, isCurrentMediaVideo]);

  const toggleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const favorites = localStorage.getItem('favorites');
    let favoritesArray: number[] = [];

    if (favorites) {
      favoritesArray = JSON.parse(favorites);
    }

    if (isFavorite) {
      favoritesArray = favoritesArray.filter(id => id !== item.id);
    } else {
      favoritesArray.push(item.id);
    }

    localStorage.setItem('favorites', JSON.stringify(favoritesArray));

    setIsFavorite(!isFavorite);
  };

  const shareProperty = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShareOptions(!showShareOptions);
  };

  const copyLink = () => {
    const shareUrl = `${process.env.NEXT_PUBLIC_FRONTEND}/properties/${item.id}`;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          toast.success("تم نسخ الرابط")
        })
        .catch(() => {
          fallbackCopyText(shareUrl, document.body);
        });
    } else {
      fallbackCopyText(shareUrl, document.body);
    }

    setShowShareOptions(false);
  };

  const fallbackCopyText = (text: string, buttonElement: Element) => {
    try {
      const tempInput = document.createElement('input');
      tempInput.style.position = 'absolute';
      tempInput.style.left = '-9999px';
      tempInput.value = text;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand('copy');
      document.body.removeChild(tempInput);

      const tooltip = document.createElement('div');
      tooltip.textContent = 'تم نسخ الرابط!';
      tooltip.className = 'absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white px-3 py-1 rounded-lg text-sm z-50';

      buttonElement.appendChild(tooltip);

      setTimeout(() => {
        tooltip.remove();
      }, 2000);
    } catch (error) {
      console.error('خطأ في نسخ الرابط:', error);
    }
  };

  const goToNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToImage = (index: number, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
  };

  const handleMouseEnter = useCallback(() => {
    setIsHovering(true);
    if (onHover) {
      onHover();
    }
  }, [onHover]);

  // Handle mouse leave with callback
  const handleMouseLeave = useCallback(() => {
    setIsHovering(false);
    if (onLeave) {
      onLeave();
    }
  }, [onLeave]);

  // Get share URL and info
  const shareUrl = `${process.env.NEXT_PUBLIC_FRONTEND}/properties/${item.id}`;
  const shareTitle = item.title;
  const shareDescription = `${item.title} - ${item.cityName}, ${item.neighborhoodName}`;

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="relative h-64">
        {/* Current image in carousel */}
        {isCurrentMediaVideo ? (
          <video
            ref={videoRef}
            src={`${images[currentImageIndex]}`}
            muted
            playsInline
            loop
            className="w-full h-full object-cover transition-transform duration-500 ease-in-out transform group-hover:scale-105"
          />
        ) : (
          <Image
            src={
              images[currentImageIndex]
                ? `${images[currentImageIndex]}`
                : "/images/bg-real.jpg"
            }
            alt={`${item.title} - صورة ${currentImageIndex + 1}`}
            fill
            loading="lazy"
            className="object-cover transition-transform duration-500 ease-in-out transform group-hover:scale-105"
          />
        )}


        {/* Property type badge */}
        <div className="absolute top-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-lg text-sm">
          {mainType?.name || item.mainCategoryName}
        </div>

        {/* Action buttons */}
        <div className="absolute top-4 left-4 flex gap-2">
          {/* Favorite Button */}
          <button
            onClick={toggleFavorite}
            className={`p-2 rounded-full ${isFavorite
              ? 'bg-red-500 text-white'
              : 'bg-white/80 hover:bg-white text-gray-700 hover:text-red-500'
              } backdrop-blur-sm transition-all duration-200`}
            aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
            title={isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
          >
            <Heart
              className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`}
            />
          </button>

          {/* Share Button with dropdown */}
          <div className="relative">
            <button
              onClick={shareProperty}
              className={`p-2 rounded-full ${showShareOptions
                ? 'bg-blue-500 text-white'
                : 'bg-white/80 hover:bg-white text-gray-700 hover:text-blue-500'
                } backdrop-blur-sm transition-all duration-200`}
              aria-label="مشاركة"
              title="مشاركة"
            >
              <Share2 className="w-5 h-5" />
            </button>

            {/* Share options dropdown */}
            {showShareOptions && (
              <div className="absolute left-0 -bottom-2 translate-y-full bg-white rounded-xl shadow-xl border border-gray-200 p-3 w-56 z-50">
                <div className="flex flex-wrap gap-2 justify-around">
                  <WhatsappShareButton
                    url={shareUrl}
                    title={shareDescription}
                    separator="\n\n"
                    onClick={() => setShowShareOptions(false)}
                  >
                    <WhatsappIcon size={36} round />
                  </WhatsappShareButton>

                  <FacebookShareButton
                    url={shareUrl}
                    onClick={() => setShowShareOptions(false)}
                  >
                    <FacebookIcon size={36} round />
                  </FacebookShareButton>

                  <TelegramShareButton
                    url={shareUrl}
                    title={shareTitle}
                    onClick={() => setShowShareOptions(false)}
                  >
                    <TelegramIcon size={36} round />
                  </TelegramShareButton>

                  <EmailShareButton
                    url={shareUrl}
                    subject={shareTitle}
                    body={`${shareDescription}\n\n`}
                    onClick={() => setShowShareOptions(false)}
                  >
                    <EmailIcon size={36} round />
                  </EmailShareButton>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-200">
                  <button
                    onClick={copyLink}
                    className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors text-gray-700"
                  >
                    <Copy className="w-4 h-4" />
                    نسخ الرابط
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Carousel navigation buttons - only show if there are multiple images */}
        {images.length > 1 && (
          <>
            {/* Left arrow */}
            <button
              onClick={goToNextImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/70 text-gray-800 hover:bg-white hover:text-blue-600 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
              aria-label="الصورة السابقة"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Right arrow */}
            <button
              onClick={goToPrevImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/70 text-gray-800 hover:bg-white hover:text-blue-600 backdrop-blur-sm transition-all opacity-0 group-hover:opacity-100"
              aria-label="الصورة التالية"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Dots navigation */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 py-2 px-3 bg-black/30 backdrop-blur-sm rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100 shadow-lg">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => goToImage(index, e)}
                  className={`w-3 h-3 rounded-full transition-all duration-200 ${currentImageIndex === index
                    ? 'bg-white scale-125 shadow-glow'
                    : 'bg-white/50 hover:bg-white/80'
                    }`}
                  aria-label={`عرض الصورة ${index + 1} من ${images.length}`}
                  aria-current={currentImageIndex === index ? 'true' : 'false'}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold mb-2 truncate whitespace-nowrap overflow-hidden text-ellipsis">
          {item.title}
        </h3>
        <div className="flex items-center gap-2 text-gray-600 mb-4">
          <MapPin className="w-4 h-4" />
          <span>
            {item.cityName} - {item.neighborhoodName}
          </span>
        </div>
        <div className="flex items-center gap-2 text-gray-500 mb-4 text-sm">
          <Clock className="w-4 h-4" />
          <span>{formatRelativeTime(item.createdAt)}</span>
        </div>

        {/* <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg mb-4">
          {(item.subCategoryName !== "أرض" && item.finalTypeName !== "أرض") && (
            <>
              {item.bedrooms && <div className="flex items-center gap-1">
                <BedDouble className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-black font-medium">
                  {item.bedrooms}
                </span>
              </div>
              }
              {
                item.bathrooms && <div className="flex items-center gap-1">
                  <Bath className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-black font-medium">
                    {item.bathrooms}
                  </span>
                </div>

              }
            </>
          )}
          <div className="flex items-center gap-1">
            <Maximize2 className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-black font-medium">
              {item.buildingArea} م²
            </span>
          </div>
        </div> */}
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-600">السعر</span>
            <div className="flex items-center gap-1">
              <span className="text-xl font-bold text-blue-600">
                {item.price}
              </span>
              <span className="text-sm font-medium text-gray-600">ر.ع</span>
            </div>
          </div>
          <Link
            href={`/properties/${item.id}`}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            التفاصيل
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default RealEstateCard;