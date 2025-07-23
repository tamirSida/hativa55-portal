'use client';

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUsers, faBriefcase, faBuilding, faChartBar, faCog, 
  faUserCheck, faUserTimes, faEye, faEdit, faTrash,
  faSearch, faFilter, faPlus
} from '@fortawesome/free-solid-svg-icons';
import { Card, Button, Input } from '@/components/ui';
import { AdminService } from '@/services/AdminService';
import { UserService } from '@/services/UserService';
import { BusinessService } from '@/services/BusinessService';
import { useAuth } from '@/hooks/useAuth';
import { User, UserStatus } from '@/models/User';
import { Business } from '@/models/Business';
import { Admin } from '@/models/Admin';
import { AddAdminModal } from '@/components/admin/AddAdminModal';

interface DashboardStats {
  totalUsers: number;
  pendingUsers: number;
  approvedUsers: number;
  totalBusinesses: number;
  activeBusinesses: number;
  totalJobs: number;
}

export default function AdminDashboard() {
  const { user, firebaseUser, isAdmin, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingUsers: 0,
    approvedUsers: 0,
    totalBusinesses: 0,
    activeBusinesses: 0,
    totalJobs: 0
  });
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allAdmins, setAllAdmins] = useState<Admin[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentAdminDoc, setCurrentAdminDoc] = useState<Admin | null>(null);
  const [showAddAdminModal, setShowAddAdminModal] = useState(false);

  const adminService = new AdminService();
  const userService = new UserService();
  const businessService = new BusinessService();

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      loadDashboardData();
      loadCurrentAdminData();
    }
  }, [isAuthenticated, isAdmin]);

  const loadCurrentAdminData = async () => {
    if (firebaseUser?.email) {
      try {
        const adminDoc = await adminService.getAdminByEmail(firebaseUser.email);
        setCurrentAdminDoc(adminDoc);
      } catch (error) {
        console.error('Error loading current admin data:', error);
      }
    }
  };

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [allUsers, allBusinesses, allAdmins] = await Promise.all([
        userService.getAll(),
        businessService.getAll(), 
        adminService.getAllActiveAdmins()
      ]);
      
      const pendingUsersData = allUsers.filter(user => user.status === 'pending');
      const approvedUsersData = allUsers.filter(user => user.status === 'approved');
      const totalUsersCount = allUsers.length + allAdmins.length;

      setStats({
        totalUsers: totalUsersCount,
        pendingUsers: pendingUsersData.length,
        approvedUsers: approvedUsersData.length + allAdmins.length,
        totalBusinesses: allBusinesses.length,
        activeBusinesses: allBusinesses.length,
        totalJobs: 0
      });

      setPendingUsers(pendingUsersData);
      setAllUsers(allUsers);
      setAllAdmins(allAdmins);
      
      console.log('Dashboard loaded with real data:', {
        totalUsers: totalUsersCount,
        regularUsers: allUsers.length,
        admins: allAdmins.length,
        pendingUsers: pendingUsersData.length,
        approvedUsers: approvedUsersData.length
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setStats({
        totalUsers: 0,
        pendingUsers: 0,
        approvedUsers: 0,
        totalBusinesses: 0,
        activeBusinesses: 0,
        totalJobs: 0
      });
      setPendingUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveUser = async (userId: string) => {
    if (!firebaseUser || !isAdmin) return;
    
    try {
      const adminDoc = await adminService.getAdminByEmail(firebaseUser.email!);
      if (!adminDoc) {
        console.error('Admin document not found');
        return;
      }
      
      await adminService.approveUser(adminDoc.id!, userId);
      await loadDashboardData();
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const handleRejectUser = async (userId: string) => {
    if (!firebaseUser || !isAdmin) return;
    
    try {
      const adminDoc = await adminService.getAdminByEmail(firebaseUser.email!);
      if (!adminDoc) {
        console.error('Admin document not found');
        return;
      }
      
      await adminService.rejectUser(adminDoc.id!, userId);
      await loadDashboardData();
    } catch (error) {
      console.error('Error rejecting user:', error);
    }
  };

  const StatCard = ({ icon, title, value, subtitle, color = 'teal' }: {
    icon: any;
    title: string;
    value: number;
    subtitle?: string;
    color?: string;
  }) => {
    const getColorClasses = (color: string) => {
      switch (color) {
        case 'blue':
          return { text: 'text-blue-600', bg: 'bg-blue-100', icon: 'text-blue-600' };
        case 'yellow':
          return { text: 'text-yellow-600', bg: 'bg-yellow-100', icon: 'text-yellow-600' };
        case 'green':
          return { text: 'text-green-600', bg: 'bg-green-100', icon: 'text-green-600' };
        case 'red':
          return { text: 'text-red-600', bg: 'bg-red-100', icon: 'text-red-600' };
        default:
          return { text: 'text-teal-600', bg: 'bg-teal-100', icon: 'text-teal-600' };
      }
    };

    const colorClasses = getColorClasses(color);

    return (
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">{title}</p>
            <p className={`text-3xl font-bold ${colorClasses.text}`}>{value}</p>
            {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          </div>
          <div className={`w-12 h-12 ${colorClasses.bg} rounded-lg flex items-center justify-center`}>
            <FontAwesomeIcon icon={icon} className={`w-6 h-6 ${colorClasses.icon}`} />
          </div>
        </div>
      </Card>
    );
  };

  const TabButton = ({ id, label, icon }: { id: string; label: string; icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg font-medium transition-colors text-xs md:text-sm whitespace-nowrap ${
        activeTab === id
          ? 'bg-teal-600 text-white'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <FontAwesomeIcon icon={icon} className="w-3 h-3 md:w-4 md:h-4" />
      <span className="hidden sm:inline">{label}</span>
      <span className="sm:hidden">
        {id === 'overview' ? 'סקירה' : 
         id === 'users' ? 'משתמשים' : 
         id === 'businesses' ? 'עסקים' : 'משרות'}
      </span>
    </button>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">טוען נתונים...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">ממשק ניהול</h1>
            <p className="text-sm md:text-base text-gray-600 truncate">
              ברוך הבא, {firebaseUser?.displayName || firebaseUser?.email || 'מנהל'}
            </p>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Button variant="outline" size="sm" className="hidden md:flex">
              <FontAwesomeIcon icon={faCog} className="w-4 h-4 ml-2" />
              הגדרות
            </Button>
            <Button variant="outline" size="sm" className="md:hidden p-2">
              <FontAwesomeIcon icon={faCog} className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        {/* Navigation Tabs */}
        <div className="flex gap-1 md:gap-2 mb-6 overflow-x-auto pb-2">
          <TabButton id="overview" label="סקירה כללית" icon={faChartBar} />
          <TabButton id="users" label="ניהול משתמשים" icon={faUsers} />
          <TabButton id="businesses" label="ניהול עסקים" icon={faBuilding} />
          <TabButton id="jobs" label="ניהול משרות" icon={faBriefcase} />
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <StatCard
                icon={faUsers}
                title="סך כל המשתמשים"
                value={stats.totalUsers}
                subtitle={`${stats.approvedUsers} מאושרים`}
                color="blue"
              />
              <StatCard
                icon={faUserCheck}
                title="משתמשים ממתינים"
                value={stats.pendingUsers}
                subtitle="דורשים אישור"
                color="yellow"
              />
              <StatCard
                icon={faBuilding}
                title="עסקים רשומים"
                value={stats.totalBusinesses}
                subtitle={`${stats.activeBusinesses} פעילים`}
                color="green"
              />
            </div>

            {stats.pendingUsers > 0 && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    משתמשים ממתינים לאישור ({stats.pendingUsers})
                  </h3>
                  <Button 
                    variant="primary" 
                    size="sm"
                    onClick={() => setActiveTab('users')}
                  >
                    צפה בכל המשתמשים
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {pendingUsers.slice(0, 5).map((user) => (
                    <div key={user.id} className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div>
                        <h4 className="font-medium text-gray-900">{user.name}</h4>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <p className="text-xs text-gray-500">
                          נרשם: {(() => {
                            if (user.createdAt instanceof Date) {
                              return user.createdAt.toLocaleDateString('he-IL');
                            }
                            if (user.createdAt && typeof user.createdAt === 'object' && 'toDate' in user.createdAt) {
                              return (user.createdAt as any).toDate().toLocaleDateString('he-IL');
                            }
                            return 'לא זמין';
                          })()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          onClick={() => handleApproveUser(user.id!)}
                        >
                          <FontAwesomeIcon icon={faUserCheck} className="w-4 h-4 ml-1" />
                          אשר
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRejectUser(user.id!)}
                        >
                          <FontAwesomeIcon icon={faUserTimes} className="w-4 h-4 ml-1" />
                          דחה
                        </Button>
                      </div>
                    </div>
                  ))}
                  {pendingUsers.length > 5 && (
                    <p className="text-sm text-gray-600 text-center pt-2">
                      ועוד {pendingUsers.length - 5} משתמשים נוספים...
                    </p>
                  )}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h2 className="text-lg md:text-xl font-semibold text-gray-900">ניהול משתמשים</h2>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Input
                  type="text"
                  placeholder="חיפוש משתמשים..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-48 md:w-64"
                />
                <Button 
                  variant="primary"
                  onClick={() => setShowAddAdminModal(true)}
                  disabled={!currentAdminDoc?.canManageAdmins()}
                  className="flex items-center justify-center gap-2"
                >
                  <FontAwesomeIcon icon={faPlus} className="w-4 h-4" />
                  <span className="hidden sm:inline">הוסף מנהל</span>
                  <span className="sm:hidden">הוסף</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Users Table */}
      {activeTab === 'users' && (
        <div className="bg-white border-t border-gray-200">
          <div className="overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden md:block">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      משתמש
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      סוג
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      סטטוס
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      תאריך הצטרפות
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      פעולות
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Regular Users */}
                  {allUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate">{user.name}</div>
                            <div className="text-sm text-gray-500 truncate">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          משתמש רגיל
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          user.status === 'approved' 
                            ? 'bg-green-100 text-green-800' 
                            : user.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {user.status === 'approved' ? 'מאושר' : 
                           user.status === 'pending' ? 'ממתין' : 'נדחה'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {user.createdAt instanceof Date 
                          ? user.createdAt.toLocaleDateString('he-IL')
                          : user.createdAt?.toDate?.()?.toLocaleDateString('he-IL') || 'לא זמין'
                        }
                      </td>
                      <td className="px-4 py-4 text-sm font-medium">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <FontAwesomeIcon icon={faEdit} className="w-4 h-4" />
                          </Button>
                          <Button variant="danger" size="sm">
                            <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Admin Users */}
                  {allAdmins.map((admin) => (
                    <tr key={admin.id} className="hover:bg-gray-50 bg-teal-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-medium text-gray-900 truncate">{admin.name}</div>
                            <div className="text-sm text-gray-500 truncate">{admin.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          admin.role === 'super_admin' 
                            ? 'bg-purple-100 text-purple-800'
                            : admin.role === 'admin'
                            ? 'bg-indigo-100 text-indigo-800' 
                            : 'bg-teal-100 text-teal-800'
                        }`}>
                          {admin.role === 'super_admin' ? 'מנהל עליון' :
                           admin.role === 'admin' ? 'מנהל' : 'אחראי'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {admin.isActive ? 'פעיל' : 'לא פעיל'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {admin.createdAt instanceof Date 
                          ? admin.createdAt.toLocaleDateString('he-IL')
                          : admin.createdAt?.toDate?.()?.toLocaleDateString('he-IL') || 'לא זמין'
                        }
                      </td>
                      <td className="px-4 py-4 text-sm font-medium">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <FontAwesomeIcon icon={faEye} className="w-4 h-4" />
                          </Button>
                          {currentAdminDoc?.isSuperAdmin() && admin.id !== currentAdminDoc?.id && (
                            <Button variant="danger" size="sm">
                              <FontAwesomeIcon icon={faTrash} className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {allUsers.length === 0 && allAdmins.length === 0 && (
                <div className="text-center py-12">
                  <FontAwesomeIcon icon={faUsers} className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">אין משתמשים במערכת</p>
                </div>
              )}
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden">
              {allUsers.length === 0 && allAdmins.length === 0 ? (
                <div className="text-center py-12">
                  <FontAwesomeIcon icon={faUsers} className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-gray-500">אין משתמשים במערכת</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {/* Regular Users Mobile Cards */}
                  {allUsers.map((user) => (
                    <div key={user.id} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">{user.name}</h3>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                          משתמש רגיל
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : user.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {user.status === 'approved' ? 'מאושר' : 
                             user.status === 'pending' ? 'ממתין' : 'נדחה'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {user.createdAt instanceof Date 
                              ? user.createdAt.toLocaleDateString('he-IL')
                              : user.createdAt?.toDate?.()?.toLocaleDateString('he-IL') || 'לא זמין'
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="sm" className="p-2">
                            <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
                          </Button>
                          <Button variant="outline" size="sm" className="p-2">
                            <FontAwesomeIcon icon={faEdit} className="w-3 h-3" />
                          </Button>
                          <Button variant="danger" size="sm" className="p-2">
                            <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Admin Users Mobile Cards */}
                  {allAdmins.map((admin) => (
                    <div key={admin.id} className="p-4 hover:bg-gray-50 bg-teal-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">{admin.name}</h3>
                          <p className="text-xs text-gray-500 truncate">{admin.email}</p>
                        </div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-2 ${
                          admin.role === 'super_admin' 
                            ? 'bg-purple-100 text-purple-800'
                            : admin.role === 'admin'
                            ? 'bg-indigo-100 text-indigo-800' 
                            : 'bg-teal-100 text-teal-800'
                        }`}>
                          {admin.role === 'super_admin' ? 'מנהל עליון' :
                           admin.role === 'admin' ? 'מנהל' : 'אחראי'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            admin.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {admin.isActive ? 'פעיל' : 'לא פעיל'}
                          </span>
                          <span className="text-xs text-gray-500">
                            {admin.createdAt instanceof Date 
                              ? admin.createdAt.toLocaleDateString('he-IL')
                              : admin.createdAt?.toDate?.()?.toLocaleDateString('he-IL') || 'לא זמין'
                            }
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button variant="outline" size="sm" className="p-2">
                            <FontAwesomeIcon icon={faEye} className="w-3 h-3" />
                          </Button>
                          {currentAdminDoc?.isSuperAdmin() && admin.id !== currentAdminDoc?.id && (
                            <Button variant="danger" size="sm" className="p-2">
                              <FontAwesomeIcon icon={faTrash} className="w-3 h-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="p-4 md:p-6">
        {/* Businesses Tab */}
        {activeTab === 'businesses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">ניהול עסקים</h2>
            </div>

            <Card className="p-6">
              <div className="text-center">
                <FontAwesomeIcon icon={faBuilding} className="w-12 h-12 text-teal-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">ממשק ניהול עסקים</h3>
                <p className="text-gray-600 mb-6">
                  צפה וערוך את כל העסקים במערכת, הפעל או השבת עסקים, ומחק עסקים לא רלוונטיים.
                </p>
                <a href="/admin/businesses">
                  <Button variant="primary" size="lg">
                    <FontAwesomeIcon icon={faBuilding} className="w-5 h-5 ml-2" />
                    כניסה לניהול עסקים
                  </Button>
                </a>
              </div>
            </Card>
          </div>
        )}

        {/* Jobs Tab */}
        {activeTab === 'jobs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">ניהול משרות</h2>
            </div>

            <Card className="p-6">
              <div className="text-center text-gray-600">
                <FontAwesomeIcon icon={faBriefcase} className="w-12 h-12 text-gray-400 mb-4" />
                <p>ממשק ניהול משרות יתווסף בקרוב...</p>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Add Admin Modal */}
      <AddAdminModal
        isOpen={showAddAdminModal}
        onClose={() => setShowAddAdminModal(false)}
        onAdminCreated={() => {
          loadDashboardData();
          setShowAddAdminModal(false);
        }}
        currentAdmin={currentAdminDoc}
      />
    </div>
  );
}