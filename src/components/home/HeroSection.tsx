import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, Search, Key } from 'lucide-react';
import SearchComponent from './SearchComponent';

export default function HeroSection() {
    const [activeSlide, setActiveSlide] = useState(0);
    
    const heroSlides = [
        {
            image: '/images/bg-real.jpg',
            title: 'فخامة السكن في عمان',
            subtitle: 'اكتشف أرقى العقارات في السلطنة'
        },
        {
            image: '/images/hero_bg_2.jpg',
            title: 'استثمار مضمون',
            subtitle: 'أفضل الفرص العقارية في المواقع المميزة'
        },
        {
            image: '/images/hero_bg_3.jpg',
            title: 'تصاميم عصرية',
            subtitle: 'منازل بتصاميم حديثة تناسب ذوقك'
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveSlide((prevSlide) =>
                prevSlide === heroSlides.length - 1 ? 0 : prevSlide + 1
            );
        }, 3000);

        return () => clearInterval(timer);
    }, [heroSlides.length]);

    const handleSlideChange = (index: any) => {
        setActiveSlide(index);
    };

    return (
        <section className="relative h-screen">
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0"
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
                        style={{ backgroundImage: `url(${heroSlides[activeSlide].image})` }}
                    >
                        <div className="absolute inset-0 bg-black/50" />
                    </div>
                </motion.div>
            </AnimatePresence>

            <div className="relative z-10 h-full flex items-center">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    <motion.h1
                        key={`title-${activeSlide}`}
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-6xl font-bold text-white mb-6"
                    >
                        {heroSlides[activeSlide].title}
                    </motion.h1>

                    <motion.p
                        key={`subtitle-${activeSlide}`}
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-xl text-gray-200 mb-12"
                    >
                        {heroSlides[activeSlide].subtitle}
                    </motion.p>
                    <SearchComponent/>
                </div>
            </div>

            {/* Slide Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {heroSlides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => handleSlideChange(index)}
                        className={`w-3 h-3 rounded-full transition-all ${activeSlide === index ? 'bg-blue-500 w-8' : 'bg-white/50'
                            }`}
                    />
                ))}
            </div>
        </section>
    );
}