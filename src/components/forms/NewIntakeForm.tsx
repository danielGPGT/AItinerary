import React, { useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  ChevronLeft, 
  ChevronRight, 
  Users, 
  Plane, 
  Hotel, 
  Car, 
  Calendar,
  CheckCircle,
  FileText,
  Brain,
  Download,
  MessageSquare,
  RotateCcw
} from 'lucide-react';
import { toast } from 'sonner';

import { newIntakeSchema, NewIntake } from '@/types/newIntake';
import { useNewIntakeStore } from '@/store/newIntake';
import { StepClientSelection } from './steps/StepClientSelection';
import { StepTripDetails } from './steps/StepTripDetails';
import { StepPreferences } from './steps/StepPreferences';
import { Step3Flights } from './steps/Step3Flights';
import { Step4Hotels } from './steps/Step4Hotels';
import { Step5Transfers } from './steps/Step5Transfers';
import { Step6Events } from './steps/Step6Events';
import { Step7Summary } from './steps/Step7Summary';

interface NewIntakeFormProps {
  onSubmit?: (data: NewIntake) => void;
  onGenerateItinerary?: (data: NewIntake) => void;
  onExportPDF?: (data: NewIntake) => void;
  initialData?: Partial<NewIntake>;
}

const STEPS = [
  { id: 0, title: 'Client Selection', icon: Users, description: 'Select or create client' },
  { id: 1, title: 'Trip Details', icon: Calendar, description: 'Basic trip information' },
  { id: 2, title: 'Preferences', icon: CheckCircle, description: 'Client preferences' },
  { id: 3, title: 'Flights', icon: Plane, description: 'Flight requirements' },
  { id: 4, title: 'Hotels', icon: Hotel, description: 'Accommodation needs' },
  { id: 5, title: 'Transfers', icon: Car, description: 'Airport transfers' },
  { id: 6, title: 'Events', icon: Calendar, description: 'Events & excursions' },
  { id: 7, title: 'Summary', icon: FileText, description: 'Review & submit' },
];

