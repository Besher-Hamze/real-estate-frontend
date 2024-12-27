import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

export default function Testimonials() {
    const testimonials = [
        {
            name: "أحمد السعيدي",
            role: "مالك عقار",
            content: "تجربة رائعة مع فريق محترف. ساعدوني في بيع عقاري بأفضل سعر ممكن مع ضمان كافة الحقوق.",
            rating: 5
        },
        {
            name: "مريم البلوشي",
            role: "مستثمرة",
            content: "خدمة متميزة وفريق احترافي. وجدت الاستثمار المناسب بفضل نصائحهم القيمة وخبرتهم في السوق.",
            rating: 5
        },
        {
            name: "خالد الحارثي",
            role: "مشتري",
            content: "سرعة في الإجراءات وشفافية في التعامل. أنصح بالتعامل معهم لتجربتهم الواسعة والمهنية العالية.",
            rating: 5
        }
    ];

    return (
        <section className="py-24 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="text-blue-600 font-semibold mb-4 inline-block">آراء العملاء</span>
                    <h2 className="text-4xl font-bold mb-6">ماذا يقول عملاؤنا</h2>
                    <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                        نفخر بثقة عملائنا وآرائهم في خدماتنا المتميزة
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {testimonials.map((testimonial, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2 }}
                            whileHover={{ y: -5 }}
                            className="bg-white p-8 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 relative border border-gray-100"
                        >
                            {/* Quote Icon */}
                            <div className="absolute top-6 left-6">
                                <Quote className="w-8 h-8 text-blue-100/80" />
                            </div>

                            {/* Stars */}
                            <div className="flex mb-6">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star 
                                        key={i} 
                                        className="w-5 h-5 text-yellow-400 fill-yellow-400 me-1" 
                                    />
                                ))}
                            </div>

                            {/* Content */}
                            <p className="text-gray-700 mb-8 text-lg leading-relaxed relative">
                                {testimonial.content}
                            </p>

                            {/* Author */}
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-gradient-to-tr from-blue-600 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-white font-semibold text-lg">
                                        {testimonial.name[0]}
                                    </span>
                                </div>
                                <div className="mr-4">
                                    <div className="font-bold text-gray-900">
                                        {testimonial.name}
                                    </div>
                                    <div className="text-blue-600 text-sm">
                                        {testimonial.role}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}