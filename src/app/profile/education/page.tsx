'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { withAuth } from '@/components/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGraduationCap, 
  faPlus,
  faEdit,
  faTrash,
  faArrowLeft,
  faCalendarAlt,
  faUniversity,
  faBookOpen,
  faSpinner
} from '@fortawesome/free-solid-svg-icons';
import { Card, Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { EducationService } from '@/services/EducationService';
import { UserService } from '@/services/UserService';
import { Education, EducationStatus, EducationManager } from '@/models/Education';

interface EducationFormData {
  institutionName: string;
  degreeOrCertificate: string;
  status: EducationStatus;
  yearExpected?: number;
  yearCompleted?: number;
  uniJobTitle?: string;
}

function EducationManagementPage() {
  const { user } = useAuth();
  const [educations, setEducations] = useState<Education[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingEducation, setEditingEducation] = useState<Education | null>(null);
  const [formData, setFormData] = useState<EducationFormData>({
    institutionName: '',
    degreeOrCertificate: '',
    status: EducationStatus.IN_PROGRESS,
    yearExpected: undefined,
    yearCompleted: undefined,
    uniJobTitle: ''
  });

  const educationService = new EducationService();
  const userService = new UserService();

  // Load user's educations
  useEffect(() => {
    const loadEducations = async () => {
      if (!user?.educationIds) {
        setIsLoading(false);
        return;
      }

      try {
        const educationPromises = user.educationIds.map(id => educationService.getById(id));
        const educationResults = await Promise.all(educationPromises);
        const validEducations = educationResults.filter(edu => edu !== null) as Education[];
        setEducations(validEducations);
      } catch (error) {
        console.error('Error loading educations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEducations();
  }, [user]);

  const handleAddNew = () => {
    setEditingEducation(null);
    setFormData({
      institutionName: '',
      degreeOrCertificate: '',
      status: EducationStatus.IN_PROGRESS,
      yearExpected: new Date().getFullYear() + 1,
      yearCompleted: undefined,
      uniJobTitle: ''
    });
    setShowForm(true);
  };

  const handleEdit = (education: Education) => {
    setEditingEducation(education);
    setFormData({
      institutionName: education.institutionName,
      degreeOrCertificate: education.degreeOrCertificate,
      status: education.status,
      yearExpected: education.yearExpected,
      yearCompleted: education.yearCompleted,
      uniJobTitle: education.uniJobTitle || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      if (editingEducation) {
        // Update existing education
        const updatedEducation = new Education({
          ...editingEducation,
          ...formData,
          updatedAt: new Date()
        });
        
        await educationService.update(editingEducation.id, updatedEducation.toFirestore());
        
        // Update local state
        setEducations(prev => 
          prev.map(edu => edu.id === editingEducation.id ? updatedEducation : edu)
        );
      } else {
        // Create new education
        const newEducation = new Education({
          ...formData,
          userId: user.id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        
        const educationId = await educationService.create(newEducation.toFirestore());
        
        // Add to user's educationIds
        const updatedEducationIds = [...(user.educationIds || []), educationId];
        await userService.update(user.id, { educationIds: updatedEducationIds });
        
        // Update local state
        const createdEducation = new Education({ ...newEducation, id: educationId });
        setEducations(prev => [...prev, createdEducation]);
        
        // Update user context would happen on next page refresh
      }
      
      setShowForm(false);
      setEditingEducation(null);
    } catch (error) {
      console.error('Error saving education:', error);
      alert('שגיאה בשמירת הנתונים. אנא נסה שוב.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (education: Education) => {
    if (!user) return;
    
    if (!confirm('האם אתה בטוח שברצונך למחוק את ההשכלה הזו?')) return;

    try {
      await educationService.delete(education.id);
      
      // Remove from user's educationIds
      const updatedEducationIds = user.educationIds?.filter(id => id !== education.id) || [];
      await userService.update(user.id, { educationIds: updatedEducationIds });
      
      // Update local state
      setEducations(prev => prev.filter(edu => edu.id !== education.id));
    } catch (error) {
      console.error('Error deleting education:', error);
      alert('שגיאה במחיקת הנתונים. אנא נסה שוב.');
    }
  };

  const getStatusText = (status: EducationStatus): string => {
    switch (status) {
      case EducationStatus.IN_PROGRESS:
        return 'בלימודים';
      case EducationStatus.COMPLETED:
        return 'הושלם';
      case EducationStatus.PLANNED:
        return 'מתוכנן';
      default:
        return status;
    }
  };

  const getStatusColor = (status: EducationStatus): string => {
    switch (status) {
      case EducationStatus.IN_PROGRESS:
        return 'bg-blue-100 text-blue-800';
      case EducationStatus.COMPLETED:
        return 'bg-green-100 text-green-800';
      case EducationStatus.PLANNED:
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-teal-600 animate-spin mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              טוען נתוני השכלה...
            </h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/profile" className="text-teal-600 hover:text-teal-700">
            <FontAwesomeIcon icon={faArrowLeft} className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              ניהול השכלה
            </h1>
            <p className="text-gray-600">
              עדכן את פרטי ההשכלה שלך
            </p>
          </div>
        </div>

        {/* Add New Button */}
        <div className="mb-6">
          <Button 
            onClick={handleAddNew}
            variant="primary" 
            className="mb-4"
          >
            <FontAwesomeIcon icon={faPlus} className="w-4 h-4 ml-2" />
            הוסף השכלה חדשה
          </Button>
        </div>

        {/* Education Form */}
        {showForm && (
          <Card className="p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              {editingEducation ? 'עריכת השכלה' : 'הוספת השכלה חדשה'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Institution */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    מוסד לימודים *
                  </label>
                  <input
                    type="text"
                    value={formData.institutionName}
                    onChange={(e) => setFormData(prev => ({ ...prev, institutionName: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="למשל: אוניברסיטת תל אביב"
                    required
                    list="institutions"
                  />
                  <datalist id="institutions">
                    {EducationManager.getCommonInstitutions().map(institution => (
                      <option key={institution} value={institution} />
                    ))}
                  </datalist>
                </div>

                {/* Degree */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    תואר/תעודה *
                  </label>
                  <input
                    type="text"
                    value={formData.degreeOrCertificate}
                    onChange={(e) => setFormData(prev => ({ ...prev, degreeOrCertificate: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="למשל: תואר ראשון במדעי המחשב"
                    required
                    list="degrees"
                  />
                  <datalist id="degrees">
                    {EducationManager.getCommonDegrees().map(degree => (
                      <option key={degree} value={degree} />
                    ))}
                  </datalist>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    סטטוס *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      status: e.target.value as EducationStatus,
                      // Reset years when status changes
                      yearExpected: e.target.value === EducationStatus.IN_PROGRESS || e.target.value === EducationStatus.PLANNED ? prev.yearExpected : undefined,
                      yearCompleted: e.target.value === EducationStatus.COMPLETED ? prev.yearCompleted : undefined
                    }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    required
                  >
                    <option value={EducationStatus.IN_PROGRESS}>בלימודים</option>
                    <option value={EducationStatus.COMPLETED}>הושלם</option>
                    <option value={EducationStatus.PLANNED}>מתוכנן</option>
                  </select>
                </div>

                {/* Year Expected/Completed */}
                {(formData.status === EducationStatus.IN_PROGRESS || formData.status === EducationStatus.PLANNED) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      שנת סיום צפויה
                    </label>
                    <input
                      type="number"
                      min="2020"
                      max="2035"
                      value={formData.yearExpected || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        yearExpected: e.target.value ? parseInt(e.target.value) : undefined 
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="2025"
                    />
                  </div>
                )}

                {formData.status === EducationStatus.COMPLETED && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      שנת סיום
                    </label>
                    <input
                      type="number"
                      min="1990"
                      max={new Date().getFullYear()}
                      value={formData.yearCompleted || ''}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        yearCompleted: e.target.value ? parseInt(e.target.value) : undefined 
                      }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      placeholder="2023"
                    />
                  </div>
                )}

                {/* University Job Title */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    תפקיד באוניברסיטה (אופציונלי)
                  </label>
                  <input
                    type="text"
                    value={formData.uniJobTitle}
                    onChange={(e) => setFormData(prev => ({ ...prev, uniJobTitle: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="למשל: מתרגל, חבר אגודת סטודנטים"
                    list="uni-jobs"
                  />
                  <datalist id="uni-jobs">
                    {EducationManager.getUniJobs().map(job => (
                      <option key={job} value={job} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-6 border-t border-gray-200">
                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <FontAwesomeIcon icon={faSpinner} className="w-4 h-4 ml-2 animate-spin" />
                      שומר...
                    </>
                  ) : (
                    editingEducation ? 'עדכן' : 'הוסף'
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingEducation(null);
                  }}
                  disabled={isSubmitting}
                >
                  ביטול
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Educations List */}
        <div className="space-y-4">
          {educations.length === 0 ? (
            <Card className="p-8 text-center">
              <FontAwesomeIcon icon={faGraduationCap} className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                אין נתוני השכלה
              </h3>
              <p className="text-gray-600 mb-4">
                הוסף את פרטי ההשכלה שלך כדי להתחבר עם סטודנטים אחרים
              </p>
              <Button onClick={handleAddNew} variant="primary">
                <FontAwesomeIcon icon={faPlus} className="w-4 h-4 ml-2" />
                הוסף השכלה ראשונה
              </Button>
            </Card>
          ) : (
            educations.map((education) => (
              <Card key={education.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="bg-teal-100 p-2 rounded-full">
                      <FontAwesomeIcon icon={faGraduationCap} className="w-5 h-5 text-teal-600" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {education.degreeOrCertificate}
                        </h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(education.status)}`}>
                          {getStatusText(education.status)}
                        </span>
                      </div>
                      
                      <div className="space-y-1 text-sm text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <FontAwesomeIcon icon={faUniversity} className="w-4 h-4" />
                          <span>{education.institutionName}</span>
                        </div>
                        
                        {(education.yearExpected || education.yearCompleted) && (
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4" />
                            <span>
                              {education.status === EducationStatus.COMPLETED 
                                ? `סיים ב-${education.yearCompleted}`
                                : `צפוי לסיים ב-${education.yearExpected}`
                              }
                            </span>
                          </div>
                        )}
                        
                        {education.uniJobTitle && (
                          <div className="flex items-center gap-2">
                            <FontAwesomeIcon icon={faBookOpen} className="w-4 h-4" />
                            <span>{education.uniJobTitle}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleEdit(education)}
                      variant="outline"
                      size="sm"
                    >
                      <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(education)}
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default withAuth(EducationManagementPage, { requireApproved: true });