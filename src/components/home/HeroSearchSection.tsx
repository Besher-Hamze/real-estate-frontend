import React, { useState } from 'react';
import { Search, Map } from 'lucide-react';

const HeroSearchSection = () => {
  const [activeTab, setActiveTab] = useState('buy');
  
  return (
    <div className="relative h-96 bg-gradient-to-r from-emerald-800 to-emerald-600 overflow-hidden" dir="rtl">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Buy/Rent/Investment Toggle */}
          <div className="inline-flex bg-white rounded-lg p-1 mb-4 shadow-sm">
            <button
              onClick={() => setActiveTab('buy')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors 
                ${activeTab === 'buy' 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-gray-600 hover:text-gray-800'}`}
            >
              شراء
            </button>
            <button
              onClick={() => setActiveTab('rent')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors 
                ${activeTab === 'rent' 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-gray-600 hover:text-gray-800'}`}
            >
              إيجار
            </button>
            <button
              onClick={() => setActiveTab('investment')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors 
                ${activeTab === 'investment' 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-gray-600 hover:text-gray-800'}`}
            >
              استثمار
            </button>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-lg p-2 shadow-lg flex flex-wrap items-center gap-2">
            {/* Property Type */}
            <div className="flex-1 min-w-[200px] relative">
              <select className="w-full p-3 bg-white border border-gray-200 rounded-lg appearance-none cursor-pointer pr-8 text-gray-600">
                <option value="">شقة</option>
                <option value="house">فيلا</option>
                <option value="villa">بيت</option>
                <option value="office">مكتب</option>
              </select>
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Price Range */}
            <div className="flex-1 min-w-[200px] relative">
              <select className="w-full p-3 bg-white border border-gray-200 rounded-lg appearance-none cursor-pointer pr-8 text-gray-600">
                <option value="">السعر</option>
                <option value="0-50000">0 - 50,000 ر.ع</option>
                <option value="50000-100000">50,000 - 100,000 ر.ع</option>
                <option value="100000-200000">100,000 - 200,000 ر.ع</option>
                <option value="200000+">أكثر من 200,000 ر.ع</option>
              </select>
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Bedrooms */}
            <div className="flex-1 min-w-[200px] relative">
              <select className="w-full p-3 bg-white border border-gray-200 rounded-lg appearance-none cursor-pointer pr-8 text-gray-600">
                <option value="">غرف النوم</option>
                <option value="1">غرفة نوم واحدة</option>
                <option value="2">غرفتين نوم</option>
                <option value="3">3 غرف نوم</option>
                <option value="4+">4 غرف نوم أو أكثر</option>
              </select>
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>

            {/* Location Search */}
            <div className="flex-[2] min-w-[300px] flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="أدخل الموقع"
                  className="w-full p-3 bg-white border border-gray-200 rounded-lg pr-10 text-gray-600"
                />
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
              
              {/* Search and Map Buttons */}
              <button className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors">
                بحث
              </button>
              <button className="bg-gray-100 p-3 rounded-lg hover:bg-gray-200 transition-colors">
                <Map size={20} className="text-gray-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSearchSection;