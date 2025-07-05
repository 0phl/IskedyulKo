import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import { apiCall } from '../utils/api';

interface Appointment {
  id: number;
  customer_name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'done';
  booking_code: string;
  service_name: string;
  price: number;
  duration: number;
}

const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'done'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAppointments();
  }, []);

  // Debug: Log appointments data
  useEffect(() => {
    if (appointments.length > 0) {
      console.log('Raw appointments data:', appointments);
      console.log('First appointment date:', appointments[0].date, typeof appointments[0].date);

      // Test Philippines timezone correction
      const testDate = new Date(appointments[0].date);
      const philippinesDate = new Date(testDate.toLocaleString("en-US", {timeZone: "Asia/Manila"}));
      console.log('Original UTC date:', testDate.toISOString());
      console.log('Philippines date object:', philippinesDate.toISOString());
      console.log('Philippines date display:', testDate.toLocaleDateString("en-US", {timeZone: "Asia/Manila"}));

      // Extract date parts for comparison
      const year = philippinesDate.getFullYear();
      const month = String(philippinesDate.getMonth() + 1).padStart(2, '0');
      const day = String(philippinesDate.getDate()).padStart(2, '0');
      console.log('Philippines date for filtering:', `${year}-${month}-${day}`);
    }
  }, [appointments]);

  useEffect(() => {
    filterAppointments();
  }, [appointments, filter, dateFilter]);

  const fetchAppointments = async () => {
    try {
      setIsLoading(true);
      const data = await apiCall('/appointments');
      setAppointments(data);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  const filterAppointments = () => {
    let filtered = appointments;

    if (filter !== 'all') {
      filtered = filtered.filter(apt => apt.status === filter);
    }

    if (dateFilter) {
      // Handle different date formats with timezone correction
      console.log('Date filter active:', dateFilter); // Debug log
      filtered = filtered.filter(apt => {
        let appointmentDate;

        // Handle timezone issues - MySQL dates get converted to UTC
        if (typeof apt.date === 'string' && apt.date.includes('T')) {
          // This is an ISO string that has been timezone-shifted
          // Convert to Philippines timezone (UTC+8)
          const date = new Date(apt.date);

          // Convert to Philippines timezone
          const philippinesDate = new Date(date.toLocaleString("en-US", {timeZone: "Asia/Manila"}));

          const year = philippinesDate.getFullYear();
          const month = String(philippinesDate.getMonth() + 1).padStart(2, '0');
          const day = String(philippinesDate.getDate()).padStart(2, '0');
          appointmentDate = `${year}-${month}-${day}`;
        } else {
          // Handle other formats
          const dateStr = String(apt.date);
          if (dateStr.includes(' ')) {
            appointmentDate = dateStr.split(' ')[0]; // MySQL datetime format: 2025-07-07 00:00:00
          } else {
            appointmentDate = dateStr; // Already in YYYY-MM-DD format
          }
        }

        console.log('Comparing:', appointmentDate, 'vs', dateFilter); // Debug log
        return appointmentDate === dateFilter;
      });
      console.log('Filtered appointments:', filtered.length); // Debug log
    }

    // Sort appointments by priority: Pending > Confirmed > Done > Cancelled
    const statusPriority = {
      'pending': 1,
      'confirmed': 2,
      'done': 3,
      'cancelled': 4
    };

    filtered.sort((a, b) => {
      // First sort by status priority
      const statusDiff = statusPriority[a.status] - statusPriority[b.status];
      if (statusDiff !== 0) return statusDiff;

      // Then sort by date (earliest first)
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      if (dateA.getTime() !== dateB.getTime()) {
        return dateA.getTime() - dateB.getTime();
      }

      // Finally sort by time (earliest first)
      return a.time.localeCompare(b.time);
    });

    setFilteredAppointments(filtered);
  };

  const updateAppointmentStatus = async (id: number, status: string) => {
    try {
      await apiCall(`/appointments/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      fetchAppointments();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update appointment');
    }
  };

  const formatTo12Hour = (time24: string) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
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

  const getStatusActions = (appointment: Appointment) => {
    const actions = [];

    if (appointment.status === 'pending') {
      actions.push(
        <button
          key="confirm"
          onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
          className="text-green-600 hover:text-green-900 mr-3"
        >
          Confirm
        </button>
      );
    }

    if (appointment.status === 'confirmed') {
      actions.push(
        <button
          key="complete"
          onClick={() => updateAppointmentStatus(appointment.id, 'done')}
          className="text-blue-600 hover:text-blue-900 mr-3"
        >
          Mark Done
        </button>
      );
    }

    if (appointment.status !== 'cancelled' && appointment.status !== 'done') {
      actions.push(
        <button
          key="cancel"
          onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
          className="text-red-600 hover:text-red-900"
        >
          Cancel
        </button>
      );
    }

    return actions;
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
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Appointments</h1>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Status
                </label>
                <select
                  value={filter}
                  onChange={(e) => setFilter(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="all">All Appointments</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="done">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filter by Date
                </label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Select date"
                  />
                  <button
                    onClick={() => {
                      const today = new Date();
                      const year = today.getFullYear();
                      const month = String(today.getMonth() + 1).padStart(2, '0');
                      const day = String(today.getDate()).padStart(2, '0');
                      const todayString = `${year}-${month}-${day}`;
                      console.log('Setting date filter to:', todayString); // Debug log
                      setDateFilter(todayString);
                    }}
                    className="px-3 py-2 text-sm text-indigo-600 hover:text-indigo-700 border border-indigo-300 rounded-md hover:bg-indigo-50 whitespace-nowrap"
                  >
                    Today
                  </button>
                </div>
              </div>

              {(filter !== 'all' || dateFilter) && (
                <div>
                  <button
                    onClick={() => {
                      setFilter('all');
                      setDateFilter('');
                    }}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 whitespace-nowrap"
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          {/* Appointments List */}
          <div className="bg-white shadow-sm rounded-lg border">
            {filteredAppointments.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
                <p className="text-gray-600">
                  {filter !== 'all' || dateFilter
                    ? 'Try adjusting your filters to see more appointments'
                    : 'Appointments will appear here when customers book through your booking link'
                  }
                </p>
              </div>
            ) : (
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Booking Code
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAppointments.map((appointment) => {
                      // Add visual priority for different statuses
                      const getRowClasses = (status: string) => {
                        switch (status) {
                          case 'pending':
                            return 'bg-yellow-50 hover:bg-yellow-100 border-l-4 border-yellow-400';
                          case 'confirmed':
                            return 'bg-green-50 hover:bg-green-100 border-l-4 border-green-400';
                          case 'cancelled':
                            return 'bg-red-50 hover:bg-red-100 border-l-4 border-red-400 opacity-75';
                          case 'done':
                            return 'bg-gray-50 hover:bg-gray-100 border-l-4 border-gray-400 opacity-75';
                          default:
                            return 'hover:bg-gray-50';
                        }
                      };

                      return (
                        <tr key={appointment.id} className={getRowClasses(appointment.status)}>
                          <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{appointment.customer_name}</div>
                            {appointment.email && (
                              <div className="text-sm text-gray-500">{appointment.email}</div>
                            )}
                            {appointment.phone && (
                              <div className="text-sm text-gray-500">{appointment.phone}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{appointment.service_name}</div>
                          <div className="text-sm text-gray-500">
                            ₱{appointment.price.toLocaleString()} • {appointment.duration} min
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {(() => {
                              try {
                                // Handle timezone issues in date display
                                if (typeof appointment.date === 'string' && appointment.date.includes('T')) {
                                  // This is an ISO string that has been timezone-shifted
                                  const date = new Date(appointment.date);

                                  // Convert to Philippines timezone and display
                                  return date.toLocaleDateString("en-US", {timeZone: "Asia/Manila"});
                                } else {
                                  // Handle other formats
                                  const dateStr = String(appointment.date);
                                  let datePart;

                                  if (dateStr.includes(' ')) {
                                    datePart = dateStr.split(' ')[0]; // MySQL datetime format
                                  } else {
                                    datePart = dateStr; // Already YYYY-MM-DD
                                  }

                                  const [year, month, day] = datePart.split('-');
                                  if (year && month && day) {
                                    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
                                    return date.toLocaleDateString();
                                  }
                                  return datePart; // Fallback to date part
                                }
                              } catch (error) {
                                return String(appointment.date); // Fallback to original date string
                              }
                            })()}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatTo12Hour(appointment.time.substring(0, 5))}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(appointment.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-900">{appointment.booking_code}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {getStatusActions(appointment)}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Summary Stats */}
          {appointments.length > 0 && (
            <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-sm text-gray-600">Total Appointments</div>
                <div className="text-2xl font-bold text-gray-900">{appointments.length}</div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-sm text-gray-600">Pending</div>
                <div className="text-2xl font-bold text-yellow-600">
                  {appointments.filter(apt => apt.status === 'pending').length}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-sm text-gray-600">Confirmed</div>
                <div className="text-2xl font-bold text-green-600">
                  {appointments.filter(apt => apt.status === 'confirmed').length}
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg border">
                <div className="text-sm text-gray-600">Completed</div>
                <div className="text-2xl font-bold text-blue-600">
                  {appointments.filter(apt => apt.status === 'done').length}
                </div>
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AppointmentsPage;
