-- ============================================================
-- Campus 360 Enterprise ERP - Seed Data
-- Seed accounts with default password 'password123'
-- (Supports both bcrypt hash and plain text fallback during initial dev)
-- ============================================================

USE campus360_db;

-- Clear previous test seeds if needed
DELETE FROM users WHERE email LIKE '%@campus360.edu';

-- Insert default institutional accounts
INSERT INTO users (login_id, name, email, password, role, status, department, phone) VALUES
('001', 'Dr. Sarah Jenkins', 'admin@campus360.edu', '$2a$10$DMormNfmz99t5a0.tDbQ/.u2DxF/nZyDOu8xcSprqsfqdKjBD/FUG', 'admin', 'active', 'Executive Directorate', '+1-555-0101'),
('TEC-002', 'Prof. Marcus Vance', 'teacher@campus360.edu', '$2a$10$DMormNfmz99t5a0.tDbQ/.u2DxF/nZyDOu8xcSprqsfqdKjBD/FUG', 'teacher', 'active', 'Physics & Applied Sciences', '+1-555-0102'),
('STD-042', 'Aiden Montgomery', 'student@campus360.edu', '$2a$10$DMormNfmz99t5a0.tDbQ/.u2DxF/nZyDOu8xcSprqsfqdKjBD/FUG', 'student', 'active', 'Grade 11-A', '+1-555-0103'),
('SEC-101', 'Officer Vikram Singh', 'gate@campus360.edu', '$2a$10$DMormNfmz99t5a0.tDbQ/.u2DxF/nZyDOu8xcSprqsfqdKjBD/FUG', 'gate', 'active', 'Campus Perimeter Security', '+1-555-0104'),
('DRV-304', 'Robert Henderson', 'driver@campus360.edu', '$2a$10$DMormNfmz99t5a0.tDbQ/.u2DxF/nZyDOu8xcSprqsfqdKjBD/FUG', 'driver', 'active', 'Transit Logistics (Bus 304)', '+1-555-0105'),
('ACC-501', 'Rachel Sterling, CPA', 'accountant@campus360.edu', '$2a$10$DMormNfmz99t5a0.tDbQ/.u2DxF/nZyDOu8xcSprqsfqdKjBD/FUG', 'accountant', 'active', 'Bursar & Accounts Office', '+1-555-0106');
