# Overview

This is a full-stack security dashboard application built with Express.js backend and React frontend. The application provides a comprehensive interface for managing security applications and viewing vulnerability findings with different severity levels (Critical, High, Medium, Low).

## User Preferences

Preferred communication style: Simple, everyday language.
Navigation menu items: "Dashboard (main analytics), Services, Reports, Alerts, Risk Scoring" (updated July 17, 2025)
Login page: Green background matching Hinge Health logo color (updated July 17, 2025)
Services page: Main application management page with clickable rows leading to detailed service pages (updated July 17, 2025)
Dashboard page: Landing page with comprehensive analytics, weekly findings by severity trends, and security insights (updated July 17, 2025)
Reports page: Document generation and export functionality for compliance reporting (updated July 17, 2025)
Color scheme: Consistent green theme throughout interface - dark green for primary actions, light green for secondary
Animations: Smooth hover effects with 200ms transitions and subtle scaling
Other pages: Empty placeholder pages for future development
Percentile system: Services ranked by total findings with color-coded badges - services with fewer findings get higher percentiles (Top 10% = Green, Top 25% = Blue, Top 50% = Yellow, Bottom 50% = Orange, Bottom 25% = Red) (updated July 17, 2025)
Interactive onboarding tutorial: Guides new users through key features with step-by-step walkthrough, highlighting elements and providing contextual information (updated July 17, 2025)
Database schema simplification: Removed unnecessary fields (projects, violating findings, risk factors, last scan) from services table - keeping only essential data (updated July 18, 2025)
Mend findings separation: Created separate tables for Mend SCA, SAST, and Containers findings with individual critical/high/medium/low counts and scan dates (updated July 18, 2025)
Authentication system fully restored: Successfully implemented session-based authentication with proper login/logout flow, protected API endpoints, and centralized useAuth hook across all pages for consistent authentication state management (updated July 18, 2025)
Database connectivity restored: Fixed PostgreSQL connection timeout issues, updated connection pool settings for optimal performance, and successfully authenticated admin user (admin/password@hh) with complete database functionality (updated August 11, 2025)
Dashboard layout: Moved Findings Trend chart from Reports page to Dashboard, replacing Recent Scan Activity section for better visibility of security trends (updated July 18, 2025)
Reports page clearing: Completely emptied Reports page content, leaving only basic navigation and empty state message for future development (updated July 18, 2025)
Page functionality swap: Moved all Services page functionality (security findings table, filters, onboarding) to Reports page, and cleared Services page to empty state (updated July 18, 2025)
Services page redesign: Created simple services list view with search functionality and clickable rows that navigate to individual service detail pages (updated July 18, 2025)
Services table enhancement: Added sortable table format with Risk Score and Percentile Ranking columns, removed tags/labels display, implemented three-column sorting functionality (updated July 18, 2025)
Services data integration: Updated to use calculated risk scores from risk assessments and proper percentile ranking based on risk scores, removed findings count display (updated July 18, 2025)
Services API endpoint: Created dedicated `/api/services-with-risk-scores` endpoint that directly fetches services from risk_assessments table with final_risk_score values (updated July 18, 2025)
Service detail page enhancement: Enhanced Risk Assessment Details and Findings by Scanner sections with beautiful gradient card designs, integrated "Take me to" buttons within scanner cards, and updated risk scores to display actual values from database final_risk_score field (updated July 18, 2025)
UI cleanup: Removed unnecessary SCA/SAST labels from service detail pages and consolidated scanner navigation into individual card-based buttons (updated July 18, 2025)
Percentile calculation standardization: Implemented consistent percentile calculation logic based on total findings across all scan engines for both Services page and Service Detail page - higher findings result in lower percentile ranking (updated July 18, 2025)
Total findings API endpoint: Created /api/services-total-findings endpoint that aggregates findings across all scan engines (Mend SCA/SAST/Containers, Escape WebApps/APIs, Crowdstrike Images/Containers) for accurate percentile calculations (updated July 18, 2025)
Comprehensive animation system: Added smooth page transitions, micro-interactions, and hover animations across all pages with CSS keyframes, staggered list animations, chart entrance effects, and enhanced button interactions (updated July 18, 2025)
Professional UI enhancement: Replaced boring plain text severity indicators with beautiful icon-based system (AlertOctagon, Zap, AlertCircle, Info) in color-coded cards, implemented proper camel-case formatting for all values, added animated pulse dots, gradient backgrounds, and enhanced visual hierarchy across Risk Assessment Details section (updated August 11, 2025)
Role-based access control system: Implemented comprehensive admin/user role system with database schema updates, demo user creation (demo/password), role-protected buttons with "Admin access required" tooltips, protected API endpoints for admin-only operations (create/update/delete), enhanced authentication hooks with role checking capabilities, and export functionality restriction for user role - export button is visible but disabled/greyed out for non-admin users with helpful tooltip (updated August 11, 2025)
Navigation menu cleanup: Removed Settings option from top right user dropdown menu, keeping only Profile and Sign out options for simplified user interface (updated August 11, 2025)
Modern login page redesign: Completely redesigned login page with two-panel layout featuring dark blue gradient background, modern form with email/password fields, password visibility toggle, terms checkbox, and security office image on right panel with Hinge Health shield overlay - matches professional security dashboard aesthetic (updated August 11, 2025)
Password security overhaul: Implemented comprehensive security improvements replacing plaintext password storage with Argon2id hashing, added server-side password pepper, rate limiting for authentication endpoints (5 attempts per 15 minutes), automatic password migration on login, password rehashing with stronger parameters, uniform error messages to prevent username enumeration, password change endpoint with current password verification, enhanced session security with environment-based configuration, and comprehensive migration script with verification - all existing passwords successfully migrated to secure hashes (updated August 12, 2025)
Hexagonal honeycomb heat map: Created mathematically precise honeycomb tessellation for Services by Risk Score visualization with perfect hexagon positioning using absolute coordinates, 75% horizontal overlap, 25% vertical overlap for authentic honeycomb structure, risk score-based border colors/thickness, percentile-based fill colors, smart text wrapping for service names, and smooth hover animations - hexagons now tessellate seamlessly like a real honeycomb (updated August 12, 2025)


## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript
- **Routing**: Wouter for client-side routing
- **UI Components**: Shadcn/ui component library with Radix UI primitives
- **Styling**: Tailwind CSS with custom security-themed color variables
- **State Management**: React Query (TanStack Query) for server state
- **Build Tool**: Vite with React plugin

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js with ESM modules
- **API Style**: RESTful endpoints
- **Session Management**: In-memory storage (development setup)
- **Request Logging**: Custom middleware for API request logging

### Database Layer
- **ORM**: Drizzle ORM configured for PostgreSQL
- **Schema**: Defined in shared directory for type safety
- **Migration**: Drizzle Kit for schema migrations
- **Current Storage**: In-memory implementation (MemStorage class) for development

## Key Components

### Authentication System
- Simple username/password authentication
- No session persistence (development mode)
- Default credentials: admin/password
- Basic login/logout flow

### Application Management
- Applications table with security metrics and clickable rows
- Vulnerability findings categorized by severity
- Risk factor calculations
- Label and tag system for organization
- Last scan timestamp tracking
- Export functionality (CSV, XLSX, PDF) for filtered data
- Two-column filtering: Scan Engine/Labels + Compliance Tags
- Percentile ranking system based on total findings with color-coded badges
- Mutually exclusive filtering between scan engines/labels and compliance tags

### Service Detail Pages
- Individual service pages accessible via clickable table rows
- Comprehensive security findings display with total and violating findings
- GitHub repository, Jira project, and Slack channel links
- Service owner information and descriptions
- Risk score analysis and compliance tag management
- Quick action buttons for scanning and history
- Interactive badges for findings categorization
- Animated service tier badges (Bronze, Silver, Gold, Platinum) based on risk scores
- Smooth badge reveal animations with shimmer effects and floating animations

### Dashboard (Main Analytics)
- Real-time security insights and comprehensive vulnerability management
- Interactive charts: Weekly trend lines, risk distribution pie charts, findings by engine bar charts
- Key performance metrics: Total applications, critical findings, average risk score, active scans
- Weekly activity trends showing scans completed, new findings, and resolved issues
- Compliance standards coverage with progress indicators
- Recent scan activity timeline with latest 4 scans
- Quick stats summary with total findings, compliance rate, and response times
- Dashboard export functionality for executive reporting

### Reports Page
- Focused on document generation and compliance reporting
- Export capabilities for detailed security documentation
- Report templates for different compliance standards
- Historical data compilation and trend reporting

### UI Component System
- Complete Shadcn/ui component library
- Responsive design with mobile-first approach
- Accessibility features built-in
- Custom security-themed color scheme

## Data Flow

1. **Authentication Flow**:
   - User submits credentials via login form
   - Backend validates against in-memory user store
   - Success redirects to dashboard, failure shows error

2. **Application Data Flow**:
   - Dashboard fetches applications via React Query
   - Backend serves from in-memory mock data
   - Real-time filtering and search on frontend
   - Severity badges rendered based on findings data

3. **Component Communication**:
   - Parent-child prop passing for data
   - React Query for server state management
   - Wouter for navigation state

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL connection (configured but not used)
- **drizzle-orm**: Database ORM and query builder
- **@tanstack/react-query**: Server state management
- **wouter**: Lightweight React router
- **express**: Web framework for Node.js

### UI Dependencies
- **@radix-ui/***: Primitive UI components
- **tailwindcss**: Utility-first CSS framework
- **lucide-react**: Icon library
- **class-variance-authority**: Component variant management

### Development Tools
- **vite**: Frontend build tool and dev server
- **tsx**: TypeScript execution for Node.js
- **esbuild**: Fast bundler for production builds

## Deployment Strategy

### Development
- Vite dev server for frontend with HMR
- tsx for running TypeScript backend directly
- Concurrent development with proxy setup

### Production Build
- Frontend: Vite builds to `dist/public`
- Backend: esbuild bundles to `dist/index.js`
- Static file serving from Express
- Single deployment artifact

### Environment Configuration
- NODE_ENV for environment detection
- DATABASE_URL for PostgreSQL connection
- Port configuration via environment variables

### Database Migration
- Drizzle Kit handles schema migrations
- `npm run db:push` for development schema updates
- Production migrations via Drizzle migrate commands

## Security Considerations

- Basic authentication implementation (development only)
- No session encryption or JWT tokens
- In-memory data storage (not persistent)
- CORS not configured for production
- Environment variables for sensitive configuration

## Development Notes

- TypeScript strict mode enabled
- Path aliases configured for clean imports
- ESM modules throughout the stack
- Replit-specific plugins for development environment
- Hot reload enabled for both frontend and backend