import { Check, Info, X } from 'lucide-react'
import React, { useState } from 'react'
interface AdviceInterface {
    setIsModalOpen?: any;
    isModalOpen: boolean;
}
const AdviseImage = ({ setIsModalOpen, isModalOpen }: AdviceInterface) => {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
                {/* Modal Header */}
                <div className="p-4 border-b flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Info className="w-5 h-5 text-blue-500" />
                        <h3 className="font-medium text-lg">نصائح لالتقاط صور جيدة</h3>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Content */}
                <div className="p-4 text-right">
                    <p className="text-gray-600 mb-4">
                        فيما يلي بعض النصائح للمساعدة في جعل إعلاناتك أكثر جاذبية عن طريق تحميل صور عالية الجودة.
                    </p>

                    {/* Tip 1 - Zoom */}
                    <div className="mb-6">
                        <h4 className="font-semibold text-lg mb-2">التكبير</h4>
                        <p className="text-gray-600 mb-3">
                            اقترب من المنتج أو قم بالابتعاد عنه وضبط إطار العدسة به لتزويد المشترين المحتملين برؤية واضحة للتفاصيل. تجنب تكبير أو قص الصورة بطريقة غير صحيحة الذي قد ينتج عنه صورة مشوهة أو غير واضحة.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <div className="flex flex-col items-center">
                                <div className="relative w-32 h-24 border border-red-200 rounded overflow-hidden mb-2">
                                    <X className="absolute top-1 right-1 w-6 h-6 text-red-500 bg-white rounded-full p-1" />
                                    <img src="/api/placeholder/128/96" alt="مثال سيء" className="w-full h-full object-cover" />
                                </div>
                                <span className="text-xs text-red-500">غير صحيح</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="relative w-32 h-24 border border-green-200 rounded overflow-hidden mb-2">
                                    <Check className="absolute top-1 right-1 w-6 h-6 text-green-500 bg-white rounded-full p-1" />
                                    <img src="/api/placeholder/128/96" alt="مثال جيد" className="w-full h-full object-cover" />
                                </div>
                                <span className="text-xs text-green-500">صحيح</span>
                            </div>
                        </div>
                    </div>

                    {/* Tip 2 - Lighting */}
                    <div className="mb-6">
                        <h4 className="font-semibold text-lg mb-2">استخدم الإضاءة الجيدة</h4>
                        <p className="text-gray-600 mb-3">
                            الإضاءة الجيدة ضرورية لالتقاط صور جذابة. استخدم الضوء الطبيعي كلما أمكن ذلك بالتصوير بالقرب من النافذة أو بالخارج أثناء النهار. إذا كنت تقوم بالتصوير في الداخل, فكر في استخدام مصادر الإضاءة الناعمة والمنتشرة مثل المصابيح أو صناديق الإضاءة لتجنب الظلال.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <div className="flex flex-col items-center">
                                <div className="relative w-32 h-24 border border-red-200 rounded overflow-hidden mb-2">
                                    <X className="absolute top-1 right-1 w-6 h-6 text-red-500 bg-white rounded-full p-1" />
                                    <img src="/api/placeholder/128/96" alt="إضاءة سيئة" className="w-full h-full object-cover" />
                                </div>
                                <span className="text-xs text-red-500">إضاءة سيئة</span>
                            </div>
                            <div className="flex flex-col items-center">
                                <div className="relative w-32 h-24 border border-green-200 rounded overflow-hidden mb-2">
                                    <Check className="absolute top-1 right-1 w-6 h-6 text-green-500 bg-white rounded-full p-1" />
                                    <img src="/api/placeholder/128/96" alt="إضاءة جيدة" className="w-full h-full object-cover" />
                                </div>
                                <span className="text-xs text-green-500">إضاءة جيدة</span>
                            </div>
                        </div>
                    </div>

                    {/* Tip 3 - Multiple Angles */}
                    <div className="mb-6">
                        <h4 className="font-semibold text-lg mb-2">زوايا متعددة</h4>
                        <p className="text-gray-600 mb-3">
                            التقط صوراً للعقار من زوايا مختلفة لإظهار جميع التفاصيل المهمة. قم بتصوير الغرف من الزوايا المختلفة، والتقط صوراً للمميزات الفريدة مثل النوافذ الكبيرة أو التشطيبات عالية الجودة.
                        </p>
                    </div>

                    {/* Modal Footer */}
                    <div className="flex justify-center mt-4">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                        >
                            فهمت
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdviseImage