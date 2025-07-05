<div align="center">
  <img src="client/public/iskedyulKo.png" alt="IskedyulKo Logo" width="900" height="900">

  *A simple and elegant booking system for Filipino businesses*

  ![React](https://img.shields.io/badge/React-18-blue)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)
  ![Express](https://img.shields.io/badge/Express.js-4.18-green)
  ![MySQL](https://img.shields.io/badge/MySQL-8.0-orange)
  ![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-cyan)
</div>

## 📖 About

IskedyulKo is a full-stack appointment booking web application designed specifically for small Filipino businesses. It provides an easy-to-use platform for business owners to manage their services and appointments while offering customers a seamless booking experience.

## ✨ Features

### 👨‍💼 For Business Owners
- **Dashboard Overview** - View today's appointments and key metrics
- **Appointment Management** - Confirm, cancel, or mark appointments as complete
- **Service Management** - Add, edit, and delete services with pricing
- **Business Settings** - Configure working hours and business information
- **Shareable Booking Link** - Custom URL for customers to book appointments

### 👥 For Customers
- **Easy Booking Process** - 4-step booking: Service → Date → Time → Details
- **Appointment Tracking** - Track booking status using unique booking code
- **No Registration Required** - Book appointments without creating accounts
- **Mobile Friendly** - Responsive design for all devices

## 🛠️ Tech Stack

**Frontend:**
- React 18 + TypeScript
- TailwindCSS + Vite
- React Router DOM

**Backend:**
- Express.js + Node.js
- MySQL Database
- JWT Authentication

**Tools:**
- ESLint + PostCSS
- Nodemon for development

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd iskedyulko
   ```

2. **Install dependencies**
   ```bash
   # Server
   cd server && npm install

   # Client
   cd ../client && npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Set up database**
   ```bash
   cd server && npm run setup-db
   ```

5. **Start development servers**
   ```bash
   # Terminal 1 - Server
   cd server && npm run dev

   # Terminal 2 - Client
   cd client && npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

<div align="center">
  Made with ❤️ for Filipino businesses
</div>