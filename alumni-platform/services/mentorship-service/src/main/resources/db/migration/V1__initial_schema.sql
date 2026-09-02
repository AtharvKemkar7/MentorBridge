-- Mentorship Service schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE mentorship_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    icon VARCHAR(200),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_mentorship_categories_name ON mentorship_categories(name);

CREATE TABLE mentorship_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    alumni_id UUID NOT NULL,
    category_id UUID NOT NULL REFERENCES mentorship_categories(id),
    message VARCHAR(2000),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    response_message VARCHAR(2000),
    responded_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_mentorship_requests_student ON mentorship_requests(student_id);
CREATE INDEX idx_mentorship_requests_alumni ON mentorship_requests(alumni_id);
CREATE INDEX idx_mentorship_requests_status ON mentorship_requests(status);
CREATE INDEX idx_mentorship_requests_category ON mentorship_requests(category_id);

CREATE TABLE mentorships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    alumni_id UUID NOT NULL,
    category_id UUID NOT NULL REFERENCES mentorship_categories(id),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    goals VARCHAR(3000),
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    ended_reason VARCHAR(1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_mentorships_student ON mentorships(student_id);
CREATE INDEX idx_mentorships_alumni ON mentorships(alumni_id);
CREATE INDEX idx_mentorships_status ON mentorships(status);
CREATE INDEX idx_mentorships_category ON mentorships(category_id);

-- Seed default categories
INSERT INTO mentorship_categories (name, description, icon, sort_order) VALUES
('Career Guidance', 'General career advice and planning', 'briefcase', 1),
('Technical Skills', 'Programming, tools, frameworks', 'code', 2),
('Industry Insights', 'Sector-specific knowledge', 'industry', 3),
('Resume & Interview Prep', 'CV review, mock interviews', 'file-text', 4),
('Leadership & Management', 'Team lead, management skills', 'users', 5),
('Entrepreneurship', 'Startup guidance, business strategy', 'rocket', 6),
('Academic Research', 'Research methodology, publications', 'book', 7),
('Work-Life Balance', 'Productivity, burnout prevention', 'heart', 8);