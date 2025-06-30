import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Calendar, 
  Ticket, 
  Users, 
  CheckCircle,
  Plus,
  Trash2,
  MapPin,
  Clock,
  Star,
  Music,
  Camera,
  Utensils,
  Car,
  Building2
} from 'lucide-react';
import { toast } from 'sonner';

import { NewIntake } from '@/types/newIntake';

interface Step6EventsProps {
  disabled?: boolean;
}

const EVENT_TYPES = [
  { value: 'museum', label: 'Museum Visit', icon: Building2, description: 'Cultural exhibitions and galleries' },
  { value: 'concert', label: 'Concert/Show', icon: Music, description: 'Live performances and entertainment' },
  { value: 'tour', label: 'Guided Tour', icon: Camera, description: 'Sightseeing and city tours' },
  { value: 'dining', label: 'Fine Dining', icon: Utensils, description: 'Restaurant reservations and experiences' },
  { value: 'adventure', label: 'Adventure Activity', icon: Car, description: 'Outdoor activities and excursions' },
  { value: 'workshop', label: 'Workshop/Class', icon: Star, description: 'Educational and hands-on experiences' },
];

const SEATING_PREFERENCES = [
  { value: 'best-available', label: 'Best Available', description: 'Optimal seating based on availability' },
  { value: 'front-row', label: 'Front Row', description: 'Premium front seating' },
  { value: 'center', label: 'Center Section', description: 'Central seating area' },
  { value: 'aisle', label: 'Aisle Seats', description: 'Easy access seating' },
  { value: 'wheelchair', label: 'Wheelchair Accessible', description: 'Accessible seating options' },
];

