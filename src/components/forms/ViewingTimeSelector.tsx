import React, { useState, useEffect, useCallback, useRef } from 'react';

interface ViewingTimeProps {
  value: any;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
}

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

const ViewingTimeSelector: React.FC<ViewingTimeProps> = ({
  value,
  onChange,
  error,
  label = "أوقات المعاينة"
}) => {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [isAlwaysAvailable, setIsAlwaysAvailable] = useState(false);
  const isInitialized = useRef(false);
  const onChangeRef = useRef(onChange);

  // Always keep the latest onChange reference
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const weekdays = [
    { value: "السبت", label: "السبت" },
    { value: "الأحد", label: "الأحد" },
    { value: "الاثنين", label: "الاثنين" },
    { value: "الثلاثاء", label: "الثلاثاء" },
    { value: "الأربعاء", label: "الأربعاء" },
    { value: "الخميس", label: "الخميس" },
    { value: "الجمعة", label: "الجمعة" }
  ];

  // Generate time options
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 7; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        times.push(timeString);
      }
    }
    return times;
  };

  const timeOptions = generateTimeOptions();

  // Convert Arabic time format to 24-hour format
  const convertArabicTimeToFormat = (timeStr: string): string => {
    if (timeStr.includes('صباحًا')) {
      const time = timeStr.replace(' صباحًا', '');
      const [hour, minute = '00'] = time.split(':');
      let hourNum = parseInt(hour);
      if (hourNum === 12) hourNum = 0;
      return `${hourNum.toString().padStart(2, '0')}:${minute}`;
    } else if (timeStr.includes('مساءً')) {
      const time = timeStr.replace(' مساءً', '');
      const [hour, minute = '00'] = time.split(':');
      let hourNum = parseInt(hour);
      if (hourNum !== 12) hourNum += 12;
      return `${hourNum.toString().padStart(2, '0')}:${minute}`;
    }
    return timeStr;
  };

  // Convert 24-hour format to Arabic time format
  const convertToArabicTime = (timeStr: string): string => {
    const [hour, minute] = timeStr.split(':');
    const hourNum = parseInt(hour);

    if (hourNum === 0) {
      return `12:${minute} صباحًا`;
    } else if (hourNum < 12) {
      return `${hourNum}:${minute} صباحًا`;
    } else if (hourNum === 12) {
      return `12:${minute} مساءً`;
    } else {
      return `${hourNum - 12}:${minute} مساءً`;
    }
  };

  // Parse existing value only on initial load
  useEffect(() => {
    if (!isInitialized.current && value && typeof value === 'string' && value.trim()) {
      try {
        // Check if it's "always available" format
        if (value.includes('متاح على مدار الساعة') || value.includes('متاح في جميع الأوقات') || value.includes('متاح بكل الأوقات')) {
          setIsAlwaysAvailable(true);
          setTimeSlots([]);
        } else {
          // Parse specific time slots
          const slots: TimeSlot[] = [];
          const dayMatches = value.match(/(\w+):\s*من الساعة ([^\s]+) إلى ([^.،]+)/g);

          if (dayMatches) {
            dayMatches.forEach(match => {
              const parts = match.match(/(\w+):\s*من الساعة ([^\s]+) إلى ([^.،]+)/);
              if (parts) {
                slots.push({
                  day: parts[1].trim(),
                  startTime: convertArabicTimeToFormat(parts[2].trim()),
                  endTime: convertArabicTimeToFormat(parts[3].trim())
                });
              }
            });
          }

          setTimeSlots(slots);
          setIsAlwaysAvailable(false);
        }
      } catch (e) {
        console.error("Failed to parse viewing time:", e);
      }
    }
    isInitialized.current = true;
  }, [value]);

  // Update output string - using useCallback to prevent recreation
  const updateOutput = useCallback(() => {
    if (!isInitialized.current) return;

    if (isAlwaysAvailable) {
      onChangeRef.current('متاح على مدار الساعة - يمكن المعاينة في أي وقت.');
    } else {
      const validSlots = timeSlots.filter(slot => slot.day && slot.startTime && slot.endTime);

      if (validSlots.length > 0) {
        const outputString = validSlots.map(slot =>
          `${slot.day}: من الساعة ${convertToArabicTime(slot.startTime)} إلى ${convertToArabicTime(slot.endTime)}`
        ).join('. ') + '.';
        onChangeRef.current(outputString);
      } else {
        onChangeRef.current('');
      }
    }
  }, [timeSlots, isAlwaysAvailable]);

  // Call updateOutput when timeSlots or isAlwaysAvailable change
  useEffect(() => {
    updateOutput();
  }, [updateOutput]);

  // Handle always available toggle
  const handleAlwaysAvailableChange = (checked: boolean) => {
    setIsAlwaysAvailable(checked);
    if (checked) {
      setTimeSlots([]); // Clear existing time slots when always available is selected
    }
  };

  // Add new time slot
  const addTimeSlot = () => {
    setTimeSlots(prev => [...prev, {
      day: '',
      startTime: '09:00',
      endTime: '17:00'
    }]);
  };

  // Remove time slot
  const removeTimeSlot = (index: number) => {
    setTimeSlots(prev => prev.filter((_, i) => i !== index));
  };

  // Update time slot
  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: string) => {
    setTimeSlots(prev => prev.map((slot, i) =>
      i === index ? { ...slot, [field]: value } : slot
    ));
  };

  // Get filtered end time options
  const getEndTimeOptions = (startTime: string) => {
    if (!startTime) return timeOptions;
    const startIndex = timeOptions.indexOf(startTime);
    return timeOptions.slice(startIndex + 1);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">{label}</h3>
          <p className="text-xs text-gray-500 mt-1">حدد الأيام والأوقات المتاحة للمعاينة</p>
        </div>
        {!isAlwaysAvailable && (
          <button
            type="button"
            onClick={addTimeSlot}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            إضافة وقت
          </button>
        )}
      </div>

      {/* Always Available Option */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={isAlwaysAvailable}
            onChange={(e) => handleAlwaysAvailableChange(e.target.checked)}
            className="w-4 h-4 text-green-600 bg-white border-green-300 rounded focus:ring-green-500 focus:ring-2"
          />
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <span className="text-sm font-medium text-green-900">متاح على مدار الساعة</span>
              <p className="text-xs text-green-700">يمكن المعاينة في أي وقت حسب اتفاق مسبق</p>
            </div>
          </div>
        </label>
      </div>

      {/* Time Slots Section - Only show if not always available */}
      {!isAlwaysAvailable && (
        <div className="space-y-3">
          {timeSlots.map((slot, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border">
              {/* Day Selector */}
              <select
                value={slot.day}
                onChange={(e) => updateTimeSlot(index, 'day', e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">اختر اليوم</option>
                {weekdays.map(day => (
                  <option key={day.value} value={day.value}>
                    {day.label}
                  </option>
                ))}
              </select>

              {/* Start Time */}
              <select
                value={slot.startTime}
                onChange={(e) => updateTimeSlot(index, 'startTime', e.target.value)}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">من</option>
                {timeOptions.map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>

              {/* Separator */}
              <span className="text-gray-400 text-sm">-</span>

              {/* End Time */}
              <select
                value={slot.endTime}
                onChange={(e) => updateTimeSlot(index, 'endTime', e.target.value)}
                disabled={!slot.startTime}
                className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">إلى</option>
                {getEndTimeOptions(slot.startTime).map(time => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>

              {/* Remove Button */}
              <button
                type="button"
                onClick={() => removeTimeSlot(index)}
                className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}

          {/* Empty State - Only show if not always available and no time slots */}
          {timeSlots.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <div className="w-12 h-12 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 mb-2">لم يتم تحديد أوقات معاينة</p>
              <p className="text-xs text-gray-400">انقر على إضافة وقت لتحديد الأوقات المتاحة أو اختر متاح على مدار الساعة</p>
            </div>
          )}
        </div>
      )}

      {/* Always Available Display */}
      {isAlwaysAvailable && (
        <div className="text-center py-8 bg-green-50 border-2 border-green-200 rounded-lg">
          <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm font-medium text-green-900 mb-1">متاح على مدار الساعة</p>
          <p className="text-xs text-green-700">يمكن ترتيب المعاينة في أي وقت مناسب</p>
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className={`border rounded-lg p-3 ${isAlwaysAvailable ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
          <h4 className={`text-sm font-medium mb-2 ${isAlwaysAvailable ? 'text-green-900' : 'text-blue-900'}`}>المعاينة:</h4>
          <p className={`text-sm leading-relaxed ${isAlwaysAvailable ? 'text-green-800' : 'text-blue-800'}`}>{value}</p>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewingTimeSelector;