-- Add is_picked_up, picked_up_at, and is_completed columns to groups table
ALTER TABLE groups ADD COLUMN is_picked_up BOOLEAN DEFAULT FALSE;
ALTER TABLE groups ADD COLUMN picked_up_at TIMESTAMP;
ALTER TABLE groups ADD COLUMN is_completed BOOLEAN DEFAULT FALSE;