export function Step6Events({ disabled }: Step6EventsProps) {
  const form = useFormContext<NewIntake>();
  const [eventsEnabled, setEventsEnabled] = useState(false);

  // Watch form values
  const events = form.watch('events.events') || [];
  const tripGroups = form.watch('tripDetails.groups') || [];
  const primaryDestination = form.watch('tripDetails.primaryDestination');
  const startDate = form.watch('tripDetails.startDate');
  const endDate = form.watch('tripDetails.endDate');

  // Initialize events enabled state
  useEffect(() => {
    const enabled = form.watch('events.enabled');
    setEventsEnabled(enabled);
  }, [form.watch('events.enabled')]);

  // Handle events toggle
  const handleToggleEvents = (enabled: boolean) => {
    setEventsEnabled(enabled);
    form.setValue('events.enabled', enabled);
    
    if (!enabled) {
      form.setValue('events.events', []);
    }
  };

  // Add new event
  const handleAddEvent = () => {
    const newEvent = {
      id: `event_${Date.now()}`,
      name: '',
      type: 'museum',
      location: primaryDestination || '',
      date: startDate || '',
      time: '14:00',
      duration: 2,
      participants: tripGroups.reduce((total, group) => total + group.adults + group.children, 0),
      seatingPreference: 'best-available',
      addOns: [],
      specialRequests: '',
      groupAssignments: tripGroups.map(g => g.id), // Assign to all groups by default
    };

    const updatedEvents = [...events, newEvent];
    form.setValue('events.events', updatedEvents);
    toast.success('Event added');
  };

  // Update event
  const updateEvent = (eventId: string, updates: any) => {
    const updatedEvents = events.map(event => 
      event.id === eventId ? { ...event, ...updates } : event
    );
    form.setValue('events.events', updatedEvents);
  };

  // Remove event
  const handleRemoveEvent = (eventId: string) => {
    const updatedEvents = events.filter(event => event.id !== eventId);
    form.setValue('events.events', updatedEvents);
    toast.success('Event removed');
  };

  // Check completion status
  const isComplete = eventsEnabled ? events.every(event => 
    event.name && event.location && event.date
  ) : true;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mx-auto space-y-8"
    >
      <Card className="bg-gradient-to-br from-[var(--card)] via-[var(--card)]/95 to-[var(--background)]/30 border border-[var(--border)] rounded-3xl shadow-lg overflow-hidden backdrop-blur-sm">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-[var(--card-foreground)]">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/30 shadow-sm">
                <Ticket className="h-6 w-6 text-[var(--primary)]" />
      </div>
      <div>
                <div className="text-xl font-bold">Events & Activities</div>
                <div className="text-sm font-normal text-[var(--muted-foreground)] mt-1">
                  Add events, tours, and activities to your itinerary
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={eventsEnabled}
                onCheckedChange={handleToggleEvents}
                disabled={disabled}
              />
              <Label className="text-sm font-medium">
                {eventsEnabled ? 'Include Events' : 'Exclude Events'}
              </Label>
            </div>
          </CardTitle>
        </CardHeader>

        {eventsEnabled && (
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-[var(--foreground)]">
                Events & Activities
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddEvent}
                disabled={disabled}
                className="h-8 px-3 rounded-xl"
              >
                <Plus className="h-3 w-3 mr-1" />
                Add Event
              </Button>
      </div>
      
            {events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event, index) => {
                  const eventType = EVENT_TYPES.find(t => t.value === event.type);
                  const Icon = eventType?.icon || Calendar;

                return (
                  <div
                    key={event.id}
                      className="border border-[var(--border)] rounded-2xl p-6 space-y-4 bg-gradient-to-br from-[var(--background)]/50 to-[var(--background)]/20 backdrop-blur-sm"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-[var(--primary)]" />
                          <span className="font-semibold text-[var(--foreground)]">
                            {event.name || `Event ${index + 1}`}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {eventType?.label || 'Event'}
                          </Badge>
                    </div>
                      <Button
                        type="button"
                          variant="ghost"
                        size="sm"
                          onClick={() => handleRemoveEvent(event.id)}
                          disabled={disabled}
                          className="h-8 w-8 p-0 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors"
                          title="Remove event"
                      >
                          <Trash2 className="h-4 w-4" />
                      </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-[var(--foreground)]">Event Name</Label>
                          <Input
                            value={event.name}
                            onChange={(e) => updateEvent(event.id, { name: e.target.value })}
                            placeholder="e.g., Louvre Museum Tour"
                            disabled={disabled}
                            className="h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-[var(--foreground)]">Event Type</Label>
                          <Select
                            value={event.type}
                            onValueChange={(value) => updateEvent(event.id, { type: value })}
                            disabled={disabled}
                          >
                            <SelectTrigger className="h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {EVENT_TYPES.map((type) => (
                                <SelectItem key={type.value} value={type.value}>
                                  <div className="flex items-center gap-2">
                                    <type.icon className="w-4 h-4" />
                                    <div>
                                      <div className="font-medium">{type.label}</div>
                                      <div className="text-xs text-[var(--muted-foreground)]">{type.description}</div>
                    </div>
                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
            </div>
              </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-[var(--primary)]" />
                            Location
                          </Label>
                          <Input
                            value={event.location}
                            onChange={(e) => updateEvent(event.id, { location: e.target.value })}
                            placeholder="e.g., Louvre Museum, Paris"
                            disabled={disabled}
                            className="h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                          />
              </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                            <Users className="h-4 w-4 text-[var(--primary)]" />
                            Participants
                          </Label>
                          <Input
                            type="number"
                            min="1"
                            value={event.participants}
                            onChange={(e) => updateEvent(event.id, { participants: parseInt(e.target.value) || 1 })}
                            disabled={disabled}
                            className="h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                          />
                            </div>
                          </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-[var(--foreground)]">Event Date</Label>
                          <Input
                            type="date"
                            value={event.date}
                            onChange={(e) => updateEvent(event.id, { date: e.target.value })}
                            disabled={disabled}
                            className="h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                            <Clock className="h-4 w-4 text-[var(--primary)]" />
                            Start Time
                          </Label>
                          <Input
                            type="time"
                            value={event.time}
                            onChange={(e) => updateEvent(event.id, { time: e.target.value })}
                            disabled={disabled}
                            className="h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                          />
                          </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-[var(--foreground)]">Duration (hours)</Label>
                          <Input
                            type="number"
                            min="0.5"
                            step="0.5"
                            value={event.duration}
                            onChange={(e) => updateEvent(event.id, { duration: parseFloat(e.target.value) || 1 })}
                            disabled={disabled}
                            className="h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-[var(--foreground)]">Seating Preference</Label>
                        <Select
                          value={event.seatingPreference}
                          onValueChange={(value) => updateEvent(event.id, { seatingPreference: value })}
                          disabled={disabled}
                        >
                          <SelectTrigger className="h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {SEATING_PREFERENCES.map((pref) => (
                              <SelectItem key={pref.value} value={pref.value}>
                                <div>
                                  <div className="font-medium">{pref.label}</div>
                                  <div className="text-xs text-[var(--muted-foreground)]">{pref.description}</div>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-sm font-medium text-[var(--foreground)]">
                          Special Requests
                        </Label>
                        <Textarea
                          value={event.specialRequests}
                          onChange={(e) => updateEvent(event.id, { specialRequests: e.target.value })}
                          placeholder="Any special requirements, accessibility needs, or preferences..."
                          disabled={disabled}
                          className="min-h-[80px] rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20 resize-none"
                        />
                      </div>
                        </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-[var(--border)] rounded-2xl bg-[var(--muted)]/10">
                <Ticket className="h-12 w-12 text-[var(--muted-foreground)] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">No events added yet</h3>
                <p className="text-sm text-[var(--muted-foreground)] mb-4">
                  Add events, tours, and activities to enhance your travel experience
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddEvent}
                  disabled={disabled}
                  className="rounded-xl"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Event
                </Button>
              </div>
            )}
          </CardContent>
        )}
      </Card>

      {/* Status Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex justify-between items-center pt-6"
      >
        <div className="text-sm text-[var(--muted-foreground)]">
          {eventsEnabled 
            ? (isComplete ? 'Events configured - ready to proceed' : 'Please configure all events with required information')
            : 'Events excluded from this trip'
          }
      </div>
        
        <div className="flex items-center gap-2">
          {isComplete && (
            <Badge variant="outline" className="bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20">
              <CheckCircle className="h-3 w-3 mr-1" />
              Complete
            </Badge>
          )}
    </div>
      </motion.div>
    </motion.div>
  );
} 