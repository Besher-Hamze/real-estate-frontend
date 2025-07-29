import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, Shield } from 'lucide-react';

export default function HeroSection() {
    const [activeSlide, setActiveSlide] = useState(0);
    const [searchInput, setSearchInput] = useState('');

    const heroSlides = [
        {
            image: '/images/bg-real.jpg',
            title: 'فخامة السكن في عمان',
            subtitle: 'اكتشف أرقى الإعلانات في السلطنة'
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

    const features = [
        {
            icon: Building2,
            title: 'عقارات فاخرة',
            description: 'اختر من بين مجموعة واسعة من الإعلانات الراقية'
        },
        {
            icon: MapPin,
            title: 'مواقع مميزة',
            description: 'في أفضل المناطق السكنية بعمان'
        },
        {
            icon: Shield,
            title: 'خدمة موثوقة',
            description: 'ضمان كامل لحقوقك العقارية'
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setActiveSlide(prev => (prev === heroSlides.length - 1 ? 0 : prev + 1));
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* Background Slider */}
            <AnimatePresence mode="sync" >
                <motion.div
                    key={activeSlide}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0"
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                        style={{ backgroundImage: `url(${heroSlides[activeSlide].image})` }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/50" />
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Content */}
            <div className="relative z-10 flex flex-col min-h-screen">
                {/* Header Text */}
                <div className="flex-grow flex items-center justify-center px-4 py-20">
                    <div className="text-center max-w-7xl mx-auto">
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-6"
                        >
                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4">
                                {heroSlides[activeSlide].title}
                            </h1>
                            <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white mb-2">
                                {heroSlides[activeSlide].subtitle}
                            </h2>
                        </motion.div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mt-16">
                            {features.map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: index * 0.2 }}
                                    className="group"
                                >
                                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1">
                                        <div className="flex flex-col items-center gap-4">
                                            <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-all duration-300">
                                                <feature.icon className="w-10 h-10 text-white" />
                                            </div>
                                            <h3 className="text-xl font-bold text-white">{feature.title}</h3>
                                            <p className="text-gray-300 text-sm">{feature.description}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Slide Indicators */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {heroSlides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveSlide(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${activeSlide === index ? 'w-8 bg-blue-500' : 'w-2 bg-white/50 hover:bg-white/70'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}