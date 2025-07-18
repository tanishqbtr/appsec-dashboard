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