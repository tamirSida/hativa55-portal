import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface InputProps {
  id?: string;
  name?: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'search';
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  required?: boolean;
  readOnly?: boolean;
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  icon?: IconDefinition;
  iconPosition?: 'left' | 'right';
  error?: string;
  success?: boolean;
  label?: string;
  hint?: string;
  className?: string;
  inputClassName?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const Input: React.FC<InputProps> = ({
  id,
  name,
  type = 'text',
  placeholder,
  value,
  defaultValue,
  disabled = false,
  required = false,
  readOnly = false,
  autoComplete,
  maxLength,
  minLength,
  pattern,
  icon,
  iconPosition = 'right',
  error,
  success = false,
  label,
  hint,
  className = '',
  inputClassName = '',
  onChange,
  onBlur,
  onFocus,
  onKeyDown,
}) => {
  const baseInputClasses = 'w-full px-3 py-2 bg-white border rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed';
  
  const stateClasses = {
    normal: 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
    error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
    success: 'border-green-500 focus:border-green-500 focus:ring-green-500'
  };

  const getStateClass = () => {
    if (error) return stateClasses.error;
    if (success) return stateClasses.success;
    return stateClasses.normal;
  };

  const inputClasses = [
    baseInputClasses,
    getStateClass(),
    icon && iconPosition === 'left' ? 'pr-10' : '',
    icon && iconPosition === 'right' ? 'pl-10' : '',
    inputClassName
  ].filter(Boolean).join(' ');

  const renderIcon = () => {
    if (!icon) return null;

    const iconClasses = [
      'absolute top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400',
      iconPosition === 'left' ? 'right-3' : 'left-3'
    ].join(' ');

    return (
      <FontAwesomeIcon 
        icon={icon} 
        className={iconClasses}
      />
    );
  };

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
        <input
          id={id}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          defaultValue={defaultValue}
          disabled={disabled}
          required={required}
          readOnly={readOnly}
          autoComplete={autoComplete}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          className={inputClasses}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
        />
        {renderIcon()}
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