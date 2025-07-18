import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ChevronLeft, ChevronRight, Filter, Search, Shield, Target } from 'lucide-react';

interface ReportsTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tutorialSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Security Findings',
    content: 'This tutorial will guide you through filtering and analyzing security findings across multiple scan engines and compliance frameworks.',
    target: null,
    position: 'center'
  },
  {
    id: 'scan-engines',
    title: 'Scan Engine Selection',
    content: 'Choose from Mend, Escape, or Crowdstrike scan engines to filter findings. Each engine has different types of security scans available.',
    target: '[data-tutorial="scan-engines"]',
    position: 'bottom'
  },
  {
    id: 'engine-labels',
    title: 'Engine-Specific Labels',
    content: 'After selecting a scan engine, choose specific scan types (labels). For example, Mend offers SCA, SAST, and Container scans.',
    target: '[data-tutorial="engine-labels"]',
    position: 'bottom'
  },
  {
    id: 'compliance-tags',
    title: 'Compliance Filtering',
    content: 'Filter services by compliance standards like HITRUST, ISO 27001, SOC 2, HIPAA, and PCI DSS. This helps track regulatory requirements.',
    target: '[data-tutorial="compliance-tags"]',
    position: 'left'
  },
  {
    id: 'filter-mode',
    title: 'Mutually Exclusive Filtering',
    content: 'Filters work in two modes: either scan engine/labels OR compliance tags. Selecting one automatically clears the other to avoid conflicts.',
    target: '[data-tutorial="filter-section"]',
    position: 'top'
  },
  {
    id: 'active-filters',
    title: 'Active Filter Display',
    content: 'See your currently applied filters as removable badges. Click the × on any badge to quickly remove that filter.',
    target: '[data-tutorial="active-filters"]',
    position: 'bottom'
  },
  {
    id: 'search-bar',
    title: 'Service Search',
    content: 'Use the search functionality within the table to quickly find specific services by name while maintaining your filter settings.',
    target: '[data-tutorial="search-bar"]',
    position: 'bottom'
  },
  {
    id: 'services-table',
    title: 'Filtered Results Table',
    content: 'View filtered services with their security findings, percentile rankings, and detailed vulnerability information. Click any service to view detailed findings.',
    target: '[data-tutorial="services-table"]',
    position: 'top'
  },
  {
    id: 'export-features',
    title: 'Export and Reporting',
    content: 'Export your filtered data in various formats (CSV, XLSX, PDF) for compliance reporting and executive dashboards.',
    target: '[data-tutorial="export-controls"]',
    position: 'left'
  },
  {
    id: 'completion',
    title: 'Tutorial Complete!',
    content: 'You now know how to filter security findings by engines and compliance standards, search services, and export reports. Start analyzing your security data!',
    target: null,
    position: 'center'
  }
];

export default function ReportsTutorial({ isOpen, onClose, onComplete }: ReportsTutorialProps) {
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