import React from 'react';

interface TextareaProps {
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  rows?: number;
  maxLength?: number;
  minLength?: number;
  error?: string;
  success?: boolean;
  label?: string;
  hint?: string;
  className?: string;
  textareaClassName?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}

export const Textarea: React.FC<TextareaProps> = ({
  id,
  name,
  placeholder,
  value,
  defaultValue,
  disabled = false,
  required = false,
  readOnly = false,
  rows = 4,
  maxLength,
  minLength,
  error,
  success = false,
  label,
  hint,
  className = '',
  textareaClassName = '',
  onChange,
  onBlur,
  onFocus,
  onKeyDown,
  resize = 'vertical',
}) => {
  const baseTextareaClasses = 'w-full px-3 py-2 bg-white border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed';
  
  const stateClasses = {
    normal: 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-500 focus:border-green-500 focus:ring-green-500'
  };

  const resizeClasses = {
    none: 'resize-none',
    both: 'resize',
    horizontal: 'resize-x',
    vertical: 'resize-y'
  };

  const getStateClass = () => {
    if (error) return stateClasses.error;
    if (success) return stateClasses.success;
    return stateClasses.normal;
  };

  const textareaClasses = [
    baseTextareaClasses,
    getStateClass(),
    resizeClasses[resize],
    textareaClassName
  ].filter(Boolean).join(' ');

  const currentLength = value?.length || defaultValue?.length || 0;

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 mr-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <textarea
          id={id}
          name={name}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          required={required}
          readOnly={readOnly}
          rows={rows}
          maxLength={maxLength}
          minLength={minLength}
          className={textareaClasses}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
        />
        
        {maxLength && (
          <div className="absolute bottom-2 left-3 text-xs text-gray-400">
            {currentLength}/{maxLength}
          </div>
        )}
      </div>
      
      {hint && !error && (
        <p className="text-sm text-gray-500">{hint}</p>
      )}
      
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};