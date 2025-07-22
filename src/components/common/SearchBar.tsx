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
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="flex items-center space-x-2 space-x-reverse">
        <div className={`relative flex-1 ${sizeClasses[size]}`}>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <FontAwesomeIcon 
              icon={faSearch} 
              className="w-5 h-5 text-gray-400"
            />
          </div>
          
          <input
            type="text"
            value={searchQuery}
            onChange={handleChange}
            placeholder={placeholder}
            className={`
              block w-full pr-10 pl-10 py-0 bg-white border border-gray-300 rounded-lg
              text-gray-900 placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
              transition-all duration-200
              ${sizeClasses[size]}
            `}
          />
          
          {searchQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400 hover:text-gray-600"
            >
              <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
            </button>
          )}
        </div>

        <Button
          type="submit"
          variant="primary"
          size={size}
          icon={faSearch}
          className="flex-shrink-0"
        >
          חפש
        </Button>

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
    </div>
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