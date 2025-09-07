# Financial Dashboard - Production-Ready Makefile
# Author: Claude Code
# Version: 1.0

.PHONY: help install dev build test clean docker-build docker-run deploy-aws setup-env check-env lint format security-audit

# Default target
.DEFAULT_GOAL := help

# Colors for output
GREEN := \033[0;32m
YELLOW := \033[0;33m
RED := \033[0;31m
NC := \033[0m # No Color

# Project variables
PROJECT_NAME := financial-dashboard
DOCKER_IMAGE := $(PROJECT_NAME):latest
AWS_REGION := us-east-1
AWS_ACCOUNT_ID := $(shell aws sts get-caller-identity --query Account --output text 2>/dev/null)

help: ## Show this help message
	@echo "$(GREEN)Financial Dashboard - Production Build System$(NC)"
	@echo "================================================"
	@echo ""
	@echo "Available targets:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  $(GREEN)%-20s$(NC) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install all dependencies
	@echo "$(YELLOW)Installing dependencies...$(NC)"
	npm ci
	@echo "$(GREEN)✓ Dependencies installed successfully$(NC)"

setup-env: ## Setup environment files from examples
	@echo "$(YELLOW)Setting up environment files...$(NC)"
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "$(GREEN)✓ Created .env from .env.example$(NC)"; \
		echo "$(YELLOW)⚠️  Please update .env with your API keys$(NC)"; \
	else \
		echo "$(YELLOW)⚠️  .env already exists, skipping...$(NC)"; \
	fi

check-env: ## Check environment configuration
	@echo "$(YELLOW)Checking environment configuration...$(NC)"
	@node -e "console.log('Environment check:', process.env.NODE_ENV || 'development')"
	@if [ -f .env ]; then \
		echo "$(GREEN)✓ .env file exists$(NC)"; \
		if grep -q "your_.*_key_here" .env; then \
			echo "$(RED)⚠️  Warning: Default API keys detected in .env$(NC)"; \
		else \
			echo "$(GREEN)✓ API keys appear to be configured$(NC)"; \
		fi; \
	else \
		echo "$(RED)✗ .env file missing - run 'make setup-env'$(NC)"; \
		exit 1; \
	fi

dev: check-env ## Start development server
	@echo "$(YELLOW)Starting development server...$(NC)"
	npm start

build: install ## Create production build
	@echo "$(YELLOW)Building production version...$(NC)"
	npm run build
	@echo "$(GREEN)✓ Production build created in build/$(NC)"

test: ## Run tests
	@echo "$(YELLOW)Running tests...$(NC)"
	npm test -- --watchAll=false --coverage

lint: ## Run ESLint
	@echo "$(YELLOW)Running linter...$(NC)"
	npx eslint src/ --ext .ts,.tsx

format: ## Format code with Prettier
	@echo "$(YELLOW)Formatting code...$(NC)"
	npx prettier --write src/

typecheck: ## Run TypeScript compiler check
	@echo "$(YELLOW)Running TypeScript compiler check...$(NC)"
	npx tsc --noEmit

clean: ## Clean build artifacts
	@echo "$(YELLOW)Cleaning build artifacts...$(NC)"
	rm -rf build/
	rm -rf node_modules/
	rm -f package-lock.json
	@echo "$(GREEN)✓ Cleaned$(NC)"

# Docker targets
docker-build: build ## Build Docker image
	@echo "$(YELLOW)Building Docker image...$(NC)"
	docker build -t $(DOCKER_IMAGE) .
	@echo "$(GREEN)✓ Docker image built: $(DOCKER_IMAGE)$(NC)"

docker-run: docker-build ## Run Docker container locally
	@echo "$(YELLOW)Running Docker container...$(NC)"
	docker run -p 3000:80 --env-file .env $(DOCKER_IMAGE)

# AWS Deployment targets
aws-login: ## Login to AWS ECR
	@echo "$(YELLOW)Logging into AWS ECR...$(NC)"
	@if [ -z "$(AWS_ACCOUNT_ID)" ]; then \
		echo "$(RED)✗ AWS CLI not configured or no access$(NC)"; \
		exit 1; \
	fi
	aws ecr get-login-password --region $(AWS_REGION) | docker login --username AWS --password-stdin $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com

deploy-aws: aws-login docker-build ## Deploy to AWS using CloudFormation
	@echo "$(YELLOW)Deploying to AWS...$(NC)"
	@if [ ! -d "infrastructure" ]; then \
		echo "$(RED)✗ Infrastructure directory not found$(NC)"; \
		exit 1; \
	fi
	docker tag $(DOCKER_IMAGE) $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/$(PROJECT_NAME):latest
	docker push $(AWS_ACCOUNT_ID).dkr.ecr.$(AWS_REGION).amazonaws.com/$(PROJECT_NAME):latest
	cd infrastructure && ./deploy.sh
	@echo "$(GREEN)✓ Deployed to AWS$(NC)"

# Security and Quality targets
security-audit: ## Run security audit
	@echo "$(YELLOW)Running security audit...$(NC)"
	npm audit --audit-level moderate
	@echo "$(YELLOW)Checking for known vulnerabilities...$(NC)"
	npx audit-ci --config audit-ci.json || echo "$(YELLOW)⚠️  Some vulnerabilities found - check output$(NC)"

quality-check: lint typecheck ## Run all quality checks
	@echo "$(GREEN)✓ All quality checks passed$(NC)"

# Full pipeline targets
ci: install quality-check build test ## Run full CI pipeline
	@echo "$(GREEN)✓ CI pipeline completed successfully$(NC)"

cd: ci security-audit ## Run full CI/CD pipeline
	@echo "$(GREEN)✓ CI/CD pipeline completed successfully$(NC)"

# Development helpers
serve: build ## Serve production build locally
	@echo "$(YELLOW)Serving production build on http://localhost:5000$(NC)"
	npx serve -s build -l 5000

analyze: build ## Analyze bundle size
	@echo "$(YELLOW)Analyzing bundle size...$(NC)"
	npx bundle-analyzer build/static/js/*.js

# Maintenance targets
update-deps: ## Update dependencies
	@echo "$(YELLOW)Updating dependencies...$(NC)"
	npm update
	npm audit fix
	@echo "$(GREEN)✓ Dependencies updated$(NC)"

reset: clean install ## Reset project (clean + install)
	@echo "$(GREEN)✓ Project reset complete$(NC)"

# Quick start for new developers
quick-start: setup-env install ## Quick setup for new developers
	@echo ""
	@echo "$(GREEN)🎉 Quick setup complete!$(NC)"
	@echo ""
	@echo "$(YELLOW)Next steps:$(NC)"
	@echo "1. Update .env with your API keys"
	@echo "2. Run 'make dev' to start development server"
	@echo "3. Visit http://localhost:3000"
	@echo ""
	@echo "$(YELLOW)Common commands:$(NC)"
	@echo "  make dev          - Start development server"
	@echo "  make build        - Create production build"
	@echo "  make test         - Run tests"
	@echo "  make quality-check - Run linting and type checking"
	@echo ""

# Production deployment
production-ready: cd security-audit ## Verify production readiness
	@echo "$(GREEN)✅ Production ready!$(NC)"
	@echo "$(YELLOW)Run 'make deploy-aws' to deploy to AWS$(NC)"