export function NewIntakeForm({ 
  onSubmit, 
  onGenerateItinerary, 
  onExportPDF,
  initialData 
}: NewIntakeFormProps) {
  const {
    currentStep,
    isSubmitting,
    setCurrentStep,
    resetForm,
  } = useNewIntakeStore();

  const [showPreview, setShowPreview] = useState(false);

  const form = useForm<NewIntake>({
    resolver: zodResolver(newIntakeSchema),
    defaultValues: initialData || {
      client: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        address: {
          street: '',
          city: '',
          state: '',
          zipCode: '',
          country: '',
        },
        preferences: {
          language: 'en',
          tone: 'luxury',
          notes: '',
        },
        pastTrips: [],
      },
      isNewClient: false,
      tripDetails: {
        tripName: '',
        primaryDestination: '',
        startDate: '',
        endDate: '',
        duration: 0,
        purpose: 'leisure',
        totalTravelers: {
          adults: 1,
          children: 0,
        },
        useSubgroups: false,
        groups: [],
      },
      preferences: {
        tone: 'luxury',
        currency: 'GBP',
        budget: {
          amount: 0,
          type: 'total',
        },
        language: 'en',
        specialRequests: '',
        travelPriorities: ['comfort', 'experience'],
      },
      flights: {
        enabled: false,
        groups: [],
      },
      hotels: {
        enabled: false,
        groups: [],
      },
      transfers: {
        enabled: false,
        groups: [],
      },
      events: {
        enabled: false,
        events: [],
      },
      summary: {
        internalNotes: '',
        quoteReference: '',
        agentId: '',
      },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft',
        version: '1.0',
      },
    },
    mode: 'onChange',
  });

  const handleNext = async () => {
    // Define which fields to validate for each step
    const stepValidationFields = {
      0: ['client.firstName', 'client.lastName', 'client.email'], // Client Selection
      1: ['tripDetails.primaryDestination', 'tripDetails.startDate', 'tripDetails.endDate', 'tripDetails.totalTravelers.adults'], // Trip Details
      2: [], // Preferences (temporarily no validation)
      3: [], // Flights (optional - has toggle)
      4: [], // Hotels (optional)
      5: [], // Transfers (optional)
      6: [], // Events (optional)
      7: [], // Summary (optional)
    };

    const fieldsToValidate = stepValidationFields[currentStep as keyof typeof stepValidationFields] || [];
    
    // Only validate if there are fields to validate for this step
    let isValid = true;
    if (fieldsToValidate.length > 0) {
      isValid = await form.trigger(fieldsToValidate as any);
    }
    
    // For Step 2, always allow proceeding (temporary fix)
    if (currentStep === 2) {
      isValid = true;
    }
    
    if (isValid && currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      if (onSubmit) {
        await onSubmit(data);
      }
      
      toast.success('Intake form submitted successfully!');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form. Please try again.');
    }
  });

  const handleGenerateItinerary = () => {
    const formData = form.getValues();
    if (onGenerateItinerary) {
      onGenerateItinerary(formData);
    }
  };

  const handleExportPDF = () => {
    const formData = form.getValues();
    if (onExportPDF) {
      onExportPDF(formData);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset the form? This will clear all data and return to step 1. This action cannot be undone.')) {
      resetForm();
      form.reset();
      toast.success('Form reset successfully');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return <StepClientSelection />;
      case 1:
        return <StepTripDetails />;
      case 2:
        return <StepPreferences />;
      case 3:
        return <Step3Flights />;
      case 4:
        return <Step4Hotels />;
      case 5:
        return <Step5Transfers />;
      case 6:
        return <Step6Events />;
      case 7:
        return <Step7Summary 
          onGenerateItinerary={handleGenerateItinerary}
          onExportPDF={handleExportPDF}
        />;
      default:
        return (
          <div className="p-6 text-center">
            <h3 className="text-lg font-semibold mb-2 text-[var(--foreground)]">Client Selection</h3>
            <p className="text-[var(--muted-foreground)]">Step component will be loaded here</p>
          </div>
        );
    }
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start bg-[var(--background)]">
      <div className="w-full max-w-4xl mx-auto py-8 px-2 sm:px-4">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--foreground)] mb-1">New Travel Quote</h1>
          <p className="text-[var(--muted-foreground)] text-base mb-2">Create a comprehensive travel quote for your client</p>
          {/* Progress Bar */}
          <div className="mb-4">
            <Progress value={progress} className="h-2" />
            <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
              <span>Step {currentStep + 1} of {STEPS.length}</span>
              <span>{Math.round(progress)}% complete</span>
            </div>
          </div>
          {/* Stepper */}
          <div className="flex flex-wrap gap-2 mb-2">
            {STEPS.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div
                  key={step.id}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium border transition-colors ${
                    index === currentStep
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)] border-[var(--primary)]'
                      : index < currentStep
                      ? 'bg-[var(--primary-50)] text-[var(--primary-700)] border-[var(--primary-200)]'
                      : 'bg-[var(--muted)] text-[var(--muted-foreground)] border-[var(--border)]'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span className="hidden sm:inline">{step.title}</span>
                  {index < currentStep && <CheckCircle className="w-4 h-4 ml-1" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Form Card */}
        <Card className="shadow-lg border-[var(--border)] bg-[var(--card)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg text-[var(--card-foreground)]">
              {(() => {
                const IconComponent = STEPS[currentStep].icon;
                return <IconComponent className="w-5 h-5" />;
              })()}
              {STEPS[currentStep].title}
            </CardTitle>
            <p className="text-[var(--muted-foreground)] text-sm">{STEPS[currentStep].description}</p>
          </CardHeader>
          <CardContent>
            <FormProvider {...form}>
              <div className="transition-all duration-300 space-y-6">
                {renderStep()}
              </div>
            </FormProvider>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="border-[var(--border)] hover:bg-[var(--accent)] hover:border-[var(--primary)]/30"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting}
              className="border-[var(--border)] hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Form
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {currentStep === STEPS.length - 1 ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleGenerateItinerary}
                  disabled={isSubmitting}
                  className="border-[var(--border)] hover:bg-[var(--accent)] hover:border-[var(--primary)]/30"
                >
                  <Brain className="w-4 h-4 mr-2" />
                  Generate AI Itinerary
                </Button>
                <Button
                  variant="outline"
                  onClick={handleExportPDF}
                  disabled={isSubmitting}
                  className="border-[var(--border)] hover:bg-[var(--accent)] hover:border-[var(--primary)]/30"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--primary-foreground)]"
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Submit Quote
                </Button>
              </>
            ) : (
              <Button
                onClick={handleNext}
                disabled={isSubmitting}
                className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[var(--primary-foreground)]"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 