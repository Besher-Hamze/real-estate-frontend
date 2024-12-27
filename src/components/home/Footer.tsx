import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
    return (
        <footer className="relative pt-24 pb-6 bg-gradient-to-b from-gray-900 to-gray-950 ">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-24 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-12 mb-16">
                    {/* About Section - 2 Columns */}
                    <div className="md:col-span-2">
                        <div className="mb-8">
                            <h3 className="text-3xl font-bold text-white mb-6">عقارات عمان</h3>
                            <p className="text-gray-400 leading-relaxed">
                                نوفر لك أفضل الخدمات العقارية في سلطنة عمان مع ضمان الجودة والموثوقية. نحن نفخر بتقديم خدمات استثنائية لعملائنا.
                            </p>
                        </div>
                        
                        {/* Contact Info */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-gray-400">
                                <Phone className="w-5 h-5" />
                                <span>+968 1234 5678</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-400">
                                <Mail className="w-5 h-5" />
                                <span>info@omanestates.com</span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-400">
                                <MapPin className="w-5 h-5" />
                                <span>مسقط، سلطنة عمان</span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Links - 1 Column */}
                    <div className="md:col-span-1">
                        <h4 className="text-lg font-bold text-white mb-6">روابط سريعة</h4>
                        <ul className="space-y-4">
                            {['الرئيسية', 'العقارات', 'من نحن', 'اتصل بنا'].map((item) => (
                                <li key={item}>
                                    <a 
                                        href="#" 
                                        className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2"
                                    >
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Services - 1 Column */}
                    <div className="md:col-span-1">
                        <h4 className="text-lg font-bold text-white mb-6">خدماتنا</h4>
                        <ul className="space-y-4">
                            {['بيع العقارات', 'شراء العقارات', 'تأجير العقارات', 'تقييم العقارات'].map((item) => (
                                <li key={item}>
                                    <a 
                                        href="#" 
                                        className="text-gray-400 hover:text-white transition-colors duration-300 flex items-center gap-2"
                                    >
                                        <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                        {item}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter - 2 Columns */}
                    <div className="md:col-span-2">
                        <h4 className="text-lg font-bold text-white mb-6">اشترك في النشرة الإخبارية</h4>
                        <p className="text-gray-400 mb-4">
                            اشترك للحصول على آخر الأخبار والعروض العقارية
                        </p>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="البريد الإلكتروني"
                                className="bg-gray-800 text-white px-4 py-3 rounded-lg flex-1 border border-gray-700 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors duration-300">
                                اشتراك
                            </button>
                        </div>

                        {/* Social Media Links */}
                        <div className="mt-8">
                            <div className="flex gap-4">
                                {[
                                    { icon: Facebook, href: '#' },
                                    { icon: Twitter, href: '#' },
                                    { icon: Instagram, href: '#' }
                                ].map((social, index) => (
                                    <motion.a
                                        key={index}
                                        href={social.href}
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="bg-gray-800 p-3 rounded-lg hover:bg-gray-700 transition-colors duration-300"
                                    >
                                        <social.icon className="w-5 h-5 text-gray-400" />
                                    </motion.a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Copyright Section */}
                <div className="border-t border-gray-800 pt-8">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-gray-400">
                            © {new Date().getFullYear()} عقارات عمان. جميع الحقوق محفوظة
                        </div>
                        <div className="flex gap-6">
                            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                                سياسة الخصوصية
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                                الشروط والأحكام
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}