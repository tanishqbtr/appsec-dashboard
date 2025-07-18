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