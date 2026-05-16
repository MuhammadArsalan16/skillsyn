CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    bio TEXT,
    skills TEXT, -- comma separated skills
    experience_level VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, in_progress, completed
    priority VARCHAR(50) DEFAULT 'medium', -- low, medium, high
    due_date TIMESTAMP WITH TIME ZONE,
    assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed some initial data for testing
-- The passwords here are hashed versions of 'password123' using a standard bcrypt hash
INSERT INTO users (name, email, password_hash, bio, skills, experience_level) 
VALUES 
('Admin User', 'admin@skillsync.com', '$2b$10$T8Pq.BqB00bB9E/5eSjKoeh2H0k9085k0X0Z/g6H19rW44eE404p6', 'Administrator', 'DevOps, Fullstack', 'Senior'),
('Test User', 'test@skillsync.com', '$2b$10$T8Pq.BqB00bB9E/5eSjKoeh2H0k9085k0X0Z/g6H19rW44eE404p6', 'Software Developer', 'React, Node, SQL', 'Intermediate')
ON CONFLICT (email) DO NOTHING;
