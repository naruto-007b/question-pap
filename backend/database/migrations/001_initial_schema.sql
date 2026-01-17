-- AutoExam Pro Database Schema - Initial Migration
-- Phase 1: Core Tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'professor' CHECK (role IN ('professor', 'admin')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    professor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_courses_professor_id ON courses(professor_id);
CREATE INDEX idx_courses_code ON courses(code);

-- Units Table
CREATE TABLE IF NOT EXISTS units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    unit_number INT NOT NULL CHECK (unit_number >= 1 AND unit_number <= 4),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, unit_number)
);

CREATE INDEX idx_units_course_id ON units(course_id);

-- Course Outcomes (COs) Table
CREATE TABLE IF NOT EXISTS cos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    co_number INT NOT NULL CHECK (co_number >= 1 AND co_number <= 6),
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, co_number)
);

CREATE INDEX idx_cos_course_id ON cos(course_id);

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('short_answer', 'long_answer')),
    marks INT NOT NULL CHECK (marks IN (2, 5, 6, 8)),
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    unit_id UUID NOT NULL REFERENCES units(id) ON DELETE RESTRICT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_questions_course_id ON questions(course_id);
CREATE INDEX idx_questions_unit_id ON questions(unit_id);
CREATE INDEX idx_questions_type ON questions(type);
CREATE INDEX idx_questions_marks ON questions(marks);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);

-- Question-CO Mapping Table (Many-to-Many)
CREATE TABLE IF NOT EXISTS question_co_mapping (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
    co_id UUID NOT NULL REFERENCES cos(id) ON DELETE CASCADE,
    UNIQUE(question_id, co_id)
);

CREATE INDEX idx_question_co_mapping_question_id ON question_co_mapping(question_id);
CREATE INDEX idx_question_co_mapping_co_id ON question_co_mapping(co_id);

-- Blueprints Table
CREATE TABLE IF NOT EXISTS blueprints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    structure JSONB NOT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_blueprints_is_default ON blueprints(is_default);

-- Generated Papers Table
CREATE TABLE IF NOT EXISTS generated_papers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    blueprint_id UUID NOT NULL REFERENCES blueprints(id) ON DELETE RESTRICT,
    exam_type VARCHAR(20) NOT NULL CHECK (exam_type IN ('mid_term', 'final')),
    pdf_url VARCHAR(500),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_generated_papers_course_id ON generated_papers(course_id);
CREATE INDEX idx_generated_papers_blueprint_id ON generated_papers(blueprint_id);
CREATE INDEX idx_generated_papers_exam_type ON generated_papers(exam_type);

-- Paper Questions Table (Tracks questions used in each paper)
CREATE TABLE IF NOT EXISTS paper_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    paper_id UUID NOT NULL REFERENCES generated_papers(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
    position INT NOT NULL
);

CREATE INDEX idx_paper_questions_paper_id ON paper_questions(paper_id);
CREATE INDEX idx_paper_questions_question_id ON paper_questions(question_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blueprints_updated_at BEFORE UPDATE ON blueprints
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default blueprint
INSERT INTO blueprints (name, structure, is_default) VALUES (
    'Default Institutional Blueprint',
    '{
        "part_a": {
            "question_count": 10,
            "marks_per_question": 2,
            "total_marks": 20,
            "type": "short_answer",
            "description": "Answer ALL questions"
        },
        "part_b": {
            "question_count": 5,
            "questions_to_answer": 3,
            "marks_per_question": 10,
            "total_marks": 30,
            "type": "long_answer",
            "description": "Answer any THREE questions"
        }
    }'::jsonb,
    TRUE
) ON CONFLICT DO NOTHING;

COMMENT ON TABLE users IS 'Stores professor and admin user accounts';
COMMENT ON TABLE courses IS 'Stores course information';
COMMENT ON TABLE units IS 'Stores course units (1-4 per course)';
COMMENT ON TABLE cos IS 'Stores course outcomes (1-6 per course)';
COMMENT ON TABLE questions IS 'Stores all questions in the question bank';
COMMENT ON TABLE question_co_mapping IS 'Maps questions to course outcomes (many-to-many)';
COMMENT ON TABLE blueprints IS 'Stores exam paper blueprint templates';
COMMENT ON TABLE generated_papers IS 'Stores metadata for generated exam papers';
COMMENT ON TABLE paper_questions IS 'Tracks which questions were used in each generated paper';
