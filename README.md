# AppSec Security Dashboard

A comprehensive full-stack application security dashboard built with React/TypeScript frontend and Express.js backend, featuring advanced vulnerability management, risk assessment, and role-based access control.

## 🚀 Features

### Core Security Dashboard
- **Multi-Engine Integration**: Mend (SCA, SAST, Containers), Escape (WebApps, APIs), Crowdstrike (Images, Containers)
- **Risk Assessment Engine**: CIA triad analysis, data classification scoring, attack surface evaluation
- **Real-time Analytics**: Interactive dashboards with trend analysis and KPI tracking
- **Service Management**: Complete lifecycle management with detailed service pages
- **Compliance Reporting**: Automated report generation and export capabilities

### Advanced Security Features
- **Role-Based Access Control**: Admin and User roles with granular permissions
- **Argon2id Password Hashing**: Enterprise-grade password security with pepper salt
- **Rate Limiting**: Protection against brute force and API abuse
- **Session Security**: Secure session management with configurable expiration
- **Audit Logging**: Comprehensive activity tracking for compliance

### User Experience
- **Interactive Onboarding**: Step-by-step tutorials for all major features
- **Responsive Design**: Mobile-first approach with professional UI components
- **Dark/Light Theme**: Theme switching with persistent user preferences
- **Smooth Animations**: Professional micro-interactions and transitions
- **Accessibility**: WCAG 2.1 AA compliant interface

### Data Visualization
- **Risk Score Heatmaps**: Hexagonal honeycomb visualization for service risk distribution
- **Trend Analysis**: Weekly findings trends with severity breakdowns
- **Interactive Charts**: Recharts-powered analytics with drill-down capabilities
- **Export Functionality**: CSV, XLSX, and PDF report generation

## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript for type-safe development
- **Wouter** for lightweight client-side routing
- **TanStack Query** (React Query v5) for server state management
- **Shadcn/UI** built on Radix UI primitives for accessible components
- **Tailwind CSS** with custom security-themed design system
- **Vite** for fast development and optimized builds
- **Framer Motion** for smooth animations and transitions

### Backend Stack
- **Express.js** with TypeScript (ESM modules)
- **PostgreSQL** with Neon serverless database
- **Drizzle ORM** for type-safe database operations
- **Argon2id** password hashing with server-side pepper
- **Express Sessions** with PostgreSQL storage
- **Rate limiting** with express-rate-limit
- **RESTful API** design with comprehensive endpoint coverage

### Database Design
- **Normalized Schema**: Separate tables for each scan engine
- **Risk Assessments**: Dedicated scoring and assessment storage
- **User Management**: Secure user accounts with role-based permissions
- **Activity Logging**: Comprehensive audit trail for compliance
- **Finding Tables**: Individual tables for each scanner type with consistent schema

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 20+
- PostgreSQL database (local or Neon)
- Git for version control

### Environment Variables
Create a `.env` file with the following variables:

```bash
DATABASE_URL=postgresql://username:password@host:port/database
SESSION_SECRET=your-super-secret-session-key-change-in-production
PASSWORD_PEPPER=your-additional-password-salt-for-security
NODE_ENV=development
PORT=5000

# Optional: Argon2 configuration
ARGON2_TIME_COST=3
ARGON2_MEMORY_COST=65536
ARGON2_PARALLELISM=1
```

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone https://github.com/tanishqbtr/appsec-dashboard.git
   cd appsec-dashboard
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Setup database**:
   ```bash
   # Push schema to database
   npm run db:push
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Access the application**:
   - Open http://localhost:5000
   - Login with default admin credentials:
     - Username: `admin`
     - Password: `password@hh`

### Production Build

```bash
# Build frontend and backend
npm run build

