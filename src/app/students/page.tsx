'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { withAuth } from '@/components/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faGraduationCap, 
  faSearch, 
  faFilter,
  faSpinner,
  faUsers,
  faUserGraduate,
  faPhone,
  faMapMarkerAlt,
  faCalendarAlt,
  faBookOpen
} from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { UserService } from '@/services/UserService';
import { EducationService } from '@/services/EducationService';
import { User } from '@/models/User';
import { Education, EducationStatus } from '@/models/Education';

interface StudentProfile {
  user: User;
  education: Education;
  matchScore: number;
}

interface SearchFilters {
  query: string;
  institution: string;
  degree: string;
  graduationYear: string;
  connectionType: 'students' | 'alumni';
}

function StudentsPage() {
  const { user: currentUser } = useAuth();
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showContact, setShowContact] = useState<string | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    institution: '',
    degree: '',
    graduationYear: '',
    connectionType: 'students'
  });

  // Auto-populate from current user's education
  useEffect(() => {
    const autoPopulateFilters = async () => {
      if (!currentUser?.educationIds?.length) return;

      try {
        const educationService = new EducationService();
        const userEducations = await Promise.all(
          currentUser.educationIds.map(id => educationService.getById(id))
        );

        // Find current in-progress degree education
        const currentEducation = userEducations.find(edu => 
          edu && 
          edu.status === EducationStatus.IN_PROGRESS &&
          (edu.degreeOrCertificate.includes('תואר') || 
           edu.degreeOrCertificate.includes('בוגר') ||
           edu.degreeOrCertificate.includes('מוסמך'))
        );

        if (currentEducation) {
          setFilters(prev => ({
            ...prev,
            institution: currentEducation.institutionName,
            degree: currentEducation.degreeOrCertificate,
            graduationYear: currentEducation.yearExpected?.toString() || ''
          }));
        }
      } catch (error) {
        console.error('Error auto-populating filters:', error);
      }
    };

    autoPopulateFilters();
  }, [currentUser]);

  // Load and filter students
  useEffect(() => {
    const loadStudents = async () => {
      try {
        setIsLoading(true);
        const userService = new UserService();
        const educationService = new EducationService();
        
        // Get all approved users
        const allUsers = await userService.getApprovedUsers();
        
        // Get all educations and match with users
        const studentProfiles: StudentProfile[] = [];
        
        for (const user of allUsers) {
          if (!user.educationIds?.length || user.id === currentUser?.id) continue;
          
          const userEducations = await Promise.all(
            user.educationIds.map(id => educationService.getById(id))
          );
          
          // Filter for degree educations only (bachelor/master)
          const degreeEducations = userEducations.filter(edu => 
            edu && (
              edu.degreeOrCertificate.includes('תואר') || 
              edu.degreeOrCertificate.includes('בוגר') ||
              edu.degreeOrCertificate.includes('מוסמך') ||
              edu.degreeOrCertificate.includes('Bachelor') ||
              edu.degreeOrCertificate.includes('Master') ||
              edu.degreeOrCertificate.includes('MBA')
            )
          );
          
          for (const education of degreeEducations) {
            if (!education) continue;
            
            // Determine if student or alumni based on graduation status
            const now = new Date();
            const currentYear = now.getFullYear();
            const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11
            
            let isCurrentStudent = false;
            let isRecentAlumni = false;
            
            if (education.status === EducationStatus.IN_PROGRESS) {
              isCurrentStudent = true;
            } else if (education.status === EducationStatus.COMPLETED && education.yearCompleted) {
              // Alumni logic: graduated within last 5 years, but after August of grad year
              const gradYear = education.yearCompleted;
              const yearsPassedSinceGrad = currentYear - gradYear;
              
              // If graduated this year, check if after August
              if (gradYear === currentYear) {
                isRecentAlumni = currentMonth >= 8; // August or later
              } else if (yearsPassedSinceGrad <= 5 && yearsPassedSinceGrad > 0) {
                isRecentAlumni = true;
              }
            }
            
            // Filter based on connection type
            const shouldInclude = 
              (filters.connectionType === 'students' && isCurrentStudent) ||
              (filters.connectionType === 'alumni' && isRecentAlumni);
              
            if (shouldInclude) {
              const matchScore = calculateMatchScore(
                currentUser?.educationIds ? await getCurrentUserEducation() : null,
                education,
                user
              );
              
              studentProfiles.push({
                user,
                education,
                matchScore
              });
            }
          }
        }
        
        setStudents(studentProfiles);
        
      } catch (error) {
        console.error('Error loading students:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStudents();
  }, [filters.connectionType, currentUser]);

  // Get current user's education for matching
  const getCurrentUserEducation = async (): Promise<Education | null> => {
    if (!currentUser?.educationIds?.length) return null;
    
    try {
      const educationService = new EducationService();
      const userEducations = await Promise.all(
        currentUser.educationIds.map(id => educationService.getById(id))
      );
      
      return userEducations.find(edu => 
        edu && edu.status === EducationStatus.IN_PROGRESS
      ) || userEducations[0] || null;
      
    } catch (error) {
      console.error('Error getting current user education:', error);
      return null;
    }
  };

  // Smart matching algorithm
  const calculateMatchScore = (
    currentEducation: Education | null, 
    targetEducation: Education, 
    targetUser: User
  ): number => {
    let score = 0;
    
    if (!currentEducation) return score;
    
    // Exact institution match (highest priority)
    if (currentEducation.institutionName === targetEducation.institutionName) {
      score += 50;
    }
    
    // Exact degree match
    if (currentEducation.degreeOrCertificate === targetEducation.degreeOrCertificate) {
      score += 40;
    }
    
    // Similar degree (same field)
    if (isSimilarDegree(currentEducation.degreeOrCertificate, targetEducation.degreeOrCertificate)) {
      score += 20;
    }
    
    // Same city
    if (currentUser?.city && targetUser.city && currentUser.city === targetUser.city) {
      score += 10;
    }
    
    // Same gdud (military unit)
    if (currentUser?.gdud && targetUser.gdud && currentUser.gdud === targetUser.gdud) {
      score += 15;
    }
    
    return score;
  };

  // Check if degrees are similar (same field)
  const isSimilarDegree = (degree1: string, degree2: string): boolean => {
    const techFields = ['מדעי המחשב', 'הנדסת תוכנה', 'מערכות מידע', 'Computer Science', 'Software Engineering'];
    const businessFields = ['כלכלה', 'ניהול', 'חשבונאות', 'Economics', 'Business', 'MBA'];
    const engineeringFields = ['הנדסה', 'Engineering'];
    
    const isDegree1Tech = techFields.some(field => degree1.includes(field));
    const isDegree2Tech = techFields.some(field => degree2.includes(field));
    
    const isDegree1Business = businessFields.some(field => degree1.includes(field));
    const isDegree2Business = businessFields.some(field => degree2.includes(field));
    
    const isDegree1Engineering = engineeringFields.some(field => degree1.includes(field));
    const isDegree2Engineering = engineeringFields.some(field => degree2.includes(field));
    
    return (isDegree1Tech && isDegree2Tech) || 
           (isDegree1Business && isDegree2Business) ||
           (isDegree1Engineering && isDegree2Engineering);
  };

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    let filtered = [...students];
    
    // Text search
    if (filters.query.trim()) {
      const query = filters.query.toLowerCase();
      filtered = filtered.filter(profile => 
        profile.user.name.toLowerCase().includes(query) ||
        profile.education.institutionName.toLowerCase().includes(query) ||
        profile.education.degreeOrCertificate.toLowerCase().includes(query)
      );
    }
    
    // Institution filter
    if (filters.institution.trim()) {
      filtered = filtered.filter(profile => 
        profile.education.institutionName.includes(filters.institution)
      );
    }
    
    // Degree filter
    if (filters.degree.trim()) {
      filtered = filtered.filter(profile => 
        profile.education.degreeOrCertificate.includes(filters.degree)
      );
    }
    
    // Graduation year filter
    if (filters.graduationYear.trim()) {
      const year = parseInt(filters.graduationYear);
      filtered = filtered.filter(profile => {
        const targetYear = profile.education.status === EducationStatus.IN_PROGRESS 
          ? profile.education.yearExpected 
          : profile.education.yearCompleted;
        return targetYear === year;
      });
    }
    
    // Sort by match score (highest first), then by name
    return filtered.sort((a, b) => {
      if (a.matchScore !== b.matchScore) {
        return b.matchScore - a.matchScore;
      }
      return a.user.name.localeCompare(b.user.name, 'he');
    });
  }, [students, filters]);

  const handleConnectReveal = (userId: string) => {
    setShowContact(showContact === userId ? null : userId);
  };

  const getEducationDisplayText = (education: Education): string => {
    if (education.status === EducationStatus.IN_PROGRESS) {
      return `צפוי לסיים: ${education.yearExpected || 'לא צוין'}`;
    } else if (education.status === EducationStatus.COMPLETED) {
      return `סיים ב: ${education.yearCompleted || 'לא צוין'}`;
    }
    return '';
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <FontAwesomeIcon icon={faSpinner} className="w-8 h-8 text-teal-600 animate-spin mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              טוען סטודנטים...
            </h3>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            רשת הסטודנטים
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            התחבר עם סטודנטים ובוגרים מהקהילה שלנו
          </p>
        </div>

        {/* Connection Type Toggle */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => setFilters(prev => ({ ...prev, connectionType: 'students' }))}
              className={`px-6 py-3 rounded-md transition-colors font-medium ${
                filters.connectionType === 'students'
                  ? 'bg-teal-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FontAwesomeIcon icon={faUsers} className="w-4 h-4 ml-2" />
              התחבר עם סטודנטים
            </button>
            <button
              onClick={() => setFilters(prev => ({ ...prev, connectionType: 'alumni' }))}
              className={`px-6 py-3 rounded-md transition-colors font-medium ${
                filters.connectionType === 'alumni'
                  ? 'bg-teal-500 text-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              <FontAwesomeIcon icon={faUserGraduate} className="w-4 h-4 ml-2" />
              התחבר עם בוגרים
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* General Search */}
            <div className="relative">
              <FontAwesomeIcon 
                icon={faSearch} 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" 
              />
              <input
                type="text"
                placeholder="חפש שם, מוסד, תחום..."
                value={filters.query}
                onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Institution Filter */}
            <input
              type="text"
              placeholder="מוסד לימודים"
              value={filters.institution}
              onChange={(e) => setFilters(prev => ({ ...prev, institution: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />

            {/* Degree Filter */}
            <input
              type="text"
              placeholder="תחום לימודים"
              value={filters.degree}
              onChange={(e) => setFilters(prev => ({ ...prev, degree: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />

            {/* Graduation Year Filter */}
            <input
              type="number"
              placeholder="שנת סיום"
              value={filters.graduationYear}
              onChange={(e) => setFilters(prev => ({ ...prev, graduationYear: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              {filteredStudents.length} {filters.connectionType === 'students' ? 'סטודנטים' : 'בוגרים'}
            </span>
            <Button
              onClick={() => setFilters({
                query: '',
                institution: '',
                degree: '',
                graduationYear: '',
                connectionType: filters.connectionType
              })}
              variant="outline"
              size="sm"
            >
              נקה סינון
            </Button>
          </div>
        </div>

        {/* Students Grid */}
        {filteredStudents.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-100 p-3 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FontAwesomeIcon icon={faGraduationCap} className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              לא נמצאו {filters.connectionType === 'students' ? 'סטודנטים' : 'בוגרים'}
            </h3>
            <p className="text-gray-600">
              נסה לשנות את פרמטרי החיפוש או לנקות את הסינון
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((studentProfile) => (
              <div
                key={`${studentProfile.user.id}-${studentProfile.education.id}`}
                className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow"
              >
                {/* Student Header */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-teal-100 p-2 rounded-full">
                    <FontAwesomeIcon 
                      icon={filters.connectionType === 'students' ? faGraduationCap : faUserGraduate} 
                      className="w-5 h-5 text-teal-600" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {studentProfile.user.name}
                    </h3>
                    {studentProfile.matchScore > 0 && (
                      <div className="text-xs text-teal-600 font-medium">
                        התאמה גבוהה
                      </div>
                    )}
                  </div>
                </div>

                {/* Education Info */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FontAwesomeIcon icon={faBookOpen} className="w-4 h-4 ml-2 flex-shrink-0" />
                    <span className="truncate">{studentProfile.education.institutionName}</span>
                  </div>
                  <div className="text-sm font-medium text-gray-800">
                    {studentProfile.education.degreeOrCertificate}
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <FontAwesomeIcon icon={faCalendarAlt} className="w-4 h-4 ml-2 flex-shrink-0" />
                    <span>{getEducationDisplayText(studentProfile.education)}</span>
                  </div>
                </div>

                {/* Location & Gdud */}
                <div className="space-y-1 mb-4">
                  {studentProfile.user.city && (
                    <div className="flex items-center text-sm text-gray-500">
                      <FontAwesomeIcon icon={faMapMarkerAlt} className="w-4 h-4 ml-2 flex-shrink-0" />
                      <span>{studentProfile.user.city}</span>
                    </div>
                  )}
                  {studentProfile.user.gdud && (
                    <div className="text-sm text-gray-500">
                      גדוד: {studentProfile.user.gdud}
                    </div>
                  )}
                </div>

                {/* Connect Button */}
                <div className="pt-4 border-t border-gray-100">
                  {showContact === studentProfile.user.id ? (
                    <div className="space-y-2">
                      <div className="bg-teal-50 p-3 rounded-lg">
                        <div className="font-medium text-teal-800 text-sm mb-1">
                          פרטי התקשרות:
                        </div>
                        <div className="text-sm text-teal-700">
                          <strong>שם:</strong> {studentProfile.user.name}
                        </div>
                        {studentProfile.user.phone && (
                          <div className="flex items-center text-sm text-teal-700">
                            <FontAwesomeIcon icon={faPhone} className="w-3 h-3 ml-1" />
                            <strong>טלפון:</strong> {studentProfile.user.phone}
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => handleConnectReveal(studentProfile.user.id)}
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        סגור
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleConnectReveal(studentProfile.user.id)}
                      variant="primary"
                      size="sm"
                      className="w-full"
                    >
                      <FontAwesomeIcon icon={faPhone} className="w-4 h-4 ml-2" />
                      התחבר
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            רשת הסטודנטים במספרים
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="text-3xl font-bold text-teal-600 mb-2">
                {students.filter(s => s.education.status === EducationStatus.IN_PROGRESS).length}
              </div>
              <div className="text-gray-600">סטודנטים פעילים</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-teal-600 mb-2">
                {students.filter(s => s.education.status === EducationStatus.COMPLETED).length}
              </div>
              <div className="text-gray-600">בוגרים זמינים</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(StudentsPage, { requireApproved: true });