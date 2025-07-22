import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faTimes, faFilter } from '@fortawesome/free-solid-svg-icons';
import { Button, Input } from '@/components/ui';

interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onSearch: (query: string) => void;
  onFilterToggle?: () => void;
  showFilterButton?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'חפש...',
  value = '',
  onSearch,
  onFilterToggle,
  showFilterButton = false,
  className = '',
  size = 'md'
}) => {
  const [searchQuery, setSearchQuery] = useState(value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery.trim());
  };

  const handleClear = () => {
    setSearchQuery('');
    onSearch('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const sizeClasses = {
    sm: 'h-10',
    md: 'h-12',
    lg: 'h-14'
  };

  return (
    <form onSubmit={handleSubmit} className={`flex items-center gap-3 ${className}`}>
        <div className={`relative flex-1 ${sizeClasses[size]}`}>
          <input
            type="text"
            value={searchQuery}
            onChange={handleChange}
            placeholder={placeholder}
            className={`
              block w-full px-6 py-0 bg-white border border-gray-200 rounded-full
              text-gray-900 placeholder-gray-500 shadow-sm
              focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500
              transition-all duration-200
              ${sizeClasses[size]}
            `}
          />
          
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 left-0 flex items-center pl-4 text-gray-400 hover:text-gray-600"
            >
              <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          type="submit"
          className={`
            flex-shrink-0 inline-flex items-center justify-center font-medium transition-all duration-200
            bg-white border-2 border-teal-600 text-teal-600 hover:bg-teal-600 hover:text-white 
            focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2
            rounded-full px-8 gap-2
            ${sizeClasses[size]}
          `}
        >
          <FontAwesomeIcon icon={faSearch} className="w-4 h-4" />
          חפש
        </button>

        {showFilterButton && onFilterToggle && (
          <Button
            type="button"
            variant="outline"
            size={size}
            icon={faFilter}
            onClick={onFilterToggle}
            className="flex-shrink-0"
          >
            סננים
          </Button>
        )}
    </form>
  );
};

interface QuickSearchProps {
  suggestions: string[];
  onSuggestionClick: (suggestion: string) => void;
  className?: string;
}

export const QuickSearch: React.FC<QuickSearchProps> = ({
  suggestions,
  onSuggestionClick,
  className = ''
}) => {
  if (suggestions.length === 0) return null;

  return (
    <div className={`mt-4 ${className}`}>
      <p className="text-sm text-gray-600 mb-2">חיפושים פופולריים:</p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSuggestionClick(suggestion)}
            className="
              px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full
              hover:bg-primary-100 hover:text-primary-700
              transition-colors duration-200
              border border-transparent hover:border-primary-200
            "
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};