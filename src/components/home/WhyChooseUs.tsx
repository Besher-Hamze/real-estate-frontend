import { motion } from 'framer-motion';
import { Home, Users, Key, ChevronLeft, Trophy, Clock, Shield } from 'lucide-react';

export default function WhyChooseUs() {
    const features = [
        {
            icon: Trophy,
            title: 'عقارات حصرية',
            description: 'نوفر لك أفضل العقارات المميزة في جميع أنحاء السلطنة',
            stat: '+500',
            statLabel: 'عقار متاح'
        },
        {
            icon: Users,
            title: 'فريق محترف',
            description: 'فريق من الخبراء لمساعدتك في اختيار العقار المناسب',
            stat: '+15',
            statLabel: 'سنة خبرة'
        },
        {
            icon: Shield,
            title: 'موثوقية تامة',
            description: 'نضمن لك سرعة إتمام المعاملات وتسليم العقار',
            stat: '+1000',
            statLabel: 'عميل سعيد'
        }
    ];

    return (
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-20"
                >
                    <span className="text-blue-600 font-semibold mb-4 block">لماذا تختارنا</span>
                    <h2 className="text-4xl font-bold mb-6 bg-gradient-to-l from-gray-900 to-gray-700 bg-clip-text text-transparent">
                        شريكك الموثوق في عالم العقارات
                    </h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">
                        نقدم لك خدمات عقارية متكاملة مع ضمان الجودة والموثوقية لتحقيق تطلعاتك في السكن المثالي
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            whileHover={{ y: -5 }}
                            className="bg-white p-8 rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                        >
                            <div className="relative">
                                <div className="bg-gradient-to-l from-blue-600 to-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                                    <feature.icon className="w-8 h-8 text-white" />
                                </div>
                                <div className="absolute top-0 left-0 bg-blue-50 text-blue-600 py-1 px-3 rounded-full text-sm font-semibold">
                                    {feature.stat}
                                </div>
                            </div>

                            <h3 className="text-xl font-bold mb-4 text-gray-900">{feature.title}</h3>
                            <p className="text-gray-600 mb-6 leading-relaxed">{feature.description}</p>
                            
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">{feature.statLabel}</span>
                                <motion.button
                                    whileHover={{ x: 5 }}
                                    className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    المزيد
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center"
                >
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="bg-gradient-to-l from-blue-600 to-blue-500 text-white px-8 py-4 rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-blue-500/30 font-medium"
                    >
                        استكشف خدماتنا
                    </motion.button>
                </motion.div>
            </div>
        </section>
    );
}