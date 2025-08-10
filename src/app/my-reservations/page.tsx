'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Phone, Mail, Eye, X, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { reservationsApi, Reservation } from '@/api/reservationsApi';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-toastify';
import Navbar from '@/components/home/Navbar';
import Footer from '@/components/home/Footer';

export default function MyReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const { user, isLoggedIn } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      loadReservations();
    } else {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  const loadReservations = async () => {
    try {
      const data = await reservationsApi.getUserReservations();
      setReservations(data);
    } catch (error: any) {
      toast.error(error.message || 'فشل في تحميل الحجوزات');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'confirmed': return 'مؤكد';
      case 'completed': return 'مكتمل';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const cancelReservation = async (reservationId: number) => {
    try {
      await reservationsApi.updateReservation(reservationId, { status: 'cancelled' });
      setReservations(prev => prev.map(r =>
        r.id === reservationId ? { ...r, status: 'cancelled' } : r
      ));
      toast.success('تم إلغاء الحجز بنجاح');
    } catch (error: any) {
      toast.error(error.message || 'فشل في إلغاء الحجز');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <Navbar />
        <div className="pt-24 pb-16">
          <div className="max-w-2xl mx-auto px-4 text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <Calendar className="w-16 h-16 text-blue-600 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                تسجيل الدخول مطلوب
              </h1>
              <p className="text-gray-600 mb-6">
                يجب تسجيل الدخول لعرض حجوزاتك
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/auth/login"
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/"
                  className="border border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                >
                  العودة للرئيسية
                </Link>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="max-w-6xl mx-auto px-4">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
              <Link href="/" className="hover:text-blue-600">الرئيسية</Link>
              <ArrowRight className="w-4 h-4" />
              <span>حجوزاتي</span>
            </div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">حجوزاتي</h1>
                <p className="text-gray-600">تتبع حالة طلبات معاينة العقارات</p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{reservations.length}</p>
                  <p className="text-sm text-gray-600">إجمالي الحجوزات</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-600">{reservations.filter(r => r.status === 'pending').length}</p>
                  <p className="text-sm text-gray-600">في الانتظار</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{reservations.filter(r => r.status === 'confirmed').length}</p>
                  <p className="text-sm text-gray-600">مؤكدة</p>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{reservations.filter(r => r.status === 'completed').length}</p>
                  <p className="text-sm text-gray-600">مكتملة</p>
                </div>
              </div>
            </div>
          </div>

          {/* Reservations List */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {isLoading ? (
              <div className="p-8 text-center">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">جاري تحميل الحجوزات...</p>
              </div>
            ) : reservations.length === 0 ? (
              <div className="p-8 text-center">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد حجوزات</h3>
                <p className="text-gray-600 mb-6">لم تقم بحجز أي مواعيد معاينة بعد</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {reservations.map((reservation) => (
                  <motion.div
                    key={reservation.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {reservation.propertyTitle}
                            </h3>
                            <p className="text-blue-600 font-medium">
                              {reservation.propertyPrice.toLocaleString('ar-SA')} ر.ع
                            </p>
                          </div>
                          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reservation.status)}`}>
                            {getStatusText(reservation.status)}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(reservation.visitDate)}</span>
                          </div>

                          {reservation.companyName && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{reservation.companyName}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSelectedReservation(reservation);
                            setShowDetailsModal(true);
                          }}
                          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                          <Eye className="w-4 h-4" />
                          التفاصيل
                        </button>

                        {reservation.status === 'pending' && (
                          <button
                            onClick={() => cancelReservation(reservation.id)}
                            className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                          >
                            <X className="w-4 h-4" />
                            إلغاء
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reservation Details Modal */}
      {showDetailsModal && selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">تفاصيل الحجز</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-6">
              {/* Property Info */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">معلومات العقار</h4>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-2">{selectedReservation.propertyTitle}</h5>
                  <p className="text-blue-600 font-semibold text-lg">
                    {selectedReservation.propertyPrice.toLocaleString('ar-SA')} ر.ع
                  </p>
                </div>
              </div>

              {/* Visit Details */}
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-3">تفاصيل الزيارة</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{formatDate(selectedReservation.visitDate)}</span>
                  </div>
                  {/* <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-900">{selectedReservation.visitTime}</span>
                  </div> */}
                  <div className="flex items-center gap-3">
                    <span className="w-5 h-5 flex items-center justify-center">📝</span>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedReservation.status)}`}>
                      {getStatusText(selectedReservation.status)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Info */}
              {selectedReservation.companyName && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">معلومات الشركة</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium text-gray-900">{selectedReservation.companyName}</p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedReservation.notes && (
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">ملاحظاتك</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-700">{selectedReservation.notes}</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}
