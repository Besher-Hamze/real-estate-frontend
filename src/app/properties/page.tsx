
"use client"
import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, BedDouble, Bath, MaximizeIcon, Heart, Share2, Search, Building2, Filter, SlidersHorizontal, X, Key } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function RealEstateListings() {
    const [activeFilter, setActiveFilter] = useState<any>('all');
    const [priceRange, setPriceRange] = useState<any>('all');
    const [searchQuery, setSearchQuery] = useState<any>('');
    const [showFilters, setShowFilters] = useState<any>(false);

    const [selectedType, setSelectedType] = useState<any>('');
    const [selectedLocation, setSelectedLocation] = useState<any>('');
    const [selectedPrice, setSelectedPrice] = useState<any>('');


    
    // Sample extended properties data
    const properties = [
        {
            id: 1,
            title: 'فيلا فاخرة في الموج مسقط',
            location: 'الموج، مسقط',
            price: '850,000',
            bedrooms: 5,
            bathrooms: 6,
            area: 450,
            type: 'فيلا',
            image: '/images/bg-real.jpg',
            isNew: true,
            coordinates: {
                lat: 23.6269,
                lng: 58.2721
            },
            specifications: [
                'حديقة خاصة',
                'مسبح خاص',
                'موقف لسيارتين',
                'غرفة خادمة',
                'مطبخ مجهز بالكامل'
            ],
            description: 'فيلا فاخرة في قلب الموج مسقط مع إطلالة بحرية رائعة وتشطيبات عالية الجودة'
        },
        {
            id: 2,
            title: 'شقة مطلة على البحر في شاطئ القرم',
            location: 'شاطئ القرم، مسقط',
            price: '380,000',
            bedrooms: 3,
            bathrooms: 4,
            area: 220,
            type: 'شقة',
            image: '/images/bg-real.jpg',
            isNew: true,
            coordinates: {
                lat: 23.6143,
                lng: 58.5922
            },
            specifications: [
                'إطلالة بحرية',
                'شرفة واسعة',
                'مصعد خاص',
                'نادي صحي',
                'أمن 24 ساعة'
            ],
            description: 'شقة فاخرة في أحد أرقى أحياء مسقط مع إطلالة مباشرة على البحر'
        },
        {
            id: 3,
            title: 'منزل عصري في صحار الجديدة',
            location: 'صحار',
            price: '320,000',
            bedrooms: 4,
            bathrooms: 5,
            area: 380,
            type: 'منزل',
            image: '/images/bg-real.jpg',
            isNew: false,
            coordinates: {
                lat: 24.3425,
                lng: 56.7096
            },
            specifications: [
                'تصميم عصري',
                'حديقة أمامية',
                'مطبخ مجهز',
                'غرفة خادمة',
                'موقف مغطى'
            ],
            description: 'منزل حديث التصميم في منطقة راقية بصحار مع جميع الخدمات'
        },
        {
            id: 4,
            title: 'فيلا مستقلة في المعبيلة',
            location: 'المعبيلة، مسقط',
            price: '420,000',
            bedrooms: 5,
            bathrooms: 6,
            area: 400,
            type: 'فيلا',
            image: '/images/bg-real.jpg',
            isNew: false,
            coordinates: {
                lat: 23.5731,
                lng: 58.1834
            },
            specifications: [
                'موقع استراتيجي',
                'حديقة واسعة',
                'مجلس خارجي',
                'غرفتين خادمة',
                'مطبخين'
            ],
            description: 'فيلا فاخرة في موقع مميز بالمعبيلة قريبة من جميع الخدمات'
        },
        {
            id: 5,
            title: 'شقة دوبلكس في القرم',
            location: 'القرم، مسقط',
            price: '295,000',
            bedrooms: 4,
            bathrooms: 4,
            area: 280,
            type: 'شقة',
            image: '/images/bg-real.jpg',
            isNew: true,
            coordinates: {
                lat: 23.6127,
                lng: 58.5947
            },
            specifications: [
                'تصميم دوبلكس',
                'شرفة كبيرة',
                'مطبخ مفتوح',
                'غرفة معيشة واسعة',
                'موقف خاص'
            ],
            description: 'شقة دوبلكس فاخرة في القرم بتصميم عصري وإطلالة جميلة'
        },
        {
            id: 6,
            title: 'أرض سكنية في الموالح',
            location: 'الموالح، مسقط',
            price: '180,000',
            area: 600,
            type: 'أرض',
            image: '/images/bg-real.jpg',
            isNew: false,
            coordinates: {
                lat: 23.5941,
                lng: 58.1836
            },
            specifications: [
                'زاوية',
                'شارعين',
                'كهرباء',
                'ماء',
                'تصريح بناء جاهز'
            ],
            description: 'أرض سكنية مميزة في موقع حيوي بالموالح، مناسبة لبناء فيلا خاصة'
        },
        {
            id: 7,
            title: 'فيلا حديثة في صلالة',
            location: 'صلالة',
            price: '480,000',
            bedrooms: 6,
            bathrooms: 7,
            area: 500,
            type: 'فيلا',
            image: '/images/bg-real.jpg',
            isNew: true,
            coordinates: {
                lat: 17.0151,
                lng: 54.0924
            },
            specifications: [
                'تصميم حديث',
                'حديقة كبيرة',
                'مسبح',
                'ملحق خارجي',
                'قريبة من الشاطئ'
            ],
            description: 'فيلا فاخرة في صلالة بتصميم عصري وإطلالة على البحر'
        },
        {
            id: 8,
            title: 'مجمع فلل في نزوى',
            location: 'نزوى',
            price: '1,200,000',
            bedrooms: 20,
            bathrooms: 25,
            area: 1500,
            type: 'مجمع سكني',
            image: '/images/bg-real.jpg',
            isNew: false,
            coordinates: {
                lat: 22.9275,
                lng: 57.5345
            },
            specifications: [
                'خمس فلل مستقلة',
                'مسبح مشترك',
                'حدائق واسعة',
                'مواقف متعددة',
                'أمن خاص'
            ],
            description: 'مجمع فلل استثماري في نزوى، مناسب للاستثمار العقاري'
        },
        {
            id: 9,
            title: 'شقة في مركز مسقط التجاري',
            location: 'روي، مسقط',
            price: '250,000',
            bedrooms: 2,
            bathrooms: 2,
            area: 140,
            type: 'شقة',
            image: '/images/bg-real.jpg',
            isNew: true,
            coordinates: {
                lat: 23.5916,
                lng: 58.5449
            },
            specifications: [
                'موقع تجاري',
                'تشطيبات فاخرة',
                'أمن 24 ساعة',
                'مواقف مغطاة',
                'خدمات متكاملة'
            ],
            description: 'شقة حديثة في قلب مسقط التجاري، مثالية للسكن أو الاستثمار'
        },
        {
            id: 10,
            title: 'فيلا تراثية في مطرح',
            location: 'مطرح، مسقط',
            price: '550,000',
            bedrooms: 6,
            bathrooms: 7,
            area: 600,
            type: 'فيلا',
            image: '/images/bg-real.jpg',
            isNew: false,
            coordinates: {
                lat: 23.6236,
                lng: 58.5635
            },
            specifications: [
                'تصميم تراثي',
                'إطلالة بحرية',
                'فناء داخلي',
                'مجلس عربي',
                'سطح واسع'
            ],
            description: 'فيلا بتصميم تراثي عماني أصيل في قلب مطرح التاريخية'
        }
    ];
    
    

    const filters = {
        type: ['الكل', 'فيلا', 'شقة', 'منزل', 'أرض'],
        price: [
            { label: 'الكل', value: 'all' },
            { label: 'أقل من 200,000', value: '0-200000' },
            { label: '200,000 - 400,000', value: '200000-400000' },
            { label: 'أكثر من 400,000', value: '400000-plus' }
        ],
        location: ['مسقط', 'صلالة', 'صحار', 'نزوى']
    };

    const filterProperties = () => {
        return properties.filter((property) => {
            const typeMatch = filters.type[0] === 'الكل' || property.type === selectedType || selectedType === '';
            const priceNum = parseInt(property.price.replace(/,/g, ''));
            let priceMatch = false;

            if (selectedPrice === 'all' || selectedPrice === '') {
                priceMatch = true;
            } else if (selectedPrice === '0-200000') {
                priceMatch = priceNum < 200000;
            } else if (selectedPrice === '200000-400000') {
                priceMatch = priceNum >= 200000 && priceNum <= 400000;
            } else if (selectedPrice === '400000-plus') {
                priceMatch = priceNum > 400000;
            }

            const locationMatch = selectedLocation === '' || property.location.includes(selectedLocation);
            const searchMatch = property.title.includes(searchQuery) || property.location.includes(searchQuery);

            return typeMatch && priceMatch && locationMatch && searchMatch;
        });
    };

    const filteredProperties = filterProperties();


    return (
        <div className="min-h-screen bg-gray-50">
            {/* قسم الرأس */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center text-white mb-12">
                        <h1 className="text-5xl font-extrabold mb-4">عقارات متميزة في عمان</h1>
                        <p className="text-xl opacity-90">اكتشف مجموعة واسعة من العقارات المتميزة في أفضل المواقع</p>
                    </div>

                    {/* شريط البحث */}
                    <div className="max-w-3xl mx-auto">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="ابحث عن العقار المناسب..."
                                className="w-full px-6 py-4 rounded-xl bg-white shadow-lg pr-12 focus:outline-none focus:ring-2 focus:ring-blue-300 transition text-black"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                aria-label="بحث عن العقار المناسب"
                            />
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-blue-500 p-2 rounded-lg text-white hover:bg-blue-600 transition-colors"
                                aria-label="تفعيل الفلاتر"
                            >
                                <SlidersHorizontal className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* قسم الفلاتر */}
            <motion.div
                initial={false}
                animate={{ height: showFilters ? 'auto' : 0 }}
                className="overflow-hidden bg-white border-b border-gray-200"
            >
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* فلتر نوع العقار */}
                        <div>
                            <label htmlFor="property-type" className="block text-sm font-medium text-gray-700 mb-2">
                                نوع العقار
                            </label>
                            <div
                                className={`relative rounded-xl transition-all duration-200 ${
                                    activeFilter === 'type' ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                                }`}
                            >
                                <Building2 className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select
                                    id="property-type"
                                    className="w-full appearance-none pr-12 p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white transition-all text-gray-700 font-medium hover:border-blue-300 focus:outline-none"
                                    onFocus={() => setActiveFilter('type')}
                                    onBlur={() => setActiveFilter(null)}
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                >
                                    {filters.type.map((type) => (
                                        <option key={type} value={type === 'الكل' ? '' : type}>{type}</option>
                                    ))}
                                </select>
                                {selectedType && (
                                    <button
                                        onClick={() => setSelectedType('')}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        aria-label="إلغاء اختيار نوع العقار"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* فلتر نطاق السعر */}
                        <div>
                            <label htmlFor="price-range" className="block text-sm font-medium text-gray-700 mb-2">
                                نطاق السعر
                            </label>
                            <div
                                className={`relative rounded-xl transition-all duration-200 ${
                                    activeFilter === 'price' ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                                }`}
                            >
                                <Key className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select
                                    id="price-range"
                                    className="w-full appearance-none pr-12 p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white transition-all text-gray-700 font-medium hover:border-blue-300 focus:outline-none"
                                    onFocus={() => setActiveFilter('price')}
                                    onBlur={() => setActiveFilter(null)}
                                    value={selectedPrice}
                                    onChange={(e) => setSelectedPrice(e.target.value)}
                                >
                                    {filters.price.map((price) => (
                                        <option key={price.value} value={price.value}>{price.label}</option>
                                    ))}
                                </select>
                                {selectedPrice && (
                                    <button
                                        onClick={() => setSelectedPrice('')}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        aria-label="إلغاء اختيار نطاق السعر"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* فلتر الموقع */}
                        <div>
                            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                                الموقع
                            </label>
                            <div
                                className={`relative rounded-xl transition-all duration-200 ${
                                    activeFilter === 'location' ? 'ring-2 ring-blue-500 ring-offset-2' : ''
                                }`}
                            >
                                <MapPin className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <select
                                    id="location"
                                    className="w-full appearance-none pr-12 p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white transition-all text-gray-700 font-medium hover:border-blue-300 focus:outline-none"
                                    onFocus={() => setActiveFilter('location')}
                                    onBlur={() => setActiveFilter(null)}
                                    value={selectedLocation}
                                    onChange={(e) => setSelectedLocation(e.target.value)}
                                >
                                    <option value="">كل المواقع</option>
                                    {filters.location.map((location) => (
                                        <option key={location} value={location}>{location}</option>
                                    ))}
                                </select>
                                {selectedLocation && (
                                    <button
                                        onClick={() => setSelectedLocation('')}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                        aria-label="إلغاء اختيار الموقع"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* قسم عرض العقارات */}
            <div className="max-w-7xl mx-auto px-4 py-12">
                {filteredProperties.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredProperties.map((property, index) => (
                            <motion.div
                                key={property.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300"
                            >
                                <div className="relative">
                                    <Image
                                        src={property.image}
                                        alt={property.title}
                                        width={400}
                                        height={300}
                                        className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
                                        placeholder="blur"
                                        blurDataURL="/images/placeholder.png" // تأكد من وجود صورة placeholder
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    {/* شارات نوع العقار والحالة الجديدة */}
                                    <div className="absolute top-4 right-4 flex flex-col gap-2">
                                        {property.isNew && (
                                            <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold uppercase">
                                                جديد
                                            </span>
                                        )}
                                        <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-xs font-semibold">
                                            {property.type}
                                        </span>
                                    </div>

                                    {/* أزرار الإجراءات */}
                                    <div className="absolute top-4 left-4 flex gap-2">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                                            aria-label="أضف إلى المفضلة"
                                        >
                                            <Heart className="w-5 h-5 text-gray-700" />
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                                            aria-label="مشاركة العقار"
                                        >
                                            <Share2 className="w-5 h-5 text-gray-700" />
                                        </motion.button>
                                    </div>
                                </div>

                                <div className="p-6">
                                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                                        <MapPin className="w-4 h-4 text-blue-600" />
                                        <span>{property.location}</span>
                                    </div>

                                    <h3 className="text-xl font-bold text-gray-900 mb-4">
                                        {property.title}
                                    </h3>

                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl mb-4">
                                        <div className="flex items-center gap-2">
                                            <BedDouble className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm text-gray-600">{property.bedrooms} غرف</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Bath className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm text-gray-600">{property.bathrooms} حمامات</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MaximizeIcon className="w-4 h-4 text-gray-600" />
                                            <span className="text-sm text-gray-600">{property.area} م²</span>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <div className="flex flex-wrap gap-2">
                                            {property.specifications.map((spec, i) => (
                                                <span key={i} className="text-sm bg-blue-50 text-blue-700 px-3 py-1 rounded-full">
                                                    {spec}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <span className="text-sm text-gray-500 block">السعر</span>
                                            <span className="text-2xl font-bold text-blue-600">
                                                {property.price} ر.ع
                                            </span>
                                        </div>
                                        {/* استخدام Link مع motion.a بشكل صحيح */}
                                        <Link href={`/properties/${property.id}`} passHref>
                                            <motion.a
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                                            >
                                                عرض التفاصيل
                                            </motion.a>
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-gray-500">
                        <p>لا توجد عقارات مطابقة للبحث.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
