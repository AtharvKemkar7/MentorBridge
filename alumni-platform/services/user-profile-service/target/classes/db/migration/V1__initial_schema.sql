-- Initial schema for User/Profile Service
-- V1__initial_schema.sql

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Student Profiles table
CREATE TABLE student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    student_id VARCHAR(50) UNIQUE,
    department VARCHAR(100),
    program VARCHAR(100),
    batch VARCHAR(20),
    graduation_year INTEGER,
    current_semester INTEGER,
    cgpa NUMERIC(3,2),
    bio TEXT,
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    location VARCHAR(200),
    willing_to_relocate BOOLEAN NOT NULL DEFAULT FALSE,
    profile_completeness INTEGER NOT NULL DEFAULT 0,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_student_profiles_user_id ON student_profiles(user_id);
CREATE INDEX idx_student_profiles_student_id ON student_profiles(student_id);
CREATE INDEX idx_student_profiles_graduation_year ON student_profiles(graduation_year);
CREATE INDEX idx_student_profiles_department ON student_profiles(department);
CREATE INDEX idx_student_profiles_completeness ON student_profiles(profile_completeness);

-- Alumni Profiles table
CREATE TABLE alumni_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    employee_id VARCHAR(50) UNIQUE,
    department VARCHAR(100),
    program VARCHAR(100),
    batch VARCHAR(20),
    graduation_year INTEGER,
    current_company VARCHAR(200),
    job_title VARCHAR(200),
    industry VARCHAR(100),
    total_experience_years INTEGER,
    bio TEXT,
    linkedin_url VARCHAR(500),
    github_url VARCHAR(500),
    portfolio_url VARCHAR(500),
    location VARCHAR(200),
    is_mentor BOOLEAN NOT NULL DEFAULT FALSE,
    verification_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID,
    mentorship_areas TEXT[],
    max_mentees INTEGER NOT NULL DEFAULT 3,
    current_mentees_count INTEGER NOT NULL DEFAULT 0,
    profile_completeness INTEGER NOT NULL DEFAULT 0,
    is_public BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_alumni_profiles_user_id ON alumni_profiles(user_id);
CREATE INDEX idx_alumni_profiles_employee_id ON alumni_profiles(employee_id);
CREATE INDEX idx_alumni_profiles_company ON alumni_profiles(current_company);
CREATE INDEX idx_alumni_profiles_job_title ON alumni_profiles(job_title);
CREATE INDEX idx_alumni_profiles_graduation_year ON alumni_profiles(graduation_year);
CREATE INDEX idx_alumni_profiles_department ON alumni_profiles(department);
CREATE INDEX idx_alumni_profiles_is_mentor ON alumni_profiles(is_mentor);
CREATE INDEX idx_alumni_profiles_verification ON alumni_profiles(verification_status);
CREATE INDEX idx_alumni_profiles_completeness ON alumni_profiles(profile_completeness);

-- Education table
CREATE TABLE educations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_profile_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    alumni_profile_id UUID REFERENCES alumni_profiles(id) ON DELETE CASCADE,
    institution VARCHAR(200) NOT NULL,
    degree VARCHAR(100),
    field_of_study VARCHAR(100),
    start_year INTEGER,
    graduation_year INTEGER,
    grade VARCHAR(20),
    description TEXT,
    education_type VARCHAR(20) NOT NULL DEFAULT 'DEGREE',
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_education_profile CHECK (
        (student_profile_id IS NOT NULL AND alumni_profile_id IS NULL) OR
        (student_profile_id IS NULL AND alumni_profile_id IS NOT NULL)
    )
);

CREATE INDEX idx_educations_student_profile ON educations(student_profile_id);
CREATE INDEX idx_educations_alumni_profile ON educations(alumni_profile_id);
CREATE INDEX idx_educations_institution ON educations(institution);
CREATE INDEX idx_educations_graduation_year ON educations(graduation_year);

-- Skills table
CREATE TABLE skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_profile_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    alumni_profile_id UUID REFERENCES alumni_profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    proficiency VARCHAR(20) NOT NULL DEFAULT 'BEGINNER',
    years_of_experience INTEGER,
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0,
    CONSTRAINT chk_skill_profile CHECK (
        (student_profile_id IS NOT NULL AND alumni_profile_id IS NULL) OR
        (student_profile_id IS NULL AND alumni_profile_id IS NOT NULL)
    )
);

CREATE INDEX idx_skills_student_profile ON skills(student_profile_id);
CREATE INDEX idx_skills_alumni_profile ON skills(alumni_profile_id);
CREATE INDEX idx_skills_name ON skills(name);
CREATE INDEX idx_skills_category ON skills(category);
CREATE INDEX idx_skills_proficiency ON skills(proficiency);

-- Experiences table (Alumni only)
CREATE TABLE experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alumni_profile_id UUID NOT NULL REFERENCES alumni_profiles(id) ON DELETE CASCADE,
    company VARCHAR(200) NOT NULL,
    job_title VARCHAR(200) NOT NULL,
    location VARCHAR(200),
    employment_type VARCHAR(30),
    start_date DATE NOT NULL,
    end_date DATE,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    achievements TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_experiences_alumni_profile ON experiences(alumni_profile_id);
CREATE INDEX idx_experiences_company ON experiences(company);
CREATE INDEX idx_experiences_start_date ON experiences(start_date);
CREATE INDEX idx_experiences_is_current ON experiences(is_current);

-- Career Interests table (Student only)
CREATE TABLE career_interests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_profile_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    desired_role VARCHAR(100),
    industry VARCHAR(100),
    preferred_locations TEXT[],
    remote_preference VARCHAR(20),
    expected_salary_min BIGINT,
    expected_salary_max BIGINT,
    notes TEXT,
    priority INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_career_interests_student_profile ON career_interests(student_profile_id);
CREATE INDEX idx_career_interests_role ON career_interests(desired_role);
CREATE INDEX idx_career_interests_industry ON career_interests(industry);

-- Expertise Areas table (Alumni only)
CREATE TABLE expertise_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alumni_profile_id UUID NOT NULL REFERENCES alumni_profiles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    category VARCHAR(50),
    description VARCHAR(500),
    years_of_experience INTEGER,
    is_mentoring_area BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_expertise_areas_alumni_profile ON expertise_areas(alumni_profile_id);
CREATE INDEX idx_expertise_areas_name ON expertise_areas(name);
CREATE INDEX idx_expertise_areas_category ON expertise_areas(category);