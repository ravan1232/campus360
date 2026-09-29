# Implementation Plan - Campus 360 School ERP

Build **Campus 360**, a complete, modern, enterprise-grade full-stack School ERP application. The system features a unified JWT authentication flow with role-based access control (RBAC), 6 dedicated role dashboards (Admin, Teacher, Student, Accountant, Driver, Gate Guard), real-time notification alerts, and an intelligent cross-role workflow/grievance dispatch engine.

---

## 1. System Architecture & Tech Stack

### Frontend
- **Framework**: React 18 + Vite (Fast HMR, optimized bundling)
- **Styling**: Tailwind CSS + Custom Design System (Glassmorphic cards, sleek dark/light theme, modern typography like Inter / Plus Jakarta Sans, refined slate/indigo/violet accents)
- **Icons**: Lucide React
- **Data Visualization**: Recharts (interactive attendance trends, fee collection analytics, gate traffic charts, grade distributions)
- **Routing**: React Router DOM (protected role-based route guards)
- **State & Notifications**: React Context API (`AuthContext`, `NotificationContext`, `ThemeContext`) + custom animated Toast notifications

### Backend
- **Runtime**: Node.js + Express.js
- **Authentication**: JWT (JSON Web Tokens) + `bcryptjs` password hashing
- **Database Engine**: MySQL with `mysql2/promise` connection pooling
- **Resilience / Zero-Friction Dev Mode**: Dual-engine database adapter with auto-detection (runs seamlessly against active MySQL database, with a built-in memory/mock data fallback layer if the local MySQL service is not yet running so developers and evaluators can immediately test all 6 dashboards out of the box).
- **Security**: CORS, parameterized SQL queries (SQL injection prevention), token verification middleware, role authorization middleware.

### Database
- Complete relational MySQL schema in `database/schema.sql`:
  - `users` (id, full_name, email, password_hash, role, phone, avatar, status)
  - `students` & `teachers` & `staff` profiles
  - `attendance` (date, user_id, status, remarks)
  - `fees` & `fee_payments` (student_id, amount, due_date, status, receipt_no)
  - `transport_routes` & `buses` & `vehicle_logs`
  - `gate_logs` & `visitor_passes` (visitor_name, host_staff_id, check_in, check_out, purpose, status)
  - `tickets_and_requests` (cross-role workflows, priority, sender_role, target_role, status, resolution)
  - `notifications` (user_id, title, message, is_read, type, created_at)
- Ready-to-run seed data in `database/seed.sql` with default credentials for all 6 roles.

---

## 2. Cross-Role Workflow Dispatch Matrix

| Sender Role | Issue / Request Type | Target Role / Department | Status Flow |
|:---|:---|:---|:---|
| **Student** | Attendance Discrepancy | Teacher | Pending → Reviewed → Corrected |
| **Student** | Fee / Invoice Issue | Accountant | Pending → Under Review → Adjusted |
| **Student** | Bus / Route Issue | Transport / Admin | Pending → Investigating → Resolved |
| **Student** | Technical Issue | Admin / IT | Pending → In Progress → Closed |
| **Teacher** | Student Academic/Disciplinary Issue | Admin | Pending → Escalated → Action Taken |
| **Teacher** | Salary / Payroll Issue | Accountant | Pending → Verification → Processed |
| **Teacher** | Leave Request | Admin | Submitted → Approved / Rejected |
| **Driver** | Vehicle Maintenance / Breakdown | Admin / Fleet Mgr | Reported → Inspection → Serviced |
| **Driver** | Route Deviation / Traffic Block | Transport / Admin | Logged → Rerouted → Closed |
| **Gate Guard** | Security Incident Alert | Admin | High Priority Alert → Resolved |
| **Gate Guard** | Visitor Entry Approval | Authorized Staff / Admin | Requested → Approved / Denied |
| **Accountant**| Capital Expense / Budget Approval | Admin | Submitted → Approved / Rejected |

---

## 3. Six Role Dashboards Breakdown

1. **Admin Hub**
   - KPI metrics: Total Students, Staff, Fee Collection %, Active Fleet, Open Tickets.
   - User Management table (CRUD, activation/deactivation).
   - Institution-wide Analytics (Recharts revenue vs expense, attendance rates).
   - Approval Center (Leave requests, budget approvals, security alerts).

2. **Teacher Workspace**
   - Today's Classes & quick attendance marking panel.
   - Student Performance & gradebook summary.
   - Class-specific attendance issue resolver.
   - Leave application modal & status tracker.

3. **Student Portal**
   - Personal Attendance gauge & subject breakdown.
   - Fee payment history & downloadable receipt summary.
   - Assigned bus route details & driver contact.
   - One-click cross-role Helpdesk Ticket creator (with direct auto-routing).

4. **Accountant Suite**
   - Total Collected vs Outstanding balances.
   - Recent Transactions & Payment gateway mock.
   - Fee dispute resolution queue (routed from students).
   - Staff payroll overview & expense approval requests to Admin.

