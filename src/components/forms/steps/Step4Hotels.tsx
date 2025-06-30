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
import { 
  Building2, 
  Bed, 
  Star, 
  Users, 
  CheckCircle,
  AlertCircle,
  Plus,
  Minus
} from 'lucide-react';
import { toast } from 'sonner';

import { NewIntake } from '@/types/newIntake';
import { useNewIntakeStore } from '@/store/newIntake';

interface Step4HotelsProps {
  disabled?: boolean;
}

export function Step4Hotels({ disabled }: Step4HotelsProps) {
  const form = useFormContext<NewIntake>();
  const [hotelsEnabled, setHotelsEnabled] = useState(false);

  // Watch form values
  const hotelGroups = form.watch('hotels.groups') || [];
  const tripGroups = form.watch('tripDetails.groups') || [];
  const primaryDestination = form.watch('tripDetails.primaryDestination');

  // Initialize hotels enabled state
  useEffect(() => {
    const enabled = form.watch('hotels.enabled');
    setHotelsEnabled(enabled);
  }, [form.watch('hotels.enabled')]);

  // Handle hotels toggle
  const handleToggleHotels = (enabled: boolean) => {
    setHotelsEnabled(enabled);
    form.setValue('hotels.enabled', enabled);
    
    if (enabled && hotelGroups.length === 0) {
      // Auto-create hotel groups based on trip groups
      const newHotelGroups = tripGroups.map(group => ({
        id: `hotel_${group.id}`,
        groupId: group.id,
        destination: primaryDestination || '',
        roomCount: Math.ceil((group.adults + group.children) / 2),
        roomType: 'standard',
        starLevel: 4,
        amenities: ['wifi', 'breakfast'],
        specialRequests: '',
      }));
      
      form.setValue('hotels.groups', newHotelGroups);
      toast.success('Hotel groups created based on travel groups');
    } else if (!enabled) {
      form.setValue('hotels.groups', []);
    }
  };

  // Check completion status
  const isComplete = hotelsEnabled ? hotelGroups.every(group => 
    group.destination && group.roomCount > 0
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
                <Building2 className="h-6 w-6 text-[var(--primary)]" />
              </div>
              <div>
                <div className="text-xl font-bold">Hotel Accommodations</div>
                <div className="text-sm font-normal text-[var(--muted-foreground)] mt-1">
                  Configure hotel preferences for each travel group
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                checked={hotelsEnabled}
                onCheckedChange={handleToggleHotels}
                disabled={disabled}
              />
              <Label className="text-sm font-medium">
                {hotelsEnabled ? 'Include Hotels' : 'Exclude Hotels'}
              </Label>
            </div>
          </CardTitle>
        </CardHeader>

        {hotelsEnabled && (
          <CardContent className="space-y-6">
            {hotelGroups.length > 0 ? (
              <div className="space-y-4">
                {hotelGroups.map((hotelGroup, index) => {
                  const tripGroup = tripGroups.find(g => g.id === hotelGroup.groupId);
                  const groupName = tripGroup?.name || `Group ${index + 1}`;

                  return (
                    <div
                      key={hotelGroup.id}
                      className="border border-[var(--border)] rounded-2xl p-6 space-y-4 bg-gradient-to-br from-[var(--background)]/50 to-[var(--background)]/20 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3">
                        <Users className="h-5 w-5 text-[var(--primary)]" />
                        <span className="font-semibold text-[var(--foreground)]">{groupName}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-[var(--foreground)]">Destination</Label>
                          <Input
                            value={hotelGroup.destination}
                            onChange={(e) => {
                              const updatedGroups = hotelGroups.map(g => 
                                g.id === hotelGroup.id ? { ...g, destination: e.target.value } : g
                              );
                              form.setValue('hotels.groups', updatedGroups);
                            }}
                            placeholder="e.g., Paris, France"
                            disabled={disabled}
                            className="h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-[var(--foreground)]">Room Count</Label>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const updatedGroups = hotelGroups.map(g => 
                                  g.id === hotelGroup.id ? { ...g, roomCount: Math.max(1, g.roomCount - 1) } : g
                                );
                                form.setValue('hotels.groups', updatedGroups);
                              }}
                              disabled={disabled || hotelGroup.roomCount <= 1}
                              className="h-10 w-10 rounded-xl"
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <Input
                              type="number"
                              min="1"
                              value={hotelGroup.roomCount}
                              onChange={(e) => {
                                const updatedGroups = hotelGroups.map(g => 
                                  g.id === hotelGroup.id ? { ...g, roomCount: parseInt(e.target.value) || 1 } : g
                                );
                                form.setValue('hotels.groups', updatedGroups);
                              }}
                              disabled={disabled}
                              className="h-10 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20 text-center"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const updatedGroups = hotelGroups.map(g => 
                                  g.id === hotelGroup.id ? { ...g, roomCount: g.roomCount + 1 } : g
                                );
                                form.setValue('hotels.groups', updatedGroups);
                              }}
                              disabled={disabled}
                              className="h-10 w-10 rounded-xl"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-[var(--foreground)]">Room Type</Label>
                          <Select
                            value={hotelGroup.roomType}
                            onValueChange={(value) => {
                              const updatedGroups = hotelGroups.map(g => 
                                g.id === hotelGroup.id ? { ...g, roomType: value } : g
                              );
                              form.setValue('hotels.groups', updatedGroups);
                            }}
                            disabled={disabled}
                          >
                            <SelectTrigger className="h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="standard">Standard Room</SelectItem>
                              <SelectItem value="deluxe">Deluxe Room</SelectItem>
                              <SelectItem value="suite">Suite</SelectItem>
                              <SelectItem value="family">Family Room</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-[var(--foreground)]">Star Level</Label>
                          <Select
                            value={hotelGroup.starLevel.toString()}
                            onValueChange={(value) => {
                              const updatedGroups = hotelGroups.map(g => 
                                g.id === hotelGroup.id ? { ...g, starLevel: parseInt(value) } : g
                              );
                              form.setValue('hotels.groups', updatedGroups);
                            }}
                            disabled={disabled}
                          >
                            <SelectTrigger className="h-11 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="3">3 Stars - Comfortable & Clean</SelectItem>
                              <SelectItem value="4">4 Stars - Premium Quality</SelectItem>
                              <SelectItem value="5">5 Stars - Luxury & Excellence</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-[var(--border)] rounded-2xl bg-[var(--muted)]/10">
                <Building2 className="h-12 w-12 text-[var(--muted-foreground)] mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">No hotel groups configured</h3>
                <p className="text-sm text-[var(--muted-foreground)] mb-4">
                  Hotel groups will be automatically created based on your travel groups
                </p>
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
          {hotelsEnabled 
            ? (isComplete ? 'Hotel preferences complete - ready to proceed' : 'Please configure hotel preferences for all groups')
            : 'Hotels excluded from this trip'
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