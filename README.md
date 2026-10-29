# KiddoCare Frontend (React + Vite)

A modern pediatric clinic management and appointment booking system tailored to cater to the pediatric healthcare needs of every child with a seamless digital approach.

---

## Features

### 1. Admin Dashboard (`/admin-dashboard`)
- **Appointments Management**:
  - **Live Filters**: Filter appointments by attending **Doctor**, **Patient**, **Status** (`Pending`, `Confirmed`, `Completed`, `Cancelled`), single **Date**, or **Date Range** (`start_date` and `end_date`).
  - **Live Search**: Instant text search by patient name, doctor, or reason for visit.
  - **View Appointment Details (`getAppointment`)**: View full details for any appointment.
  - **Doctor Availability Checking (`checkAvailability`)**: Prevents conflicting bookings by checking doctor slots live before booking or rescheduling.
  - **Book New Appointment (`createAppointment`)**: Schedule an appointment for any registered child with an available pediatrician.
  - **Status Updates (`updateAppointmentStatus`)**: Change status between `Pending`, `Confirmed`, `Completed`, and `Cancelled` with real-time UI updates.
  - **Reschedule Appointment (`rescheduleAppointment`)**: Move date/time or reassign to another pediatrician with instant conflict prevention.
- **Children / Patient Management**:
  - Live patient directory and quick demographic viewing.
- **Real-Time Synchronized Stat Cards**:
  - Displays dynamic live counts for registered patients and scheduled visits.

### 2. User / Guardian Portal (`/dashboard`)
- **Child Information & Registration**:
  - Register new children with birth date, gender, height, and weight.
  - View individual medical records and appointment history.
- **Book Appointments**:
  - Select child and preferred pediatrician.
  - Choose preferred date with real-time availability indicator (`(Available Free Slot)` vs `(Booked - Conflict)`).
  - Confirm bookings directly into the clinic database.
- **Scheduled Appointments**:
  - View all upcoming visits with real-time status badges updated by clinic staff.

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables (`.env`)
Create a `.env` file in the project root:
```env
VITE_API_BASE_URL=http://localhost:5000
```

### 3. Run Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:5173`.

### 4. Build for Production
```bash
npm run build
```

---

## Test Accounts

| Role | Portal URL | Email / Username | Password |
|---|---|---|---|
| **Admin** | `http://localhost:5173/admin` | `admin@gmail.com` | `Admin123!` |
| **Guardian** | `http://localhost:5173/login` | `gojosama@gmail.com` | `Password123!` |

---

## Backend Requirements
Requires the KiddoCare Express/Node.js backend running on `http://localhost:5000` with Supabase connected.
