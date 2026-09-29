-- ============================================================
-- Campus 360 Enterprise ERP - Database Schema
-- Focus: Authentication & User Accounts (Local Database Setup)
-- ============================================================

CREATE DATABASE IF NOT EXISTS campus360_db;
USE campus360_db;

-- 1. Users & Institutional Authentication Table
DROP TABLE IF EXISTS users;
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  login_id VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'teacher', 'student', 'gate', 'driver', 'accountant') NOT NULL DEFAULT 'student',
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  phone VARCHAR(30) DEFAULT NULL,
  department VARCHAR(100) DEFAULT NULL,
  employee_code VARCHAR(50) DEFAULT NULL,
  grade VARCHAR(50) DEFAULT NULL,
  roll_number VARCHAR(50) DEFAULT NULL,
  parent_name VARCHAR(150) DEFAULT NULL,
  parent_phone VARCHAR(30) DEFAULT NULL,
  bus_route VARCHAR(100) DEFAULT NULL,
  vehicle_number VARCHAR(50) DEFAULT NULL,
  route_number VARCHAR(50) DEFAULT NULL,
  license_number VARCHAR(50) DEFAULT NULL,
  gate_post VARCHAR(100) DEFAULT NULL,
  shift VARCHAR(50) DEFAULT NULL,
  title VARCHAR(100) DEFAULT NULL,
  specialization VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Gate Passes & Emergency Outpass Clearance Table
CREATE TABLE IF NOT EXISTS gate_passes (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(100) UNIQUE NOT NULL,
  type VARCHAR(100) NOT NULL,
  holder_type VARCHAR(50) DEFAULT 'student',
  holder_name VARCHAR(150) NOT NULL,
  holder_id VARCHAR(50) DEFAULT NULL,
  department VARCHAR(100) DEFAULT NULL,
  reason TEXT NOT NULL,
  generate_time VARCHAR(100) DEFAULT NULL,
  gate_out_time VARCHAR(100) DEFAULT NULL,
  scanned_at VARCHAR(100) DEFAULT NULL,
  departure_time VARCHAR(50) DEFAULT NULL,
  out_date VARCHAR(50) DEFAULT NULL,
  valid_until VARCHAR(100) DEFAULT NULL,
  parent_contact VARCHAR(100) DEFAULT NULL,
  vehicle_no VARCHAR(50) DEFAULT NULL,
  gate VARCHAR(100) DEFAULT 'Main West Gate',
  transport_mode VARCHAR(100) DEFAULT 'Personal Vehicle',
  emergency BOOLEAN DEFAULT FALSE,
  status VARCHAR(50) DEFAULT 'approved',
  approved_by VARCHAR(150) DEFAULT 'Authorized School Protocol',
  whatsapp_number VARCHAR(30) DEFAULT '9741264364',
  whatsapp_status VARCHAR(50) DEFAULT 'SENT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Gate Outpass Checkout & Security Exit Logs
CREATE TABLE IF NOT EXISTS gate_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  token VARCHAR(100) NOT NULL,
  holder_name VARCHAR(150) NOT NULL,
  holder_id VARCHAR(50) DEFAULT NULL,
  type VARCHAR(100) DEFAULT 'Gate Departure Clearance',
  reason TEXT DEFAULT NULL,
  generate_time VARCHAR(100) DEFAULT NULL,
  scanned_at VARCHAR(100) DEFAULT NULL,
  out_time VARCHAR(100) NOT NULL,
  gate_out_time VARCHAR(100) DEFAULT NULL,
  device VARCHAR(150) DEFAULT '📱 Guard Security Phone Scanner',
  action VARCHAR(100) DEFAULT 'GATE_EXIT_VERIFIED',
  gate VARCHAR(100) DEFAULT 'Main West Gate',
  officer VARCHAR(150) DEFAULT 'Officer Vikram Singh',
  vehicle_no VARCHAR(50) DEFAULT NULL,
  status VARCHAR(50) DEFAULT 'EXIT_RECORDED',
  whatsapp_number VARCHAR(30) DEFAULT '9741264364',
  whatsapp_notified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Student Half-Day Leaves & Outpass Applications
CREATE TABLE IF NOT EXISTS student_leaves (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  student_name VARCHAR(150) NOT NULL,
  roll VARCHAR(50) DEFAULT NULL,
  grade VARCHAR(50) DEFAULT NULL,
  reason TEXT NOT NULL,
  generate_time VARCHAR(100) DEFAULT NULL,
  gate_out_time VARCHAR(100) DEFAULT NULL,
  departure_time VARCHAR(50) DEFAULT NULL,
  parent_confirmation VARCHAR(150) DEFAULT NULL,
  transport_mode VARCHAR(100) DEFAULT 'Parent Pickup',
  status VARCHAR(50) DEFAULT 'approved',
  qr_token VARCHAR(100) NOT NULL,
  whatsapp_number VARCHAR(30) DEFAULT '9741264364',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. WhatsApp Notifications & Delivery Audit Log
CREATE TABLE IF NOT EXISTS whatsapp_logs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  phone VARCHAR(30) NOT NULL DEFAULT '9741264364',
  holder_name VARCHAR(150) DEFAULT NULL,
  holder_id VARCHAR(50) DEFAULT NULL,
  token VARCHAR(100) DEFAULT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'GATE_PASS_ALERT',
  message TEXT NOT NULL,
  generate_time VARCHAR(100) DEFAULT NULL,
  gate_out_time VARCHAR(100) DEFAULT NULL,
  status VARCHAR(50) DEFAULT 'SENT',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
