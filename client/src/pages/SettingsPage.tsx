import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import { apiCall } from '../utils/api';
import { useAuth } from '../context/AuthContext';

interface WorkingHour {
  id?: number;
  day_of_week: number;
  is_open: boolean;
  open_time: string;
  close_time: string;
}

const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'general' | 'hours' | 'account'>('general');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // General Settings
  const [generalData, setGeneralData] = useState({
    businessName: '',
    contactInfo: '',
    address: '',
  });

  // Working Hours
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);

  // Password Change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    if (activeTab === 'general') {
      fetchGeneralSettings();
    } else if (activeTab === 'hours') {
      fetchWorkingHours();
    }
  }, [activeTab]);

  const fetchGeneralSettings = async () => {
    try {
      const data = await apiCall('/settings/general');
      setGeneralData({
        businessName: data.business_name || '',
        contactInfo: data.contact_info || '',
        address: data.address || '',
      });
    } catch (error) {
      setError('Failed to load general settings');
    }
  };

  const fetchWorkingHours = async () => {
    try {
      const data = await apiCall('/settings/working-hours');

      // Always ensure we have all 7 days
      const allDays = Array.from({ length: 7 }, (_, i) => {
        const existingDay = data.find((d: any) => d.day_of_week === i);
        return existingDay || {
          day_of_week: i,
          is_open: i >= 1 && i <= 5, // Monday to Friday default to open
          open_time: '09:00:00',
          close_time: '17:00:00',
        };
      });

      setWorkingHours(allDays);
    } catch (error) {
      setError('Failed to load working hours');
    }
  };

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await apiCall('/settings/general', {
        method: 'PUT',
        body: JSON.stringify({
          businessName: generalData.businessName,
          contactInfo: generalData.contactInfo,
          address: generalData.address,
        }),
      });
      setSuccess('General settings updated successfully');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWorkingHoursSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      // Clean the data before sending
      const cleanedWorkingHours = workingHours.map(hour => ({
        day_of_week: hour.day_of_week,
        is_open: hour.is_open,
        open_time: hour.is_open && hour.open_time ? hour.open_time : null,
        close_time: hour.is_open && hour.close_time ? hour.close_time : null,
      }));

      await apiCall('/settings/working-hours', {
        method: 'PUT',
        body: JSON.stringify({ workingHours: cleanedWorkingHours }),
      });
      setSuccess('Working hours updated successfully');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update working hours');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await apiCall('/settings/password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });
      setSuccess('Password updated successfully');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const updateWorkingHour = (dayIndex: number, field: keyof WorkingHour, value: any) => {
    setWorkingHours(prev => prev.map((hour, index) => {
      if (index === dayIndex) {
        const updatedHour = { ...hour, [field]: value };

        // If toggling is_open to true and times are null, set default times
        if (field === 'is_open' && value === true) {
          if (!updatedHour.open_time) {
            updatedHour.open_time = '09:00:00';
          }
          if (!updatedHour.close_time) {
            updatedHour.close_time = '17:00:00';
          }
        }

        return updatedHour;
      }
      return hour;
    }));
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Settings</h1>

          {/* Tabs */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('general')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'general'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                General Info
              </button>
              <button
                onClick={() => setActiveTab('hours')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'hours'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Working Hours
              </button>
              <button
                onClick={() => setActiveTab('account')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'account'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Account
              </button>
            </nav>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md mb-6">
              {success}
            </div>
          )}

          {/* General Settings Tab */}
          {activeTab === 'general' && (
            <div className="bg-white shadow-sm rounded-lg border p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">General Information</h2>

              <form onSubmit={handleGeneralSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={generalData.businessName}
                    onChange={(e) => setGeneralData({ ...generalData, businessName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Information
                  </label>
                  <input
                    type="text"
                    value={generalData.contactInfo}
                    onChange={(e) => setGeneralData({ ...generalData, contactInfo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Phone number, email, etc."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Business Address
                  </label>
                  <textarea
                    rows={3}
                    value={generalData.address}
                    onChange={(e) => setGeneralData({ ...generalData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter your business address"
                  />
                </div>

                <div className="bg-blue-50 p-4 rounded-md">
                  <h3 className="text-sm font-medium text-blue-900 mb-2">Your Booking Link</h3>
                  <div className="text-sm text-blue-700 break-all">
                    {window.location.origin}/book/{user?.slug}
                  </div>
                  <p className="text-xs text-blue-600 mt-1">
                    Share this link with customers so they can book appointments
                  </p>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Working Hours Tab */}
          {activeTab === 'hours' && (
            <div className="bg-white shadow-sm rounded-lg border p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Working Hours</h2>

              <form onSubmit={handleWorkingHoursSubmit} className="space-y-4">
                {workingHours.map((hour, index) => (
                  <div key={index} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="w-24">
                      <span className="text-sm font-medium text-gray-900">
                        {dayNames[hour.day_of_week]}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={hour.is_open}
                        onChange={(e) => updateWorkingHour(index, 'is_open', e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">Open</label>
                    </div>

                    {hour.is_open && (
                      <>
                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Open Time</label>
                          <input
                            type="time"
                            value={hour.open_time ? hour.open_time.substring(0, 5) : '09:00'}
                            onChange={(e) => updateWorkingHour(index, 'open_time', e.target.value + ':00')}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-xs text-gray-500 mb-1">Close Time</label>
                          <input
                            type="time"
                            value={hour.close_time ? hour.close_time.substring(0, 5) : '17:00'}
                            onChange={(e) => updateWorkingHour(index, 'close_time', e.target.value + ':00')}
                            className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          />
                        </div>
                      </>
                    )}
                  </div>
                ))}

                <div className="flex justify-end pt-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Saving...' : 'Save Working Hours'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="bg-white shadow-sm rounded-lg border p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Change Password</h2>

              <form onSubmit={handlePasswordSubmit} className="space-y-6 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Minimum 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                  >
                    {isLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default SettingsPage;
