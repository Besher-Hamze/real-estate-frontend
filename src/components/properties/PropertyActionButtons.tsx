import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Send, Heart, Share2, Copy } from 'lucide-react';
import { toast } from 'react-toastify';
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

interface PropertyActionButtonsProps {
    onReservationClick: () => void;
    onFeedbackClick: () => void;
    propertyId: number;
    propertyTitle: string;
    propertyLocation: string;
}

export const PropertyActionButtons: React.FC<PropertyActionButtonsProps> = ({
    onReservationClick,
    onFeedbackClick,
    propertyId,
    propertyTitle,
    propertyLocation
}) => {
    const [isFavorite, setIsFavorite] = useState<boolean>(false);
    const [showShareOptions, setShowShareOptions] = useState<boolean>(false);
    const shareRef = useRef<HTMLDivElement>(null);

    // Get share URL and info
    const shareUrl = `${process.env.NEXT_PUBLIC_FRONTEND}/properties/${propertyId}`;
    const shareTitle = propertyTitle;
    const shareDescription = `${propertyTitle} - ${propertyLocation}`;

    // Check if property is in favorites on component mount
    useEffect(() => {
        const favorites = localStorage.getItem('favorites');
        if (favorites) {
            const favoritesArray = JSON.parse(favorites);
            setIsFavorite(favoritesArray.includes(propertyId));
        }
    }, [propertyId]);

    // Handle clicks outside the share dropdown to close it
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showShareOptions && shareRef.current && !shareRef.current.contains(event.target as Node)) {
                setShowShareOptions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showShareOptions]);

    // Toggle favorite status
    const toggleFavorite = () => {
        const favorites = localStorage.getItem('favorites');
        let favoritesArray: number[] = [];

        if (favorites) {
            favoritesArray = JSON.parse(favorites);
        }

        if (isFavorite) {
            favoritesArray = favoritesArray.filter(id => id !== propertyId);
            toast.success("تم إزالة العقار من المفضلة");
        } else {
            favoritesArray.push(propertyId);
            toast.success("تم إضافة العقار إلى المفضلة");
        }

        localStorage.setItem('favorites', JSON.stringify(favoritesArray));
        setIsFavorite(!isFavorite);
    };

    // Toggle share options
    const toggleShareOptions = () => {
        setShowShareOptions(!showShareOptions);
    };

    // Copy link to clipboard
    const copyLink = () => {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(shareUrl)
                .then(() => {
                    toast.success("تم نسخ الرابط");
                })
                .catch(() => {
                    fallbackCopyText(shareUrl);
                });
        } else {
            fallbackCopyText(shareUrl);
        }

        setShowShareOptions(false);
    };

    // Fallback copy function for browsers without clipboard API
    const fallbackCopyText = (text: string) => {
        try {
            const tempInput = document.createElement('input');
            tempInput.style.position = 'absolute';
            tempInput.style.left = '-9999px';
            tempInput.value = text;
            document.body.appendChild(tempInput);
            tempInput.select();
            document.execCommand('copy');
            document.body.removeChild(tempInput);
            toast.success("تم نسخ الرابط");
        } catch (error) {
            console.error('خطأ في نسخ الرابط:', error);
            toast.error("فشل نسخ الرابط");
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 mt-8 mb-12">
            <h3 className="text-xl font-bold text-gray-800 mb-5">إجراءات العقار</h3>

            <div className="flex flex-wrap gap-4">
                {/* Main Action Buttons */}
                <button
                    onClick={onReservationClick}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white px-6 py-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group"
                >
                    <Calendar className="w-5 h-5" />
                    <span className="font-semibold">حجز العقار</span>
                </button>

                <button
                    onClick={onFeedbackClick}
                    className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-500 text-white px-6 py-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 group"
                >
                    <Send className="w-5 h-5" />
                    <span className="font-semibold">طلب عرض</span>
                </button>

                {/* Favorite Button */}
                <button
                    onClick={toggleFavorite}
                    className={`flex items-center justify-center gap-2 px-6 py-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ${isFavorite
                            ? 'bg-red-500 text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:text-red-500'
                        }`}
                >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                    <span className="font-medium">المفضلة</span>
                </button>

                {/* Share Button with Dropdown */}
                <div className="relative" ref={shareRef}>
                    <button
                        onClick={toggleShareOptions}
                        className={`flex items-center justify-center gap-2 px-6 py-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 ${showShareOptions
                                ? 'bg-blue-500 text-white'
                                : 'bg-white border border-gray-200 text-gray-700 hover:text-blue-500'
                            }`}
                    >
                        <Share2 className="w-5 h-5" />
                        <span className="font-medium">مشاركة</span>
                    </button>

                    {/* Share Dropdown */}
                    {showShareOptions && (
                        <div className="absolute left-0 bottom-full mb-2 bg-white rounded-xl shadow-xl border border-gray-200 p-4 w-64 z-50">
                            <h4 className="text-sm font-medium text-gray-700 mb-3">مشاركة العقار</h4>

                            <div className="flex flex-wrap gap-3 justify-around mb-4">
                                <WhatsappShareButton
                                    url={shareUrl}
                                    title={shareDescription}
                                    separator="\n\n"
                                    onClick={() => setShowShareOptions(false)}
                                >
                                    <WhatsappIcon size={40} round />
                                </WhatsappShareButton>

                                <FacebookShareButton
                                    url={shareUrl}
                                    onClick={() => setShowShareOptions(false)}
                                >
                                    <FacebookIcon size={40} round />
                                </FacebookShareButton>

                                <TelegramShareButton
                                    url={shareUrl}
                                    title={shareTitle}
                                    onClick={() => setShowShareOptions(false)}
                                >
                                    <TelegramIcon size={40} round />
                                </TelegramShareButton>

                                <EmailShareButton
                                    url={shareUrl}
                                    subject={shareTitle}
                                    body={`${shareDescription}\n\n`}
                                    onClick={() => setShowShareOptions(false)}
                                >
                                    <EmailIcon size={40} round />
                                </EmailShareButton>
                            </div>

                            <div className="pt-3 border-t border-gray-200">
                                <button
                                    onClick={copyLink}
                                    className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors text-gray-700 font-medium"
                                >
                                    <Copy className="w-4 h-4" />
                                    نسخ الرابط
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PropertyActionButtons;