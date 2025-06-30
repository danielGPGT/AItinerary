import React from 'react';
import { useFormContext } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Users, 
  MapPin, 
  Calendar, 
  Plane, 
  Building2, 
  Car, 
  Ticket,
  CheckCircle,
  AlertCircle,
  DollarSign,
  Star,
  Clock,
  Package,
  Heart
} from 'lucide-react';

import { NewIntake } from '@/types/newIntake';

interface Step7SummaryProps {
  disabled?: boolean;
  onGenerateItinerary?: () => void;
  onExportPDF?: () => void;
}

export function Step7Summary({ disabled, onGenerateItinerary, onExportPDF }: Step7SummaryProps) {
  const form = useFormContext<NewIntake>();
  const formData = form.getValues();

  // Helper function to format currency
  const formatCurrency = (amount: number | undefined, currency: string = 'GBP') => {
    if (!amount) return 'Not specified';
    const symbols: { [key: string]: string } = { GBP: '£', USD: '$', EUR: '€' };
    return `${symbols[currency] || currency}${amount.toLocaleString()}`;
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Calculate completion status
  const hasClient = formData.client?.firstName && formData.client?.lastName;
  const hasTripDetails = formData.tripDetails?.primaryDestination && formData.tripDetails?.startDate;
  const hasPreferences = formData.preferences?.tone;
  const hasFlights = !formData.flights?.enabled || formData.flights?.groups?.length > 0;
  const hasHotels = !formData.hotels?.enabled || formData.hotels?.groups?.length > 0;
  const hasTransfers = !formData.transfers?.enabled || formData.transfers?.groups?.length > 0;
  const hasEvents = !formData.events?.enabled || formData.events?.events?.length > 0;

  const isComplete = hasClient && hasTripDetails && hasPreferences && hasFlights && hasHotels && hasTransfers && hasEvents;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mx-auto space-y-8"
    >
      {/* Summary Header */}
      <Card className="bg-gradient-to-br from-[var(--card)] via-[var(--card)]/95 to-[var(--background)]/30 border border-[var(--border)] rounded-3xl shadow-lg overflow-hidden backdrop-blur-sm">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-4 text-[var(--card-foreground)]">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/30 shadow-sm">
              <FileText className="h-6 w-6 text-[var(--primary)]" />
            </div>
            <div>
              <div className="text-xl font-bold">Quote Summary</div>
              <div className="text-sm font-normal text-[var(--muted-foreground)] mt-1">
                Review all details before generating your travel quote
              </div>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Client Information */}
          {hasClient && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-[var(--primary)]" />
                <h3 className="text-lg font-semibold text-[var(--foreground)]">Client Information</h3>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[var(--muted)]/10 rounded-xl">
                <div>
                  <span className="text-sm text-[var(--muted-foreground)]">Name:</span>
                  <span className="ml-2 font-medium text-[var(--foreground)]">
                    {formData.client?.firstName} {formData.client?.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-[var(--muted-foreground)]">Email:</span>
                  <span className="ml-2 font-medium text-[var(--foreground)]">
                    {formData.client?.email || 'Not provided'}
                  </span>
                </div>
                {formData.client?.phone && (
                  <div>
                    <span className="text-sm text-[var(--muted-foreground)]">Phone:</span>
                    <span className="ml-2 font-medium text-[var(--foreground)]">
                      {formData.client.phone}
                    </span>
                  </div>
                )}
                {formData.client?.company && (
                  <div>
                    <span className="text-sm text-[var(--muted-foreground)]">Company:</span>
                    <span className="ml-2 font-medium text-[var(--foreground)]">
                      {formData.client.company}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Trip Details */}
          {hasTripDetails && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-[var(--primary)]" />
                <h3 className="text-lg font-semibold text-[var(--foreground)]">Trip Details</h3>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[var(--muted)]/10 rounded-xl">
                <div>
                  <span className="text-sm text-[var(--muted-foreground)]">Destination:</span>
                  <span className="ml-2 font-medium text-[var(--foreground)]">
                    {formData.tripDetails?.primaryDestination}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-[var(--muted-foreground)]">Purpose:</span>
                  <Badge variant="outline" className="ml-2 capitalize">
                    {formData.tripDetails?.purpose || 'Not specified'}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-[var(--muted-foreground)]">Dates:</span>
                  <span className="ml-2 font-medium text-[var(--foreground)]">
                    {formatDate(formData.tripDetails?.startDate || '')} - {formatDate(formData.tripDetails?.endDate || '')}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-[var(--muted-foreground)]">Duration:</span>
                  <span className="ml-2 font-medium text-[var(--foreground)]">
                    {formData.tripDetails?.duration || 0} days
                  </span>
                </div>
                <div>
                  <span className="text-sm text-[var(--muted-foreground)]">Travelers:</span>
                  <span className="ml-2 font-medium text-[var(--foreground)]">
                    {formData.tripDetails?.totalTravelers?.adults || 0} adults, {formData.tripDetails?.totalTravelers?.children || 0} children
                  </span>
                </div>
                {formData.tripDetails?.groups && formData.tripDetails.groups.length > 0 && (
                  <div>
                    <span className="text-sm text-[var(--muted-foreground)]">Groups:</span>
                    <span className="ml-2 font-medium text-[var(--foreground)]">
                      {formData.tripDetails.groups.length} travel groups
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Preferences */}
          {hasPreferences && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Heart className="h-5 w-5 text-[var(--primary)]" />
                <h3 className="text-lg font-semibold text-[var(--foreground)]">Preferences</h3>
                <CheckCircle className="h-5 w-5 text-green-500" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-[var(--muted)]/10 rounded-xl">
                <div>
                  <span className="text-sm text-[var(--muted-foreground)]">Tone:</span>
                  <Badge variant="outline" className="ml-2 capitalize">
                    {formData.preferences?.tone}
                  </Badge>
                </div>
                <div>
                  <span className="text-sm text-[var(--muted-foreground)]">Currency:</span>
                  <span className="ml-2 font-medium text-[var(--foreground)]">
                    {formData.preferences?.currency}
                  </span>
                </div>
                {formData.preferences?.budget?.amount && (
                  <div>
                    <span className="text-sm text-[var(--muted-foreground)]">Budget:</span>
                    <span className="ml-2 font-medium text-[var(--foreground)]">
                      {formatCurrency(formData.preferences.budget.amount, formData.preferences.currency)}
                      <span className="text-sm text-[var(--muted-foreground)] ml-1">
                        ({formData.preferences.budget.type})
                      </span>
                    </span>
                  </div>
                )}
                {formData.preferences?.travelPriorities && formData.preferences.travelPriorities.length > 0 && (
                  <div>
                    <span className="text-sm text-[var(--muted-foreground)]">Priorities:</span>
                    <div className="ml-2 mt-1">
                      {formData.preferences.travelPriorities.map((priority) => (
                        <Badge key={priority} variant="secondary" className="text-xs capitalize mr-1">
                          {priority}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator className="bg-[var(--border)]" />

          {/* Services Summary */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">Included Services</h3>
            
            {/* Flights */}
            <div className="flex items-center gap-3 p-3 bg-[var(--muted)]/10 rounded-xl">
              <Plane className="h-5 w-5 text-[var(--primary)]" />
              <span className="font-medium text-[var(--foreground)]">Flights</span>
              {formData.flights?.enabled ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {formData.flights.groups?.length || 0} group{formData.flights.groups?.length !== 1 ? 's' : ''} configured
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <span className="text-sm text-[var(--muted-foreground)]">Excluded</span>
                </>
              )}
            </div>

            {/* Hotels */}
            <div className="flex items-center gap-3 p-3 bg-[var(--muted)]/10 rounded-xl">
              <Building2 className="h-5 w-5 text-[var(--primary)]" />
              <span className="font-medium text-[var(--foreground)]">Hotels</span>
              {formData.hotels?.enabled ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {formData.hotels.groups?.length || 0} group{formData.hotels.groups?.length !== 1 ? 's' : ''} configured
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <span className="text-sm text-[var(--muted-foreground)]">Excluded</span>
                </>
              )}
            </div>

            {/* Transfers */}
            <div className="flex items-center gap-3 p-3 bg-[var(--muted)]/10 rounded-xl">
              <Car className="h-5 w-5 text-[var(--primary)]" />
              <span className="font-medium text-[var(--foreground)]">Transfers</span>
              {formData.transfers?.enabled ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {formData.transfers.groups?.length || 0} group{formData.transfers.groups?.length !== 1 ? 's' : ''} configured
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <span className="text-sm text-[var(--muted-foreground)]">Excluded</span>
                </>
              )}
            </div>

            {/* Events */}
            <div className="flex items-center gap-3 p-3 bg-[var(--muted)]/10 rounded-xl">
              <Ticket className="h-5 w-5 text-[var(--primary)]" />
              <span className="font-medium text-[var(--foreground)]">Events</span>
              {formData.events?.enabled ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="text-sm text-[var(--muted-foreground)]">
                    {formData.events.events?.length || 0} event{formData.events.events?.length !== 1 ? 's' : ''} configured
                  </span>
                </>
              ) : (
                <>
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  <span className="text-sm text-[var(--muted-foreground)]">Excluded</span>
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onExportPDF}
              disabled={disabled || !isComplete}
              className="h-12 px-6 rounded-xl border-[var(--border)] hover:bg-[var(--accent)] hover:border-[var(--primary)]/30"
            >
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
            <Button
              type="button"
              onClick={onGenerateItinerary}
              disabled={disabled || !isComplete}
              className="h-12 px-6 rounded-xl bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--primary-foreground)]"
            >
              <Star className="h-4 w-4 mr-2" />
              Generate AI Itinerary
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex justify-between items-center pt-6"
      >
        <div className="text-sm text-[var(--muted-foreground)]">
          {isComplete 
            ? 'All information complete - ready to generate quote and itinerary'
            : 'Please complete all required sections before proceeding'
          }
        </div>
        
        <div className="flex items-center gap-2">
          {isComplete && (
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
              <CheckCircle className="h-3 w-3 mr-1" />
              Complete
            </Badge>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
} 