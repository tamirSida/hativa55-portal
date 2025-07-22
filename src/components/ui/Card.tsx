import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  icon?: IconDefinition;
  image?: string;
  imageAlt?: string;
  variant?: 'default' | 'elevated' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  clickable?: boolean;
  disabled?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  onClick?: () => void;
  actions?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  icon,
  image,
  imageAlt,
  variant = 'default',
  size = 'md',
  padding = 'md',
  clickable = false,
  disabled = false,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  onClick,
  actions,
}) => {
  const baseClasses = 'bg-white rounded-lg transition-all duration-200';
  
  const variantClasses = {
    default: 'border border-gray-200',
    elevated: 'shadow-lg hover:shadow-xl',
    outlined: 'border-2 border-gray-300',
    filled: 'bg-gray-50 border border-gray-200'
  };

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg'
  };

  const paddingClasses = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6'
  };

  const clickableClasses = clickable ? 'cursor-pointer hover:bg-gray-50' : '';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  const cardClasses = [
    baseClasses,
    variantClasses[variant],
    sizeClasses[size],
    paddingClasses[padding],
    clickableClasses,
    disabledClasses,
    className
  ].filter(Boolean).join(' ');

  const handleClick = () => {
    if (clickable && !disabled && onClick) {
      onClick();
    }
  };

  return (
    <div 
      className={cardClasses}
      onClick={handleClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable && !disabled ? 0 : undefined}
      onKeyDown={(e) => {
        if (clickable && !disabled && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {image && (
        <div className="relative overflow-hidden rounded-t-lg">
          <img 
            src={image} 
            alt={imageAlt || ''} 
            className="w-full h-48 object-cover"
          />
        </div>
      )}

      {(title || subtitle || icon || actions) && (
        <div className={`border-b border-gray-200 pb-3 mb-3 ${headerClassName}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {icon && (
                <div className="flex-shrink-0">
                  <FontAwesomeIcon 
                    icon={icon} 
                    className="w-5 h-5 text-primary-500"
                  />
                </div>
              )}
              
              <div>
                {title && (
                  <h3 className="text-lg font-semibold text-gray-900">
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-sm text-gray-600 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            
            {actions && (
              <div className="flex-shrink-0">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}

      <div className={bodyClassName}>
        {children}
      </div>
    </div>
  );
};