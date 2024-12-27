"use client"
import { useState } from 'react';
import { motion } from 'framer-motion';
import { MapPin, BedDouble, Bath, MaximizeIcon, Heart, Share2, ArrowRight, Home, Phone, Mail, Calendar, Info } from 'lucide-react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

export default function PropertyDetails() {
    const [activeImage, setActiveImage] = useState(0);
    const [showContactForm, setShowContactForm] = useState(false);

    const property = {
        id: 1,
        title: 'فيلا فاخرة في الموج مسقط',
        location: 'الموج، مسقط',
        price: '850,000',
        bedrooms: 5,
        bathrooms: 6,
        area: 450,
        type: 'فيلا',
        images: [
            '/images/bg-real.jpg',
            '/images/bg-real.jpg',
            '/images/bg-real.jpg',
            '/images/bg-real.jpg'
        ],
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
        amenities: [
            { title: 'مكيف مركزي', value: true },
            { title: 'انترنت', value: true },
            { title: 'موقف خاص', value: true },
            { title: 'أمن 24 ساعة', value: true },
            { title: 'مسبح', value: true },
            { title: 'حديقة', value: true },
            { title: 'غرفة خادمة', value: true },
            { title: 'مطبخ مجهز', value: true }
        ],
        description: 'فيلا فاخرة في قلب الموج مسقط مع إطلالة بحرية رائعة وتشطيبات عالية الجودة. تتميز الفيلا بموقعها الاستراتيجي وتصميمها العصري مع الحفاظ على الطابع العماني الأصيل.',
        propertyDetails: {
            'سنة البناء': '2023',
            'نوع التشطيب': 'سوبر ديلوكس',
            'عدد الطوابق': '2',
            'واجهة': 'بحرية',
            'عدد المطابخ': '2',
            'عدد الصالات': '3'
        },
        agent: {
            name: 'أحمد العامري',
            phone: '+968 1234 5678',
            email: 'ahmed@omanestates.com',
            image: '/agent-photo.jpg'
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Property Images Gallery */}
            <div className="relative h-[70vh] bg-gray-900">
                <div className="absolute inset-0">
                    <img
                        src={property.images[activeImage]}
                        alt={property.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
                    {property.images.map((image, index) => (
                        <motion.button
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setActiveImage(index)}
                            className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${activeImage === index ? 'border-blue-500' : 'border-white/50'
                                }`}
                        >
                            <img src={image} alt="" className="w-full h-full object-cover" />
                        </motion.button>
                    ))}
                </div>

                {/* Back Button */}
                <motion.button
                    whileHover={{ x: -5 }}
                    className="absolute top-8 right-8 flex items-center gap-2 text-white bg-black/20 backdrop-blur-sm px-4 py-2 rounded-lg"
                    onClick={() => window.history.back()}
                >
                    <ArrowRight className="w-5 h-5" />
                    عودة
                </motion.button>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        {/* Property Header */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                        {property.title}
                                    </h1>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <MapPin className="w-5 h-5 text-blue-600" />
                                        <span>{property.location}</span>
                                    </div>
                                </div>
                                <div className="text-left">
                                    <div className="text-sm text-gray-500">السعر</div>
                                    <div className="text-3xl font-bold text-blue-600">
                                        {property.price} ر.ع
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6 p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-3">
                                    <BedDouble className="w-6 h-6 text-blue-600" />
                                    <div>
                                        <div className="text-sm text-gray-500">غرف النوم</div>
                                        <div className="font-semibold">{property.bedrooms}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Bath className="w-6 h-6 text-blue-600" />
                                    <div>
                                        <div className="text-sm text-gray-500">الحمامات</div>
                                        <div className="font-semibold">{property.bathrooms}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <MaximizeIcon className="w-6 h-6 text-blue-600" />
                                    <div>
                                        <div className="text-sm text-gray-500">المساحة</div>
                                        <div className="font-semibold">{property.area} م²</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Property Description */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Info className="w-6 h-6 text-blue-600" />
                                وصف العقار
                            </h2>
                            <p className="text-gray-600 leading-relaxed">
                                {property.description}
                            </p>
                        </div>

                        {/* Property Features */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Home className="w-6 h-6 text-blue-600" />
                                مميزات العقار
                            </h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                {property.amenities.map((amenity, index) => (
                                    <div
                                        key={index}
                                        className={`p-4 rounded-xl text-center ${amenity.value ? 'bg-blue-50 text-blue-700' : 'bg-gray-50 text-gray-500'
                                            }`}
                                    >
                                        {amenity.title}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Property Details */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg mb-8">
                            <h2 className="text-2xl font-bold mb-6">تفاصيل إضافية</h2>
                            <div className="grid grid-cols-2 gap-6">
                                {Object.entries(property.propertyDetails).map(([key, value]) => (
                                    <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                        <span className="text-gray-600">{key}</span>
                                        <span className="font-semibold">{value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Location Map */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg">
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <MapPin className="w-6 h-6 text-blue-600" />
                                الموقع
                            </h2>
                            <div className="h-[400px] rounded-xl overflow-hidden">
                                <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
                                    <GoogleMap
                                        mapContainerStyle={{ width: '100%', height: '100%' }}
                                        center={property.coordinates}
                                        zoom={15}
                                    >
                                        <Marker position={property.coordinates} />
                                    </GoogleMap>
                                </LoadScript>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        {/* Agent Contact Card */}
                        <div className="bg-white rounded-2xl p-8 shadow-lg sticky top-8">
                            <div className="text-center mb-6">
                                <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4">
                                    <img src={property.agent.image} alt={property.agent.name} className="w-full h-full object-cover" />
                                </div>
                                <h3 className="text-xl font-bold">{property.agent.name}</h3>
                                <p className="text-gray-600">وكيل عقاري معتمد</p>
                            </div>

                            <div className="space-y-4 mb-8">
                                <a href={`tel:${property.agent.phone}`} className="flex items-center gap-3 text-gray-600">
                                    <Phone className="w-5 h-5 text-blue-600" />
                                    <span>{property.agent.phone}</span>
                                </a>
                                <a href={`mailto:${property.agent.email}`} className="flex items-center gap-3 text-gray-600">
                                    <Mail className="w-5 h-5 text-blue-600" />
                                    <span>{property.agent.email}</span>
                                </a>
                            </div>

                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">الاسم</label>
                                    <input
                                        type="text"
                                        className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
                                    <input
                                        type="tel"
                                        className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">رسالتك</label>
                                    <textarea
                                        rows={4}
                                        className="w-full p-3 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition resize-none"
                                    ></textarea>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
                                >
                                    ارسال
                                </motion.button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}