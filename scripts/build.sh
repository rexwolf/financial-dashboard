#!/bin/bash
# Production build script for Financial Dashboard
# Author: Claude Code

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${GREEN}🏗️  Financial Dashboard - Production Build${NC}"
echo "================================================"

# Function to check command existence
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo -e "${BLUE}🔍 Checking prerequisites...${NC}"

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    exit 1
fi

if ! command_exists npm; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites met${NC}"

# Check environment file
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Using environment variables...${NC}"
else
    echo -e "${GREEN}✅ .env file found${NC}"
    # Check for placeholder values
    if grep -q "your_.*_key_here" .env; then
        echo -e "${YELLOW}⚠️  Warning: Default API keys detected in .env${NC}"
        echo -e "${YELLOW}💡 Consider updating API keys for production build${NC}"
    fi
fi

# Clean previous build
echo -e "${BLUE}🧹 Cleaning previous build...${NC}"
rm -rf build/
rm -rf node_modules/.cache/
echo -e "${GREEN}✅ Clean complete${NC}"

# Install dependencies
echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm ci --production=false
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Run quality checks
echo -e "${BLUE}🔍 Running quality checks...${NC}"

# TypeScript check
echo -e "${YELLOW}  📝 TypeScript check...${NC}"
npx tsc --noEmit || {
    echo -e "${RED}❌ TypeScript errors found${NC}"
    exit 1
}

# Linting
echo -e "${YELLOW}  🎨 ESLint check...${NC}"
npx eslint src/ --ext .ts,.tsx --max-warnings 0 || {
    echo -e "${YELLOW}⚠️  ESLint warnings found (continuing build...)${NC}"
}

echo -e "${GREEN}✅ Quality checks complete${NC}"

# Security audit
echo -e "${BLUE}🔒 Running security audit...${NC}"
npm audit --audit-level high || {
    echo -e "${YELLOW}⚠️  Security vulnerabilities found (review recommended)${NC}"
}

# Build application
echo -e "${BLUE}🏗️  Building application...${NC}"
export NODE_ENV=production
export GENERATE_SOURCEMAP=false  # Disable source maps for production
export INLINE_RUNTIME_CHUNK=false

npm run build

# Check build output
if [ ! -d "build" ]; then
    echo -e "${RED}❌ Build failed - build directory not created${NC}"
    exit 1
fi

# Build statistics
BUILD_SIZE=$(du -sh build | cut -f1)
echo -e "${GREEN}✅ Build complete!${NC}"
echo -e "${BLUE}📊 Build Statistics:${NC}"
echo -e "   📁 Build size: $BUILD_SIZE"
echo -e "   📄 Files created: $(find build -type f | wc -l | tr -d ' ')"

# Asset analysis
if [ -f build/static/js/*.js ]; then
    JS_FILES=$(find build/static/js -name "*.js" | wc -l | tr -d ' ')
    CSS_FILES=$(find build/static/css -name "*.css" | wc -l | tr -d ' ')
    echo -e "   🎨 CSS files: $CSS_FILES"
    echo -e "   🔧 JS files: $JS_FILES"
fi

# Gzip size analysis
if command_exists gzip; then
    GZIP_SIZE=$(tar -czf - build | wc -c | numfmt --to=iec)
    echo -e "   🗜️  Gzipped size: $GZIP_SIZE"
fi

echo ""
echo -e "${GREEN}🎉 Production build ready!${NC}"
echo -e "${BLUE}💡 Next steps:${NC}"
echo -e "   • Test the build: make serve"
echo -e "   • Deploy to server: make deploy-aws"
echo -e "   • Run in Docker: make docker-run"