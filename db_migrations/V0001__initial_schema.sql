-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    provider VARCHAR(50),
    provider_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User profiles with cycle settings
CREATE TABLE IF NOT EXISTS user_profiles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    average_cycle_length INTEGER DEFAULT 28,
    average_period_length INTEGER DEFAULT 5,
    date_of_birth DATE,
    weight DECIMAL(5,2),
    height INTEGER,
    timezone VARCHAR(100) DEFAULT 'Europe/Moscow',
    notifications_enabled BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menstrual cycles tracking
CREATE TABLE IF NOT EXISTS cycles (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    start_date DATE NOT NULL,
    end_date DATE,
    cycle_length INTEGER,
    period_length INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Daily tracking data
CREATE TABLE IF NOT EXISTS daily_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    log_date DATE NOT NULL,
    mood INTEGER CHECK (mood >= 0 AND mood <= 4),
    pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
    flow_intensity INTEGER CHECK (flow_intensity >= 0 AND flow_intensity <= 3),
    energy_level INTEGER CHECK (energy_level >= 0 AND energy_level <= 10),
    sleep_hours DECIMAL(3,1),
    water_glasses INTEGER,
    exercise_minutes INTEGER,
    calories_intake INTEGER,
    weight DECIMAL(5,2),
    temperature DECIMAL(4,2),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, log_date)
);

-- Symptoms tracking
CREATE TABLE IF NOT EXISTS symptoms (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    log_date DATE NOT NULL,
    symptom_type VARCHAR(100) NOT NULL,
    severity INTEGER CHECK (severity >= 1 AND severity <= 5),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medications and contraception
CREATE TABLE IF NOT EXISTS medications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    start_date DATE,
    end_date DATE,
    reminder_time TIME,
    notes TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Medication intake log
CREATE TABLE IF NOT EXISTS medication_logs (
    id SERIAL PRIMARY KEY,
    medication_id INTEGER REFERENCES medications(id),
    taken_at TIMESTAMP NOT NULL,
    skipped BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pregnancy tracking
CREATE TABLE IF NOT EXISTS pregnancies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    conception_date DATE,
    due_date DATE,
    status VARCHAR(50) DEFAULT 'planning',
    current_week INTEGER,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pregnancy milestones and appointments
CREATE TABLE IF NOT EXISTS pregnancy_events (
    id SERIAL PRIMARY KEY,
    pregnancy_id INTEGER REFERENCES pregnancies(id),
    event_date DATE NOT NULL,
    event_type VARCHAR(100),
    title VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Health conditions and chronic diseases
CREATE TABLE IF NOT EXISTS health_conditions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    condition_name VARCHAR(255) NOT NULL,
    diagnosed_date DATE,
    status VARCHAR(50) DEFAULT 'active',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Community posts
CREATE TABLE IF NOT EXISTS community_posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    category VARCHAR(100),
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    replies_count INTEGER DEFAULT 0,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Community replies
CREATE TABLE IF NOT EXISTS community_replies (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES community_posts(id),
    user_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    likes_count INTEGER DEFAULT 0,
    is_anonymous BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Health diary entries
CREATE TABLE IF NOT EXISTS diary_entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    entry_date DATE NOT NULL,
    title VARCHAR(500),
    content TEXT NOT NULL,
    mood INTEGER,
    is_private BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Appointments with specialists
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    specialist_type VARCHAR(100),
    appointment_date TIMESTAMP NOT NULL,
    duration_minutes INTEGER DEFAULT 30,
    location TEXT,
    notes TEXT,
    status VARCHAR(50) DEFAULT 'scheduled',
    reminder_sent BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User settings and preferences
CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) UNIQUE,
    theme VARCHAR(20) DEFAULT 'light',
    language VARCHAR(10) DEFAULT 'ru',
    notifications_email BOOLEAN DEFAULT true,
    notifications_push BOOLEAN DEFAULT true,
    reminders_period BOOLEAN DEFAULT true,
    reminders_ovulation BOOLEAN DEFAULT true,
    reminders_medication BOOLEAN DEFAULT true,
    reminders_appointments BOOLEAN DEFAULT true,
    data_sharing BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cycles_user_date ON cycles(user_id, start_date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_logs_user_date ON daily_logs(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_symptoms_user_date ON symptoms(user_id, log_date DESC);
CREATE INDEX IF NOT EXISTS idx_medications_user_active ON medications(user_id, active);
CREATE INDEX IF NOT EXISTS idx_community_posts_category ON community_posts(category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_appointments_user_date ON appointments(user_id, appointment_date);