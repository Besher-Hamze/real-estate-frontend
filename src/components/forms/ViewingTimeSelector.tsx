import React, { useState, useEffect } from 'react';

interface ViewingTimeProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
}

const ViewingTimeSelector: React.FC<ViewingTimeProps> = ({
  value,
  onChange,
  error,
  label = "وقت المشاهدة"
}) => {
  // Local state to track UI selections
  const [formState, setFormState] = useState({
    selectedDays: [] as string[],
    morningTimeFrom: "",
    morningTimeTo: "",
    eveningTimeFrom: "",
    eveningTimeTo: ""
  });

  // Parse existing value string when component loads or value changes
  useEffect(() => {
    if (value) {
      try {
        // Try to parse days
        const daysMatch = value.match(/أيام المشاهدة: ([^.]+)/);
        const selectedDays = daysMatch ? daysMatch[1].split('، ') : [];

        // Try to parse morning time
        const morningMatch = value.match(/الفترة الصباحية: من الساعة ([^ ]+) إلى ([^.]+)/);
        const morningTimeFrom = morningMatch ? morningMatch[1] : "";
        const morningTimeTo = morningMatch ? morningMatch[2] : "";

        // Try to parse evening time
        const eveningMatch = value.match(/الفترة المسائية: من الساعة ([^ ]+) إلى ([^.]+)/);
        const eveningTimeFrom = eveningMatch ? eveningMatch[1] : "";
        const eveningTimeTo = eveningMatch ? eveningMatch[2] : "";

        setFormState({
          selectedDays,
          morningTimeFrom,
          morningTimeTo,
          eveningTimeFrom,
          eveningTimeTo
        });
      } catch (e) {
        console.error("Failed to parse viewing time string:", e);
      }
    }
  }, []);

  // Update the viewTime string whenever form state changes
  useEffect(() => {
    updateViewTimeString();
  }, [formState]);

  // Generate the formatted view time string
  const updateViewTimeString = () => {
    const { selectedDays, morningTimeFrom, morningTimeTo, eveningTimeFrom, eveningTimeTo } = formState;
    
    let viewTimeString = '';
    
    // Add days
    if (selectedDays && selectedDays.length > 0) {
      viewTimeString += `أيام المشاهدة: ${selectedDays.join('، ')}. `;
    }
    
    // Add morning slot
    if (morningTimeFrom && morningTimeTo) {
      viewTimeString += `الفترة الصباحية: من الساعة ${morningTimeFrom} إلى ${morningTimeTo}. `;
    }
    
    // Add evening slot
    if (eveningTimeFrom && eveningTimeTo) {
      viewTimeString += `الفترة المسائية: من الساعة ${eveningTimeFrom} إلى ${eveningTimeTo}.`;
    }
    
    // Update the main form data
    onChange(viewTimeString);
  };

  // Handle form state changes
  const handleFormStateChange = (field: string, value: any) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Toggle day selection
  const toggleDay = (day: string) => {
    setFormState(prev => {
      const newSelectedDays = prev.selectedDays.includes(day)
        ? prev.selectedDays.filter(d => d !== day)
        : [...prev.selectedDays, day];
      
      return {
        ...prev,
        selectedDays: newSelectedDays
      };
    });
  };

  const weekdays = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

  // Time options for both morning and evening
  const morningHours = Array.from({ length: 13 }, (_, i) => i + 7).map((hour) => ({
    value: hour <= 12 ? `${hour}:00 صباحًا` : `${hour-12}:00 مساءً`,
    label: hour <= 12 ? `${hour}:00 صباحًا` : `${hour-12}:00 مساءً`
  }));

  const eveningHours = Array.from({ length: 12 }, (_, i) => i + 12).map((hour) => ({
    value: hour === 12 ? `${hour}:00 مساءً` : `${hour-12}:00 مساءً`,
    label: hour === 12 ? `${hour}:00 مساءً` : `${hour-12}:00 مساءً`
  }));

  return (
    <div className="mb-4">
      
      {/* Days Selection */}
      <div className="p-3 border border-gray-200 rounded-md mb-3">
        <label className="block text-sm text-gray-600 mb-2">أيام المشاهدة المتاحة</label>
        <div className="flex flex-wrap gap-1">
          {weekdays.map((day) => (
            <button 
              key={day}
              type="button"
              className={`px-2 py-1 rounded text-sm cursor-pointer border ${
                formState.selectedDays.includes(day) 
                  ? 'bg-blue-500 text-white border-blue-500' 
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => toggleDay(day)}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Morning Time Slot */}
        <div className="p-3 border border-gray-200 rounded-md">
          <label className="block text-sm text-gray-600 mb-2">الفترة الصباحية</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                value={formState.morningTimeFrom}
                onChange={(e) => handleFormStateChange('morningTimeFrom', e.target.value)}
              >
                <option value="">من</option>
                {morningHours.map((time) => (
                  <option key={time.value} value={time.value}>
                    {time.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                value={formState.morningTimeTo}
                onChange={(e) => handleFormStateChange('morningTimeTo', e.target.value)}
                disabled={!formState.morningTimeFrom}
              >
                <option value="">إلى</option>
                {morningHours
                  .filter(time => {
                    if (!formState.morningTimeFrom) return true;
                    
                    // Extract hour from the time string
                    const fromHourMatch = formState.morningTimeFrom.match(/^(\d+):/);
                    const timeHourMatch = time.value.match(/^(\d+):/);
                    
                    if (!fromHourMatch || !timeHourMatch) return true;
                    
                    const fromHour = parseInt(fromHourMatch[1]);
                    const timeHour = parseInt(timeHourMatch[1]);
                    
                    // Check if current time is after the "from" time
                    if (formState.morningTimeFrom.includes('صباحًا') && time.value.includes('مساءً')) {
                      return true; // Morning to evening is always valid
                    } else if (formState.morningTimeFrom.includes('مساءً') && time.value.includes('صباحًا')) {
                      return false; // Evening to morning is invalid
                    } else {
                      return timeHour > fromHour;
                    }
                  })
                  .map((time) => (
                    <option key={time.value} value={time.value}>
                      {time.label}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Evening Time Slot */}
        <div className="p-3 border border-gray-200 rounded-md">
          <label className="block text-sm text-gray-600 mb-2">الفترة المسائية</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                value={formState.eveningTimeFrom}
                onChange={(e) => handleFormStateChange('eveningTimeFrom', e.target.value)}
              >
                <option value="">من</option>
                {eveningHours.map((time) => (
                  <option key={time.value} value={time.value}>
                    {time.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
                value={formState.eveningTimeTo}
                onChange={(e) => handleFormStateChange('eveningTimeTo', e.target.value)}
                disabled={!formState.eveningTimeFrom}
              >
                <option value="">إلى</option>
                {eveningHours
                  .filter(time => {
                    if (!formState.eveningTimeFrom) return true;
                    
                    // Extract hour from the time string
                    const fromHourMatch = formState.eveningTimeFrom.match(/^(\d+):/);
                    const timeHourMatch = time.value.match(/^(\d+):/);
                    
                    if (!fromHourMatch || !timeHourMatch) return true;
                    
                    const fromHour = parseInt(fromHourMatch[1]);
                    const timeHour = parseInt(timeHourMatch[1]);
                    
                    // Check if current time is after the "from" time
                    return timeHour > fromHour;
                  })
                  .map((time) => (
                    <option key={time.value} value={time.value}>
                      {time.label}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      
      {/* Preview */}
      {value && (
        <div className="mt-3 text-sm text-gray-600 p-2 bg-gray-50 rounded-md">
          <p className="leading-relaxed">{value}</p>
        </div>
      )}
      
      {error && (
        <div className="text-red-500 text-sm mt-2">{error}</div>
      )}
    </div>
  );
};

export default ViewingTimeSelector;