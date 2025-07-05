"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import Layout from "../components/Layout"
import { apiCall } from "../utils/api"

interface Service {
  id: number
  name: string
  price: number
  duration: number
}

interface WorkingHour {
  day_of_week: number
  is_open: boolean
  open_time: string
  close_time: string
}

interface UnavailableSlot {
  time: string
  reason: "booked" | "past"
}

interface BookingData {
  serviceId: number
  serviceName: string
  servicePrice: number
  serviceDuration: number
  date: string
  time: string
  customerName: string
  email: string
  phone: string
}

const BookingFlowPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [services, setServices] = useState<Service[]>([])
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([])
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  const [unavailableTimeSlots, setUnavailableTimeSlots] = useState<UnavailableSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [bookingData, setBookingData] = useState<BookingData>({
    serviceId: 0,
    serviceName: "",
    servicePrice: 0,
    serviceDuration: 0,
    date: "",
    time: "",
    customerName: "",
    email: "",
    phone: "",
  })

  const steps = [
    { number: 1, title: "Choose Service", description: "Select the service you want" },
    { number: 2, title: "Select Date", description: "Pick your preferred date" },
    { number: 3, title: "Select Time", description: "Choose available time slot" },
    { number: 4, title: "Your Information", description: "Enter your contact details" },
  ]

  useEffect(() => {
    fetchServices()
    fetchWorkingHours()
  }, [slug])

  useEffect(() => {
    if (bookingData.date && bookingData.serviceDuration && bookingData.serviceId) {
      generateAvailableTimeSlots()
    }
  }, [bookingData.date, bookingData.serviceDuration, bookingData.serviceId])

  const fetchServices = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/services/public/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setServices(data)
      }
    } catch (error) {
      console.error("Error fetching services:", error)
    }
  }

  const fetchWorkingHours = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/settings/working-hours/${slug}`)
      if (response.ok) {
        const data = await response.json()
        setWorkingHours(data)
      }
    } catch (error) {
      console.error("Error fetching working hours:", error)
    }
  }

  const generateAvailableTimeSlots = async () => {
    try {
      const response = await apiCall(
        `/appointments/available-slots/${slug}/${bookingData.date}?duration=${bookingData.serviceDuration}&serviceId=${bookingData.serviceId}`,
      )
      setAvailableTimeSlots(response.availableSlots)
      setUnavailableTimeSlots(response.unavailableSlots)
    } catch (error) {
      console.error("Error fetching available slots:", error)
      setAvailableTimeSlots([])
      setUnavailableTimeSlots([])
    }
  }

  const handleServiceSelect = (service: Service) => {
    setBookingData({
      ...bookingData,
      serviceId: service.id,
      serviceName: service.name,
      servicePrice: service.price,
      serviceDuration: service.duration,
    })
    setCurrentStep(2)
  }

  const handleDateSelect = (date: string) => {
    setBookingData({ ...bookingData, date })
    setCurrentStep(3)
  }

  const handleTimeSelect = (time: string) => {
    // Store the 12-hour format for display, but we'll convert to 24-hour when submitting
    setBookingData({ ...bookingData, time })
    setCurrentStep(4)
  }

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)
    try {
      const response = await fetch("http://localhost:5000/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      })
      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || "Failed to create booking")
      }
      // Show success message with booking code
      alert(`Booking successful! Your booking code is: ${data.bookingCode}`)
      navigate(`/book/${slug}`)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to create booking")
    } finally {
      setIsLoading(false)
    }
  }

  const getAvailableDates = () => {
    const dates = []
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dayOfWeek = date.getDay()
      const workingHour = workingHours.find((wh) => wh.day_of_week === dayOfWeek)
      if (workingHour && workingHour.is_open) {
        dates.push(date.toISOString().split("T")[0])
      }
    }
    return dates
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Progress Steps */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-8">
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                  <div className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                        currentStep >= step.number
                          ? "bg-indigo-600 border-indigo-600 text-white shadow-lg"
                          : "border-gray-300 text-gray-500 bg-white"
                      }`}
                    >
                      {currentStep > step.number ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="font-semibold">{step.number}</span>
                      )}
                    </div>
                    <div className="ml-4 min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium ${
                          currentStep >= step.number ? "text-indigo-600" : "text-gray-500"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500 hidden sm:block">{step.description}</p>
                    </div>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-4">
                      <div
                        className={`h-1 rounded-full transition-all duration-300 ${
                          currentStep > step.number ? "bg-indigo-600" : "bg-gray-200"
                        }`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-8 flex items-center">
              <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {error}
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Step 1: Choose Service */}
            {currentStep === 1 && (
              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Select a Service</h3>
                  <p className="text-gray-600">Choose the service you'd like to book</p>
                </div>
                <div className="max-w-4xl mx-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-2">
                    {services.map((service) => (
                      <button
                        key={service.id}
                        onClick={() => handleServiceSelect(service)}
                        className="group text-left p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50/50 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-base mb-1 truncate">{service.name}</h4>
                            <div className="flex items-center text-sm text-gray-600">
                              <svg
                                className="w-4 h-4 mr-1 flex-shrink-0"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              {service.duration} min
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-lg font-bold text-indigo-600">₱{service.price.toLocaleString()}</div>
                            <div className="text-xs text-gray-500 group-hover:text-indigo-600 transition-colors">
                              Select →
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  {services.length > 6 && (
                    <div className="text-center mt-4">
                      <p className="text-sm text-gray-500">Scroll to see more services</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Select Date */}
            {currentStep === 2 && (
              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Select Date</h3>
                  <p className="text-gray-600">Choose your preferred appointment date</p>
                </div>
                <div className="max-w-2xl mx-auto">
                  <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-indigo-900">{bookingData.serviceName}</p>
                        <p className="text-sm text-indigo-700">
                          ₱{bookingData.servicePrice.toLocaleString()} • {bookingData.serviceDuration} minutes
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
                    {getAvailableDates()
                      .slice(0, 12)
                      .map((date) => (
                        <button
                          key={date}
                          onClick={() => handleDateSelect(date)}
                          className="p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 text-center group"
                        >
                          <div className="text-sm font-semibold text-gray-900 group-hover:text-indigo-600">
                            {new Date(date).toLocaleDateString("en-US", {
                              weekday: "short",
                            })}
                          </div>
                          <div className="text-lg font-bold text-gray-900 group-hover:text-indigo-600">
                            {new Date(date).toLocaleDateString("en-US", {
                              day: "numeric",
                            })}
                          </div>
                          <div className="text-xs text-gray-500 group-hover:text-indigo-500">
                            {new Date(date).toLocaleDateString("en-US", {
                              month: "short",
                            })}
                          </div>
                        </button>
                      ))}
                  </div>
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Services
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Select Time */}
            {currentStep === 3 && (
              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Select Time</h3>
                  <p className="text-gray-600">Choose your preferred time slot</p>
                </div>
                <div className="max-w-2xl mx-auto">
                  <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <p className="font-semibold text-indigo-900">{bookingData.serviceName}</p>
                        <p className="text-sm text-indigo-700">
                          {new Date(bookingData.date).toLocaleDateString("en-US", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {availableTimeSlots.length === 0 && unavailableTimeSlots.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-600 mb-4">No time slots available for this date</p>
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Choose Different Date
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mb-6">
                        {/* Available time slots */}
                        {availableTimeSlots.map((time) => (
                          <button
                            key={time}
                            onClick={() => handleTimeSelect(time)}
                            className="p-4 border border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50 transition-all duration-200 text-center bg-white group"
                          >
                            <div className="font-semibold text-gray-900 group-hover:text-indigo-600">{time}</div>
                          </button>
                        ))}
                        {/* Unavailable time slots */}
                        {unavailableTimeSlots.map((slot) => (
                          <button
                            key={slot.time}
                            disabled
                            className={`p-4 border rounded-xl text-center cursor-not-allowed ${
                              slot.reason === "booked"
                                ? "bg-red-50 border-red-200 text-red-600"
                                : "bg-gray-50 border-gray-200 text-gray-400"
                            }`}
                            title={slot.reason === "booked" ? "Already booked" : "Time has passed"}
                          >
                            <div className="font-semibold">{slot.time}</div>
                            <div className="text-xs mt-1">{slot.reason === "booked" ? "Booked" : "Past"}</div>
                          </button>
                        ))}
                      </div>
                      {availableTimeSlots.length === 0 && (
                        <div className="text-center p-6 bg-yellow-50 rounded-xl border border-yellow-200">
                          <svg
                            className="w-12 h-12 text-yellow-500 mx-auto mb-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                          </svg>
                          <p className="text-yellow-800 font-medium">
                            All time slots for this date are either booked or have passed.
                          </p>
                          <p className="text-yellow-700 text-sm mt-1">Please choose a different date.</p>
                        </div>
                      )}
                    </>
                  )}
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Date Selection
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Customer Information */}
            {currentStep === 4 && (
              <div className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Information</h3>
                  <p className="text-gray-600">Enter your contact details to complete the booking</p>
                </div>
                <div className="max-w-2xl mx-auto">
                  <div className="mb-8 p-6 bg-indigo-50 rounded-xl border border-indigo-200">
                    <h4 className="font-semibold text-indigo-900 mb-4 flex items-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                      Booking Summary
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-indigo-700">
                      <div>
                        <p className="font-medium">Service</p>
                        <p>{bookingData.serviceName}</p>
                      </div>
                      <div>
                        <p className="font-medium">Price</p>
                        <p>₱{bookingData.servicePrice.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="font-medium">Date</p>
                        <p>{new Date(bookingData.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="font-medium">Time</p>
                        <p>
                          {bookingData.time} ({bookingData.serviceDuration} minutes)
                        </p>
                      </div>
                    </div>
                  </div>
                  <form onSubmit={handleSubmitBooking} className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        required
                        value={bookingData.customerName}
                        onChange={(e) => setBookingData({ ...bookingData, customerName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={bookingData.email}
                        onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="your@email.com (optional)"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={bookingData.phone}
                        onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                        placeholder="+63 XXX XXX XXXX (optional)"
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-center pt-6 space-y-4 sm:space-y-0">
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="flex items-center text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Time Selection
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center"
                      >
                        {isLoading ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            Booking...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Confirm Booking
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default BookingFlowPage
