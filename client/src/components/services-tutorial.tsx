import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ChevronLeft, ChevronRight, Search, Plus, Trash2, ArrowUpDown } from 'lucide-react';

interface ServicesTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tutorialSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Services Management',
    content: 'This tutorial will guide you through managing your security services, viewing risk scores, and performing bulk operations.',
    target: null,
    position: 'center'
  },
  {
    id: 'search',
    title: 'Search Services',
    content: 'Use the search bar to quickly find specific services by name. Try typing a service name to filter the results.',
    target: '[data-tutorial="search"]',
    position: 'bottom'
  },
  {
    id: 'add-service',
    title: 'Add New Service',
    content: 'Click the "Add Service" button to register a new service with security details, GitHub repo, Jira project, and Slack channel.',
    target: '[data-tutorial="add-service"]',
    position: 'bottom'
  },
  {
    id: 'remove-services',
    title: 'Bulk Operations',
    content: 'Use "Remove Services" to enter selection mode and delete multiple services at once. This helps with cleanup and maintenance.',
    target: '[data-tutorial="remove-services"]',
    position: 'bottom'
  },
  {
    id: 'table-headers',
    title: 'Sort by Columns',
    content: 'Click on any column header to sort services by name, risk score, or percentile ranking. Click again to reverse the order.',
    target: '[data-tutorial="table-headers"]',
    position: 'bottom'
  },
  {
    id: 'risk-scores',
    title: 'Risk Score Analysis',
    content: 'Each service displays its calculated risk score (0-10 scale) based on security assessments and vulnerability findings.',
    target: '[data-tutorial="risk-scores"]',
    position: 'left'
  },
  {
    id: 'percentile-ranking',
    title: 'Percentile Rankings',
    content: 'Services are ranked by percentile based on total security findings. Higher percentiles indicate better security posture.',
    target: '[data-tutorial="percentile"]',
    position: 'left'
  },
  {
    id: 'service-details',
    title: 'Service Details',
    content: 'Click on any service name to view detailed security findings, risk assessments, and scanner results for that service.',
    target: '[data-tutorial="service-row"]',
    position: 'right'
  },
  {
    id: 'completion',
    title: 'Tutorial Complete!',
    content: 'You now know how to manage services, view risk metrics, and navigate security data. Start exploring your services!',
    target: null,
    position: 'center'
  }
];

export default function ServicesTutorial({ isOpen, onClose, onComplete }: ServicesTutorialProps) {
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
    const popup = { width: 400, height: 200 }; // Approximate popup size

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