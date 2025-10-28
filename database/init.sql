-- Enable UUID extension first
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Now create all tables
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'lecturer', 'prl', 'pl', 'fmg')),
    faculty VARCHAR(100) NOT NULL CHECK (faculty IN ('FICT', 'FBMG', 'FABE')),
    program VARCHAR(255),
    class_id VARCHAR(100),
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE faculties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) NOT NULL,
    faculty_id UUID REFERENCES faculties(id),
    duration_years INTEGER DEFAULT 3,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, faculty_id)
);

CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    faculty VARCHAR(100) NOT NULL CHECK (faculty IN ('FICT', 'FBMG', 'FABE')),
    program_id UUID REFERENCES programs(id),
    credits INTEGER DEFAULT 3,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    faculty VARCHAR(100) NOT NULL CHECK (faculty IN ('FICT', 'FBMG', 'FABE')),
    program_id UUID REFERENCES programs(id),
    total_students INTEGER DEFAULT 0,
    academic_year VARCHAR(20) DEFAULT '2024',
    semester VARCHAR(20) DEFAULT '1',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lecture_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_name VARCHAR(100) NOT NULL,
    class_name VARCHAR(255) NOT NULL,
    week_of_reporting VARCHAR(50) NOT NULL,
    date_of_lecture DATE NOT NULL,
    course_name VARCHAR(255) NOT NULL,
    course_code VARCHAR(50) NOT NULL,
    lecturer_name VARCHAR(255) NOT NULL,
    lecturer_id UUID REFERENCES users(id),
    students_present INTEGER NOT NULL,
    total_students INTEGER NOT NULL,
    venue VARCHAR(255) NOT NULL,
    scheduled_time TIME NOT NULL,
    topic_taught TEXT NOT NULL,
    learning_outcomes TEXT NOT NULL,
    recommendations TEXT,
    status VARCHAR(50) DEFAULT 'pending_student_approval' 
        CHECK (status IN ('pending_student_approval', 'student_approved', 'prl_reviewed', 'completed', 'rejected')),
    feedback_prl TEXT,
    feedback_pl TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT valid_attendance CHECK (students_present <= total_students AND students_present >= 0)
);

CREATE TABLE student_signatures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES lecture_reports(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id),
    signature_data TEXT NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    signed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(report_id, student_id)
);

CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    complainant_id UUID REFERENCES users(id),
    complainant_role VARCHAR(50) NOT NULL,
    against_user_id UUID REFERENCES users(id),
    against_role VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' 
        CHECK (status IN ('pending', 'in_review', 'resolved', 'dismissed')),
    priority VARCHAR(20) DEFAULT 'medium' 
        CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    category VARCHAR(100) DEFAULT 'general',
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE complaint_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    responder_id UUID REFERENCES users(id),
    response_text TEXT NOT NULL,
    attachment_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE attendances (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    report_id UUID REFERENCES lecture_reports(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id),
    is_present BOOLEAN DEFAULT FALSE,
    late_arrival BOOLEAN DEFAULT FALSE,
    notes TEXT,
    recorded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(report_id, student_id)
);

CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rater_id UUID REFERENCES users(id),
    rated_entity_type VARCHAR(50) NOT NULL CHECK (rated_entity_type IN ('lecture', 'course', 'lecturer', 'system')),
    rated_entity_id UUID NOT NULL,
    rating_value INTEGER NOT NULL CHECK (rating_value >= 1 AND rating_value <= 5),
    comment TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(rater_id, rated_entity_type, rated_entity_id)
);

CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lecturer_id UUID REFERENCES users(id),
    course_id UUID REFERENCES courses(id),
    class_id UUID REFERENCES classes(id),
    assigned_by UUID REFERENCES users(id),
    academic_year VARCHAR(20) DEFAULT '2024',
    semester VARCHAR(20) DEFAULT '1',
    is_active BOOLEAN DEFAULT TRUE,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lecturer_id, course_id, class_id, academic_year, semester)
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
    related_entity_type VARCHAR(50),
    related_entity_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    action_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    description TEXT,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE excel_exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    export_type VARCHAR(50) NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    filters JSONB,
    record_count INTEGER DEFAULT 0,
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_faculty ON users(faculty);
CREATE INDEX idx_users_role_faculty ON users(role, faculty);
CREATE INDEX idx_users_is_approved ON users(is_approved) WHERE role = 'student';

CREATE INDEX idx_lecture_reports_lecturer_id ON lecture_reports(lecturer_id);
CREATE INDEX idx_lecture_reports_status ON lecture_reports(status);
CREATE INDEX idx_lecture_reports_faculty ON lecture_reports(faculty_name);
CREATE INDEX idx_lecture_reports_date ON lecture_reports(date_of_lecture);
CREATE INDEX idx_lecture_reports_course ON lecture_reports(course_code);
CREATE INDEX idx_lecture_reports_created_at ON lecture_reports(created_at DESC);

CREATE INDEX idx_complaints_complainant_id ON complaints(complainant_id);
CREATE INDEX idx_complaints_against_user_id ON complaints(against_user_id);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_priority ON complaints(priority);
CREATE INDEX idx_complaints_created_at ON complaints(created_at DESC);

CREATE INDEX idx_student_signatures_report_id ON student_signatures(report_id);
CREATE INDEX idx_student_signatures_student_id ON student_signatures(student_id);

CREATE INDEX idx_attendances_report_id ON attendances(report_id);
CREATE INDEX idx_attendances_student_id ON attendances(student_id);

CREATE INDEX idx_ratings_entity ON ratings(rated_entity_type, rated_entity_id);
CREATE INDEX idx_ratings_rater_id ON ratings(rater_id);

CREATE INDEX idx_assignments_lecturer_id ON assignments(lecturer_id);
CREATE INDEX idx_assignments_course_id ON assignments(course_id);
CREATE INDEX idx_assignments_class_id ON assignments(class_id);
CREATE INDEX idx_assignments_active ON assignments(is_active) WHERE is_active = true;

CREATE INDEX idx_courses_faculty ON courses(faculty);
CREATE INDEX idx_courses_program_id ON courses(program_id);
CREATE INDEX idx_courses_active ON courses(is_active) WHERE is_active = true;

CREATE INDEX idx_classes_faculty ON classes(faculty);
CREATE INDEX idx_classes_program_id ON classes(program_id);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

CREATE INDEX idx_system_logs_user_id ON system_logs(user_id);
CREATE INDEX idx_system_logs_action ON system_logs(action);
CREATE INDEX idx_system_logs_created_at ON system_logs(created_at DESC);
