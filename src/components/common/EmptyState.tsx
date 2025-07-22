import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faInbox, faSearch, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui';

interface EmptyStateProps {
  icon?: IconDefinition;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  variant?: 'default' | 'search' | 'error';
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = '',
  variant = 'default'
}) => {
  const getDefaultIcon = () => {
    switch (variant) {
      case 'search':
        return faSearch;
      case 'error':
        return faExclamationTriangle;
      default:
        return faInbox;
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'error':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const displayIcon = icon || getDefaultIcon();

  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="mx-auto w-16 h-16 flex items-center justify-center mb-4">
        <FontAwesomeIcon 
          icon={displayIcon} 
          className={`w-12 h-12 ${getIconColor()}`}
        />
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      
      {description && (
        <p className="text-gray-600 mb-6 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      )}
      
      {actionLabel && onAction && (
        <Button
          variant="primary"
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export const NoResults: React.FC<{
  searchTerm?: string;
  onClearSearch?: () => void;
  suggestion?: string;
}> = ({ searchTerm, onClearSearch, suggestion }) => {
  return (
    <EmptyState
      variant="search"
      title={searchTerm ? `לא נמצאו תוצאות עבור "${searchTerm}"` : 'לא נמצאו תוצאות'}
      description={
        suggestion || 
        'נסה לחפש במילים אחרות או לבדוק את הכתיב. ייתכן שהמידע שחיפשת אינו קיים במערכת.'
      }
      actionLabel={searchTerm && onClearSearch ? 'נקה חיפוש' : undefined}
      onAction={onClearSearch}
    />
  );
};

export const EmptyList: React.FC<{
  type: string;
  onAdd?: () => void;
}> = ({ type, onAdd }) => {
  return (
    <EmptyState
      title={`אין ${type} עדיין`}
      description={`כאשר יתווספו ${type} למערכת, הם יופיעו כאן.`}
      actionLabel={onAdd ? `הוסף ${type}` : undefined}
      onAction={onAdd}
    />
  );
};

export const ErrorState: React.FC<{
  title?: string;
  description?: string;
  onRetry?: () => void;
}> = ({ 
  title = 'אירעה שגיאה',
  description = 'משהו השתבש. אנא נסה שוב מאוחר יותר.',
  onRetry
}) => {
  return (
    <EmptyState
      variant="error"
      title={title}
      description={description}
      actionLabel={onRetry ? 'נסה שוב' : undefined}
      onAction={onRetry}
    />
  );
};