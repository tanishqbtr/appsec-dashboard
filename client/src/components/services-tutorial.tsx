import React from 'react';
import TutorialBase from './tutorial-base';

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
  return (
    <TutorialBase
      isOpen={isOpen}
      onClose={onClose}
      onComplete={onComplete}
      steps={tutorialSteps}
      tutorialName="Services"
    />
  );
}