import { motion } from 'framer-motion';
import { Phone, MapPin, Mail } from 'lucide-react';

export default function ContactSection() {
    const contactInfo = [
        {
            icon: Phone,
            title: 'رقم الهاتف',
            info: '+968 1234 5678',
            subInfo: 'متاحون على مدار الساعة'
        },
        {
            icon: MapPin,
            title: 'العنوان',
            info: 'مسقط، سلطنة عمان',
            subInfo: 'المنطقة التجارية'
        },
        {
            icon: Mail,
            title: 'البريد الإلكتروني',
            info: 'info@omanestates.com',
            subInfo: 'نرد خلال 24 ساعة'
        }
    ];

    return (
        <section className="py-24 relative overflow-hidden bg-gradient-to-b from-gray-50 to-white">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-30" />

            <div className="max-w-6xl mx-auto px-4 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="text-blue-600 font-semibold mb-4 inline-block">تواصل معنا</span>
                    <h2 className="text-4xl font-bold mb-6">نحن هنا لمساعدتك</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        فريقنا جاهز للإجابة على استفساراتك وتقديم المساعدة التي تحتاجها
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {contactInfo.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                            className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 text-center border border-gray-100"
                        >
                            <div className="bg-gradient-to-r from-blue-600 to-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                                <item.icon className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                            <p className="text-gray-900 font-medium mb-2">{item.info}</p>
                            <p className="text-gray-500 text-sm">{item.subInfo}</p>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100 max-w-3xl mx-auto"
                >
                    <form className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">الاسم</label>
                                <input
                                    type="text"
                                    className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                    placeholder="أدخل اسمك"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-700 font-medium mb-2">رقم الهاتف</label>
                                <input
                                    type="tel"
                                    className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                    placeholder="أدخل رقم هاتفك"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">البريد الإلكتروني</label>
                            <input
                                type="email"
                                className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition"
                                placeholder="أدخل بريدك الإلكتروني"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">الرسالة</label>
                            <textarea
                                rows={4}
                                className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition resize-none"
                                placeholder="اكتب رسالتك هنا"
                            ></textarea>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white p-4 rounded-xl hover:from-blue-700 hover:to-blue-600 transition-all duration-300 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 font-medium"
                        >
                            <Mail className="w-5 h-5" />
                            إرسال الرسالة
                        </motion.button>
                    </form>
                </motion.div>
            </div>
        </section>
    );
}