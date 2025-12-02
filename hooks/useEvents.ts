import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ServerEvent {
  id: string;
  title: string;
  description: string;
  event_type: string;
  start_date: string;
  end_date: string;
  location: string;
  max_participants: number;
  current_participants: number;
  rewards: string[];
  requirements: string[];
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    display_name?: string;
    minecraft_username?: string;
    avatar_url?: string;
  };
  user_registered?: boolean;
}

export const useEvents = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<ServerEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data: eventsData, error: eventsError } = await supabase
          .from('server_events')
          .select('*')
          .eq('is_active', true)
          .order('start_date', { ascending: true });

        if (eventsError) {
          console.error('Error fetching events:', eventsError);
          return;
        }

        let eventsWithRegistration = eventsData || [];

        // Check user registration status if logged in
        if (user && eventsData?.length) {
          const { data: participantsData } = await supabase
            .from('event_participants')
            .select('event_id')
            .eq('user_id', user.id)
            .in('event_id', eventsData.map(e => e.id));

          const registeredEventIds = new Set(participantsData?.map(p => p.event_id) || []);

          eventsWithRegistration = eventsData.map(event => ({
            ...event,
            user_registered: registeredEventIds.has(event.id)
          }));
        }

        setEvents(eventsWithRegistration);
      } catch (error) {
        console.error('Error in fetchEvents:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [user]);

  const registerForEvent = async (eventId: string) => {
    if (!user) return { error: 'Must be logged in to register' };

    try {
      const { error } = await supabase
        .from('event_participants')
        .insert({
          event_id: eventId,
          user_id: user.id
        });

      if (error) {
        return { error: error.message };
      }

      // Update local state
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, user_registered: true, current_participants: event.current_participants + 1 }
          : event
      ));

      return { success: true };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const unregisterFromEvent = async (eventId: string) => {
    if (!user) return { error: 'Must be logged in to unregister' };

    try {
      const { error } = await supabase
        .from('event_participants')
        .delete()
        .eq('event_id', eventId)
        .eq('user_id', user.id);

      if (error) {
        return { error: error.message };
      }

      // Update local state
      setEvents(prev => prev.map(event => 
        event.id === eventId 
          ? { ...event, user_registered: false, current_participants: Math.max(0, event.current_participants - 1) }
          : event
      ));

      return { success: true };
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const getUpcomingEvents = () => events.filter(event => new Date(event.start_date) > new Date());
  const getOngoingEvents = () => events.filter(event => {
    const now = new Date();
    const start = new Date(event.start_date);
    const end = event.end_date ? new Date(event.end_date) : null;
    return start <= now && (!end || end >= now);
  });

  return {
    events,
    loading,
    registerForEvent,
    unregisterFromEvent,
    getUpcomingEvents,
    getOngoingEvents,
  };
};