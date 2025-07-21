# Security Dashboard - Design Document

## Executive Summary

The Security Dashboard is a comprehensive vulnerability management platform that enables intelligent, multi-engine risk assessment and visualization across diverse scanning technologies. Built with modern web technologies, it provides centralized security insights for enterprise applications with sophisticated risk scoring and compliance tracking capabilities.

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture](#architecture)
3. [Database Design](#database-design)
4. [API Design](#api-design)
5. [User Interface Design](#user-interface-design)
6. [Security Considerations](#security-considerations)
7. [Performance & Scalability](#performance--scalability)
8. [Deployment Strategy](#deployment-strategy)
9. [Future Roadmap](#future-roadmap)

## System Overview

### Purpose
The Security Dashboard serves as a centralized platform for monitoring, analyzing, and managing security vulnerabilities across an organization's application portfolio. It integrates multiple security scanning engines and provides risk-based prioritization for remediation efforts.

### Key Features
- **Multi-Engine Integration**: Supports Mend (SCA, SAST, Containers), Escape (WebApps, APIs), and Crowdstrike (Images, Containers)
- **Risk Assessment Engine**: Comprehensive risk scoring based on CIA triad, data classification, and attack surface analysis
- **Interactive Analytics**: Real-time dashboards with trend analysis and compliance tracking
- **Service Management**: Complete lifecycle management of security-monitored services
- **Compliance Reporting**: Automated report generation for various security standards
- **User Onboarding**: Interactive tutorials for all major platform features

### Target Users
- Security Engineers
- DevOps Teams
- Compliance Officers
- Engineering Managers
- Executive Leadership

## Architecture

### Technology Stack

#### Frontend
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack Query (React Query) for server state
- **UI Components**: Shadcn/ui built on Radix UI primitives
- **Styling**: Tailwind CSS with custom security-themed variables
- **Build Tool**: Vite with HMR support
- **Icons**: Lucide React for interface icons

#### Backend
- **Runtime**: Node.js with TypeScript (ESM modules)
- **Framework**: Express.js with custom middleware
- **Database**: PostgreSQL with connection pooling
- **ORM**: Drizzle ORM with type-safe queries
- **Session Management**: Express sessions with database storage
- **API Architecture**: RESTful endpoints with JSON responses

#### Infrastructure
- **Database**: PostgreSQL (Neon serverless)
- **Deployment**: Replit platform with auto-scaling
- **Development**: Hot reload for both frontend and backend
- **Environment**: Containerized development with shared configurations

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React)                         │
├─────────────────────────────────────────────────────────────┤
│  Dashboard │ Services │ Reports │ Alerts │ Risk Scoring     │
│     │           │        │        │           │             │
│     └───────────┼────────┼────────┼───────────┘             │
│                 │        │        │                         │
│            TanStack Query (State Management)                │
└─────────────────┼────────┼────────┼─────────────────────────┘
                  │        │        │
┌─────────────────┼────────┼────────┼─────────────────────────┐
│                 │  Express.js API Server                    │
├─────────────────┼────────┼────────┼─────────────────────────┤
│                 │        │        │                         │
│  Authentication │ Service│Reports │ Risk Assessment         │
│    Middleware   │  Mgmt  │ Engine │    Engine               │
│                 │        │        │                         │
└─────────────────┼────────┼────────┼─────────────────────────┘
                  │        │        │
┌─────────────────┼────────┼────────┼─────────────────────────┐
│                    Database Layer (PostgreSQL)             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│ │   Users     │ │Applications │ │Risk         │           │
│ │   Table     │ │   Table     │ │Assessments  │           │
│ └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│ │ Mend SCA    │ │ Mend SAST   │ │ Mend        │           │
│ │ Findings    │ │ Findings    │ │ Containers  │           │
│ └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│ ┌─────────────┐ ┌─────────────┐                           │
│ │ Escape      │ │ Crowdstrike │                           │
│ │ Findings    │ │ Findings    │                           │
│ └─────────────┘ └─────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

## Database Design

### Schema Overview

The database follows a normalized design with separate tables for each scan engine to enable independent scaling and data management.

#### Core Tables

**users** - Authentication and user management
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
);
```

**applications** - Service registry and metadata
```sql
CREATE TABLE applications (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    risk_score TEXT NOT NULL,
    labels TEXT[],
    tags TEXT[],
    has_alert BOOLEAN DEFAULT false,
    github_repo TEXT,
    jira_project TEXT,
    service_owner TEXT,
    slack_channel TEXT,
    description TEXT
);
```

**risk_assessments** - Risk scoring engine data
```sql
CREATE TABLE risk_assessments (
    id SERIAL PRIMARY KEY,
    service_name TEXT NOT NULL UNIQUE,
    data_classification TEXT,
    phi TEXT,
    eligibility_data TEXT,
    confidentiality_impact TEXT,
    integrity_impact TEXT,
    availability_impact TEXT,
    public_endpoint TEXT,
    discoverability TEXT,
    awareness TEXT,
    data_classification_score INTEGER DEFAULT 0,
    cia_triad_score INTEGER DEFAULT 0,
    attack_surface_score INTEGER DEFAULT 0,
    final_risk_score REAL DEFAULT 0,
    risk_level TEXT DEFAULT 'Low',
    last_updated TIMESTAMP DEFAULT now(),
    updated_by TEXT
);
```

#### Scanner Tables

Each scanning engine has dedicated tables with consistent schema:

**Mend Scanner Tables** (3 tables):
- `mend_sca_findings` - Software Composition Analysis
- `mend_sast_findings` - Static Application Security Testing  
- `mend_containers_findings` - Container Security

**Escape Scanner Tables** (2 tables):
- `escape_apis_findings` - API Security Testing
- `escape_webapps_findings` - Web Application Security

**Crowdstrike Scanner Tables** (2 tables):
- `crowdstrike_images_findings` - Container Image Security
- `crowdstrike_containers_findings` - Container Runtime Security

All scanner tables follow this pattern:
```sql
CREATE TABLE {engine}_{type}_findings (
    id SERIAL PRIMARY KEY,
    service_name TEXT NOT NULL,
    scan_date TEXT NOT NULL,
    critical INTEGER DEFAULT 0,
    high INTEGER DEFAULT 0,
    medium INTEGER DEFAULT 0,
    low INTEGER DEFAULT 0
);
```

### Relationships

- **One-to-One**: `applications.name` ↔ `risk_assessments.service_name`
- **One-to-Many**: `applications.name` ↔ All scanner findings tables via `service_name`
- **No Foreign Keys**: Designed for flexibility with soft relationships

### Indexing Strategy

- Primary keys on all `id` fields (auto-created)
- Unique constraint on `users.username`
- Unique constraint on `risk_assessments.service_name`
- Consider adding indexes on `service_name` fields for scanner tables in production

## API Design

### RESTful Principles

The API follows REST conventions with consistent resource naming and HTTP methods:

- **GET** for data retrieval
- **POST** for resource creation
- **PATCH** for partial updates
- **DELETE** for resource removal

### Authentication

- **Session-based**: Uses Express sessions with database storage
- **Middleware**: `requireAuth` protects all endpoints except login/logout
- **Stateful**: Sessions persist across browser restarts

### Endpoint Categories

#### Authentication Endpoints
```
POST   /api/login           - User authentication
GET    /api/auth/user       - Get current user
POST   /api/logout          - End user session
```

#### Application Management
```
GET    /api/applications              - List all applications
POST   /api/applications              - Create new application
PATCH  /api/applications/:id          - Update application
DELETE /api/applications/:id          - Remove application
GET    /api/applications-with-risk    - Applications with risk data
GET    /api/services-with-risk-scores - Services with calculated risk scores
GET    /api/services-total-findings   - Services with aggregated findings
```

#### Scanner Data Endpoints
```
GET /api/mend/sca                    - Mend SCA findings
GET /api/mend/sast                   - Mend SAST findings
GET /api/mend/containers             - Mend container findings
GET /api/escape/webapps              - Escape web app findings
GET /api/escape/apis                 - Escape API findings
GET /api/crowdstrike/images          - Crowdstrike image findings
GET /api/crowdstrike/containers      - Crowdstrike container findings
```

#### Risk Assessment
```
GET  /api/risk-assessments/:serviceName  - Get risk assessment
POST /api/risk-assessments               - Create/update assessment
```

#### Dashboard Analytics
```
GET /api/dashboard/metrics              - Key performance indicators
GET /api/dashboard/risk-distribution    - Risk distribution for charts
GET /api/dashboard/scan-engine-findings - Aggregated scan engine data
```

### Response Formats

**Success Response**:
```json
{
  "data": [...],
  "status": "success"
}
```

**Error Response**:
```json
{
  "message": "Error description",
  "status": "error"
}
```

**Pagination** (Future):
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1250,
    "hasNext": true
  }
}
```

## User Interface Design

### Design System

#### Color Palette
- **Primary**: Hinge Health green (`#059669`) for brand consistency
- **Severity Colors**: 
  - Critical: `#DC2626` (Red)
  - High: `#EA580C` (Orange) 
  - Medium: `#D97706` (Amber)
  - Low: `#65A30D` (Green)
- **Neutral**: Gray scale for text and backgrounds
- **Success/Error**: Green/Red for status indicators

#### Typography
- **Font Family**: Inter (system fallback)
- **Scale**: 
  - Headings: 2xl, xl, lg
  - Body: base, sm
  - Labels: sm, xs
- **Weight**: Regular (400), Medium (500), Semibold (600), Bold (700)

#### Spacing System
- **Base Unit**: 4px (Tailwind's spacing scale)
- **Component Padding**: 4, 6, 8 units
- **Layout Margins**: 6, 8, 12 units
- **Section Gaps**: 8, 12, 16 units

#### Component Architecture

**Atomic Design Principles**:
- **Atoms**: Buttons, inputs, badges, icons
- **Molecules**: Form fields, search bars, metric cards
- **Organisms**: Navigation, data tables, charts
- **Templates**: Page layouts, modal structures
- **Pages**: Complete views with data integration

### Page Layouts

#### Dashboard Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Header (Logo + Navigation + User Menu)                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│ │   Total     │ │  Critical   │ │    High     │           │
│ │    Apps     │ │  Findings   │ │  Findings   │           │
│ └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │           Weekly Findings Trend Chart                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────┐ ┌─────────────────────────────┐ │
│ │    Risk Distribution    │ │   Scan Engine Findings     │ │
│ │      (Pie Chart)        │ │      (Bar Chart)           │ │
│ └─────────────────────────┘ └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

#### Services Layout
```
┌─────────────────────────────────────────────────────────────┐
│ Header + Navigation                                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────────────────────┐ ┌─────────────────────────┐ │
│ │      Search Services        │ │    Add Service +        │ │
│ └─────────────────────────────┘ └─────────────────────────┘ │
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │                 Services Table                          │ │
│ │ ┌─────────────┬─────────────┬─────────────┬───────────┐ │ │
│ │ │   Service   │ Risk Score  │ Percentile  │  Actions  │ │ │
│ │ │    Name     │             │   Ranking   │           │ │ │
│ │ ├─────────────┼─────────────┼─────────────┼───────────┤ │ │
│ │ │ Service 1   │    8.5      │   Top 10%   │    →      │ │ │
│ │ │ Service 2   │    6.2      │   Top 25%   │    →      │ │ │
│ │ └─────────────┴─────────────┴─────────────┴───────────┘ │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Interactive Elements

#### Animations
- **Page Transitions**: 200ms ease-in-out
- **Hover Effects**: Scale (1.05) and color changes
- **Loading States**: Skeleton animations and spinners
- **Chart Animations**: Staggered entrance effects
- **Micro-interactions**: Button press feedback

#### Responsive Design
- **Mobile First**: Base styles for mobile devices
- **Breakpoints**:
  - sm: 640px (tablets)
  - md: 768px (small laptops) 
  - lg: 1024px (desktops)
  - xl: 1280px (large screens)
- **Component Adaptations**: Navigation collapses, charts resize, tables scroll

### Accessibility

- **WCAG 2.1 AA Compliance**
- **Keyboard Navigation**: Full keyboard support
- **Screen Readers**: Proper ARIA labels and descriptions
- **Color Contrast**: 4.5:1 minimum ratio
- **Focus Management**: Visible focus indicators

## Security Considerations

### Authentication & Authorization

#### Current Implementation
- **Session-based Authentication**: Express sessions with database storage
- **Password Storage**: Plain text (development only - needs hashing)
- **Session Management**: Automatic expiration and cleanup
- **Authorization**: Role-based access control ready

#### Production Security Requirements
```typescript
// Required security enhancements
interface SecurityEnhancements {
  passwordHashing: 'bcrypt' | 'argon2';
  sessionEncryption: 'AES-256';
  csrfProtection: boolean;
  rateLimiting: {
    windowMs: number;
    maxRequests: number;
  };
  httpsSecurity: {
    hstsEnabled: boolean;
    certificateValidation: boolean;
  };
}
```

### Data Protection

#### Sensitive Data Handling
- **PII/PHI Data**: Identified in risk assessments
- **Encryption at Rest**: Database-level encryption
- **Encryption in Transit**: HTTPS/TLS 1.3
- **Data Retention**: Configurable retention policies

#### Input Validation
- **Request Validation**: Zod schemas for all endpoints
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
- **XSS Protection**: React's built-in XSS protection + CSP headers
- **File Upload Security**: Validation and scanning for malicious content

### Infrastructure Security

#### Network Security
- **Firewall Rules**: Restrict database access to application servers only
- **VPC Configuration**: Isolated network segments
- **Load Balancer**: SSL termination and DDoS protection
- **API Gateway**: Rate limiting and request filtering

#### Monitoring & Logging
- **Audit Logging**: All user actions and data modifications
- **Security Monitoring**: Failed login attempts, suspicious activity
- **Performance Monitoring**: Response times and error rates
- **Compliance Logging**: SOC2, HIPAA audit trails

## Performance & Scalability

### Frontend Performance

#### Optimization Strategies
- **Code Splitting**: Route-based lazy loading
- **Bundle Optimization**: Tree shaking and minification
- **Caching Strategy**: 
  - React Query for server state
  - Browser caching for static assets
  - Service worker for offline functionality

#### Performance Metrics
```typescript
interface PerformanceTargets {
  firstContentfulPaint: '<2s';
  largestContentfulPaint: '<3s';
  firstInputDelay: '<100ms';
  cumulativeLayoutShift: '<0.1';
  timeToInteractive: '<4s';
}
```

### Backend Performance

#### Database Optimization
- **Connection Pooling**: Configurable pool sizes
- **Query Optimization**: Indexed commonly queried fields
- **Caching Layer**: Redis for frequently accessed data
- **Read Replicas**: Separate read/write database instances

#### API Performance
- **Response Compression**: Gzip/Brotli for large payloads
- **Pagination**: Limit large dataset responses
- **Async Processing**: Background jobs for heavy computations
- **Rate Limiting**: Prevent API abuse

### Scalability Architecture

#### Horizontal Scaling
```
┌─────────────────────────────────────────────────────────────┐
│                    Load Balancer                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│ │   App       │ │   App       │ │   App       │           │
│ │ Instance 1  │ │ Instance 2  │ │ Instance 3  │           │
│ └─────────────┘ └─────────────┘ └─────────────┘           │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐           │
│ │  Primary    │ │    Read     │ │   Cache     │           │
│ │ Database    │ │  Replica    │ │   Layer     │           │
│ └─────────────┘ └─────────────┘ └─────────────┘           │
└─────────────────────────────────────────────────────────────┘
```

#### Monitoring & Alerting
- **Application Metrics**: Response times, error rates, throughput
- **Infrastructure Metrics**: CPU, memory, disk usage
- **Business Metrics**: User engagement, feature adoption
- **Alerting Rules**: Automated notifications for threshold breaches

## Deployment Strategy

### Development Environment

#### Local Development
```bash
# Development setup
npm install              # Install dependencies
npm run dev             # Start development servers
npm run db:push         # Update database schema
npm run db:studio       # Database management UI
```

#### Environment Variables
```env
# Database
DATABASE_URL=postgresql://...
PGUSER=username
PGPASSWORD=password
PGHOST=localhost
PGPORT=5432
PGDATABASE=security_dashboard

# Application
NODE_ENV=development
PORT=5000
SESSION_SECRET=dev-secret-key
```

### Production Deployment

#### Replit Platform
- **Auto-scaling**: Automatic resource scaling based on demand
- **Zero-downtime**: Rolling deployments with health checks
- **SSL/TLS**: Automatic certificate management
- **CDN**: Global content delivery network
- **Monitoring**: Built-in performance and error monitoring

#### Deployment Pipeline
```yaml
# .replit deployment configuration
deploy:
  build:
    - npm ci
    - npm run build
  start: npm run start
  health-check: /api/health
  environment:
    NODE_ENV: production
```

#### Post-Deployment Verification
- **Health Checks**: Endpoint availability verification
- **Database Migrations**: Automated schema updates
- **Performance Testing**: Load testing for critical paths
- **Security Scanning**: Vulnerability assessment

### Backup & Recovery

#### Database Backups
- **Automated Backups**: Daily full backups with point-in-time recovery
- **Cross-region Replication**: Geographic redundancy
- **Backup Testing**: Regular restore verification
- **Retention Policy**: 30-day backup retention

#### Disaster Recovery
- **RTO Target**: 4 hours (Recovery Time Objective)
- **RPO Target**: 1 hour (Recovery Point Objective)
- **Failover Process**: Automated failover to backup infrastructure
- **Communication Plan**: Stakeholder notification procedures

## Future Roadmap

### Phase 1: Enhanced Security (Q1)
- [ ] Implement password hashing (bcrypt/argon2)
- [ ] Add CSRF protection
- [ ] Implement rate limiting
- [ ] Add API key authentication for service integrations
- [ ] Security audit and penetration testing

### Phase 2: Advanced Analytics (Q2)
- [ ] Machine learning for anomaly detection
- [ ] Predictive risk scoring
- [ ] Custom dashboard builder
- [ ] Advanced reporting engine
- [ ] Real-time vulnerability feeds integration

### Phase 3: Enterprise Features (Q3)
- [ ] Single Sign-On (SSO) integration
- [ ] Multi-tenant architecture
- [ ] Role-based access control (RBAC)
- [ ] Advanced workflow automation
- [ ] Slack/Teams integration for notifications

### Phase 4: Platform Expansion (Q4)
- [ ] Mobile application
- [ ] Public API with developer portal
- [ ] Third-party integrations marketplace
- [ ] White-label solution capability
- [ ] Advanced compliance reporting (SOC2, ISO27001)

### Technical Debt & Optimizations
- [ ] Migration to Next.js for better SEO and performance
- [ ] Implementation of GraphQL for more efficient data fetching
- [ ] Microservices architecture for better scalability
- [ ] Event-driven architecture with message queues
- [ ] Advanced caching strategy with Redis

---

## Appendices

### A. API Response Examples

#### Authentication Response
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "admin"
  }
}
```

#### Dashboard Metrics Response
```json
{
  "totalApplications": 10,
  "criticalFindings": 47,
  "highFindings": 128,
  "averageRiskScore": 6.8
}
```

#### Risk Assessment Response
```json
{
  "id": 1,
  "serviceName": "Hinge Health Web Portal",
  "dataClassification": "Confidential",
  "phi": "Yes",
  "finalRiskScore": 8.5,
  "riskLevel": "Critical",
  "lastUpdated": "2025-07-18T17:30:00Z"
}
```

### B. Database Indexes

#### Recommended Production Indexes
```sql
-- Performance optimization indexes
CREATE INDEX idx_applications_name ON applications(name);
CREATE INDEX idx_risk_assessments_service_name ON risk_assessments(service_name);
CREATE INDEX idx_findings_service_name ON mend_sca_findings(service_name);
CREATE INDEX idx_findings_scan_date ON mend_sca_findings(scan_date);

-- Composite indexes for complex queries
CREATE INDEX idx_risk_score_level ON risk_assessments(final_risk_score, risk_level);
CREATE INDEX idx_findings_severity ON mend_sca_findings(critical, high, medium, low);
```

### C. Security Headers

#### Production Security Headers
```javascript
// Recommended security headers
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'",
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};
```

---

**Document Version**: 1.0  
**Last Updated**: July 18, 2025  
**Author**: Security Dashboard Development Team  
**Review Cycle**: Quarterly