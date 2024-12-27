import { motion } from 'framer-motion';
import { Building2, Users, Clock, Award } from 'lucide-react';

export default function Statistics() {
    const stats = [
        {
            icon: Building2,
            number: "500+",
            label: "عقار متاح",
            description: "عقارات متنوعة في أفضل المواقع",
            color: "from-blue-600 to-blue-400"
        },
        {
            icon: Users,
            number: "1000+",
            label: "عميل سعيد",
            description: "يثقون بخدماتنا العقارية",
            color: "from-indigo-600 to-indigo-400"
        },
        {
            icon: Clock,
            number: "15+",
            label: "سنة خبرة",
            description: "في السوق العقاري العماني",
            color: "from-violet-600 to-violet-400"
        },
        {
            icon: Award,
            number: "50+",
            label: "وكيل عقاري",
            description: "من الخبراء المتخصصين",
            color: "from-purple-600 to-purple-400"
        }
    ];

    return (
        <section className="py-24 relative">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-30" />

            <div className="max-w-7xl mx-auto px-4 relative">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                        >
                            {/* Icon */}
                            <div className={`absolute -top-5 right-6 w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg`}>
                                <stat.icon className="w-6 h-6 text-white" />
                            </div>

                            <div className="text-center pt-6">
                                {/* Number Counter */}
                                <motion.div
                                    initial={{ scale: 0.5, opacity: 0 }}
                                    whileInView={{ scale: 1, opacity: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.2, type: "spring", stiffness: 100 }}
                                    className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2"
                                >
                                    {stat.number}
                                </motion.div>

                                {/* Label */}
                                <div className="text-lg font-semibold text-gray-900 mb-2">
                                    {stat.label}
                                </div>

                                {/* Description */}
                                <p className="text-gray-600 text-sm">
                                    {stat.description}
                                </p>
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-gray-100 to-transparent opacity-50 rounded-full blur-2xl -z-10" />
                            <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-gray-100 to-transparent opacity-50 rounded-full blur-2xl -z-10" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}