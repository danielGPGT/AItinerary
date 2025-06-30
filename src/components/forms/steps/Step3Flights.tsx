import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { format, addDays, isAfter, isBefore } from 'date-fns';
import { 
  Plane, 
  MapPin, 
  Calendar, 
  Users, 
  Star,
  Plus,
  Minus,
  Trash2,
  Copy,
  Edit,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  Building2,
  Globe,
  Settings,
  Filter,
  Search,
  X,
  DollarSign,
  Clock3,
  Zap,
  Heart,
  Eye,
  BookOpen,
  TrendingUp,
  Shield,
  Wifi,
  Coffee,
  Utensils,
  Briefcase,
  Baby,
  Luggage,
  Award,
  Route,
  Navigation,
  Compass,
  Timer,
  CalendarDays,
  PlaneTakeoff,
  PlaneLanding,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { NewIntake, CabinClass } from '@/types/newIntake';
import { 
  mockLowFareResult, 
  getAirlineById, 
  getLocationById,
  getFlightsByDirection,
  getRecommendationsByPriceRange,
  MockFlight,
  MockRecommendation,
  MockAirline,
  MockLocation
} from '@/lib/mockData/mockFlightData';

interface Step3FlightsProps {
  disabled?: boolean;
}

// Cabin class options with enhanced details
const cabinClassOptions = [
  { 
    value: 'economy', 
    label: 'Economy', 
    description: 'Standard seating with essential amenities',
    icon: Plane,
    features: ['Standard seat', 'Meal service', 'Entertainment'],
    priceMultiplier: 1
  },
  { 
    value: 'premium_economy', 
    label: 'Premium Economy', 
    description: 'Enhanced comfort with extra legroom',
    icon: Star,
    features: ['Extra legroom', 'Priority boarding', 'Enhanced meal'],
    priceMultiplier: 1.5
  },
  { 
    value: 'business', 
    label: 'Business', 
    description: 'Premium service with lie-flat seats',
    icon: Building2,
    features: ['Lie-flat seats', 'Lounge access', 'Premium dining'],
    priceMultiplier: 3
  },
  { 
    value: 'first', 
    label: 'First Class', 
    description: 'Ultimate luxury with private suites',
    icon: Award,
    features: ['Private suite', 'Concierge service', 'Fine dining'],
    priceMultiplier: 5
  },
];

// Popular airports for quick selection
const popularAirports = [
  { code: 'LHR', name: 'London Heathrow', city: 'London', country: 'UK' },
  { code: 'LGW', name: 'London Gatwick', city: 'London', country: 'UK' },
  { code: 'STN', name: 'London Stansted', city: 'London', country: 'UK' },
  { code: 'LCY', name: 'London City', city: 'London', country: 'UK' },
  { code: 'JFK', name: 'John F. Kennedy', city: 'New York', country: 'USA' },
  { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA' },
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France' },
  { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' },
  { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE' },
  { code: 'AUH', name: 'Abu Dhabi International', city: 'Abu Dhabi', country: 'UAE' },
  { code: 'SIN', name: 'Changi Airport', city: 'Singapore', country: 'Singapore' },
  { code: 'HKG', name: 'Hong Kong International', city: 'Hong Kong', country: 'China' },
  { code: 'NRT', name: 'Narita International', city: 'Tokyo', country: 'Japan' },
  { code: 'SYD', name: 'Sydney Airport', city: 'Sydney', country: 'Australia' },
];

// Flight search filters
interface FlightFilters {
  priceRange: [number, number];
  duration: [number, number];
  stops: 'any' | 'direct' | '1-stop' | '2-plus';
  airlines: string[];
  departureTime: 'any' | 'morning' | 'afternoon' | 'evening' | 'night';
  arrivalTime: 'any' | 'morning' | 'afternoon' | 'evening' | 'night';
}

export function Step3Flights({ disabled }: Step3FlightsProps) {
  const form = useFormContext<NewIntake>();
  
  // Form state
  const flightsEnabled = form.watch('flights.enabled');
  const flightGroups = form.watch('flights.groups') || [];
  const tripGroups = form.watch('tripDetails.groups') || [];
  const primaryDestination = form.watch('tripDetails.primaryDestination');

  // Local state
  const [showAirportSearch, setShowAirportSearch] = useState<string | null>(null);
  const [airportSearchQuery, setAirportSearchQuery] = useState('');
  const [showAirlineSearch, setShowAirlineSearch] = useState<string | null>(null);
  const [airlineSearchQuery, setAirlineSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('search');
  const [searchResults, setSearchResults] = useState<MockRecommendation[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Get available airlines and airports from mock data
  const availableAirlines = mockLowFareResult.Airlines;
  const availableAirports = mockLowFareResult.Locations;

  // Prevent infinite update loop: only initialize once per enable
  const initializedRef = useRef(false);
  useEffect(() => {
    if (flightsEnabled && !initializedRef.current && tripGroups.length > 0) {
      const initialFlightGroups = tripGroups.map(group => ({
        groupId: group.id,
        originAirport: '',
        destinationAirport: primaryDestination || '',
        cabinClass: 'economy' as CabinClass,
        preferredAirlines: [] as string[],
        flexibleDates: false,
        frequentFlyerInfo: '',
      }));
      form.setValue('flights.groups', initialFlightGroups);
      initializedRef.current = true;
    }
    if (!flightsEnabled) {
      initializedRef.current = false;
    }
  }, [flightsEnabled, tripGroups, primaryDestination, form]);

  // Handlers
  const handleToggleFlights = (enabled: boolean) => {
    form.setValue('flights.enabled', enabled);
    
    if (!enabled) {
      form.setValue('flights.groups', []);
    } else if (tripGroups.length > 0) {
      const initialFlightGroups = tripGroups.map(group => ({
        groupId: group.id,
        originAirport: '',
        destinationAirport: primaryDestination || '',
        cabinClass: 'economy' as CabinClass,
        preferredAirlines: [] as string[],
        flexibleDates: false,
        frequentFlyerInfo: '',
      }));
      
      form.setValue('flights.groups', initialFlightGroups);
    }
  };

  const updateFlightGroup = (groupId: string, updates: Partial<typeof flightGroups[0]>) => {
    const updatedGroups = flightGroups.map(group =>
      group.groupId === groupId ? { ...group, ...updates } : group
    );
    form.setValue('flights.groups', updatedGroups);
  };

  const addFlightGroup = () => {
    const newGroup = {
      groupId: `flight-group-${Date.now()}`,
      originAirport: '',
      destinationAirport: primaryDestination || '',
      cabinClass: 'economy' as CabinClass,
      preferredAirlines: [] as string[],
      flexibleDates: false,
      frequentFlyerInfo: '',
    };
    
    form.setValue('flights.groups', [...flightGroups, newGroup]);
  };

  const removeFlightGroup = (groupId: string) => {
    const updatedGroups = flightGroups.filter(group => group.groupId !== groupId);
    form.setValue('flights.groups', updatedGroups);
    toast.success('Flight group removed');
  };

  const duplicateFlightGroup = (groupId: string) => {
    const groupToDuplicate = flightGroups.find(group => group.groupId === groupId);
    if (groupToDuplicate) {
      const duplicatedGroup = {
        ...groupToDuplicate,
        groupId: `flight-group-${Date.now()}`,
      };
      form.setValue('flights.groups', [...flightGroups, duplicatedGroup]);
      toast.success('Flight group duplicated');
    }
  };

  const toggleAirline = (groupId: string, airlineId: string) => {
    const group = flightGroups.find(g => g.groupId === groupId);
    if (group) {
      const currentAirlines = group.preferredAirlines || [];
      const updatedAirlines = currentAirlines.includes(airlineId)
        ? currentAirlines.filter(id => id !== airlineId)
        : [...currentAirlines, airlineId];
      
      updateFlightGroup(groupId, { preferredAirlines: updatedAirlines });
    }
  };

  // Flight search functionality
  const searchFlights = useCallback(async (groupId: string) => {
    const group = flightGroups.find(g => g.groupId === groupId);
    if (!group?.originAirport || !group?.destinationAirport) {
      toast.error('Please select origin and destination airports');
      return;
    }

    setIsSearching(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Get mock search results with default price range
    const results = getRecommendationsByPriceRange(0, 5000);
    setSearchResults(results);
    setIsSearching(false);
    
    toast.success(`Found ${results.length} flights`);
  }, [flightGroups]);

  // Filter airports based on search query
  const filteredAirports = availableAirports.filter(airport =>
    airport.AirportId.toLowerCase().includes(airportSearchQuery.toLowerCase()) ||
    airport.AirportName.toLowerCase().includes(airportSearchQuery.toLowerCase())
  );

  // Filter airlines based on search query
  const filteredAirlines = availableAirlines.filter(airline =>
    airline.AirlineId.toLowerCase().includes(airlineSearchQuery.toLowerCase()) ||
    airline.AirlineName.toLowerCase().includes(airlineSearchQuery.toLowerCase())
  );

  // Check completion status
  const isComplete = flightsEnabled 
    ? flightGroups.length > 0 && flightGroups.every(group => 
        group.originAirport && group.destinationAirport && group.cabinClass
      )
    : true;

  if (disabled) {
    return (
      <div className="space-y-6">
        <div className="h-10 bg-muted animate-pulse rounded-lg" />
        <div className="h-10 bg-muted animate-pulse rounded-lg" />
        <div className="h-10 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mx-auto space-y-8 max-w-6xl"
    >
      {/* Flight Section Toggle */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="bg-gradient-to-br from-[var(--card)] via-[var(--card)]/95 to-[var(--background)]/30 border border-[var(--border)] rounded-3xl shadow-lg overflow-hidden backdrop-blur-sm">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-[var(--card-foreground)]">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/30 shadow-sm">
                  <Plane className="h-6 w-6 text-[var(--primary)]" />
                </div>
                <div>
                  <div className="text-xl font-bold">Flight Search & Preferences</div>
                  <div className="text-sm font-normal text-[var(--muted-foreground)] mt-1">
                    Search and configure flights for each travel group
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  checked={flightsEnabled}
                  onCheckedChange={handleToggleFlights}
                  disabled={disabled}
                />
                <Label className="text-sm font-medium">
                  {flightsEnabled ? 'Include Flights' : 'Exclude Flights'}
                </Label>
              </div>
            </CardTitle>
          </CardHeader>
          
          {flightsEnabled && (
            <CardContent className="space-y-6">
              {/* Flight Groups with Tabs */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                    <Users className="h-4 w-4 text-[var(--primary)]" />
                    Flight Groups ({flightGroups.length})
                  </Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addFlightGroup}
                    disabled={disabled}
                    className="h-8"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Group
                  </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-3 bg-[var(--muted)]/50">
                    <TabsTrigger value="search" className="flex items-center gap-2">
                      <Search className="h-4 w-4" />
                      Flight Search
                    </TabsTrigger>
                    <TabsTrigger value="preferences" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Preferences
                    </TabsTrigger>
                    <TabsTrigger value="summary" className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      Summary
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="search" className="space-y-6 mt-6">
                <AnimatePresence>
                  {flightGroups.map((flightGroup, index) => {
                    const tripGroup = tripGroups.find(g => g.id === flightGroup.groupId);
                    const groupName = tripGroup?.name || `Group ${index + 1}`;
                    const groupSize = (tripGroup?.adults || 0) + (tripGroup?.children || 0);

                    return (
                      <motion.div
                        key={flightGroup.groupId}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="border border-[var(--border)] rounded-2xl p-6 space-y-6 bg-gradient-to-br from-[var(--background)]/50 to-[var(--background)]/20 backdrop-blur-sm hover:shadow-md transition-all duration-200"
                      >
                        {/* Group Header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20">
                              <Users className="h-5 w-5 text-[var(--primary)]" />
                            </div>
                            <div>
                              <span className="font-semibold text-[var(--foreground)]">{groupName}</span>
                              <div className="flex items-center gap-2 mt-1">
                                <Badge variant="secondary" className="text-xs bg-[var(--accent)]/20 text-[var(--accent-foreground)]">
                                  {groupSize} travelers
                                </Badge>
                                    {tripGroup?.adults && tripGroup.adults > 0 && (
                                  <Badge variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-200">
                                        {tripGroup?.adults} adults
                                  </Badge>
                                )}
                                    {tripGroup?.children && tripGroup.children > 0 && (
                                  <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-200">
                                        {tripGroup?.children} children
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => duplicateFlightGroup(flightGroup.groupId)}
                              disabled={disabled}
                              className="h-8 w-8 p-0 rounded-lg hover:bg-[var(--accent)] transition-colors"
                              title="Duplicate group"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFlightGroup(flightGroup.groupId)}
                              disabled={disabled}
                              className="h-8 w-8 p-0 rounded-lg hover:bg-red-100 hover:text-red-700 transition-colors"
                              title="Remove group"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                            {/* Flight Search Interface */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                          {/* Origin Airport */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                                  <PlaneTakeoff className="h-4 w-4 text-[var(--primary)]" />
                                  From *
                            </Label>
                                <Popover open={showAirportSearch === `origin-${flightGroup.groupId}`} onOpenChange={(open) => setShowAirportSearch(open ? `origin-${flightGroup.groupId}` : null)}>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                        "w-full justify-start text-left font-normal h-12 rounded-xl border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/30 transition-colors duration-200",
                                    !flightGroup.originAirport && "text-[var(--muted-foreground)]"
                                  )}
                                >
                                  <MapPin className="mr-2 h-4 w-4" />
                                      {flightGroup.originAirport || "Select departure airport"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80 p-0" align="start">
                                <Command>
                                  <CommandInput 
                                    placeholder="Search airports..." 
                                    value={airportSearchQuery}
                                    onValueChange={setAirportSearchQuery}
                                  />
                                  <CommandList>
                                    <CommandEmpty>No airports found.</CommandEmpty>
                                    <CommandGroup>
                                      <div className="px-2 py-1.5 text-sm font-medium text-[var(--muted-foreground)]">
                                        Popular Airports
                                      </div>
                                      {popularAirports.map((airport) => (
                                        <CommandItem
                                          key={airport.code}
                                          value={`${airport.code} ${airport.name} ${airport.city}`}
                                          onSelect={() => {
                                            updateFlightGroup(flightGroup.groupId, { originAirport: airport.code });
                                            setShowAirportSearch(null);
                                            setAirportSearchQuery('');
                                          }}
                                          className="flex items-center gap-3"
                                        >
                                          <MapPin className="h-4 w-4 text-[var(--muted-foreground)]" />
                                          <div>
                                            <div className="font-medium">{airport.code}</div>
                                            <div className="text-xs text-[var(--muted-foreground)]">
                                              {airport.name}, {airport.city}
                                            </div>
                                          </div>
                                        </CommandItem>
                                      ))}
                                      
                                      <Separator className="my-2" />
                                      
                                      <div className="px-2 py-1.5 text-sm font-medium text-[var(--muted-foreground)]">
                                        All Airports
                                      </div>
                                      {filteredAirports.map((airport) => (
                                        <CommandItem
                                          key={airport.AirportId}
                                          value={`${airport.AirportId} ${airport.AirportName}`}
                                          onSelect={() => {
                                            updateFlightGroup(flightGroup.groupId, { originAirport: airport.AirportId });
                                            setShowAirportSearch(null);
                                            setAirportSearchQuery('');
                                          }}
                                          className="flex items-center gap-3"
                                        >
                                          <MapPin className="h-4 w-4 text-[var(--muted-foreground)]" />
                                          <div>
                                            <div className="font-medium">{airport.AirportId}</div>
                                            <div className="text-xs text-[var(--muted-foreground)]">
                                              {airport.AirportName}
                                            </div>
                                          </div>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                          </div>

                          {/* Destination Airport */}
                          <div className="space-y-2">
                            <Label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                                  <PlaneLanding className="h-4 w-4 text-[var(--primary)]" />
                                  To *
                            </Label>
                            <Input
                              value={flightGroup.destinationAirport}
                              onChange={(e) => updateFlightGroup(flightGroup.groupId, { destinationAirport: e.target.value })}
                              placeholder="e.g., AUH, DXB, JFK"
                                  className="h-12 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                              disabled={disabled}
                            />
                            <p className="text-xs text-[var(--muted-foreground)]">
                              Pre-filled from trip destination
                            </p>
                        </div>

                              {/* Search Button */}
                        <div className="space-y-2">
                                <Label className="text-sm font-medium text-[var(--foreground)] opacity-0">
                                  Search
                          </Label>
                                <Button
                                  type="button"
                                  onClick={() => searchFlights(flightGroup.groupId)}
                                  disabled={!flightGroup.originAirport || !flightGroup.destinationAirport || isSearching}
                                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 hover:from-[var(--primary)]/90 hover:to-[var(--primary)]/70 text-white font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                  {isSearching ? (
                                    <>
                                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                      Searching...
                                    </>
                                  ) : (
                                    <>
                                      <Search className="h-4 w-4 mr-2" />
                                      Search Flights
                                    </>
                                  )}
                                </Button>
                              </div>
                            </div>

                            {/* Search Results */}
                            {searchResults.length > 0 && (
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-semibold text-[var(--foreground)] flex items-center gap-2">
                                    <Route className="h-4 w-4 text-[var(--primary)]" />
                                    Available Flights ({searchResults.length})
                                  </h4>
                            <div className="flex items-center gap-2">
                                    <Button variant="outline" size="sm" className="h-8">
                                      <SortAsc className="h-3 w-3 mr-1" />
                                      Price
                                    </Button>
                                    <Button variant="outline" size="sm" className="h-8">
                                      <Clock className="h-3 w-3 mr-1" />
                                      Duration
                                    </Button>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  {searchResults.slice(0, 5).map((flight, flightIndex) => (
                                    <motion.div
                                      key={flight.RecommendationId}
                                      initial={{ opacity: 0, y: 10 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      transition={{ delay: flightIndex * 0.1 }}
                                      className="border border-[var(--border)] rounded-xl p-4 hover:border-[var(--primary)]/30 transition-all duration-200 cursor-pointer group"
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                          <div className="w-12 h-12 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20">
                                            <Plane className="h-6 w-6 text-[var(--primary)]" />
                                          </div>
                                          <div>
                                            <div className="font-semibold text-[var(--foreground)]">
                                              {flight.Routing}
                                            </div>
                                            <div className="text-sm text-[var(--muted-foreground)] flex items-center gap-4">
                                              <span>Duration: 8h 30m</span>
                                              <span>•</span>
                                              <span>1 stop</span>
                                              <span>•</span>
                                              <span>British Airways</span>
                                            </div>
                                          </div>
                                        </div>
                                        <div className="text-right">
                                          <div className="font-bold text-lg text-[var(--foreground)]">
                                            £{flight.Total.toFixed(0)}
                                          </div>
                                          <div className="text-sm text-[var(--muted-foreground)]">
                                            per person
                                          </div>
                                        </div>
                                      </div>
                                    </motion.div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </TabsContent>

                  <TabsContent value="preferences" className="space-y-6 mt-6">
                    <AnimatePresence>
                      {flightGroups.map((flightGroup, index) => {
                        const tripGroup = tripGroups.find(g => g.id === flightGroup.groupId);
                        const groupName = tripGroup?.name || `Group ${index + 1}`;

                        return (
                          <motion.div
                            key={flightGroup.groupId}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="border border-[var(--border)] rounded-2xl p-6 space-y-6 bg-gradient-to-br from-[var(--background)]/50 to-[var(--background)]/20 backdrop-blur-sm"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20">
                                <Users className="h-5 w-5 text-[var(--primary)]" />
                              </div>
                              <span className="font-semibold text-[var(--foreground)]">{groupName}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Cabin Class */}
                              <div className="space-y-3">
                            <Label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                              <Star className="h-4 w-4 text-[var(--primary)]" />
                              Cabin Class
                            </Label>
                            <Select
                              value={flightGroup.cabinClass}
                              onValueChange={(value) => updateFlightGroup(flightGroup.groupId, { cabinClass: value as CabinClass })}
                              disabled={disabled}
                            >
                                  <SelectTrigger className="h-12 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-[var(--border)] bg-[var(--background)]">
                                {cabinClassOptions.map((option) => {
                                  const Icon = option.icon;
                                  return (
                                    <SelectItem key={option.value} value={option.value} className="rounded-lg">
                                      <div className="flex items-center gap-3 py-1">
                                        <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20">
                                          <Icon className="w-4 h-4 text-[var(--primary)]" />
                                        </div>
                                        <div>
                                          <div className="font-medium text-[var(--foreground)]">{option.label}</div>
                                          <div className="text-xs text-[var(--muted-foreground)]">{option.description}</div>
                                        </div>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>

                          {/* Flexibility */}
                              <div className="space-y-3">
                            <Label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                              <Settings className="h-4 w-4 text-[var(--primary)]" />
                              Date Flexibility
                            </Label>
                            <div className="flex items-center space-x-2 p-3 bg-[var(--accent)]/10 rounded-xl">
                              <Switch
                                checked={flightGroup.flexibleDates}
                                onCheckedChange={(checked) => updateFlightGroup(flightGroup.groupId, { flexibleDates: checked })}
                                disabled={disabled}
                              />
                              <Label className="text-sm">
                                {flightGroup.flexibleDates ? 'Flexible dates (±3 days)' : 'Fixed dates'}
                              </Label>
                            </div>
                          </div>
                        </div>

                        {/* Preferred Airlines */}
                            <div className="space-y-3">
                          <Label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                            <Plane className="h-4 w-4 text-[var(--primary)]" />
                            Preferred Airlines
                          </Label>
                          <Popover open={showAirlineSearch === flightGroup.groupId} onOpenChange={(open) => setShowAirlineSearch(open ? flightGroup.groupId : null)}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                    className="w-full justify-start text-left font-normal h-12 rounded-xl border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/30 transition-colors duration-200"
                              >
                                <Search className="mr-2 h-4 w-4" />
                                {flightGroup.preferredAirlines.length > 0 
                                  ? `${flightGroup.preferredAirlines.length} airline(s) selected`
                                  : "Select preferred airlines (optional)"
                                }
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80 p-0" align="start">
                              <Command>
                                <CommandInput 
                                  placeholder="Search airlines..." 
                                  value={airlineSearchQuery}
                                  onValueChange={setAirlineSearchQuery}
                                />
                                <CommandList>
                                  <CommandEmpty>No airlines found.</CommandEmpty>
                                  <CommandGroup>
                                    {filteredAirlines.map((airline) => (
                                      <CommandItem
                                        key={airline.AirlineId}
                                        value={`${airline.AirlineId} ${airline.AirlineName}`}
                                        onSelect={() => toggleAirline(flightGroup.groupId, airline.AirlineId)}
                                        className="flex items-center gap-3"
                                      >
                                        <Checkbox
                                          checked={flightGroup.preferredAirlines.includes(airline.AirlineId)}
                                          className="mr-2"
                                        />
                                        <div>
                                          <div className="font-medium">{airline.AirlineName}</div>
                                          <div className="text-xs text-[var(--muted-foreground)]">
                                            {airline.AirlineId} • {airline.SkytraxRating}/5 rating
                                          </div>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          
                          {/* Selected Airlines */}
                          {flightGroup.preferredAirlines.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {flightGroup.preferredAirlines.map((airlineId) => {
                                const airline = getAirlineById(airlineId);
                                return airline ? (
                                  <Badge
                                    key={airlineId}
                                    variant="secondary"
                                    className="flex items-center gap-1 bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20"
                                  >
                                    {airline.AirlineName}
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleAirline(flightGroup.groupId, airlineId)}
                                      disabled={disabled}
                                      className="h-3 w-3 p-0 hover:bg-transparent"
                                    >
                                      <X className="h-3 w-3" />
                                    </Button>
                                  </Badge>
                                ) : null;
                              })}
                            </div>
                          )}
                        </div>

                        {/* Frequent Flyer Info */}
                            <div className="space-y-3">
                          <Label className="text-sm font-medium text-[var(--foreground)] flex items-center gap-2">
                                <Award className="h-4 w-4 text-[var(--primary)]" />
                            Frequent Flyer Information (Optional)
                          </Label>
                          <Input
                            value={flightGroup.frequentFlyerInfo}
                            onChange={(e) => updateFlightGroup(flightGroup.groupId, { frequentFlyerInfo: e.target.value })}
                            placeholder="e.g., BA Executive Club, EY Guest"
                                className="h-12 rounded-xl border-[var(--border)] bg-[var(--background)] focus:border-[var(--primary)] focus:ring-[var(--primary)]/20"
                            disabled={disabled}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                  </TabsContent>

                  <TabsContent value="summary" className="space-y-6 mt-6">
                    <div className="space-y-4">
                      {flightGroups.map((flightGroup, index) => {
                        const tripGroup = tripGroups.find(g => g.id === flightGroup.groupId);
                        const groupName = tripGroup?.name || `Group ${index + 1}`;
                        const cabinClass = cabinClassOptions.find(c => c.value === flightGroup.cabinClass);

                        return (
                          <div key={flightGroup.groupId} className="border border-[var(--border)] rounded-xl p-4 bg-[var(--background)]/50">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 flex items-center justify-center border border-[var(--primary)]/20">
                                  <Users className="h-4 w-4 text-[var(--primary)]" />
                                </div>
                                <span className="font-medium text-[var(--foreground)]">{groupName}</span>
                              </div>
                              <Badge variant="outline" className="bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20">
                                {cabinClass?.label || 'Economy'}
                              </Badge>
                            </div>
                            <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-[var(--muted-foreground)]">Route:</span>
                                <span className="ml-2 font-medium text-[var(--foreground)]">
                                  {flightGroup.originAirport} → {flightGroup.destinationAirport}
                                </span>
                              </div>
                              <div>
                                <span className="text-[var(--muted-foreground)]">Airlines:</span>
                                <span className="ml-2 font-medium text-[var(--foreground)]">
                                  {flightGroup.preferredAirlines.length > 0 
                                    ? flightGroup.preferredAirlines.length + ' selected'
                                    : 'Any airline'
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </TabsContent>
                </Tabs>

                {flightGroups.length === 0 && (
                  <div className="text-center py-12 text-[var(--muted-foreground)]">
                    <Plane className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">No flight groups configured</p>
                    <p className="text-sm">Add a flight group to start searching for flights</p>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      </motion.div>

      {/* Status Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex justify-between items-center pt-6"
      >
        <div className="text-sm text-[var(--muted-foreground)]">
          {flightsEnabled 
            ? (isComplete ? 'Flight preferences complete - ready to proceed' : 'Please configure flight preferences for all groups')
            : 'Flights excluded from this trip'
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