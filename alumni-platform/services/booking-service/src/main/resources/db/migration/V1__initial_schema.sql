-- Booking Service schema
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE availabilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    alumni_id UUID NOT NULL,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    timezone VARCHAR(50) NOT NULL DEFAULT 'UTC',
    is_recurring BOOLEAN NOT NULL DEFAULT FALSE,
    recurrence_pattern VARCHAR(50),
    recurrence_end_date DATE,
    notes VARCHAR(1000),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_availabilities_alumni ON availabilities(alumni_id);
CREATE INDEX idx_availabilities_date ON availabilities(date);

CREATE TABLE slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    availability_id UUID REFERENCES availabilities(id) ON DELETE CASCADE,
    alumni_id UUID NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'AVAILABLE',
    booked_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_slots_availability ON slots(availability_id);
CREATE INDEX idx_slots_alumni ON slots(alumni_id);
CREATE INDEX idx_slots_start_time ON slots(start_time);
CREATE INDEX idx_slots_status ON slots(status);
-- Unique constraint to prevent double booking: only one booking per slot
CREATE UNIQUE INDEX idx_slots_unique_booking ON slots(id) WHERE status = 'BOOKED';

CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL,
    alumni_id UUID NOT NULL,
    slot_id UUID NOT NULL UNIQUE,
    mentorship_id UUID,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    notes VARCHAR(2000),
    cancelled_by UUID,
    cancelled_reason VARCHAR(1000),
    cancelled_at TIMESTAMPTZ,
    confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_bookings_student ON bookings(student_id);
CREATE INDEX idx_bookings_alumni ON bookings(alumni_id);
CREATE INDEX idx_bookings_slot ON bookings(slot_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_mentorship ON bookings(mentorship_id);

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID NOT NULL UNIQUE,
    student_id UUID NOT NULL,
    alumni_id UUID NOT NULL,
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    meeting_link VARCHAR(500),
    notes VARCHAR(3000),
    completed_at TIMESTAMPTZ,
    completed_by UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    version BIGINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_sessions_booking ON sessions(booking_id);
CREATE INDEX idx_sessions_student ON sessions(student_id);
CREATE INDEX idx_sessions_alumni ON sessions(alumni_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_start_time ON sessions(start_time);