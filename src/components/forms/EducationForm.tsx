'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui';
import { EducationStatus, EducationManager } from '@/models/Education';

export interface EducationFormData {
  institutionName: string;
  degreeOrCertificate: string;
  status: EducationStatus;
  yearExpected?: number;
  yearCompleted?: number;
  uniJobTitle?: string;
}

interface EducationFormProps {
  formData: EducationFormData;
  onChange: (data: Partial<EducationFormData>) => void;
  onValidationChange?: (isValid: boolean, errors: {[key: string]: string}) => void;
  mode?: 'full' | 'onboarding'; // Controls features and styling
}

export const EducationForm: React.FC<EducationFormProps> = ({
  formData,
  onChange,
  onValidationChange,
  mode = 'full'
}) => {
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showCustomInstitution, setShowCustomInstitution] = useState(false);
  const [showCustomDegree, setShowCustomDegree] = useState(false);
  const [showCustomJob, setShowCustomJob] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.institutionName.trim()) {
      newErrors.institutionName = 'מוסד לימודים נדרש';
    }
    if (!formData.degreeOrCertificate.trim()) {
      newErrors.degreeOrCertificate = 'תואר/תעודה נדרש';
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    
    if (onValidationChange) {
      onValidationChange(isValid, newErrors);
    }
    
    return isValid;
  };

  const handleChange = (field: string, value: any) => {
    onChange({ [field]: value });
    
    // Clear error for this field
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };

  const handleStatusChange = (status: EducationStatus) => {
    const updates: Partial<EducationFormData> = {
      status,
      // Reset year fields based on status
      yearExpected: status === EducationStatus.IN_PROGRESS || status === EducationStatus.PLANNED ? formData.yearExpected : undefined,
      yearCompleted: status === EducationStatus.COMPLETED ? formData.yearCompleted : undefined
    };
    
    onChange(updates);
  };

  const handleInstitutionChange = (value: string) => {
    if (value === 'other') {
      setShowCustomInstitution(true);
      handleChange('institutionName', '');
    } else {
      setShowCustomInstitution(false);
      handleChange('institutionName', value);
    }
  };

  const handleDegreeChange = (value: string) => {
    if (value === 'other') {
      setShowCustomDegree(true);
      handleChange('degreeOrCertificate', '');
    } else {
      setShowCustomDegree(false);
      handleChange('degreeOrCertificate', value);
    }
  };

  const handleJobChange = (value: string) => {
    if (value === 'other') {
      setShowCustomJob(true);
      handleChange('uniJobTitle', '');
    } else {
      setShowCustomJob(false);
      handleChange('uniJobTitle', value);
    }
  };

  return (
    <div className="space-y-6">
      {mode === 'onboarding' && (
        <h4 className="text-lg font-semibold text-gray-900 mb-4">פרטי השכלה</h4>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Institution */}
        <div>
          <label htmlFor="institutionName" className="block text-sm font-medium text-gray-700 mb-2">
            מוסד לימודים *
          </label>
          {showCustomInstitution ? (
            <div className="space-y-2">
              <input
                type="text"
                value={formData.institutionName}
                onChange={(e) => handleChange('institutionName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="הקלד מוסד לימודים מותאם אישית"
                required
              />
              <button
                type="button"
                onClick={() => {
                  setShowCustomInstitution(false);
                  handleChange('institutionName', '');
                }}
                className="text-sm text-teal-600 hover:text-teal-700"
              >
                בחר מהרשימה
              </button>
            </div>
          ) : (
            <select
              id="institutionName"
              name="institutionName"
              value={formData.institutionName}
              onChange={(e) => handleInstitutionChange(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">בחר מוסד לימודים</option>
              {EducationManager.getCommonInstitutions().map(institution => (
                <option key={institution} value={institution}>{institution}</option>
              ))}
              <option value="other">אחר...</option>
            </select>
          )}
          {errors.institutionName && <p className="text-red-500 text-sm mt-1">{errors.institutionName}</p>}
        </div>

        {/* Degree */}
        <div>
          <label htmlFor="degreeOrCertificate" className="block text-sm font-medium text-gray-700 mb-2">
            תואר/תעודה *
          </label>
          {showCustomDegree ? (
            <div className="space-y-2">
              <input
                type="text"
                value={formData.degreeOrCertificate}
                onChange={(e) => handleChange('degreeOrCertificate', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="הקלד תואר/תעודה מותאם אישית"
                required
              />
              <button
                type="button"
                onClick={() => {
                  setShowCustomDegree(false);
                  handleChange('degreeOrCertificate', '');
                }}
                className="text-sm text-teal-600 hover:text-teal-700"
              >
                בחר מהרשימה
              </button>
            </div>
          ) : (
            <select
              id="degreeOrCertificate"
              name="degreeOrCertificate"
              value={formData.degreeOrCertificate}
              onChange={(e) => handleDegreeChange(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">בחר תואר/תעודה</option>
              {EducationManager.getCommonDegrees().map(degree => (
                <option key={degree} value={degree}>{degree}</option>
              ))}
              <option value="other">אחר...</option>
            </select>
          )}
          {errors.degreeOrCertificate && <p className="text-red-500 text-sm mt-1">{errors.degreeOrCertificate}</p>}
        </div>
      </div>

      {/* Status */}
      <div>
        <label htmlFor="educationStatus" className="block text-sm font-medium text-gray-700 mb-2">
          סטטוס *
        </label>
        <select
          id="educationStatus"
          name="educationStatus"
          value={formData.status}
          onChange={(e) => handleStatusChange(e.target.value as EducationStatus)}
          required
          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
        >
          <option value={EducationStatus.IN_PROGRESS}>בלימודים</option>
          <option value={EducationStatus.COMPLETED}>הושלם</option>
          <option value={EducationStatus.PLANNED}>מתוכנן</option>
        </select>
      </div>

      {/* Year Expected/Completed */}
      {(formData.status === EducationStatus.IN_PROGRESS || formData.status === EducationStatus.PLANNED) && (
        <Input
          id="yearExpected"
          name="yearExpected"
          type="number"
          label="שנת סיום צפויה"
          value={formData.yearExpected || ''}
          onChange={(e) => handleChange('yearExpected', e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder="2025"
          min="2020"
          max="2035"
        />
      )}

      {formData.status === EducationStatus.COMPLETED && (
        <Input
          id="yearCompleted"
          name="yearCompleted"
          type="number"
          label="שנת סיום"
          value={formData.yearCompleted || ''}
          onChange={(e) => handleChange('yearCompleted', e.target.value ? parseInt(e.target.value) : undefined)}
          placeholder="2023"
          min="1990"
          max={new Date().getFullYear()}
        />
      )}

      {/* University Job Title */}
      <div>
        <label htmlFor="uniJobTitle" className="block text-sm font-medium text-gray-700 mb-2">
          תפקיד באוניברסיטה (אופציונלי)
        </label>
        {showCustomJob ? (
          <div className="space-y-2">
            <input
              type="text"
              value={formData.uniJobTitle}
              onChange={(e) => handleChange('uniJobTitle', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="הקלד תפקיד מותאם אישית"
            />
            <button
              type="button"
              onClick={() => {
                setShowCustomJob(false);
                handleChange('uniJobTitle', '');
              }}
              className="text-sm text-teal-600 hover:text-teal-700"
            >
              בחר מהרשימה
            </button>
          </div>
        ) : (
          <select
            id="uniJobTitle"
            name="uniJobTitle"
            value={formData.uniJobTitle || ''}
            onChange={(e) => handleJobChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          >
            <option value="">בחר תפקיד (אופציונלי)</option>
            {EducationManager.getUniJobs().map(job => (
              <option key={job} value={job}>{job}</option>
            ))}
            <option value="other">אחר...</option>
          </select>
        )}
      </div>
    </div>
  );
};

export default EducationForm;