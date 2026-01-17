#!/bin/bash

# AutoExam Pro - Setup Verification Script
# Run this script to verify your Phase 1 setup

echo "🔍 AutoExam Pro - Phase 1 Setup Verification"
echo "=============================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check Node.js
echo -n "Checking Node.js... "
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Found $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found"
    exit 1
fi

# Check npm
echo -n "Checking npm... "
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} Found v$NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found"
    exit 1
fi

# Check PostgreSQL
echo -n "Checking PostgreSQL... "
if command -v psql &> /dev/null; then
    PG_VERSION=$(psql --version | awk '{print $3}')
    echo -e "${GREEN}✓${NC} Found v$PG_VERSION"
else
    echo -e "${YELLOW}⚠${NC}  PostgreSQL not found (install required)"
fi

echo ""
echo "📁 Checking Project Structure..."
echo "--------------------------------"

# Check backend structure
dirs=(
    "backend/src"
    "backend/src/config"
    "backend/src/routes"
    "backend/src/controllers"
    "backend/src/middleware"
    "backend/src/models"
    "backend/database"
    "backend/database/migrations"
    "frontend/src"
    "frontend/public"
)

for dir in "${dirs[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✓${NC} $dir"
    else
        echo -e "${RED}✗${NC} $dir (missing)"
    fi
done

echo ""
echo "📄 Checking Key Files..."
echo "-------------------------"

files=(
    "backend/package.json"
    "backend/src/server.js"
    "backend/src/config/database.js"
    "backend/database/setup.js"
    "backend/database/seed.js"
    "backend/database/migrations/001_initial_schema.sql"
    "backend/.env.example"
    "backend/DATABASE.md"
    "frontend/package.json"
    "frontend/src/App.jsx"
    "frontend/src/main.jsx"
    "frontend/src/index.css"
    "frontend/index.html"
    "frontend/vite.config.js"
    "frontend/tailwind.config.js"
    "frontend/postcss.config.js"
    "frontend/.env.example"
    "README.md"
    "QUICKSTART.md"
    ".gitignore"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} $file (missing)"
    fi
done

echo ""
echo "📦 Checking Dependencies..."
echo "---------------------------"

# Check backend dependencies
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Backend dependencies installed"
else
    echo -e "${YELLOW}⚠${NC}  Backend dependencies not installed (run: cd backend && npm install)"
fi

# Check frontend dependencies
if [ -d "frontend/node_modules" ]; then
    echo -e "${GREEN}✓${NC} Frontend dependencies installed"
else
    echo -e "${YELLOW}⚠${NC}  Frontend dependencies not installed (run: cd frontend && npm install)"
fi

echo ""
echo "🔐 Checking Environment Files..."
echo "---------------------------------"

# Check backend .env
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✓${NC} Backend .env configured"
else
    echo -e "${YELLOW}⚠${NC}  Backend .env not found (copy from .env.example)"
fi

# Check frontend .env
if [ -f "frontend/.env" ]; then
    echo -e "${GREEN}✓${NC} Frontend .env configured"
else
    echo -e "${YELLOW}⚠${NC}  Frontend .env not found (copy from .env.example)"
fi

echo ""
echo "=============================================="
echo "✅ Phase 1 Setup Verification Complete"
echo ""
echo "Next Steps:"
echo "1. Install dependencies (if not done):"
echo "   cd backend && npm install"
echo "   cd ../frontend && npm install"
echo ""
echo "2. Configure environment files:"
echo "   cp backend/.env.example backend/.env"
echo "   cp frontend/.env.example frontend/.env"
echo "   # Edit .env files with your credentials"
echo ""
echo "3. Set up database:"
echo "   createdb autoexam_pro"
echo "   cd backend && npm run migrate"
echo "   npm run seed  # Optional: add demo data"
echo ""
echo "4. Start development servers:"
echo "   # Terminal 1: cd backend && npm run dev"
echo "   # Terminal 2: cd frontend && npm run dev"
echo ""