5. **Driver Fleet Console**
   - Assigned vehicle details (Bus No, Capacity, Fuel status).
   - Route stops list with passenger check-in counter.
   - Rapid Incident / Breakdown reporting form (auto-notifies Admin/Transport).
   - Emergency SOS toggle.

6. **Gate Guard Security Console**
   - Live Campus Entry/Exit monitor with timestamp logging.
   - Instant Visitor Pass generation with host staff selection.
   - Student Gate Pass verification (checks if exit permission granted).
   - Security Alert trigger button (direct broadcast to Admin).

---

## 4. Proposed Folder & File Structure

```
campus-360/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MySQL connection pool + fallback adapter
│   │   └── jwt.js                # JWT secret and token utilities
│   ├── controllers/
│   │   ├── authController.js     # Login, profile, demo quick-login
│   │   ├── dashboardController.js# Role-tailored metrics & stats
│   │   ├── ticketController.js   # Cross-role ticket submission & workflow
│   │   ├── userController.js     # User & staff management
│   │   ├── feeController.js      # Fee records & invoices
│   │   ├── attendanceController.js # Attendance marking & history
│   │   └── gateController.js     # Visitor passes & gate logs
│   ├── middleware/
│   │   ├── authMiddleware.js     # Bearer token verification
│   │   └── roleMiddleware.js     # Role validation (RBAC)
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── ticketRoutes.js
│   │   ├── userRoutes.js
│   │   ├── feeRoutes.js
│   │   ├── attendanceRoutes.js
│   │   └── gateRoutes.js
│   ├── utils/
│   │   └── mockData.js           # Seamless seed & memory state fallback
│   ├── server.js                 # Express app bootstrapper & error handling
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/           # Navbar, Sidebar, Modal, Badge, StatCard, DataTable
│   │   │   ├── notifications/    # NotificationDropdown, Toast
│   │   │   └── tickets/          # CrossRoleTicketModal, TicketList
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Auth state, login, logout, active role
│   │   │   └── ThemeContext.jsx  # Dark/Light mode toggle
│   │   ├── layouts/
│   │   │   ├── DashboardLayout.jsx # Dynamic sidebar + topbar + role badge
│   │   │   └── AuthLayout.jsx
│   │   ├── pages/
│   │   │   ├── auth/Login.jsx    # Sleek login + 1-click Quick Demo Role Switcher
│   │   │   ├── admin/AdminDashboard.jsx
│   │   │   ├── teacher/TeacherDashboard.jsx
│   │   │   ├── student/StudentDashboard.jsx
│   │   │   ├── accountant/AccountantDashboard.jsx
│   │   │   ├── driver/DriverDashboard.jsx
│   │   │   └── gate/GateDashboard.jsx
│   │   ├── routes/
│   │   │   ├── AppRoutes.jsx     # Route mappings
│   │   │   └── ProtectedRoute.jsx# Role-gated route protector
│   │   ├── services/
│   │   │   └── api.js            # Axios/Fetch API client with auth interceptor
│   │   ├── App.jsx
│   │   ├── index.css             # Tailwind config & design tokens
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   └── package.json
├── database/
│   ├── schema.sql                # Complete MySQL DDL tables
│   └── seed.sql                  # Comprehensive seed data for all roles
└── README.md                     # Setup, running, and API documentation
```

---

## 5. Pre-Configured Demo Credentials

To make testing instant for all 6 roles, the application will feature both standard login credentials and a **1-Click Quick Role Switcher** on the login page:

| Role | Email | Password |
|:---|:---|:---|
| **Admin** | `admin@campus360.edu` | `password123` |
| **Teacher** | `teacher@campus360.edu` | `password123` |
| **Student** | `student@campus360.edu` | `password123` |
| **Accountant** | `accountant@campus360.edu` | `password123` |
| **Driver** | `driver@campus360.edu` | `password123` |
| **Gate Guard** | `gate@campus360.edu` | `password123` |

---

## 6. Verification Plan

### Automated Build & Lint Verification
1. `npm install` in both `backend` and `frontend`.
2. Frontend build verification: `npm run build` in `frontend` to verify no JSX, TypeScript, or Tailwind compile errors.
3. Backend startup test: `node server.js` to ensure the API starts cleanly on port 5000 and answers `/api/health`.

### Functional & UI Verification
1. Launch backend on port 5000 and frontend on port 5173.
2. Login flow: Test login for each of the 6 roles (Admin, Teacher, Student, Accountant, Driver, Gate Guard).
3. Cross-role workflow: Create a ticket from the Student portal (e.g. "Fee discrepancy") -> verify it appears in the Accountant's dispute resolution queue.
4. Gate Guard visitor pass generation -> verify pass status and timestamp.
5. Teacher attendance marking -> verify instant update in metrics.
6. Responsive design check (desktop and mobile viewports) via browser.
