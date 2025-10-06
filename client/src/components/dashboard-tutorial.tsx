import React from 'react';
import TutorialBase from './tutorial-base';

interface DashboardTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

const tutorialSteps = [
  {
    id: 'welcome',
    title: 'Welcome to Security Dashboard',
    content: 'This tutorial will guide you through the comprehensive security analytics dashboard. Learn how to monitor vulnerability trends, analyze risk distributions, and track high-risk applications.',
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
    id: 'risk-distribution',
    title: 'Risk Score Distribution',
    content: 'Visualize how your applications are distributed across risk levels. This pie chart helps you understand what percentage of your portfolio falls into Critical, High, Medium, and Low risk categories.',
    target: '[data-tutorial="risk-distribution"]',
    position: 'right'
  },
  {
    id: 'engine-findings',
    title: 'Findings by Scan Engine',
    content: 'Compare security findings across different scanning engines (Mend, Escape, Crowdstrike). This stacked bar chart shows the severity breakdown for each engine.',
    target: '[data-tutorial="engine-findings"]',
    position: 'left'
  },
  {
    id: 'top-risks-total',
    title: 'Top High-Risk Applications',
    content: 'View the top 5 applications with the most security findings across all scan engines. These applications require immediate attention with detailed severity breakdowns.',
    target: '[data-tutorial="top-risks-total"]',
    position: 'right'
  },
  {
    id: 'top-risks-mend',
    title: 'Top Mend Findings',
    content: 'See the top 5 applications with the highest findings in Mend (SCA, SAST, Containers). Focus remediation efforts on applications with critical and high-severity vulnerabilities.',
    target: '[data-tutorial="top-risks-mend"]',
    position: 'left'
  },
  {
    id: 'top-risks-escape',
    title: 'Top Escape Findings',
    content: 'Identify the top 5 applications with the most findings in Escape (Web Apps, APIs). Prioritize applications with API security vulnerabilities and web application issues.',
    target: '[data-tutorial="top-risks-escape"]',
    position: 'right'
  },
  {
    id: 'completion',
    title: 'Tutorial Complete!',
    content: 'You now understand how to use the Security Dashboard to monitor security metrics, analyze risk distributions, and identify high-risk applications. Start exploring your security insights!',
    target: null,
    position: 'center'
  }
];

export default function DashboardTutorial({ isOpen, onClose, onComplete }: DashboardTutorialProps) {
  return (
    <TutorialBase
      isOpen={isOpen}
      onClose={onClose}
      onComplete={onComplete}
      steps={tutorialSteps}
      tutorialName="Dashboard"
    />
  );
}