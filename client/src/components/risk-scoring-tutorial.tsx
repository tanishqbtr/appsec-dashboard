import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ChevronLeft, ChevronRight, TrendingUp, AlertTriangle, Shield, Activity } from 'lucide-react';

interface RiskScoringTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tutorialSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Risk Scoring',
    content: 'This tutorial will guide you through conducting comprehensive security risk assessments, scoring services, and managing risk levels across your organization.',
    target: null,
    position: 'center'
  },
  {
    id: 'risk-metrics',
    title: 'Risk Level Overview',
    content: 'View the distribution of risk levels across all services. These metrics show how many services fall into Critical (8-10), High (6-7), Medium (4-5), and Low (0-3) risk categories.',
    target: '[data-tutorial="risk-metrics"]',
    position: 'bottom'
  },
  {
    id: 'search-services',
    title: 'Search Services',
    content: 'Use the search bar to quickly find specific services for risk assessment. This helps you locate services that need scoring or review.',
    target: '[data-tutorial="search-services"]',
    position: 'bottom'
  },
  {
    id: 'risk-table',
    title: 'Service Risk Scores Table',
    content: 'View all services with their current risk scores and levels. Click any column header to sort by service name, risk score, or risk level.',
    target: '[data-tutorial="risk-table"]',
    position: 'top'
  },
  {
    id: 'edit-assessment',
    title: 'Risk Assessment',
    content: 'Click "Edit" to open the comprehensive risk assessment dialog. This is where you evaluate and score security risks for each service.',
    target: '[data-tutorial="edit-assessment"]',
    position: 'left'
  },
  {
    id: 'data-classification',
    title: 'Data Classification Factors',
    content: 'Assess the sensitivity of data handled by the service. Consider data classification levels, PHI (Protected Health Information), and eligibility data.',
    target: '[data-tutorial="data-classification"]',
    position: 'right'
  },
  {
    id: 'cia-triad',
    title: 'CIA Triad Assessment',
    content: 'Evaluate the impact on Confidentiality, Integrity, and Availability. This assesses the potential damage if these security pillars are compromised.',
    target: '[data-tutorial="cia-triad"]',
    position: 'right'
  },
  {
    id: 'attack-surface',
    title: 'Attack Surface Factors',
    content: 'Analyze the exposure and discoverability of the service. Consider public endpoints, discoverability levels, and organizational awareness.',
    target: '[data-tutorial="attack-surface"]',
    position: 'right'
  },
  {
    id: 'risk-calculation',
    title: 'Automated Risk Calculation',
    content: 'Watch as risk scores are calculated in real-time based on your assessments. The system combines all factors to generate a final risk score and level.',
    target: '[data-tutorial="risk-calculation"]',
    position: 'left'
  },
  {
    id: 'save-assessment',
    title: 'Save Assessment',
    content: 'Complete all required fields and save your risk assessment. The system validates your input and updates the service\'s risk score automatically.',
    target: '[data-tutorial="save-assessment"]',
    position: 'top'
  },
  {
    id: 'completion',
    title: 'Tutorial Complete!',
    content: 'You now know how to conduct comprehensive risk assessments, evaluate security factors, and manage risk scores across your services. Start assessing your services!',
    target: null,
    position: 'center'
  }
];

export default function RiskScoringTutorial({ isOpen, onClose, onComplete }: RiskScoringTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    const step = tutorialSteps[currentStep];
    if (step.target) {
      const element = document.querySelector(step.target) as HTMLElement;
      if (element) {
        setHighlightedElement(element);
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add highlight class
        element.classList.add('tutorial-highlight');
        
        return () => {
          element.classList.remove('tutorial-highlight');
        };
      }
    } else {
      setHighlightedElement(null);
    }
  }, [currentStep, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    // Add overlay styles
    const style = document.createElement('style');
    style.textContent = `
      .tutorial-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        z-index: 9998;
        pointer-events: none;
      }
      
      .tutorial-highlight {
        position: relative;
        z-index: 9999;
        box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.8), 0 0 0 8px rgba(34, 197, 94, 0.3) !important;
        border-radius: 8px !important;
        pointer-events: auto;
      }
      
      .tutorial-popup {
        position: fixed;
        z-index: 10000;
        max-width: 400px;
        pointer-events: auto;
      }
      
      @keyframes tutorialPulse {
        0% { box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.8), 0 0 0 8px rgba(34, 197, 94, 0.3); }
        50% { box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.9), 0 0 0 12px rgba(34, 197, 94, 0.4); }
        100% { box-shadow: 0 0 0 4px rgba(34, 197, 94, 0.8), 0 0 0 8px rgba(34, 197, 94, 0.3); }
      }
      
      .tutorial-highlight {
        animation: tutorialPulse 2s infinite;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
      // Clean up any remaining highlights
      document.querySelectorAll('.tutorial-highlight').forEach(el => {
        el.classList.remove('tutorial-highlight');
      });
    };
  }, [isOpen]);

  const handleNext = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    onComplete();
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  const getPopupPosition = () => {
    const step = tutorialSteps[currentStep];
    
    if (!step.target || !highlightedElement) {
      // Center position for steps without targets
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    const rect = highlightedElement.getBoundingClientRect();
    const popup = { width: 400, height: 250 }; // Approximate popup size

    let top, left, transform = '';

    switch (step.position) {
      case 'bottom':
        top = rect.bottom + 20;
        left = rect.left + (rect.width / 2);
        transform = 'translateX(-50%)';
        break;
      case 'top':
        top = rect.top - popup.height - 20;
        left = rect.left + (rect.width / 2);
        transform = 'translateX(-50%)';
        break;
      case 'left':
        top = rect.top + (rect.height / 2);
        left = rect.left - popup.width - 20;
        transform = 'translateY(-50%)';
        break;
      case 'right':
        top = rect.top + (rect.height / 2);
        left = rect.right + 20;
        transform = 'translateY(-50%)';
        break;
      default:
        top = rect.bottom + 20;
        left = rect.left;
    }

    // Ensure popup stays within viewport
    const maxTop = window.innerHeight - popup.height - 20;
    const maxLeft = window.innerWidth - popup.width - 20;
    
    top = Math.max(20, Math.min(top, maxTop));
    left = Math.max(20, Math.min(left, maxLeft));

    return { top: `${top}px`, left: `${left}px`, transform };
  };

  if (!isOpen) return null;

  const step = tutorialSteps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="tutorial-overlay" />
      
      {/* Tutorial Popup */}
      <Card 
        className="tutorial-popup shadow-2xl border-2 border-green-200"
        style={getPopupPosition()}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{step.title}</h3>
              <Badge variant="outline" className="mt-1">
                Step {currentStep + 1} of {tutorialSteps.length}
              </Badge>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            {step.content}
          </p>
          
          <div className="flex items-center justify-between">
            <Button 
              variant="outline" 
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            
            <div className="flex gap-1">
              {tutorialSteps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            {currentStep === tutorialSteps.length - 1 ? (
              <Button 
                onClick={handleComplete}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                Complete Tutorial
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}