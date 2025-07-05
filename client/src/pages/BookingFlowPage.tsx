import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { apiCall, formatTo24Hour } from '../utils/api';

interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;
}

interface WorkingHour {
  day_of_week: number;
  is_open: boolean;
  open_time: string;
  close_time: string;
}

interface UnavailableSlot {
  time: string;
  reason: 'booked' | 'past';
}

interface BookingData {
  serviceId: number;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  date: string;
  time: string;
  customerName: string;
  email: string;
  phone: string;
}

const BookingFlowPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  const [unavailableTimeSlots, setUnavailableTimeSlots] = useState<UnavailableSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [bookingData, setBookingData] = useState<BookingData>({
    serviceId: 0,
    serviceName: '',
    servicePrice: 0,
    serviceDuration: 0,
    date: '',
    time: '',
    customerName: '',
    email: '',
    phone: '',
  });

  const steps = [
    { number: 1, title: 'Choose Service', description: 'Select the service you want' },
    { number: 2, title: 'Select Date', description: 'Pick your preferred date' },
    { number: 3, title: 'Select Time', description: 'Choose available time slot' },
    { number: 4, title: 'Your Information', description: 'Enter your contact details' },
  ];

  useEffect(() => {
    fetchServices();
    fetchWorkingHours();
  }, [slug]);

  useEffect(() => {
    if (bookingData.date && bookingData.serviceDuration && bookingData.serviceId) {
      generateAvailableTimeSlots();
    }
  }, [bookingData.date, bookingData.serviceDuration, bookingData.serviceId]);

  const fetchServices = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/services/public/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchWorkingHours = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/settings/working-hours/${slug}`);
      if (response.ok) {
        const data = await response.json();
        setWorkingHours(data);
      }
    } catch (error) {
      console.error('Error fetching working hours:', error);
    }
  };

  const generateAvailableTimeSlots = async () => {
    try {
      const response = await apiCall(
        `/appointments/available-slots/${slug}/${bookingData.date}?duration=${bookingData.serviceDuration}&serviceId=${bookingData.serviceId}`
      );

      setAvailableTimeSlots(response.availableSlots);
      setUnavailableTimeSlots(response.unavailableSlots);
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setAvailableTimeSlots([]);
      setUnavailableTimeSlots([]);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setBookingData({
      ...bookingData,
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price,
      serviceDuration: service.duration,
    });
    setCurrentStep(2);
  };

  const handleDateSelect = (date: string) => {
    setBookingData({ ...bookingData, date });
    setCurrentStep(3);
  };

  const handleTimeSelect = (time: string) => {
    // Store the 12-hour format for display, but we'll convert to 24-hour when submitting
    setBookingData({ ...bookingData, time });
    setCurrentStep(4);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: bookingData.serviceId,
          customerName: bookingData.customerName,
          email: bookingData.email || undefined,
          phone: bookingData.phone || undefined,
          date: bookingData.date,
          time: bookingData.time, // API now accepts both 12-hour and 24-hour formats
          slug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create booking');
      }

      // Show success message with booking code
      alert(`Booking successful! Your booking code is: ${data.bookingCode}`);
      navigate(`/book/${slug}`);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create booking');
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableDates = () => {
    const dates = [];
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const dayOfWeek = date.getDay();
      const workingHour = workingHours.find(wh => wh.day_of_week === dayOfWeek);

      if (workingHour && workingHour.is_open) {
        dates.push(date.toISOString().split('T')[0]);
      }
    }

    return dates;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.number
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-gray-300 text-gray-500'
                  }`}>
                    {currentStep > step.number ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      step.number
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-full h-1 mx-4 ${
                      currentStep > step.number ? 'bg-indigo-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <h2 className="text-xl font-semibold text-gray-900">
                {steps[currentStep - 1].title}
              </h2>
              <p className="text-gray-600">{steps[currentStep - 1].description}</p>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
              {error}
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm border p-6">
            {/* Step 1: Choose Service */}
            {currentStep === 1 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Select a Service</h3>
                <div className="grid gap-4">
                  {services.map((service) => (
                    <button
                      key={service.id}
                      onClick={() => handleServiceSelect(service)}
                      className="text-left p-4 border rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-gray-900">{service.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{service.duration} minutes</p>
                        </div>
                        <div className="text-lg font-semibold text-indigo-600">
                          ₱{service.price.toLocaleString()}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 2: Select Date */}
            {currentStep === 2 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Select Date</h3>
                <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-indigo-700">
                    Selected: <strong>{bookingData.serviceName}</strong> - ₱{bookingData.servicePrice.toLocaleString()}
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {getAvailableDates().slice(0, 12).map((date) => (
                    <button
                      key={date}
                      onClick={() => handleDateSelect(date)}
                      className="p-3 border rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-center"
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {new Date(date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="mt-4 text-indigo-600 hover:text-indigo-700"
                >
                  ← Back to Services
                </button>
              </div>
            )}

            {/* Step 3: Select Time */}
            {currentStep === 3 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Select Time</h3>
                <div className="mb-4 p-3 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-indigo-700">
                    <strong>{bookingData.serviceName}</strong> on{' '}
                    <strong>{new Date(bookingData.date).toLocaleDateString()}</strong>
                  </p>
                </div>

                {availableTimeSlots.length === 0 && unavailableTimeSlots.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No time slots available for this date</p>
                    <button
                      onClick={() => setCurrentStep(2)}
                      className="mt-2 text-indigo-600 hover:text-indigo-700"
                    >
                      Choose Different Date
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                      {/* Available time slots */}
                      {availableTimeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => handleTimeSelect(time)}
                          className="p-3 border rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors text-center bg-white border-gray-300"
                        >
                          <div className="text-sm font-medium text-gray-900">{time}</div>
                        </button>
                      ))}

                      {/* Unavailable time slots */}
                      {unavailableTimeSlots.map((slot) => (
                        <button
                          key={slot.time}
                          disabled
                          className={`p-3 border rounded-lg text-center cursor-not-allowed ${
                            slot.reason === 'booked'
                              ? 'bg-red-50 border-red-200 text-red-600'
                              : 'bg-gray-50 border-gray-200 text-gray-400'
                          }`}
                          title={slot.reason === 'booked' ? 'Already booked' : 'Time has passed'}
                        >
                          <div className="text-sm font-medium">{slot.time}</div>
                          <div className="text-xs mt-1">
                            {slot.reason === 'booked' ? 'Booked' : 'Past'}
                          </div>
                        </button>
                      ))}
                    </div>

                    {availableTimeSlots.length === 0 && (
                      <div className="text-center mt-4 p-4 bg-yellow-50 rounded-lg">
                        <p className="text-yellow-800 text-sm">
                          All time slots for this date are either booked or have passed.
                          Please choose a different date.
                        </p>
                      </div>
                    )}
                  </>
                )}

                <button
                  onClick={() => setCurrentStep(2)}
                  className="mt-4 text-indigo-600 hover:text-indigo-700"
                >
                  ← Back to Date Selection
                </button>
              </div>
            )}

            {/* Step 4: Customer Information */}
            {currentStep === 4 && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Your Information</h3>
                <div className="mb-6 p-4 bg-indigo-50 rounded-lg">
                  <h4 className="font-medium text-indigo-900 mb-2">Booking Summary</h4>
                  <div className="text-sm text-indigo-700 space-y-1">
                    <p><strong>Service:</strong> {bookingData.serviceName}</p>
                    <p><strong>Date:</strong> {new Date(bookingData.date).toLocaleDateString()}</p>
                    <p><strong>Time:</strong> {bookingData.time}</p>
                    <p><strong>Duration:</strong> {bookingData.serviceDuration} minutes</p>
                    <p><strong>Price:</strong> ₱{bookingData.servicePrice.toLocaleString()}</p>
                  </div>
                </div>

                <form onSubmit={handleSubmitBooking} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={bookingData.customerName}
                      onChange={(e) => setBookingData({ ...bookingData, customerName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={bookingData.email}
                      onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="your@email.com (optional)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={bookingData.phone}
                      onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      placeholder="+63 XXX XXX XXXX (optional)"
                    />
                  </div>

                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep(3)}
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      ← Back to Time Selection
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {isLoading ? 'Booking...' : 'Confirm Booking'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BookingFlowPage;
