# AppSec Security Dashboard

A full-stack security dashboard application built with Express.js backend and React frontend. Provides a comprehensive interface for managing security applications and viewing vulnerability findings across different severity levels (Critical, High, Medium, Low).

## Key Features

- **Multi-Engine Integration**: Supports Mend (SCA, SAST, Containers), Escape (WebApps, APIs), and Crowdstrike (Images, Containers)
- **Risk Assessment**: Comprehensive risk scoring and percentile ranking system
- **Interactive Analytics**: Real-time dashboards with trend analysis and compliance tracking
- **Service Management**: Complete lifecycle management of security-monitored services
- **Authentication**: Session-based authentication with protected API endpoints
- **Responsive UI**: Modern design with Hinge Health green theme and smooth animations

## System Architecture

### Frontend
- **React** with TypeScript and Wouter routing
- **Shadcn/ui** components with Radix UI primitives
- **Tailwind CSS** with custom security-themed variables
- **TanStack Query** for server state management
- **Vite** build tool with HMR

### Backend
- **Express.js** with TypeScript and ESM modules
- **Drizzle ORM** with PostgreSQL
- **RESTful API** with session management
- **Custom middleware** for authentication and logging

### Database
- **PostgreSQL** with Neon serverless
- **Separate tables** for each scan engine (Mend, Escape, Crowdstrike)
- **Risk assessments** with CIA triad scoring
- **Applications registry** with metadata

## Quick Start

```bash
# Install dependencies
npm install

# Start development servers
npm run dev

# Update database schema
npm run db:push

# Access database management UI
npm run db:studio
```

## Authentication
- **Default credentials**: admin/password
- **Session-based** authentication
- **Protected routes** for all dashboard pages

## API Endpoints

### Core Endpoints
- `GET /api/applications` - List all applications
- `GET /api/services-with-risk-scores` - Services with risk data
- `GET /api/dashboard/metrics` - Key performance indicators
- `POST /api/login` - User authentication

### Scanner Data
- `GET /api/mend/{sca|sast|containers}` - Mend findings
- `GET /api/escape/{webapps|apis}` - Escape findings  
- `GET /api/crowdstrike/{images|containers}` - Crowdstrike findings

## Deployment

### Development
```bash
npm run dev  # Concurrent frontend/backend with HMR
```

### Production
```bash
npm run build  # Build frontend and backend
npm start      # Start production server
```

## Security Considerations

- Session-based authentication (development setup)
- Input validation with Zod schemas
- SQL injection prevention via Drizzle ORM
- Environment variables for sensitive configuration
- HTTPS/TLS for production deployment

## Technology Stack

**Frontend**: React, TypeScript, Tailwind CSS, Shadcn/ui, TanStack Query  
**Backend**: Node.js, Express.js, TypeScript, Drizzle ORM  
**Database**: PostgreSQL (Neon serverless)  
**Deployment**: Replit platform with auto-scaling
