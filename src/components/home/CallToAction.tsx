import { motion } from 'framer-motion';
import { Phone, Mail, BuildingIcon, Clock } from 'lucide-react';

export default function CallToAction() {
    return (
        <section className="py-24 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,#3b82f6,#2563eb)]">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/30 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute inset-0" style={{
                    backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)',
                    backgroundSize: '30px 30px'
                }} />
            </div>

            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-4 relative z-10">
                <div className="text-center text-white mb-12">
                    <motion.span
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full text-sm font-semibold mb-6"
                    >
                        ابدأ رحلتك العقارية معنا
                    </motion.span>

                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-4xl md:text-5xl font-bold mb-6"
                    >
                        هل تبحث عن عقار مميز؟
                    </motion.h2>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-white/90 max-w-2xl mx-auto mb-12"
                    >
                        فريقنا من الخبراء جاهز لمساعدتك في العثور على العقار المثالي
                    </motion.p>
                </div>

                {/* Contact Options */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto"
                >
                    {[
                        {
                            icon: Phone,
                            title: 'اتصل بنا',
                            info: '+968 1234 5678',
                            subtext: 'متاحون على مدار الساعة'
                        },
                        {
                            icon: Mail,
                            title: 'راسلنا',
                            info: 'info@omanestates.com',
                            subtext: 'نرد خلال 24 ساعة'
                        },
                        {
                            icon: BuildingIcon,
                            title: 'زورنا',
                            info: 'مسقط، عمان',
                            subtext: 'من 9 صباحاً - 9 مساءً'
                        }
                    ].map((item, index) => (
                        <motion.div
                            key={index}
                            whileHover={{ y: -5, scale: 1.02 }}
                            className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="bg-white/20 p-4 rounded-xl mb-4">
                                    <item.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                                <p className="text-white font-medium mb-2">{item.info}</p>
                                <p className="text-sm text-white/70">{item.subtext}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* CTA Button */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                    className="text-center mt-12"
                >
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white text-blue-600 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-blue-50 transition-colors shadow-xl shadow-blue-950/10 inline-flex items-center gap-2"
                    >
                        <Clock className="w-5 h-5" />
                        احجز موعداً للمعاينة
                    </motion.button>
                </motion.div>
            </div>
        </section>
    );
}