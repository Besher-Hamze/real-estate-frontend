import React, { useState, useEffect } from 'react';
import { Calendar, Clock, ChevronDown, X, Plus, Check } from 'lucide-react';

interface ViewingTime {
    date: string;
    timeSlots: string[];
}

interface ViewingTimeSelectorProps {
    value?: ViewingTime[];
    onChange: (viewingTimes: ViewingTime[]) => void;
    className?: string;
}

const ViewingTimeSelector: React.FC<ViewingTimeSelectorProps> = ({
    value = [],
    onChange,
    className = ""
}) => {
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string>('');
    const [viewingTimes, setViewingTimes] = useState<ViewingTime[]>(value);
    const [isAddingTime, setIsAddingTime] = useState(false);

    // Time slots (every 30 minutes from 8 AM to 10 PM)
    const timeSlots = [
        '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
        '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
        '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
        '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
        '20:00', '20:30', '21:00', '21:30', '22:00'
    ];

    // Get next 30 days starting from today
    const getAvailableDates = () => {
        const dates = [];
        const today = new Date();

        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() + i);
            dates.push({
                value: date.toISOString().split('T')[0],
                label: formatDateLabel(date),
                isToday: i === 0,
                dayName: date.toLocaleDateString('ar-EG', { weekday: 'long' })
            });
        }
        return dates;
    };

    const formatDateLabel = (date: Date) => {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        if (date.toDateString() === today.toDateString()) {
            return 'اليوم';
        } else if (date.toDateString() === tomorrow.toDateString()) {
            return 'غداً';
        } else {
            return date.toLocaleDateString('ar-EG', {
                month: 'long',
                day: 'numeric',
                weekday: 'short'
            });
        }
    };

    const addViewingTime = () => {
        if (!selectedDate || !selectedTime) return;

        const existingDateIndex = viewingTimes.findIndex(vt => vt.date === selectedDate);
        let newViewingTimes = [...viewingTimes];

        if (existingDateIndex >= 0) {
            // Add time to existing date
            if (!newViewingTimes[existingDateIndex].timeSlots.includes(selectedTime)) {
                newViewingTimes[existingDateIndex].timeSlots.push(selectedTime);
                newViewingTimes[existingDateIndex].timeSlots.sort();
            }
        } else {
            // Create new date entry
            newViewingTimes.push({
                date: selectedDate,
                timeSlots: [selectedTime]
            });
        }

        // Sort by date
        newViewingTimes.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        setViewingTimes(newViewingTimes);
        onChange(newViewingTimes);
        setSelectedTime('');
        setIsAddingTime(false);
    };

    const removeViewingTime = (date: string, timeSlot: string) => {
        const newViewingTimes = viewingTimes.map(vt => {
            if (vt.date === date) {
                const newTimeSlots = vt.timeSlots.filter(ts => ts !== timeSlot);
                return { ...vt, timeSlots: newTimeSlots };
            }
            return vt;
        }).filter(vt => vt.timeSlots.length > 0);

        setViewingTimes(newViewingTimes);
        onChange(newViewingTimes);
    };

    const formatTimeDisplay = (time: string) => {
        const [hours, minutes] = time.split(':');
        const hour24 = parseInt(hours);
        const period = hour24 >= 12 ? 'م' : 'ص';
        const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
        return `${hour12}:${minutes} ${period}`;
    };

    const availableDates = getAvailableDates();

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Current viewing times */}
            {viewingTimes.length > 0 && (
                <div className="space-y-3">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        أوقات المعاينة المحددة
                    </h4>

                    <div className="space-y-2">
                        {viewingTimes.map((viewingTime) => (
                            <div key={viewingTime.date} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-blue-900">
                                        {formatDateLabel(new Date(viewingTime.date))} - {new Date(viewingTime.date).toLocaleDateString('ar-EG')}
                                    </span>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {viewingTime.timeSlots.map((timeSlot) => (
                                        <div
                                            key={timeSlot}
                                            className="flex items-center gap-2 bg-white border border-blue-300 rounded-md px-3 py-1"
                                        >
                                            <Clock className="w-3 h-3 text-blue-500" />
                                            <span className="text-sm text-blue-700">{formatTimeDisplay(timeSlot)}</span>
                                            <button
                                                type="button"
                                                onClick={() => removeViewingTime(viewingTime.date, timeSlot)}
                                                className="text-red-500 hover:text-red-700 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add new viewing time */}
            {!isAddingTime ? (
                <button
                    type="button"
                    onClick={() => setIsAddingTime(true)}
                    className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    إضافة وقت معاينة
                </button>
            ) : (
                <div className="border border-gray-300 rounded-lg p-4 space-y-4 bg-gray-50">
                    <h4 className="font-medium text-gray-800">إضافة وقت معاينة جديد</h4>

                    {/* Date selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            اختر التاريخ
                        </label>
                        <select
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">اختر التاريخ</option>
                            {availableDates.map((date) => (
                                <option key={date.value} value={date.value}>
                                    {date.label} ({date.dayName}) - {new Date(date.value).toLocaleDateString('ar-EG')}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Time selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            اختر الوقت
                        </label>
                        <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                            {timeSlots.map((time) => {
                                const isDisabled = selectedDate &&
                                    viewingTimes.find(vt => vt.date === selectedDate)?.timeSlots.includes(time);

                                return (
                                    <button
                                        key={time}
                                        type="button"
                                        onClick={() => setSelectedTime(time)}
                                        disabled={isDisabled}
                                        className={`p-2 text-sm rounded-md border transition-colors ${selectedTime === time
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : isDisabled
                                                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                    : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                                            }`}
                                    >
                                        {formatTimeDisplay(time)}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={addViewingTime}
                            disabled={!selectedDate || !selectedTime}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            <Check className="w-4 h-4" />
                            إضافة
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setIsAddingTime(false);
                                setSelectedDate('');
                                setSelectedTime('');
                            }}
                            className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 transition-colors"
                        >
                            إلغاء
                        </button>
                    </div>
                </div>
            )}

            {viewingTimes.length === 0 && !isAddingTime && (
                <p className="text-sm text-gray-500 text-center py-4">
                    لم يتم تحديد أوقات معاينة بعد
                </p>
            )}
        </div>
    );
};

export default ViewingTimeSelector;