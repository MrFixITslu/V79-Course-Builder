-- V79 Academy Course Builder - PostgreSQL Database Schema

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(50) NOT NULL DEFAULT 'Administrator', -- Administrator, Instructor, Reviewer, Content Editor
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    short_description TEXT NOT NULL,
    full_description TEXT NOT NULL,
    category VARCHAR(100) NOT NULL, -- Fire Finance Pro (FFPRO2), SIWM, Tiquet, KashDash, General
    difficulty_level VARCHAR(50) NOT NULL, -- Beginner, Intermediate, Advanced
    instructor VARCHAR(150) NOT NULL,
    course_version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
    thumbnail TEXT,
    estimated_duration VARCHAR(100) NOT NULL,
    prerequisites TEXT[], -- Array of strings
    learning_objectives TEXT[], -- Array of strings
    status VARCHAR(50) NOT NULL DEFAULT 'Draft', -- Draft, Review, Ready for Upload, Uploaded
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS modules (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    order_number INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS lessons (
    id VARCHAR(50) PRIMARY KEY,
    module_id VARCHAR(50) NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    learning_objectives TEXT[],
    estimated_time VARCHAR(50) NOT NULL,
    lesson_content TEXT NOT NULL,
    video_url TEXT,
    audio_url TEXT,
    image_urls TEXT[],
    downloads JSONB, -- Array of {name, url, size, type}
    exercise_prompt TEXT,
    order_number INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS quizzes (
    id VARCHAR(50) PRIMARY KEY,
    lesson_id VARCHAR(50) NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    passing_score INTEGER NOT NULL DEFAULT 80
);

CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(50) PRIMARY KEY,
    quiz_id VARCHAR(50) NOT NULL REFERENCES quizzes(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50) NOT NULL, -- multiple_choice, true_false
    options TEXT[],
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    order_number INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS assets (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    module_id VARCHAR(50) REFERENCES modules(id) ON DELETE SET NULL,
    lesson_id VARCHAR(50) REFERENCES lessons(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- video, audio, image, pdf, document, download
    url TEXT NOT NULL,
    file_size VARCHAR(50) NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS course_versions (
    id SERIAL PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    version_number VARCHAR(50) NOT NULL,
    changelog TEXT,
    snapshot JSONB, -- Stores the full state snapshot of the course, modules, lessons, content blocks, etc.
    exported_by VARCHAR(150),
    exported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_blocks (
    id VARCHAR(50) PRIMARY KEY,
    lesson_id VARCHAR(50) NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- video, markdown, rich_text, image, audio, pdf, download, quiz, assignment, code, checklist, divider, callout
    order_number INTEGER NOT NULL DEFAULT 0,
    content_data JSONB NOT NULL, -- Type-specific content payload
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS assignments (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    module_id VARCHAR(50) REFERENCES modules(id) ON DELETE SET NULL,
    lesson_id VARCHAR(50) REFERENCES lessons(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    max_points INTEGER NOT NULL DEFAULT 100,
    submission_type VARCHAR(50) NOT NULL DEFAULT 'file', -- file, text, url, none
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS downloads (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id VARCHAR(50) REFERENCES lessons(id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- pdf, zip, spreadsheet, document, etc.
    url TEXT NOT NULL,
    file_size VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS media (
    id VARCHAR(50) PRIMARY KEY,
    course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- video, audio, image, pdf, document, zip, etc.
    url TEXT NOT NULL,
    file_size VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS import_histories (
    id VARCHAR(50) PRIMARY KEY,
    imported_by VARCHAR(150) NOT NULL,
    source_file_name VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL, -- Pending, Success, Failed
    error_message TEXT,
    imported_course_id VARCHAR(50) REFERENCES courses(id) ON DELETE SET NULL,
    imported_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexing for performance
CREATE INDEX IF NOT EXISTS idx_courses_category ON courses(category);
CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status);
CREATE INDEX IF NOT EXISTS idx_modules_course_id ON modules(course_id);
CREATE INDEX IF NOT EXISTS idx_lessons_module_id ON lessons(module_id);
CREATE INDEX IF NOT EXISTS idx_assets_course_id ON assets(course_id);
CREATE INDEX IF NOT EXISTS idx_content_blocks_lesson_id ON content_blocks(lesson_id);
CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_downloads_course_id ON downloads(course_id);
CREATE INDEX IF NOT EXISTS idx_media_course_id ON media(course_id);
CREATE INDEX IF NOT EXISTS idx_import_histories_status ON import_histories(status);
