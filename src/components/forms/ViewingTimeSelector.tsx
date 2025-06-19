import React, { useState, useEffect } from 'react';

interface ViewingTimeProps {
  value: any;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
}

interface TimeSlot {
  from: string;
  to: string;
}

interface DaySchedule {
  [day: string]: TimeSlot[];
}

const ViewingTimeSelector: React.FC<ViewingTimeProps> = ({
  value,
  onChange,
  error,
  label = "وقت المشاهدة"
}) => {
  // Local state to track UI selections - now each day can have multiple time slots
  const [schedule, setSchedule] = useState<DaySchedule>({});

  const weekdays = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

  // Parse existing value string when component loads or value changes
  useEffect(() => {
    if (value && typeof value === 'string') {
      try {
        const newSchedule: DaySchedule = {};

        // Split by days and parse each day's schedule
        weekdays.forEach(day => {
          const dayPattern = new RegExp(`${day}:([^]*?)(?=${weekdays.join('|')}|$)`, 'g');
          const dayMatch = dayPattern.exec(value);

          if (dayMatch) {
            const dayContent = dayMatch[1].trim();
            const timeSlots: TimeSlot[] = [];

            // Extract all time ranges for this day
            const timePattern = /من الساعة ([^ ]+) إلى ([^.،]+)/g;
            let timeMatch;

            while ((timeMatch = timePattern.exec(dayContent)) !== null) {
              timeSlots.push({
                from: timeMatch[1].trim(),
                to: timeMatch[2].trim()
              });
            }

            if (timeSlots.length > 0) {
              newSchedule[day] = timeSlots;
            }
          }
        });

        setSchedule(newSchedule);
      } catch (e) {
        console.error("Failed to parse viewing time string:", e);
      }
    }
  }, []);

  // Update the viewTime string whenever schedule changes
  useEffect(() => {
    updateViewTimeString();
  }, [schedule]);

  // Generate the formatted view time string
  const updateViewTimeString = () => {
    let viewTimeString = '';

    Object.entries(schedule).forEach(([day, timeSlots]) => {
      if (timeSlots && timeSlots.length > 0) {
        viewTimeString += `${day}: `;

        const validTimeSlots = timeSlots.filter(slot => slot.from && slot.to);

        if (validTimeSlots.length > 0) {
          const timeStrings = validTimeSlots.map(slot =>
            `من الساعة ${slot.from} إلى ${slot.to}`
          );

          viewTimeString += timeStrings.join('، ') + '. ';
        }
      }
    });

    onChange(viewTimeString.trim());
  };

  // Add a new time slot for a specific day
  const addTimeSlot = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: [...(prev[day] || []), { from: '', to: '' }]
    }));
  };

  // Remove a time slot for a specific day
  const removeTimeSlot = (day: string, index: number) => {
    setSchedule(prev => {
      const daySlots = [...(prev[day] || [])];
      daySlots.splice(index, 1);

      if (daySlots.length === 0) {
        const newSchedule = { ...prev };
        delete newSchedule[day];
        return newSchedule;
      }

      return {
        ...prev,
        [day]: daySlots
      };
    });
  };

  // Update a specific time slot
  const updateTimeSlot = (day: string, index: number, field: 'from' | 'to', value: string) => {
    setSchedule(prev => ({
      ...prev,
      [day]: (prev[day] || []).map((slot, i) =>
        i === index ? { ...slot, [field]: value } : slot
      )
    }));
  };

  // Generate time options (24-hour format with AM/PM in Arabic)
  const generateTimeOptions = () => {
    const times = [];

    // Morning hours (7 AM to 11:59 AM)
    for (let hour = 7; hour <= 11; hour++) {
      times.push(`${hour}:00 صباحًا`);
      times.push(`${hour}:30 صباحًا`);
    }

    // Noon
    times.push('12:00 مساءً');
    times.push('12:30 مساءً');

    // Afternoon/Evening hours (1 PM to 11:59 PM)
    for (let hour = 1; hour <= 11; hour++) {
      times.push(`${hour}:00 مساءً`);
      times.push(`${hour}:30 مساءً`);
    }

    return times;
  };

  const timeOptions = generateTimeOptions();

  // Filter "to" options based on "from" selection
  const getFilteredToOptions = (fromTime: string) => {
    if (!fromTime) return timeOptions;

    const fromIndex = timeOptions.indexOf(fromTime);
    return timeOptions.slice(fromIndex + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
          <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
          <p className="text-sm text-gray-600">حدد الأوقات المتاحة لمعاينة العقار</p>
        </div>
      </div>

      {/* Days with time slots */}
      <div className="space-y-4">
        {weekdays.map((day) => (
          <div key={day} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center">
                    <span className="text-xs font-medium text-white">{day.charAt(0)}</span>
                  </div>
                  <h4 className="text-base font-medium text-gray-900">{day}</h4>
                  {schedule[day] && schedule[day].length > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {schedule[day].length} موعد
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => addTimeSlot(day)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  إضافة موعد
                </button>
              </div>
            </div>

            {/* Time slots for this day */}
            <div className="p-4">
              {schedule[day] && schedule[day].length > 0 ? (
                <div className="space-y-3">
                  {schedule[day].map((slot, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-2 flex-1">
                        <select
                          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-colors"
                          value={slot.from}
                          onChange={(e) => updateTimeSlot(day, index, 'from', e.target.value)}
                        >
                          <option value="">من الساعة</option>
                          {timeOptions.map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>

                        <div className="flex items-center justify-center px-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>

                        <select
                          className="flex-1 px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm transition-colors disabled:bg-gray-100 disabled:text-gray-400"
                          value={slot.to}
                          onChange={(e) => updateTimeSlot(day, index, 'to', e.target.value)}
                          disabled={!slot.from}
                        >
                          <option value="">إلى الساعة</option>
                          {getFilteredToOptions(slot.from).map((time) => (
                            <option key={time} value={time}>
                              {time}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeTimeSlot(day, index)}
                        className="flex items-center justify-center w-8 h-8 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-3">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500">لا توجد مواعيد لهذا اليوم</p>
                  <p className="text-xs text-gray-400 mt-1">انقر على إضافة موعد لإضافة وقت جديد</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Preview */}
      {value && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-green-900 mb-2">معاينة جدول المواعيد</h4>
              <div className="text-sm text-green-800 leading-relaxed bg-white/60 rounded-lg p-3 border border-green-200/50">
                {value.split('. ').map((line, index) => (
                  line.trim() && (
                    <div key={index} className="mb-2 last:mb-0">
                      {line.trim()}.
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-red-900 mb-1">خطأ في البيانات</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewingTimeSelector;