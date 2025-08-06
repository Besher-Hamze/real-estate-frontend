// src/components/PropertyReservation.tsx - مكون حجز العقار
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, User, X, Check, MessageSquare, Link } from 'lucide-react';
import { reservationsApi } from '@/api/reservationsApi';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-toastify';

interface PropertyReservationProps {
  propertyId: number;
  propertyTitle: string;
  propertyPrice: number;
  viewTime?: string; // Add viewTime prop
  isOpen: boolean;
  onClose: () => void;
}

export default function PropertyReservation({
  propertyId,
  propertyTitle,
  propertyPrice,
  viewTime,
  isOpen,
  onClose
}: PropertyReservationProps) {
  const [formData, setFormData] = useState({
    visitDate: '',
    visitTime: '',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const { user, isLoggedIn } = useAuth();

  // Reset time selection when date changes
  useEffect(() => {
    if (formData.visitDate) {
      setFormData(prev => ({
        ...prev,
        visitTime: '' // Reset time when date changes
      }));
    }
  }, [formData.visitDate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.visitDate) {
      newErrors.visitDate = 'تاريخ الزيارة مطلوب';
    } else {
      const selectedDate = new Date(formData.visitDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.visitDate = 'يجب أن يكون تاريخ الزيارة في المستقبل';
      }
    }

    // if (!formData.visitTime) {
    //   newErrors.visitTime = 'وقت الزيارة مطلوب';
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      toast.error('يجب تسجيل الدخول أولاً لحجز موعد');
      return;
    }

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await reservationsApi.createReservation({
        propertyId,
        visitDate: formData.visitDate,
        visitTime: "12:00",
        notes: formData.notes
      });

      toast.success('تم إرسال طلب الحجز بنجاح! سيتم التواصل معك قريباً');
      onClose();

      // Reset form
      setFormData({
        visitDate: '',
        visitTime: '',
        notes: ''
      });
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء إرسال طلب الحجز');
    } finally {
      setIsLoading(false);
    }
  };

  // Parse viewTime and generate time slots based on selected date
  const parseViewTimeForDate = (viewTime?: string, selectedDate?: string) => {
    if (!viewTime || !selectedDate) {
      // Default time slots if no viewTime provided
      return [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30', '18:00'
      ];
    }

    const timeSlots: string[] = [];
    const selectedDay = new Date(selectedDate).getDay();

    // Map day numbers to Arabic day names
    const dayNames = {
      0: 'الأحد',
      1: 'الاثنين',
      2: 'الثلاثاء',
      3: 'الأربعاء',
      4: 'الخميس',
      5: 'الجمعة',
      6: 'السبت'
    };

    const selectedDayName = dayNames[selectedDay as keyof typeof dayNames];

    // Parse the viewTime string to extract time ranges for the selected day
    const lines = viewTime.split('\n').filter(line => line.trim());

    lines.forEach(line => {
      // Check if this line contains the selected day
      if (line.includes(selectedDayName)) {
        // Extract time range for this day
        const timeMatch = line.match(/من الساعة (\d{1,2}):(\d{2}) (صباحًا|مساءً|AM|PM) إلى (\d{1,2}):(\d{2}) (صباحًا|مساءً|PM)/);
        if (timeMatch) {
          let startHour = parseInt(timeMatch[1]);
          const startMinute = parseInt(timeMatch[2]);
          let endHour = parseInt(timeMatch[4]);
          const endMinute = parseInt(timeMatch[5]);

          // Convert to 24-hour format
          if (timeMatch[3] === 'مساءً' || timeMatch[3] === 'PM') {
            if (startHour !== 12) startHour += 12;
          }
          if (timeMatch[6] === 'مساءً' || timeMatch[6] === 'PM') {
            if (endHour !== 12) endHour += 12;
          }
          if (timeMatch[3] === 'صباحًا' || timeMatch[3] === 'AM') {
            if (startHour === 12) startHour = 0;
          }
          if (timeMatch[6] === 'صباحًا' || timeMatch[6] === 'AM') {
            if (endHour === 12) endHour = 0;
          }

          // Generate 30-minute intervals for this time period
          let currentHour = startHour;
          let currentMinute = startMinute;

          while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
            const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
            timeSlots.push(timeSlot);

            currentMinute += 30;
            if (currentMinute >= 60) {
              currentMinute = 0;
              currentHour++;
            }
          }
        }
      }
    });

    // If no specific times found for this day, return default times
    if (timeSlots.length === 0) {
      return [
        '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
        '12:00', '12:30', '14:00', '14:30', '15:00', '15:30',
        '16:00', '16:30', '17:00', '17:30', '18:00'
      ];
    }

    // Remove duplicates and sort
    return [...new Set(timeSlots)].sort();
  };

  const timeSlots = parseViewTimeForDate(viewTime, formData.visitDate);

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" dir="rtl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">حجز موعد معاينة</h3>
                <p className="text-sm text-gray-600 mt-1">احجز موعد لمعاينة العقار</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Property Info */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <h4 className="font-semibold text-gray-900 mb-2">{propertyTitle}</h4>
              <p className="text-blue-600 font-bold text-lg">
                {propertyPrice.toLocaleString('ar-SA')} ر.ع
              </p>
            </div>

            {/* Login Required Message */}
            {!isLoggedIn && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-yellow-600" />
                  <span className="text-yellow-800 font-medium">يجب تسجيل الدخول أولاً</span>
                </div>
                <p className="text-yellow-700 text-sm mt-1">
                  سجل دخولك لحجز موعد معاينة العقار
                </p>
              </div>
            )}

            {/* Reservation Form */}
            {isLoggedIn && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Visit Date */}
                <div>
                  <label htmlFor="visitDate" className="block text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    تاريخ الزيارة
                  </label>
                  <input
                    type="date"
                    id="visitDate"
                    name="visitDate"
                    value={formData.visitDate}
                    onChange={handleInputChange}
                    min={getMinDate()}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.visitDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    disabled={isLoading}
                  />
                  {errors.visitDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.visitDate}</p>
                  )}
                </div>

                {/* Visit Time */}
                {/* <div>
                  <label htmlFor="visitTime" className="block text-sm font-medium text-gray-700 mb-2">
                    <Clock className="w-4 h-4 inline mr-2" />
                    وقت الزيارة
                  </label>
                  {formData.visitDate && viewTime && (
                    <div className="mb-2 p-2 bg-blue-50 rounded-lg text-sm text-blue-700">
                      <strong>مواعيد المعاينة المتاحة:</strong>
                      <div className="mt-1 text-xs">
                        {(() => {
                          const selectedDay = new Date(formData.visitDate).getDay();
                          const dayNames = {
                            0: 'الأحد', 1: 'الاثنين', 2: 'الثلاثاء', 3: 'الأربعاء',
                            4: 'الخميس', 5: 'الجمعة', 6: 'السبت'
                          };
                          const dayName = dayNames[selectedDay as keyof typeof dayNames];
                          const lines = viewTime.split('\n').filter(line => line.trim());
                          const daySchedule = lines.find(line => line.includes(dayName));
                          return daySchedule ? daySchedule : 'جميع الأوقات متاحة';
                        })()}
                      </div>
                    </div>
                  )}
                  <select
                    id="visitTime"
                    name="visitTime"
                    value={formData.visitTime}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${errors.visitTime ? 'border-red-500' : 'border-gray-300'
                      }`}
                    disabled={isLoading}
                  >
                    <option value="">اختر الوقت المناسب</option>
                    {timeSlots.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  {errors.visitTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.visitTime}</p>
                  )}
                </div> */}

                {/* Notes */}
                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                    <MessageSquare className="w-4 h-4 inline mr-2" />
                    ملاحظات (اختيارية)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleInputChange}
                    placeholder="أي ملاحظات أو متطلبات خاصة للزيارة..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    disabled={isLoading}
                  />
                </div>

                {/* User Info Display */}
                {user && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">بيانات التواصل:</h5>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">الاسم:</span> {user.fullName}</p>
                      <p><span className="font-medium">البريد:</span> {user.email}</p>
                      {user.phone && (
                        <p><span className="font-medium">الهاتف:</span> {user.phone}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <motion.button
                    type="submit"
                    disabled={isLoading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Check className="w-5 h-5" />
                        إرسال طلب الحجز
                      </>
                    )}
                  </motion.button>

                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                    disabled={isLoading}
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            )}

            {/* Login Buttons for non-logged users */}
            {!isLoggedIn && (
              <div className="space-y-3">
                <Link
                  href="/auth/login"
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  <User className="w-5 h-5" />
                  تسجيل الدخول
                </Link>
                <Link
                  href="/auth/register"
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
                >
                  إنشاء حساب جديد
                </Link>
              </div>
            )}

            {/* Info Note */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>ملاحظة:</strong> سيتم التواصل معك خلال 24 ساعة لتأكيد موعد الزيارة.
                يمكنك تتبع حالة طلبك في صفحة حجوزاتي.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
