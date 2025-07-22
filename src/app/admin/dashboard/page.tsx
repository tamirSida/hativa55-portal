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
      
      // Load real dashboard data with simpler queries to avoid index requirements
      const allUsers = await userService.getAll();
      const allBusinesses = await businessService.getAll();
      
      // Filter users by status in memory to avoid Firestore index requirements
      const pendingUsersData = allUsers.filter(user => user.status === 'pending');
      const approvedUsersData = allUsers.filter(user => user.status === 'approved');

      setStats({
        totalUsers: allUsers.length,
        pendingUsers: pendingUsersData.length,
        approvedUsers: approvedUsersData.length,
        totalBusinesses: allBusinesses.length,
        activeBusinesses: allBusinesses.length, // Assuming all businesses are active for now
        totalJobs: 0 // We haven't implemented jobs yet
      });

      setPendingUsers(pendingUsersData);
      
      console.log('Dashboard loaded with real data:', {
        totalUsers: allUsers.length,
        pendingUsers: pendingUsersData.length,
        approvedUsers: approvedUsersData.length
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Fall back to demo data if there's an error
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
      // Get admin document to use admin ID
      const adminDoc = await adminService.getAdminByEmail(firebaseUser.email!);
      if (!adminDoc) {
        console.error('Admin document not found');
        return;
      }
      
      await adminService.approveUser(adminDoc.id!, userId);
      await loadDashboardData(); // Refresh data
    } catch (error) {
      console.error('Error approving user:', error);
    }
  };

  const handleRejectUser = async (userId: string) => {
    if (!firebaseUser || !isAdmin) return;
    
    try {
      // Get admin document to use admin ID
      const adminDoc = await adminService.getAdminByEmail(firebaseUser.email!);
      if (!adminDoc) {
        console.error('Admin document not found');
        return;
      }
      
      await adminService.rejectUser(adminDoc.id!, userId);
      await loadDashboardData(); // Refresh data
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
  }) => (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 bg-${color}-100 rounded-lg flex items-center justify-center`}>
          <FontAwesomeIcon icon={icon} className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </Card>
  );

  const TabButton = ({ id, label, icon }: { id: string; label: string; icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
        activeTab === id
          ? 'bg-teal-600 text-white'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <FontAwesomeIcon icon={icon} className="w-4 h-4" />
      {label}
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
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ממשק ניהול</h1>
            <p className="text-gray-600">ברוך הבא, {firebaseUser?.displayName || firebaseUser?.email || 'מנהל'}</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <FontAwesomeIcon icon={faCog} className="w-4 h-4 ml-2" />
              הגדרות
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          <TabButton id="overview" label="סקירה כללית" icon={faChartBar} />
          <TabButton id="users" label="ניהול משתמשים" icon={faUsers} />
          <TabButton id="businesses" label="ניהול עסקים" icon={faBuilding} />
          <TabButton id="jobs" label="ניהול משרות" icon={faBriefcase} />
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Grid */}
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

            {/* Pending Users Section */}
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
                          נרשם: {user.createdAt?.toDate().toLocaleDateString('he-IL')}
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
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">ניהול משתמשים</h2>
              <div className="flex items-center gap-3">
                <Input
                  type="text"
                  placeholder="חיפוש משתמשים..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
                <Button 
                  variant="primary"
                  onClick={() => setShowAddAdminModal(true)}
                  disabled={!currentAdminDoc?.canManageAdmins()}
                >
                  <FontAwesomeIcon icon={faPlus} className="w-4 h-4 ml-1" />
                  הוסף מנהל
                </Button>
              </div>
            </div>

            <Card className="p-6">
              <div className="text-center text-gray-600">
                <FontAwesomeIcon icon={faUsers} className="w-12 h-12 text-gray-400 mb-4" />
                <p>ממשק ניהול משתמשים יתווסף בקרוב...</p>
              </div>
            </Card>
          </div>
        )}

        {/* Businesses Tab */}
        {activeTab === 'businesses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">ניהול עסקים</h2>
            </div>

            <Card className="p-6">
              <div className="text-center text-gray-600">
                <FontAwesomeIcon icon={faBuilding} className="w-12 h-12 text-gray-400 mb-4" />
                <p>ממשק ניהול עסקים יתווסף בקרוב...</p>
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