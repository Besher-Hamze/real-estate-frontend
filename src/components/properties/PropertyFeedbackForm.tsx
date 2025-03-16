import React, { useState } from 'react';
import { Send } from 'lucide-react';

interface PropertyFeedbackFormProps {
    propertyId: number;
}

export const PropertyFeedbackForm: React.FC<PropertyFeedbackFormProps> = ({ propertyId }) => {
    const [feedback, setFeedback] = useState('');
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
            setFeedback('');
            setName('');
            setPhone('');
            setIsSubmitted(true);

            // Hide success message after 5 seconds
            setTimeout(() => {
                setIsSubmitted(false);
            }, 5000);
        } catch (error) {
            console.error('Error submitting feedback:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-white rounded-3xl p-8 shadow-xl mb-8 hover:shadow-2xl transition-all duration-300">
            <h2 className="text-3xl font-bold mb-8 flex items-center gap-4 text-gray-800">
                <Send className="w-8 h-8 text-blue-500" />
                <span className="text-xl text-black">
                    تقديم طلب كرضك
                </span>
            </h2>

            {isSubmitted ? (
                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-center">
                    تم إرسال طلبك بنجاح! سنتواصل معك قريباً.
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="name" className="block text-gray-700 mb-2">الاسم كامل</label>
                            <input
                                type="text"
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="أدخل الاسم"
                            />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-gray-700 mb-2">رقم الهاتف</label>
                            <input
                                type="tel"
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="أدخل رقم الهاتف"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="feedback" className="block text-gray-700 mb-2">الوصف</label>
                        <textarea
                            id="feedback"
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            required
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="اكتب وصفاً للعقار الذي تبحث عنه..."
                        />
                    </div>

                    <div className="text-center">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-colors ${isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
                                }`}
                        >
                            {isSubmitting ? 'جاري الإرسال...' : 'إرسال الطلب'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};