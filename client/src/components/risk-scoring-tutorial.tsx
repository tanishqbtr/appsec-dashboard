import React from 'react';
import TutorialBase from './tutorial-base';

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
  return (
    <TutorialBase
      isOpen={isOpen}
      onClose={onClose}
      onComplete={onComplete}
      steps={tutorialSteps}
      tutorialName="Risk Scoring"
    />
  );
}