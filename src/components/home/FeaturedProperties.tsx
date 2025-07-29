import { motion } from 'framer-motion';
import { MapPin, BedDouble, Bath, MaximizeIcon, Heart, Share2 } from 'lucide-react';
import Link from 'next/link';

export default function FeaturedProperties() {
    const properties = [
        {
            id: 1,
            title: 'فيلا فاخرة في مسقط',
            location: 'الموالح، مسقط',
            price: '450,000',
            bedrooms: 4,
            bathrooms: 3,
            area: 350,
            type: 'فيلا',
            image: '/images/bg-real.jpg',
            isNew: true,
            specifications: ['حديقة خاصة', 'مسبح', 'موقف خاص']
        },
        {
            id: 2,
            title: 'شقة مطلة على البحر',
            location: 'شاطئ القرم، مسقط',
            price: '280,000',
            bedrooms: 3,
            bathrooms: 2,
            area: 220,
            type: 'شقة',
            image: '/images/bg-real.jpg',
            isNew: true,
            specifications: ['إطلالة بحرية', 'شرفة', 'مصعد']
        },
        {
            id: 3,
            title: 'منزل عصري في صحار',
            location: 'صحار الجديدة',
            price: '320,000',
            bedrooms: 5,
            bathrooms: 4,
            area: 400,
            type: 'منزل',
            image: '/images/bg-real.jpg',
            isNew: false,
            specifications: ['تصميم عصري', 'غرفة خادمة', 'مطبخ مجهز']
        }
    ];

    return (
        <section className="py-24 bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-7xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="text-blue-600 font-semibold mb-4 block">عقارات مميزة</span>
                    <h2 className="text-4xl font-bold mb-6 bg-gradient-to-l from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        اكتشف أفضل الإعلانات المتاحة
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
                        نقدم لك مجموعة منتقاة من أفضل الإعلانات في أرقى المناطق السكنية
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {properties.map((property, index) => (
                        <motion.div
                            key={property.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            className="bg-white rounded-3xl overflow-hidden shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300"
                        >
                            <div className="relative overflow-hidden group">
                                <motion.img
                                    src={property.image}
                                    alt={property.title}
                                    className="w-full h-72 object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                {/* Property Type Badge */}
                                <div className="absolute top-4 right-4 flex gap-2">
                                    {property.isNew && (
                                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                                            جديد
                                        </span>
                                    )}
                                    <span className="bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1 rounded-full text-sm font-semibold">
                                        {property.type}
                                    </span>
                                </div>

                                {/* Action Buttons */}
                                <div className="absolute top-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
                                    >
                                        <Heart className="w-5 h-5 text-gray-700" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="bg-white/90 backdrop-blur-sm p-2 rounded-full hover:bg-white transition-colors"
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
                                    <Link href={`/properties/1`} passHref>
                                        <motion.button
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                                        >
                                            عرض التفاصيل
                                        </motion.button>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mt-12"
                >
                    <Link href={`/properties/`} passHref>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-white text-blue-600 border-2 border-blue-600 px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors font-semibold"
                        >
                            عرض جميع الإعلانات
                        </motion.button>
                    </Link>

                </motion.div>
            </div>
        </section>
    );
}