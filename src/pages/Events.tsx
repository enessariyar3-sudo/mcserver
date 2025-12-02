import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, Clock, Users, MapPin, Gift, CheckCircle, AlertCircle } from 'lucide-react';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/contexts/AuthContext';
import Navigation from '@/components/Navigation';
import { toast } from '@/hooks/use-toast';

const EventCard = ({ event, onRegister, onUnregister }: { 
  event: any; 
  onRegister: (id: string) => void;
  onUnregister: (id: string) => void;
}) => {
  const { user } = useAuth();
  const isUpcoming = new Date(event.start_date) > new Date();
  const isOngoing = new Date(event.start_date) <= new Date() && 
    (!event.end_date || new Date(event.end_date) >= new Date());
  const isPast = event.end_date && new Date(event.end_date) < new Date();

  const getStatusBadge = () => {
    if (isPast) return <Badge variant="outline">Past</Badge>;
    if (isOngoing) return <Badge variant="default">Ongoing</Badge>;
    if (isUpcoming) return <Badge variant="secondary">Upcoming</Badge>;
    return null;
  };

  const canRegister = isUpcoming && !event.user_registered && 
    (!event.max_participants || event.current_participants < event.max_participants);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="capitalize">
            {event.event_type.replace('-', ' ')}
          </Badge>
          {getStatusBadge()}
        </div>
        <CardTitle className="flex items-center gap-2">
          {event.title}
          {event.user_registered && (
            <CheckCircle className="h-5 w-5 text-green-500" />
          )}
        </CardTitle>
        <CardDescription>
          {event.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between">
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4" />
            <span>
              {new Date(event.start_date).toLocaleDateString()} at{' '}
              {new Date(event.start_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          
          {event.end_date && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              <span>
                Ends {new Date(event.end_date).toLocaleDateString()} at{' '}
                {new Date(event.end_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}

          {event.location && (
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Users className="h-4 w-4" />
            <span>
              {event.current_participants}
              {event.max_participants && ` / ${event.max_participants}`} participants
            </span>
          </div>

          {event.rewards && event.rewards.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Gift className="h-4 w-4" />
                Rewards:
              </div>
              <div className="flex flex-wrap gap-1">
                {event.rewards.map((reward: string, index: number) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {reward}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={event.profiles?.avatar_url} />
              <AvatarFallback className="text-xs">
                S
              </AvatarFallback>
            </Avatar>
          <span className="text-sm text-muted-foreground">
            Staff
          </span>
          </div>
        </div>

        {user && !isPast && (
          <div className="pt-4 border-t">
            {event.user_registered ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => onUnregister(event.id)}
              >
                Unregister
              </Button>
            ) : canRegister ? (
              <Button 
                size="sm" 
                className="w-full"
                onClick={() => onRegister(event.id)}
              >
                Register
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                disabled 
                className="w-full"
              >
                {event.max_participants && event.current_participants >= event.max_participants 
                  ? 'Event Full' 
                  : 'Registration Closed'
                }
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default function Events() {
  const { events, loading, registerForEvent, unregisterFromEvent, getUpcomingEvents, getOngoingEvents } = useEvents();
  const { user } = useAuth();

  const handleRegister = async (eventId: string) => {
    const result = await registerForEvent(eventId);
    if (result.error) {
      toast({
        title: "Registration Failed",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Registration Successful",
        description: "You've been registered for the event!",
      });
    }
  };

  const handleUnregister = async (eventId: string) => {
    const result = await unregisterFromEvent(eventId);
    if (result.error) {
      toast({
        title: "Unregistration Failed",
        description: result.error,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Unregistration Successful",
        description: "You've been unregistered from the event.",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
        <Navigation />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center">Loading events...</div>
        </div>
      </div>
    );
  }

  const upcomingEvents = getUpcomingEvents();
  const ongoingEvents = getOngoingEvents();
  const pastEvents = events.filter(event => 
    event.end_date && new Date(event.end_date) < new Date()
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-background/80">
      <Navigation />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">
            <Calendar className="inline-block mr-2 h-8 w-8" />
            Server Events
          </h1>
          <p className="text-xl text-muted-foreground">
            Join exciting events and competitions on the server
          </p>
          {!user && (
            <div className="flex items-center justify-center gap-2 mt-4 p-3 bg-muted rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Log in to register for events</span>
            </div>
          )}
        </div>

        {/* Ongoing Events */}
        {ongoingEvents.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 text-primary">Happening Now</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {ongoingEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onRegister={handleRegister}
                  onUnregister={handleUnregister}
                />
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onRegister={handleRegister}
                  onUnregister={handleUnregister}
                />
              ))}
            </div>
          </section>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-6">Past Events</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pastEvents.slice(0, 6).map((event) => (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  onRegister={handleRegister}
                  onUnregister={handleUnregister}
                />
              ))}
            </div>
          </section>
        )}

        {events.length === 0 && (
          <div className="text-center text-muted-foreground py-12">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No events scheduled yet. Check back soon for exciting competitions and activities!</p>
          </div>
        )}
      </main>
    </div>
  );
}