"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, Link } from "react-router-dom"
import Layout from "../components/Layout"
import Logo from "../components/Logo"

interface BusinessInfo {
  business_name: string
  slug: string
  contact_info: string
  address: string
}

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

const BookingLandingPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>()
  const [businessInfo, setBusinessInfo] = useState<BusinessInfo | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [workingHours, setWorkingHours] = useState<WorkingHour[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  useEffect(() => {
    if (slug) {
      fetchBusinessData()
    }
  }, [slug])

  const fetchBusinessData = async () => {
    try {
      setIsLoading(true)
      // Fetch business info
      const businessResponse = await fetch(`http://localhost:5000/api/settings/business/${slug}`)
      if (!businessResponse.ok) {
        throw new Error("Business not found")
      }
      const businessData = await businessResponse.json()
      setBusinessInfo(businessData)

      // Fetch services
      const servicesResponse = await fetch(`http://localhost:5000/api/services/public/${slug}`)
      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json()
        setServices(servicesData)
      }

      // Fetch working hours
      const hoursResponse = await fetch(`http://localhost:5000/api/settings/working-hours/${slug}`)
      if (hoursResponse.ok) {
        const hoursData = await hoursResponse.json()
        setWorkingHours(hoursData)
      }
    } catch (error) {
      console.error("Error fetching business data:", error)
      setError(error instanceof Error ? error.message : "Failed to load business information")
    } finally {
      setIsLoading(false)
    }
  }

  const getOpenHours = () => {
    return workingHours
      .filter((hour) => hour.is_open)
      .map((hour) => ({
        day: dayNames[hour.day_of_week],
        hours: `${hour.open_time.substring(0, 5)} - ${hour.close_time.substring(0, 5)}`,
      }))
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-300 border-t-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading business information...</p>
          </div>
        </div>
      </Layout>
    )
  }

  if (error || !businessInfo) {
    return (
      <Layout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center bg-white p-8 rounded-2xl shadow-sm border border-gray-200 max-w-md mx-4">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Business Not Found</h1>
            <p className="text-gray-600 mb-6 leading-relaxed">
              {error || "The business you're looking for doesn't exist or is no longer available."}
            </p>
            <Link
              to="/"
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            >
              Go to Homepage
            </Link>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">{businessInfo.business_name}</h1>
                <p className="text-gray-600">Book your appointment online</p>
              </div>
              <Link
                to="/track"
                className="text-indigo-600 hover:text-indigo-700 font-medium px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                Track Booking
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Services Section */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Here are our services</h2>
                  <p className="text-gray-600">Available services and pricing</p>
                </div>

                {services.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-500">No services available at the moment</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-base mb-2 truncate">{service.name}</h3>
                            <div className="flex items-center justify-between text-sm text-gray-600">
                              <div className="flex items-center space-x-1">
                                <span className="font-medium">₱{service.price.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <svg
                                  className="w-4 h-4 flex-shrink-0"
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
                                <span className="font-medium">{service.duration}min</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {services.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <Link
                      to={`/book/${slug}/appointment`}
                      className="w-full bg-indigo-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span>Continue to Book Appointment</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Business Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                <div className="space-y-4">
                  {businessInfo.contact_info && (
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">{businessInfo.contact_info}</span>
                    </div>
                  )}
                  {businessInfo.address && (
                    <div className="flex items-start">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">{businessInfo.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Working Hours */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Business Hours</h3>
                {getOpenHours().length === 0 ? (
                  <p className="text-gray-500">Hours not available</p>
                ) : (
                  <div className="space-y-2">
                    {getOpenHours().map((schedule, index) => (
                      <div key={index} className="flex justify-between items-center py-2">
                        <span className="text-gray-600 font-medium">{schedule.day}</span>
                        <span className="text-gray-900 font-semibold">{schedule.hours}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative bg-gray-100 border-t border-gray-200 py-4 mt-8 overflow-hidden">
          {/* Bokeh effect background */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <svg width="100%" height="100%" className="w-full h-full" style={{ filter: 'blur(8px)' }}>
              <circle cx="20%" cy="40%" r="40" fill="#d1d5db" fillOpacity="0.5" />
              <circle cx="60%" cy="70%" r="30" fill="#e5e7eb" fillOpacity="0.4" />
              <circle cx="80%" cy="30%" r="25" fill="#f3f4f6" fillOpacity="0.3" />
              <circle cx="40%" cy="80%" r="20" fill="#cbd5e1" fillOpacity="0.3" />
            </svg>
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex items-center justify-center h-10">
            <span className="text-gray-500 text-sm mr-2 flex items-center">Powered by</span>
            <span className="flex items-center" style={{ marginTop: '1px' }}>
              <Logo size="sm" showText={false} />
            </span>
          </div>
        </footer>
      </div>
    </Layout>
  )
}

export default BookingLandingPage
