-- Supabase Database Schema for Catering Menu App
-- Run this in Supabase SQL Editor

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255),
    business_name VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    tagline TEXT DEFAULT 'Tasty catering & events',
    services TEXT DEFAULT 'Catering, Events, Celebrations',
    special_notes TEXT,
    logo_data_url TEXT,
    ganapati_data_url TEXT,
    customer_name VARCHAR(255),
    menus JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Create an index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Create a function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default admin user (you can modify email/password later)
INSERT INTO users (
    email, 
    password_hash, 
    owner_name, 
    business_name, 
    phone, 
    address, 
    tagline, 
    services, 
    special_notes
) VALUES (
    'admin@catering.com',
    '$2b$10$placeholder.hash.will.be.replaced', -- This will be replaced by backend
    'Admin User',
    'Catering Menu Pro',
    '+1-800-CATERING',
    'Admin Address',
    'Professional catering menu creator',
    'Wedding Catering, Corporate Events, Birthday Parties, Festival Catering',
    'Default admin account - change credentials after setup'
) ON CONFLICT (email) DO NOTHING;

-- Display success message
SELECT 'Database schema created successfully!' as status;
