-- Function to shift all timeline events for a game by a specified number of minutes
CREATE OR REPLACE FUNCTION shift_timeline_events(p_game_id UUID, p_minutes INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE timeline_events
  SET time_offset = time_offset + p_minutes
  WHERE game_id = p_game_id;
END;
$$ LANGUAGE plpgsql;

