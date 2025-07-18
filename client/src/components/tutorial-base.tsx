import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  target: string | null;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface TutorialBaseProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  steps: TutorialStep[];
  tutorialName: string;
}

export default function TutorialBase({ isOpen, onClose, onComplete, steps, tutorialName }: TutorialBaseProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightedElement, setHighlightedElement] = useState<HTMLElement | null>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const step = steps[currentStep];
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
  }, [currentStep, isOpen, steps]);

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
        max-width: 420px;
        min-width: 320px;
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
    if (currentStep < steps.length - 1) {
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
    const step = steps[currentStep];
    
    if (!step.target || !highlightedElement || !popupRef.current) {
      // Center position for steps without targets
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      };
    }

    const rect = highlightedElement.getBoundingClientRect();
    const popupRect = popupRef.current.getBoundingClientRect();
    const popup = { 
      width: popupRect.width || 420, 
      height: popupRect.height || 280 
    };

    let top, left, transform = '';
    const padding = 20;

    switch (step.position) {
      case 'bottom':
        top = rect.bottom + padding;
        left = rect.left + (rect.width / 2);
        transform = 'translateX(-50%)';
        break;
      case 'top':
        top = rect.top - popup.height - padding;
        left = rect.left + (rect.width / 2);
        transform = 'translateX(-50%)';
        break;
      case 'left':
        top = rect.top + (rect.height / 2);
        left = rect.left - popup.width - padding;
        transform = 'translateY(-50%)';
        break;
      case 'right':
        top = rect.top + (rect.height / 2);
        left = rect.right + padding;
        transform = 'translateY(-50%)';
        break;
      default:
        top = rect.bottom + padding;
        left = rect.left;
    }

    // Ensure popup stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // Adjust horizontal position
    if (left < padding) {
      left = padding;
      if (transform.includes('translateX')) transform = '';
    } else if (left + popup.width > viewportWidth - padding) {
      left = viewportWidth - popup.width - padding;
      if (transform.includes('translateX')) transform = '';
    }
    
    // Adjust vertical position
    if (top < padding) {
      top = padding;
      if (transform.includes('translateY')) transform = '';
    } else if (top + popup.height > viewportHeight - padding) {
      top = viewportHeight - popup.height - padding;
      if (transform.includes('translateY')) transform = '';
    }

    return { top: `${top}px`, left: `${left}px`, transform };
  };

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <>
      {/* Overlay */}
      <div className="tutorial-overlay" />
      
      {/* Tutorial Popup */}
      <Card 
        ref={popupRef}
        className="tutorial-popup shadow-2xl border-2 border-green-200"
        style={getPopupPosition()}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1 pr-4">
              <h3 className="text-lg font-semibold text-gray-900 leading-tight">{step.title}</h3>
              <Badge variant="outline" className="mt-2">
                Step {currentStep + 1} of {steps.length}
              </Badge>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSkip}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
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
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentStep ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            
            {currentStep === steps.length - 1 ? (
              <Button 
                onClick={handleComplete}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2 whitespace-nowrap"
              >
                Complete
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