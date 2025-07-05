import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Logo from '../components/Logo';

interface AppointmentDetails {
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
  business_name: string;
}

const TrackingPage: React.FC = () => {
  const [bookingCode, setBookingCode] = useState('');
  const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setAppointment(null);

    if (!bookingCode.trim()) {
      setError('Please enter a booking code');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`http://localhost:5000/api/appointments/track/${bookingCode.trim()}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Booking not found. Please check your booking code.');
        }
        throw new Error('Failed to track booking');
      }

      const data = await response.json();
      setAppointment(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to track booking');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: {
        color: 'bg-yellow-100 text-yellow-600',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        message: 'Your appointment is pending confirmation'
      },
      confirmed: {
        color: 'bg-green-100 text-green-600',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
        message: 'Your appointment is confirmed'
      },
      cancelled: {
        color: 'bg-red-100 text-red-600',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ),
        message: 'Your appointment has been cancelled'
      },
      done: {
        color: 'bg-blue-100 text-blue-600',
        icon: (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        message: 'Your appointment is completed'
      }
    };

    const config = statusConfig[status as keyof typeof statusConfig];

    return (
      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        {config.icon}
        <span className="ml-2">{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </div>
    );
  };

  const getStatusMessage = (status: string) => {
    const statusConfig = {
      pending: 'Your appointment is pending confirmation',
      confirmed: 'Your appointment is confirmed',
      cancelled: 'Your appointment has been cancelled',
      done: 'Your appointment is completed'
    };

    return statusConfig[status as keyof typeof statusConfig];
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="mb-4 inline-block">
              <Logo size="lg" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Booking</h1>
            <p className="text-gray-600">
              Enter your booking code to check the status of your appointment
            </p>
          </div>

          {/* Search Form */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="bookingCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Booking Code
                </label>
                <input
                  type="text"
                  id="bookingCode"
                  value={bookingCode}
                  onChange={(e) => setBookingCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-center font-mono text-lg"
                  placeholder="e.g., BUSINESS-ABC123"
                  maxLength={50}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Your booking code was provided when you made the appointment
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 text-white py-3 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Searching...
                  </div>
                ) : (
                  'Track Booking'
                )}
              </button>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-8">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                {error}
              </div>
            </div>
          )}

          {/* Appointment Details */}
          {appointment && (
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              {/* Status Header */}
              <div className="bg-gray-50 px-6 py-4 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Appointment Details</h2>
                  {getStatusBadge(appointment.status)}
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {getStatusMessage(appointment.status)}
                </p>
              </div>

              {/* Details */}
              <div className="p-6 space-y-6">
                {/* Business Info */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Business
                  </h3>
                  <p className="text-lg font-semibold text-gray-900">{appointment.business_name}</p>
                </div>

                {/* Service Info */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Service
                  </h3>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-lg font-medium text-gray-900">{appointment.service_name}</p>
                      <p className="text-sm text-gray-600">{appointment.duration} minutes</p>
                    </div>
                    <p className="text-lg font-semibold text-indigo-600">
                      ₱{appointment.price.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Date
                    </h3>
                    <p className="text-lg text-gray-900">
                      {new Date(appointment.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Time
                    </h3>
                    <p className="text-lg text-gray-900">{appointment.time.substring(0, 5)}</p>
                  </div>
                </div>

                {/* Customer Info */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Customer Information
                  </h3>
                  <div className="space-y-1">
                    <p className="text-gray-900">{appointment.customer_name}</p>
                    {appointment.email && (
                      <p className="text-gray-600">{appointment.email}</p>
                    )}
                    {appointment.phone && (
                      <p className="text-gray-600">{appointment.phone}</p>
                    )}
                  </div>
                </div>

                {/* Booking Code */}
                <div>
                  <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Booking Code
                  </h3>
                  <p className="text-lg font-mono text-gray-900 bg-gray-100 px-3 py-2 rounded inline-block">
                    {appointment.booking_code}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Help Section */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Need help? Contact the business directly or visit their booking page.
            </p>
            <Link
              to="/"
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← Back to Homepage
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default TrackingPage;
