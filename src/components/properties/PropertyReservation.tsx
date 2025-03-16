import React, { useState } from 'react';
import { Calendar, Phone, User, Check } from 'lucide-react';

interface PropertyReservationProps {
    propertyId: number;
}

export const PropertyReservation: React.FC<PropertyReservationProps> = ({ propertyId }) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Reset form and show success message
            setName('');
            setPhone('');
            setIsSubmitted(true);

            // Hide success message after 8 seconds
            setTimeout(() => {
                setIsSubmitted(false);
            }, 8000);
        } catch (error) {
            console.error('Error submitting reservation:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-8 shadow-xl mb-8 hover:shadow-2xl transition-all duration-300">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-4 text-gray-800">
                <Calendar className="w-8 h-8 text-blue-500" />
                <span className="text-xl text-black">
                    حجز العقار
                </span>
            </h2>

            {isSubmitted ? (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 p-6 rounded-xl flex items-center gap-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                        <Check className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-bold mb-1">تم استلام طلب الحجز بنجاح!</h3>
                        <p>سوف يتم الرد خلال 72 ساعة</p>
                    </div>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="p-6 bg-blue-50 rounded-xl mb-6">
                        <p className="text-gray-700">قم بملء بياناتك لحجز هذا العقار. سيتواصل معك فريقنا في أقرب وقت لتأكيد الحجز.</p>
                    </div>
                    
                    <div className="space-y-6">
                        <div className="relative">
                            <label htmlFor="name" className="block text-gray-700 mb-2 font-medium">الاسم كامل</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <User className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="أدخل الاسم الكامل"
                                />
                            </div>
                        </div>
                        
                        <div className="relative">
                            <label htmlFor="phone" className="block text-gray-700 mb-2 font-medium">رقم الهاتف</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                    <Phone className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="tel"
                                    id="phone"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="أدخل رقم الهاتف"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center mt-8">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-colors w-full md:w-auto flex items-center justify-center gap-2 ${
                                isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
                            }`}
                        >
                            <Calendar className="w-5 h-5" />
                            {isSubmitting ? 'جاري الإرسال...' : 'تأكيد الحجز'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};