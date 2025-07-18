import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X, ChevronLeft, ChevronRight, BarChart3, PieChart, Activity, Target, Shield, AlertTriangle, TrendingUp, FileText } from 'lucide-react';

interface DashboardTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tutorialSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Security Dashboard',
    content: 'This tutorial will guide you through the comprehensive security analytics dashboard. Learn how to monitor vulnerability trends, analyze risk distributions, and track compliance across your applications.',
    target: null,
    position: 'center'
  },
  {
    id: 'header-overview',
    title: 'Dashboard Overview',
    content: 'The Security Dashboard provides real-time security insights and comprehensive vulnerability management for your entire application portfolio.',
    target: '[data-tutorial="dashboard-header"]',
    position: 'bottom'
  },
  {
    id: 'key-metrics',
    title: 'Key Security Metrics',
    content: 'Monitor your critical security KPIs at a glance: total applications, critical findings requiring immediate attention, high-priority findings, and your organization\'s average risk score.',
    target: '[data-tutorial="key-metrics"]',
    position: 'bottom'
  },
  {
    id: 'weekly-trends',
    title: 'Weekly Findings Trends',
    content: 'Track how security findings are trending over time. This line chart shows the daily count of Critical, High, Medium, and Low severity findings for the past week.',
    target: '[data-tutorial="weekly-trends"]',
    position: 'right'
  },
  {
    id: 'risk-distribution',
    title: 'Risk Score Distribution',
    content: 'Visualize how your applications are distributed across risk levels. This pie chart helps you understand what percentage of your portfolio falls into each risk category.',
    target: '[data-tutorial="risk-distribution"]',
    position: 'left'
  },
  {
    id: 'engine-findings',
    title: 'Findings by Scan Engine',
    content: 'Compare security findings across different scanning engines (Mend, Escape, Crowdstrike). This stacked bar chart shows the severity breakdown for each engine.',
    target: '[data-tutorial="engine-findings"]',
    position: 'right'
  },
  {
    id: 'compliance-coverage',
    title: 'Compliance Standards Coverage',
    content: 'Monitor your organization\'s compliance with various security standards. See which standards have good coverage and which need attention.',
    target: '[data-tutorial="compliance-coverage"]',
    position: 'left'
  },
  {
    id: 'findings-trend-area',
    title: 'Findings Trend Analysis',
    content: 'This area chart provides a detailed view of how findings accumulate over time by severity level. Use this to identify trends and plan remediation efforts.',
    target: '[data-tutorial="findings-trend-area"]',
    position: 'right'
  },
  {
    id: 'security-summary',
    title: 'Security Summary Stats',
    content: 'Get quick insights into total findings across all applications, overall compliance rate, and average response time for resolving critical security issues.',
    target: '[data-tutorial="security-summary"]',
    position: 'left'
  },
  {
    id: 'export-functionality',
    title: 'Export Dashboard Reports',
    content: 'Generate comprehensive PDF reports of your security dashboard data for executive reporting, compliance documentation, and stakeholder communication.',
    target: '[data-tutorial="export-button"]',
    position: 'bottom'
  },
  {
    id: 'time-range-filter',
    title: 'Time Range Selection',
    content: 'Adjust the time range for your analytics to focus on specific periods. Choose from predefined ranges or set custom date ranges for detailed analysis.',
    target: '[data-tutorial="time-range"]',
    position: 'bottom'
  },
  {
    id: 'completion',
    title: 'Tutorial Complete!',
    content: 'You now understand how to use the Security Dashboard to monitor security metrics, analyze trends, track compliance, and generate reports. Start exploring your security insights!',
    target: null,
    position: 'center'
  }
];

export default function DashboardTutorial({ isOpen, onClose, onComplete }: DashboardTutorialProps) {
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