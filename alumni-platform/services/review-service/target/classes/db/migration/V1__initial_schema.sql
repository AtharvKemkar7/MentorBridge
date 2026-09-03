CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL,
    mentor_id UUID NOT NULL,
    student_id UUID NOT NULL,
    rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_review_session_student UNIQUE (session_id, student_id)
);

CREATE INDEX idx_reviews_mentor ON reviews(mentor_id);
CREATE INDEX idx_reviews_student ON reviews(student_id);
CREATE INDEX idx_reviews_session ON reviews(session_id);
CREATE INDEX idx_reviews_status ON reviews(status);