# Start production server
npm start
```

## 📱 Application Pages

### Main Navigation
- **Dashboard**: Real-time security insights, metrics, and trend analysis
- **Services**: Service inventory with risk scoring and management
- **Reports**: Security findings with filtering, export, and compliance tracking
- **Alerts**: Alert management and notification system
- **Risk Scoring**: Interactive risk assessment tool with CIA triad analysis
- **Service Inventory**: Comprehensive service catalog (Coming Soon)

### Additional Features
- **Profile Management**: User profile editing with secure password changes
- **Admin Panel**: Administrative functions for user and system management
- **Service Detail Pages**: Deep-dive views for individual services with scanner integration

## 🔐 Security Features

### Authentication & Authorization
- **Secure Login**: Session-based authentication with secure cookies
- **Role-Based Access**: Admin and User roles with different permission levels
- **Password Security**: Argon2id hashing with server-side pepper salt
- **Rate Limiting**: 5 attempts per 15 minutes for authentication endpoints
- **Session Management**: Automatic expiration with secure session storage

### Data Protection
- **Input Validation**: Zod schemas for all API endpoints
- **SQL Injection Prevention**: Parameterized queries via Drizzle ORM
- **XSS Protection**: React's built-in protection + proper data sanitization
- **CSRF Protection**: Session-based CSRF token validation
- **Secure Headers**: Security headers for production deployments

### Password Security Implementation
- **Argon2id Algorithm**: Industry-standard password hashing
- **Configurable Parameters**: Time cost, memory cost, and parallelism settings
- **Server-Side Pepper**: Additional security layer beyond salting
- **Automatic Migration**: Seamless upgrade from legacy password storage
- **Password Policies**: Minimum length requirements and complexity validation

## 📊 API Documentation

### Authentication Endpoints
```
POST   /api/login                    - User authentication
GET    /api/auth/user               - Get current user info
POST   /api/logout                  - End user session
POST   /api/auth/change-password    - Change user password
```

### Application Management
```
GET    /api/applications                  - List all applications
POST   /api/applications                  - Create new application (Admin)
PATCH  /api/applications/:id              - Update application (Admin)
DELETE /api/applications/:id              - Remove application (Admin)
GET    /api/services-with-risk-scores     - Services with risk scores
GET    /api/services-total-findings       - Services with aggregated findings
```

### Scanner Data Endpoints
```
GET    /api/mend/sca                     - Mend SCA findings
GET    /api/mend/sast                    - Mend SAST findings  
GET    /api/mend/containers              - Mend container findings
GET    /api/escape/webapps               - Escape web app findings
GET    /api/escape/apis                  - Escape API findings
GET    /api/crowdstrike/images           - Crowdstrike image findings
GET    /api/crowdstrike/containers       - Crowdstrike container findings
```

### Risk Assessment
```
GET    /api/risk-assessments/:serviceName - Get risk assessment
POST   /api/risk-assessments              - Create/update assessment
```

### Dashboard Analytics
```
GET    /api/dashboard/metrics             - Key performance indicators
GET    /api/dashboard/risk-distribution   - Risk distribution data
GET    /api/dashboard/scan-engine-findings - Scanner findings aggregation
GET    /api/dashboard/risk-score-heatmap  - Risk score visualization data
```

## 🗄️ Database Schema

### Core Tables
- **users**: User authentication and role management
- **applications**: Service registry and metadata
- **risk_assessments**: Risk scoring and assessment data
- **activity_logs**: Audit trail and activity logging

### Scanner Finding Tables
- **mend_sca_findings**: Software Composition Analysis results
- **mend_sast_findings**: Static Application Security Testing results
- **mend_containers_findings**: Container security findings
- **escape_webapps_findings**: Web application security results
- **escape_apis_findings**: API security testing results
- **crowdstrike_images_findings**: Container image security results
- **crowdstrike_containers_findings**: Container runtime security results

## 🎨 UI Components & Design System

### Component Library
- **Shadcn/UI**: Complete component library with Radix UI primitives
- **Custom Components**: Security-themed components for dashboard needs
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Accessibility**: Full keyboard navigation and screen reader support

### Design Features
- **Color System**: Hinge Health green branding with security severity colors
- **Typography**: Inter font family with consistent scale and weights
- **Animations**: Smooth transitions with Framer Motion integration
- **Icons**: Lucide React icons with company logos from React Icons
- **Charts**: Recharts integration for data visualization

## 🚀 Development Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build production bundles
npm start           # Start production server
npm run check       # TypeScript type checking
npm run db:push     # Apply database schema changes
```

## 🐛 Troubleshooting

### Common Issues
1. **Database Connection Errors**: Verify `DATABASE_URL` is correct and database is accessible
2. **Authentication Issues**: Check session configuration and password hashing setup
3. **Build Failures**: Ensure all dependencies are installed and TypeScript errors resolved
4. **Permission Errors**: Verify user roles and admin permissions for protected operations

### Development Tips
- Use `npm run check` to verify TypeScript compilation before deployment
- Run `npm run db:push` after schema changes to sync database
- Check browser console for client-side errors and network tab for API issues
- Monitor server logs for authentication and database connectivity issues

## 📝 Default Credentials

### Admin Account
- **Username**: `admin`
- **Password**: `password@hh`
- **Role**: Admin (full permissions)

### Demo Account  
- **Username**: `demo`
- **Password**: `password`
- **Role**: User (read-only access with limited export permissions)

## 🔒 Production Security Checklist

- [ ] Change default passwords and update SESSION_SECRET
- [ ] Configure PASSWORD_PEPPER environment variable
- [ ] Enable HTTPS with proper SSL certificates
- [ ] Configure rate limiting for production traffic
- [ ] Set up database connection pooling and read replicas
- [ ] Configure logging and monitoring systems
- [ ] Enable database encryption at rest
- [ ] Configure CSP headers and security middleware
- [ ] Set up backup and disaster recovery procedures
- [ ] Implement network security and firewall rules

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for application security teams**