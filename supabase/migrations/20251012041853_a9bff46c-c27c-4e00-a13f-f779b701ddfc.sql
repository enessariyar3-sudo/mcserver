-- Fix: Add unique constraint to prevent duplicate event registrations
-- This prevents users from registering multiple times for the same event

ALTER TABLE public.event_participants
ADD CONSTRAINT unique_user_event UNIQUE (user_id, event_id);

-- Add CHECK constraint for valid status values
ALTER TABLE public.event_participants
ADD CONSTRAINT valid_participant_status 
CHECK (status IN ('registered', 'attended', 'cancelled', 'no_show'));

-- Create function to update event participant count
CREATE OR REPLACE FUNCTION public.update_event_participant_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'registered' THEN
    UPDATE server_events 
    SET current_participants = current_participants + 1
    WHERE id = NEW.event_id;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.status = 'registered' THEN
      UPDATE server_events 
      SET current_participants = GREATEST(0, current_participants - 1)
      WHERE id = OLD.event_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.status = 'registered' AND NEW.status != 'registered' THEN
      UPDATE server_events 
      SET current_participants = GREATEST(0, current_participants - 1)
      WHERE id = OLD.event_id;
    ELSIF OLD.status != 'registered' AND NEW.status = 'registered' THEN
      UPDATE server_events 
      SET current_participants = current_participants + 1
      WHERE id = NEW.event_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

-- Create trigger for automatic participant count updates
DROP TRIGGER IF EXISTS event_participant_count_trigger ON public.event_participants;
CREATE TRIGGER event_participant_count_trigger
AFTER INSERT OR UPDATE OR DELETE ON public.event_participants
FOR EACH ROW
EXECUTE FUNCTION public.update_event_participant_count();

-- Add index for performance on queries filtering by user_id and event_id
CREATE INDEX IF NOT EXISTS idx_event_participants_user_event 
ON public.event_participants(user_id, event_id);

-- Add index for status queries
CREATE INDEX IF NOT EXISTS idx_event_participants_status 
ON public.event_participants(status);