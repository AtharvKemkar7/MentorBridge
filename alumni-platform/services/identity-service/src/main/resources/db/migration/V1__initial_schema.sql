-- Initial schema for Identity Service
-- V1__initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Permissions table
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    resource VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_permissions_name ON permissions(name);
CREATE INDEX idx_permissions_resource ON permissions(resource);

-- Roles table
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_roles_name ON roles(name);

-- Role-Permission junction table
CREATE TABLE role_permissions (
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    student_id VARCHAR(50) UNIQUE,
    employee_id VARCHAR(50) UNIQUE,
    phone_number VARCHAR(20),
    profile_image_url VARCHAR(500),
    account_status VARCHAR(20) NOT NULL DEFAULT 'PENDING_VERIFICATION',
    user_type VARCHAR(20) NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    password_changed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_users_employee_id ON users(employee_id);
CREATE INDEX idx_users_status ON users(account_status);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_user_type ON users(user_type);

-- Refresh Tokens table
CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    token VARCHAR(512) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoked_reason VARCHAR(255),
    replaced_by_token VARCHAR(512),
    device_info VARCHAR(500),
    ip_address VARCHAR(45),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_refresh_tokens_token ON refresh_tokens(token);
CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expiry ON refresh_tokens(expiry_date);
CREATE INDEX idx_refresh_tokens_revoked ON refresh_tokens(revoked);

-- Insert default permissions
INSERT INTO permissions (name, description, resource, action) VALUES
('USER_READ', 'Read user profiles', 'user', 'read'),
('USER_WRITE', 'Create and update user profiles', 'user', 'write'),
('USER_DELETE', 'Delete users', 'user', 'delete'),
('ADMIN_READ', 'Read admin data', 'admin', 'read'),
('ADMIN_WRITE', 'Manage admin settings', 'admin', 'write'),
('ALUMNI_VERIFY', 'Verify alumni accounts', 'alumni', 'verify'),
('MENTORSHIP_READ', 'Read mentorship data', 'mentorship', 'read'),
('MENTORSHIP_WRITE', 'Create and manage mentorships', 'mentorship', 'write'),
('SCHEDULING_READ', 'Read scheduling data', 'scheduling', 'read'),
('SCHEDULING_WRITE', 'Manage schedules and bookings', 'scheduling', 'write'),
('REVIEW_READ', 'Read reviews', 'review', 'read'),
('REVIEW_WRITE', 'Create and manage reviews', 'review', 'write'),
('REVIEW_MODERATE', 'Moderate reviews', 'review', 'moderate');

-- Insert default roles
INSERT INTO roles (id, name, description) VALUES
(uuid_generate_v4(), 'STUDENT', 'Student user with basic access'),
(uuid_generate_v4(), 'ALUMNI', 'Alumni user with mentorship access'),
(uuid_generate_v4(), 'ADMIN', 'Institute administrator with full access');

-- Assign permissions to roles
-- STUDENT permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'STUDENT' AND p.name IN ('USER_READ', 'USER_WRITE', 'MENTORSHIP_READ', 'MENTORSHIP_WRITE', 'SCHEDULING_READ', 'SCHEDULING_WRITE', 'REVIEW_READ', 'REVIEW_WRITE');

-- ALUMNI permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ALUMNI' AND p.name IN ('USER_READ', 'USER_WRITE', 'MENTORSHIP_READ', 'MENTORSHIP_WRITE', 'SCHEDULING_READ', 'SCHEDULING_WRITE', 'REVIEW_READ');

-- ADMIN permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ADMIN' AND p.name IN ('USER_READ', 'USER_WRITE', 'USER_DELETE', 'ADMIN_READ', 'ADMIN_WRITE', 'ALUMNI_VERIFY', 'MENTORSHIP_READ', 'MENTORSHIP_WRITE', 'SCHEDULING_READ', 'SCHEDULING_WRITE', 'REVIEW_READ', 'REVIEW_WRITE', 'REVIEW_MODERATE');