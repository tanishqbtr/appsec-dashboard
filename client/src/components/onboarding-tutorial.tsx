import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  X, 
  ArrowRight, 
  ArrowLeft, 
  Shield, 
  BarChart3, 
  FileText, 
  AlertTriangle,
  Target,
  CheckCircle,
  Play
} from "lucide-react";

interface TutorialStep {
  id: string;
  title: string;
  description: string;
  target: string;
  icon: React.ReactNode;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Hinge Health Security Dashboard',
    description: 'This tutorial will guide you through the key features to help you manage security vulnerabilities effectively.',
    target: '',
    icon: <Shield className="h-5 w-5" />,
    position: 'center'
  },
  {
    id: 'navigation',
    title: 'Navigation Menu',
    description: 'Use the navigation menu to access different sections: Dashboard for analytics, Services for application management, Reports for documentation, and Risk Scoring for assessment tools.',
    target: 'nav',
    icon: <BarChart3 className="h-5 w-5" />,
    position: 'right'
  },
  {
    id: 'services-table',
    title: 'Services Overview',
    description: 'View all your applications with security metrics. The percentile column shows how each service ranks compared to others - higher percentiles mean fewer security findings.',
    target: 'services-table',
    icon: <Target className="h-5 w-5" />,
    position: 'top'
  },
  {
    id: 'percentile-system',
    title: 'Percentile Ranking System',
    description: 'Services are ranked by total findings. Top performers (90%+) get Platinum tier, while services needing attention show lower percentiles with Bronze tier badges.',
    target: 'percentile-column',
    icon: <CheckCircle className="h-5 w-5" />,
    position: 'bottom'
  },
  {
    id: 'filtering',
    title: 'Smart Filtering',
    description: 'Use the filter options to focus on specific scan engines, labels, or compliance tags. Filters are mutually exclusive for precise results.',
    target: 'filter-section',
    icon: <FileText className="h-5 w-5" />,
    position: 'bottom'
  },
  {
    id: 'service-details',
    title: 'Service Details',
    description: 'Click any service row to view detailed security findings, risk scores, percentile ranks, and management links for GitHub, Jira, and Slack.',
    target: 'service-row',
    icon: <AlertTriangle className="h-5 w-5" />,
    position: 'left',
    action: 'Click on a service row to explore'
  },
  {
    id: 'export',
    title: 'Export Capabilities',
    description: 'Export filtered data in multiple formats (CSV, XLSX, PDF) for reporting and compliance documentation.',
    target: 'export-button',
    icon: <FileText className="h-5 w-5" />,
    position: 'bottom'
  }
];

interface OnboardingTutorialProps {
  isVisible: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export default function OnboardingTutorial({ isVisible, onComplete, onSkip }: OnboardingTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isHighlighting, setIsHighlighting] = useState(false);

  useEffect(() => {
    if (isVisible && currentStep > 0) {
      setIsHighlighting(true);
      const timer = setTimeout(() => setIsHighlighting(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, isVisible]);

  if (!isVisible) return null;

  const step = tutorialSteps[currentStep];
  const isLastStep = currentStep === tutorialSteps.length - 1;
  const isFirstStep = currentStep === 0;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getPositionClasses = () => {
    switch (step.position) {
      case 'center':
        return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
      case 'top':
        return 'fixed top-20 left-1/2 transform -translate-x-1/2';
      case 'bottom':
        return 'fixed bottom-20 left-1/2 transform -translate-x-1/2';
      case 'left':
        return 'fixed top-1/2 left-20 transform -translate-y-1/2';
      case 'right':
        return 'fixed top-1/2 right-20 transform -translate-y-1/2';
      default:
        return 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2';
    }
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300" />
      
      {/* Highlight effect for targeted elements */}
      {step.target && isHighlighting && (
        <style>
          {`
            [data-tutorial-target="${step.target}"] {
              position: relative;
              z-index: 45;
              box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.5), 0 0 20px rgba(34, 197, 94, 0.3);
              border-radius: 8px;
              animation: pulse-green 2s ease-in-out;
            }
            
            @keyframes pulse-green {
              0%, 100% { box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.5), 0 0 20px rgba(34, 197, 94, 0.3); }
              50% { box-shadow: 0 0 0 8px rgba(34, 197, 94, 0.7), 0 0 30px rgba(34, 197, 94, 0.5); }
            }
          `}
        </style>
      )}

      {/* Tutorial Card */}
      <Card className={`${getPositionClasses()} z-50 w-96 max-w-sm mx-4 shadow-2xl border-green-200 bg-white`}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
                {step.icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{step.title}</h3>
                <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                  Step {currentStep + 1} of {tutorialSteps.length}
                </Badge>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onSkip}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="mb-6">
            <p className="text-gray-600 text-sm leading-relaxed">
              {step.description}
            </p>
            {step.action && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 text-green-700 text-sm font-medium">
                  <Play className="h-4 w-4" />
                  {step.action}
                </div>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Progress</span>
              <span>{Math.round(((currentStep + 1) / tutorialSteps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${((currentStep + 1) / tutorialSteps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePrevious}
              disabled={isFirstStep}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onSkip}
                className="text-gray-600 hover:text-gray-800"
              >
                Skip Tutorial
              </Button>
              <Button 
                size="sm" 
                onClick={handleNext}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                {isLastStep ? 'Complete' : 'Next'}
                {!isLastStep && <ArrowRight className="h-4 w-4" />}
                {isLastStep && <CheckCircle className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}