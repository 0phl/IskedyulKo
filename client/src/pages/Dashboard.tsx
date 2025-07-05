import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { apiCall, formatTo12Hour } from '../utils/api';

interface DashboardStats {
  todayAppointments: number;
  monthlyRevenue: number;
  pendingConfirmations: number;
  totalServices: number;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    todayAppointments: 0,
    monthlyRevenue: 0,
    pendingConfirmations: 0,
    totalServices: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch today's appointments
      const todayAppts = await apiCall('/appointments/today');

      // Fetch upcoming appointments for recent list
      const upcomingAppts = await apiCall('/appointments/upcoming');

      // Fetch all appointments for revenue calculation
      const allAppts = await apiCall('/appointments');

      // Fetch services
      const services = await apiCall('/services');

      // Calculate stats
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();

      // Monthly revenue should only count appointments marked as 'done'
      const monthlyRevenue = allAppts
        .filter((apt: any) => {
          const aptDate = new Date(apt.date);
          return aptDate.getMonth() === currentMonth &&
                 aptDate.getFullYear() === currentYear &&
                 apt.status === 'done'; // Only count completed appointments
        })
        .reduce((total: number, apt: any) => total + parseFloat(apt.price), 0);

      const pendingConfirmations = allAppts.filter(
        (apt: any) => apt.status === 'pending'
      ).length;

      setStats({
        todayAppointments: todayAppts.length,
        monthlyRevenue,
        pendingConfirmations,
        totalServices: services.length,
      });

      setTodayAppointments(todayAppts);
      setUpcomingAppointments(upcomingAppts.slice(0, 5));

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'bg-yellow-100 text-yellow-600',
      confirmed: 'bg-green-100 text-green-600',
      cancelled: 'bg-red-100 text-red-600',
      done: 'bg-gray-100 text-gray-600',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusClasses[status as keyof typeof statusClasses]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const copyBookingLink = () => {
    const link = `${window.location.origin}/book/${user?.slug}`;
    navigator.clipboard.writeText(link);
    alert('Booking link copied to clipboard!');
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Dashboard</h1>

            {/* Share Your Booking Page Section */}
            <div className="bg-indigo-600 rounded-lg p-6 mb-8 text-white">
              <h2 className="text-lg font-semibold mb-2">Share Your Booking Page</h2>
              <p className="text-indigo-100 mb-4">Let customers book appointments online with your personalized booking page</p>
              <div className="flex gap-3">
                <Link
                  to={`/book/${user?.slug}`}
                  target="_blank"
                  className="bg-white text-indigo-600 px-4 py-2 rounded-md font-medium hover:bg-gray-50 flex items-center"
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  View Booking Page
                </Link>
                <button
                  onClick={copyBookingLink}
                  className="bg-indigo-500 text-white px-4 py-2 rounded-md font-medium hover:bg-indigo-400"
                >
                  Copy Link
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Today's Appointments</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.todayAppointments}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Pending Confirmations</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingConfirmations}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Total Services</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.totalServices}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">₱{stats.monthlyRevenue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Appointments Grid - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Today's Appointments */}
              <div className="bg-white rounded-lg border">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Today's Appointments</h2>
                    <Link
                      to="/dashboard/appointments"
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      View all →
                    </Link>
                  </div>
                </div>

                <div className="p-6">
                  {todayAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {todayAppointments.slice(0, 4).map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {appointment.customer_name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <p className="font-medium text-gray-900">{appointment.customer_name}</p>
                              <p className="text-sm text-gray-600">{appointment.service_name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-600">{formatTo12Hour(appointment.time.substring(0, 5))}</p>
                            <div className="mt-1">
                              {getStatusBadge(appointment.status)}
                            </div>
                          </div>
                        </div>
                      ))}
                      {todayAppointments.length > 4 && (
                        <div className="text-center pt-2">
                          <Link
                            to="/dashboard/appointments"
                            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                          >
                            +{todayAppointments.length - 4} more appointments
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-600">No appointments today</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Upcoming Appointments */}
              <div className="bg-white rounded-lg border">
                <div className="p-6 border-b">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
                    <Link
                      to="/dashboard/appointments"
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      View all →
                    </Link>
                  </div>
                </div>

                <div className="p-6">
                  {upcomingAppointments.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingAppointments.slice(0, 3).map((appointment) => (
                        <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                              <span className="text-white text-sm font-medium">
                                {appointment.customer_name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <p className="font-medium text-gray-900">{appointment.customer_name}</p>
                              <p className="text-sm text-gray-600">{appointment.service_name}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-900">{new Date(appointment.date).toLocaleDateString()}</p>
                            <p className="text-sm text-gray-600">{formatTo12Hour(appointment.time.substring(0, 5))}</p>
                            <div className="mt-1">
                              {getStatusBadge(appointment.status)}
                            </div>
                          </div>
                        </div>
                      ))}
                      {upcomingAppointments.length > 3 && (
                        <div className="text-center pt-2">
                          <Link
                            to="/dashboard/appointments"
                            className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                          >
                            +{upcomingAppointments.length - 3} more appointments
                          </Link>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-600">No upcoming appointments</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default Dashboard;
