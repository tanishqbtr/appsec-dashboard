#!/bin/bash

echo "🚀 Starting AppSec Dashboard locally..."

# Function to check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        echo "❌ Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Function to start production environment
start_production() {
    echo "🏭 Starting production environment..."
    check_docker
    docker-compose up --build -d
    echo "✅ Production environment started!"
    echo "🌐 Application available at: http://localhost:3000"
    echo "🗄️  Database available at: localhost:5432"
    echo ""
    echo "To view logs: docker-compose logs -f"
    echo "To stop: docker-compose down"
}

# Function to start development environment
start_development() {
    echo "🛠️  Starting development environment..."
    check_docker
    docker-compose -f docker-compose.dev.yml up --build
}

# Function to start only database
start_db_only() {
    echo "🗄️  Starting only PostgreSQL database..."
    check_docker
    docker-compose up postgres -d
    echo "✅ Database started!"
    echo "🗄️  Database available at: localhost:5432"
    echo "📝 Connection: postgresql://appsec_user:appsec_password@localhost:5432/appsec_dashboard"
    echo ""
    echo "You can now run 'npm run dev' in another terminal for local development."
}

# Function to stop all services
stop_services() {
    echo "🛑 Stopping all services..."
    docker-compose down
    docker-compose -f docker-compose.dev.yml down
    echo "✅ All services stopped!"
}

# Function to show help
show_help() {
    echo "AppSec Dashboard - Local Setup Script"
    echo ""
    echo "Usage: ./start-local.sh [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  prod, production    Start production environment (Docker)"
    echo "  dev, development    Start development environment (Docker with hot reload)"
    echo "  db, database        Start only PostgreSQL database"
    echo "  stop               Stop all Docker services"
    echo "  direct             Instructions for direct Node.js setup"
    echo "  help               Show this help message"
    echo ""
    echo "Examples:"
    echo "  ./start-local.sh prod         # Start production environment"
    echo "  ./start-local.sh dev          # Start development environment"
    echo "  ./start-local.sh db           # Start only database"
    echo "  ./start-local.sh stop         # Stop all services"
}

# Function to show direct setup instructions
show_direct_setup() {
    echo "📋 Direct Node.js Setup Instructions:"
    echo ""
    echo "1. Install dependencies:"
    echo "   npm install"
    echo ""
    echo "2. Set up PostgreSQL database (local or cloud)"
    echo ""
    echo "3. Create .env file with:"
    echo "   DATABASE_URL=postgresql://user:password@localhost:5432/appsec_dashboard"
    echo "   NODE_ENV=development"
    echo "   PORT=5000"
    echo "   SESSION_SECRET=your-secret-key"
    echo ""
    echo "4. Push database schema:"
    echo "   npm run db:push"
    echo ""
    echo "5. Start development server:"
    echo "   npm run dev"
    echo ""
    echo "6. Access application at: http://localhost:5000"
}

# Main script logic
case "${1:-help}" in
    "prod"|"production")
        start_production
        ;;
    "dev"|"development")
        start_development
        ;;
    "db"|"database")
        start_db_only
        ;;
    "stop")
        stop_services
        ;;
    "direct")
        show_direct_setup
        ;;
    "help"|*)
        show_help
        ;;
esac