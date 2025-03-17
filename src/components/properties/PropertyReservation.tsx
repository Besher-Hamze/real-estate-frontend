import React, { useState } from 'react';
import { Calendar, Phone, User, X, File, Mail, MessageSquare } from 'lucide-react';

interface PropertyReservationModalProps {
    propertyId: number;
    isOpen: boolean;
    onClose: () => void;
}

export const PropertyReservationModal: React.FC<PropertyReservationModalProps> = ({
    propertyId,
    isOpen,
    onClose
}) => {
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [whatsappPhone, setWhatsappPhone] = useState('');
    const [email, setEmail] = useState('');
    const [description, setDescription] = useState('');
    const [idCard, setIdCard] = useState<File | null>(null);
    const [commercialRegister, setCommercialRegister] = useState<File | null>(null);
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
            setWhatsappPhone('');
            setEmail('');
            setDescription('');
            setIdCard(null);
            setCommercialRegister(null);
            setIsSubmitted(true);

            // Hide success message after 5 seconds
            setTimeout(() => {
                setIsSubmitted(false);
                onClose();
            }, 5000);
        } catch (error) {
            console.error('Error submitting reservation:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: React.Dispatch<React.SetStateAction<File | null>>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-auto">
                <div className="sticky top-0 bg-white p-4 border-b border-gray-200 flex justify-between items-center rounded-t-2xl z-10">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
                        <Calendar className="w-6 h-6 text-blue-500" />
                        <span>حجز العقار</span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        aria-label="إغلاق"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6">
                    {isSubmitted ? (
                        <div className="bg-blue-50 border border-blue-200 text-blue-700 p-6 rounded-xl flex items-center gap-4">
                            <div className="bg-blue-100 p-2 rounded-full">
                                <Calendar className="w-6 h-6 text-blue-600" />
                            </div>
                            <div>
                                <h3 className="font-bold mb-1">تم استلام طلب الحجز بنجاح!</h3>
                                <p>سوف يتم الرد خلال 72 ساعة</p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="p-4 bg-blue-50 rounded-xl mb-6">
                                <p className="text-gray-700">قم بملء بياناتك لحجز هذا العقار. سيتواصل معك فريقنا في أقرب وقت لتأكيد الحجز.</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative">
                                    <label htmlFor="name" className="block text-gray-700 mb-2 font-medium">الاسم كامل <span className="text-red-500">*</span></label>
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
                                    <label htmlFor="phone" className="block text-gray-700 mb-2 font-medium">رقم الهاتف <span className="text-red-500">*</span></label>
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

                                <div className="relative">
                                    <label htmlFor="whatsapp" className="block text-gray-700 mb-2 font-medium">رقم الواتساب <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                            <Phone className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="tel"
                                            id="whatsapp"
                                            value={whatsappPhone}
                                            onChange={(e) => setWhatsappPhone(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="أدخل رقم الواتساب"
                                        />
                                    </div>
                                </div>

                                <div className="relative">
                                    <label htmlFor="email" className="block text-gray-700 mb-2 font-medium">البريد الإلكتروني <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                            <Mail className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="email"
                                            id="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="أدخل البريد الإلكتروني"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="relative">
                                    <label htmlFor="idCard" className="block text-gray-700 mb-2 font-medium">صورة البطاقة الشخصية <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                            <File className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="file"
                                            id="idCard"
                                            onChange={(e) => handleFileChange(e, setIdCard)}
                                            required
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">PDF أو صورة</p>
                                </div>
                                
                                <div className="relative">
                                    <label htmlFor="commercialRegister" className="block text-gray-700 mb-2 font-medium">السجل التجاري <span className="text-red-500">*</span></label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                            <File className="h-5 w-5 text-gray-400" />
                                        </div>
                                        <input
                                            type="file"
                                            id="commercialRegister"
                                            onChange={(e) => handleFileChange(e, setCommercialRegister)}
                                            required
                                            accept=".pdf,.jpg,.jpeg,.png"
                                            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">PDF أو صورة</p>
                                </div>
                            </div>

                            <div className="relative">
                                <label htmlFor="description" className="block text-gray-700 mb-2 font-medium">الوصف</label>
                                <div className="relative">
                                    <div className="absolute top-3 right-3">
                                        <MessageSquare className="h-5 w-5 text-gray-400" />
                                    </div>
                                    <textarea
                                        id="description"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        rows={4}
                                        className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="أدخل وصفًا إضافيًا..."
                                    />
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
            </div>
        </div>
    );
};