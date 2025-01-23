import React from "react";
import { Grid, ListFilter } from "lucide-react";

type SearchFilterBarProps = {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
};

const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchTerm,
  setSearchTerm,
}) => {
  return (
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 
              rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button className="p-2 text-black hover:text-gray-900 transition-colors">
          <Grid className="w-5 h-5" />
        </button>
        <button className="p-2 text-black hover:text-gray-900 transition-colors">
          <ListFilter className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default SearchFilterBar;
