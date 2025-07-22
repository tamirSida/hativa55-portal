import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface TagProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  removable?: boolean;
  disabled?: boolean;
  icon?: IconDefinition;
  className?: string;
  onClick?: () => void;
  onRemove?: () => void;
}

export const Tag: React.FC<TagProps> = ({
  children,
  variant = 'default',
  size = 'md',
  removable = false,
  disabled = false,
  icon,
  className = '',
  onClick,
  onRemove,
}) => {
  const baseClasses = 'inline-flex items-center font-medium rounded-full transition-all duration-200';
  
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
    primary: 'bg-primary-100 text-primary-800 hover:bg-primary-200',
    secondary: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
    success: 'bg-green-100 text-green-800 hover:bg-green-200',
    warning: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
    danger: 'bg-red-100 text-red-800 hover:bg-red-200'
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  const clickableClasses = onClick ? 'cursor-pointer' : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  const tagClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    clickableClasses,
    disabledClasses,
    className
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (onClick && !disabled) {
      onClick();
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove && !disabled) {
      onRemove();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <span
      className={tagClasses}
      onClick={handleClick}
      onKeyDown={onClick ? handleKeyDown : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick && !disabled ? 0 : undefined}
    >
      {icon && (
        <FontAwesomeIcon 
          icon={icon} 
          className={`w-3 h-3 ${children ? 'ml-1' : ''}`}
        />
      )}
      
      {children}
      
      {removable && (
        <button
          type="button"
          className={`mr-1 text-current hover:text-opacity-70 focus:outline-none ${
            size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
          }`}
          onClick={handleRemove}
          disabled={disabled}
          aria-label={`הסר ${children}`}
        >
          <FontAwesomeIcon 
            icon={faTimes} 
            className="w-full h-full"
          />
        </button>
      )}
    </span>
  );
};

interface TagInputProps {
  tags: string[];
  suggestions?: string[];
  placeholder?: string;
  disabled?: boolean;
  maxTags?: number;
  allowCustom?: boolean;
  className?: string;
  tagProps?: Omit<TagProps, 'children' | 'onRemove'>;
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}

export const TagInput: React.FC<TagInputProps> = ({
  tags,
  suggestions = [],
  placeholder = 'הוסף תגיות...',
  disabled = false,
  maxTags,
  allowCustom = true,
  className = '',
  tagProps,
  onAdd,
  onRemove,
}) => {
  const [inputValue, setInputValue] = React.useState('');
  const [showSuggestions, setShowSuggestions] = React.useState(false);

  const inputRef = React.useRef<HTMLInputElement>(null);

  const filteredSuggestions = suggestions.filter(
    suggestion => 
      suggestion.toLowerCase().includes(inputValue.toLowerCase()) &&
      !tags.includes(suggestion)
  );

  const canAddMore = !maxTags || tags.length < maxTags;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setShowSuggestions(true);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onRemove(tags[tags.length - 1]);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const addTag = (tag: string) => {
    if (!tag || tags.includes(tag) || !canAddMore || disabled) return;
    
    if (!allowCustom && !suggestions.includes(tag)) return;

    onAdd(tag);
    setInputValue('');
    setShowSuggestions(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    addTag(suggestion);
    inputRef.current?.focus();
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex flex-wrap items-center gap-2 p-2 border border-gray-300 rounded-lg bg-white focus-within:ring-2 focus-within:ring-primary-500 focus-within:border-primary-500">
        {tags.map((tag) => (
          <Tag
            key={tag}
            {...tagProps}
            removable
            onRemove={() => onRemove(tag)}
          >
            {tag}
          </Tag>
        ))}
        
        {canAddMore && (
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 min-w-0 bg-transparent border-none outline-none placeholder-gray-400"
            onChange={handleInputChange}
            onKeyDown={handleInputKeyDown}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          />
        )}
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              className="w-full px-3 py-2 text-right hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};