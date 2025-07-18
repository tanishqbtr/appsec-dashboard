import React from 'react';
import TutorialBase from './tutorial-base';

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
  return (
    <TutorialBase
      isOpen={isOpen}
      onClose={onClose}
      onComplete={onComplete}
      steps={tutorialSteps}
      tutorialName="Reports"
    />
  );
}