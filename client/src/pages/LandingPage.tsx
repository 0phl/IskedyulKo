import type React from "react"
import { Link } from "react-router-dom"
import Layout from "../components/Layout"
import Logo from "../components/Logo"

const LandingPage: React.FC = () => {
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-violet-50 relative overflow-hidden">
        {/* Background Elements */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23818cf8' fillOpacity='0.03'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-200/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-violet-200/20 to-transparent rounded-full blur-3xl"></div>

        {/* Header */}
        <header className="relative z-10 bg-white/60 backdrop-blur-xl border-b border-indigo-100/30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Logo size="lg" />
              </div>
              <div className="flex space-x-4">
                <Link
                  to="/login"
                  className="text-slate-700 hover:text-indigo-600 px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 hover:bg-white/60 backdrop-blur-sm"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white px-8 py-2.5 rounded-xl text-sm font-semibold hover:from-indigo-700 hover:to-indigo-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 border border-indigo-500/20"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-indigo-100/80 backdrop-blur-sm border border-indigo-200/50 text-indigo-700 text-sm font-medium mb-8">
              <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2 animate-pulse"></span>
              Trusted by 500+ Filipino businesses
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 mb-12 leading-[1.2] md:leading-[1.15] tracking-tight py-4">
              Simplify Your
              <span className="block bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent animate-pulse py-4">
                Booking Process
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed font-light">
              IskedyulKo helps Filipino small businesses manage appointments effortlessly. Create your booking page,
              manage services, and let customers book appointments online.
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Link
                to="/register"
                className="group relative bg-gradient-to-r from-indigo-600 via-indigo-700 to-violet-700 text-white px-12 py-5 rounded-2xl text-lg font-bold hover:from-indigo-700 hover:via-indigo-800 hover:to-violet-800 transition-all duration-500 shadow-2xl hover:shadow-indigo-500/25 transform hover:-translate-y-2 border border-indigo-400/20"
              >
                <span className="relative z-10">Start For Free</span>
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              </Link>
              <Link
                to="/track"
                className="group relative bg-white/80 backdrop-blur-sm text-slate-700 px-12 py-5 rounded-2xl text-lg font-bold hover:bg-white transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-2 border border-slate-200/50"
              >
                <span className="relative z-10">Track Booking</span>
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-1">500+</div>
                <div className="text-sm text-slate-600 font-medium">Active Businesses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-1">10k+</div>
                <div className="text-sm text-slate-600 font-medium">Bookings Made</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-slate-900 mb-1">99.9%</div>
                <div className="text-sm text-slate-600 font-medium">Uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center mb-24">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-violet-100/80 backdrop-blur-sm border border-violet-200/50 text-violet-700 text-sm font-medium mb-6">
              Features
            </div>
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-8 tracking-tight leading-[1.2] md:leading-[1.15] py-4">
              Everything You Need to
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 py-4">
                Manage Bookings
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto font-light">
              Simple, powerful tools designed for Filipino small businesses
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-white/20 group-hover:border-indigo-200/50">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-r from-indigo-500 to-violet-500 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Easy Scheduling</h3>
                <p className="text-slate-600 leading-relaxed text-lg font-light">
                  Let customers book appointments 24/7 with your custom booking page
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-indigo-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-white/20 group-hover:border-violet-200/50">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-indigo-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-r from-violet-500 to-indigo-500 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Service Management</h3>
                <p className="text-slate-600 leading-relaxed text-lg font-light">
                  Add and manage your services with pricing and duration settings
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-4 border border-white/20 group-hover:border-indigo-200/50">
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-2xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                  <div className="relative bg-gradient-to-r from-indigo-500 to-violet-500 w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2M9 5a2 2 0 002-2h2a2 2 0 002 2zm0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-4">Business Insights</h3>
                <p className="text-slate-600 leading-relaxed text-lg font-light">
                  Track appointments, revenue, and manage your business efficiently
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="relative z-10 bg-slate-900/95 backdrop-blur-xl text-white py-4 border-t border-slate-800/50">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/20 to-violet-900/20"></div>
          <div className="relative max-w-7xl mx-auto px-4 text-center flex flex-col items-center gap-1">
            <div className="flex items-center justify-center gap-2">
              <span className="text-slate-400 text-sm">Developed by: Ronan Dela Cruz</span>
              <a
                href="https://github.com/0phl"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="ml-1 hover:text-white transition-colors"
              >
                <svg
                  className="w-5 h-5 inline-block align-middle"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    d="M12 2C6.477 2 2 6.484 2 12.021c0 4.428 2.865 8.184 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.342-3.369-1.342-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.004.07 1.532 1.032 1.532 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.339-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.987 1.029-2.687-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.295 2.748-1.025 2.748-1.025.546 1.378.202 2.397.1 2.65.64.7 1.028 1.594 1.028 2.687 0 3.847-2.338 4.695-4.566 4.944.359.309.678.919.678 1.852 0 1.336-.012 2.417-.012 2.747 0 .268.18.58.688.482C19.138 20.2 22 16.448 22 12.021 22 6.484 17.523 2 12 2z"
                  />
                </svg>
              </a>
            </div>
            <span className="text-slate-500 text-xs">&copy; 2025 IskedyulKo. Made for Filipino small businesses.</span>
          </div>
        </footer>
      </div>
    </Layout>
  )
}

export default LandingPage
